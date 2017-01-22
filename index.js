const fs = require('fs');
const path = require('path');
const vm = require('vm');

exports = module.exports = (app, options = {}) => {
  const { dir, cache = true, setContentType = true, locals = {} } = options;

  const internalCache = {};

  app.use((req, res, next) => {
    function render(file, data) {
      if (!data) return obj => render(file, obj);

      if (setContentType) {
        res.set('Content-Type', 'application/hal+json');
      }

      const filePath = path.join(dir, `${file.replace(/\.js$/, '')}.js`);

      const content = cache && internalCache[filePath] ?
              internalCache[filePath] :
              (internalCache[filePath] = fs.readFileSync(filePath));

      const context = Object.assign(
        {
          absolute(path) {
            return `${req.protocol}://${req.get('host')}${req.baseUrl}${path}`;
          },
          get(path) {
            try {
              with (data) {
                return eval(path);
              }
            } catch (e) {
            }
            return undefined;
          },
          render,
        },
        locals,
        { data, result: null }
      );

      const script = new vm.Script(
        `with (data) { result = ${content.toString()} }`,
        { filename: filePath, displayErrors: true }
      );

      script.runInContext(new vm.createContext(context));

      return context.result;
    };

    res.hal = (file, data) => {
      try {
        const result = render(file, data);

        res.json(result);
      } catch (e) {
        next(e);
      }
    };

    next();
  });
};
