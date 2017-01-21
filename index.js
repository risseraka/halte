const fs = require('fs');
const path = require('path');

exports = module.exports = (app, { dir }) => {
  app.use((req, res, next) => {
    res.hal = (file, data) => {
      res.set('Content-Type', 'application/hal+json');

      const filePath = path.join(dir, `${file}.js`);

      fs.readFile(filePath, (err, content) => {
        if (err) return next(err);

        const { baseUri } = req;

        function absolute(path) {
          return `${req.protocol}://${req.get('host')}${req.baseUrl}${path}`;
        }

        try {
          with (data) {
            return res.json(eval(`(${content.toString()})`));
          }
        } catch (e) {
          console.error(`Template error in file "${file}"`);

          return next(new Error(`Template error: ${e}`));
        }
      });
    };

    next();
  });
};
