import path from 'path';

const base = (...args) => Reflect.apply(path.resolve, null, [path.resolve(__dirname, '..'), ...args]);

export const paths = {
	base,
	src: base.bind(null, 'src'),
	dist: base.bind(null, 'dist')
};

export const getExternal = entries => (ctx, req, cb) => {
	if (!/node_modules/.test(ctx) && req[0] !== '.') {
		// Assumes you have defined an "entries" variable
		let notAnEntry = path => {
			return Object.keys(entries).every(entry => {
				return entries[entry] !== path;
			});
		};

		if (notAnEntry(require.resolve(req))) {
			// This module is external in a commonjs context
			return cb(null, `commonjs ${req}`);
		}
	}

	cb();
};
