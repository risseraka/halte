const jeste = require('jeste');

exports = module.exports = (options = {}) => {
    const {
        dir,
        cache = true,
        setContentType = true,
        locals = {},
    } = options;

    const renderer = jeste({ dir, cache, locals });

    return (req, res, next) => {
        res.halte = (file, data = {}) => {
            try {
                const result = renderer(file + (req.accepts(['json', 'html']) === 'html' ? '.html' : ''), data);

                if (setContentType) {
                    if (typeof result === 'object') {
                        res.set('Content-Type', 'application/hal+json');
                        return res.json(result);
                    }
                }

                return res.send(result);
            } catch (e) {
                next(e);
            }
        };

        next();
    };
};
