const fs = require('fs');

exports = module.exports = () => (filePath, options, callback) => {
  fs.readFile(filePath, (err, content) => {
    if (err) return callback(err);

    try {
      content = JSON.parse(content);
    } catch (e) {
      return callback(e);
    }

    const result = content;

    return callback(null, result);
  });
};
