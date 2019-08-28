import path from 'path';
import express from 'express';
import expressStaticGzip from 'express-static-gzip';

export default () => {
	const app = express();
	const distFolder = path.resolve(__dirname, '../dist');

	const BROWSER_ENV_PREFIX = 'BROWSER_';

	app.use(expressStaticGzip(path.resolve(distFolder, 'client'), {index: false}));

	app.get('/env.js', (_req, res) => {
		/* Transform environment variables that start with BROWSER_ENV_PREFIX into a
		 * `key1:env1,key2:env2` string.
		 */
		const envStr = Object.keys(process.env)
			.filter(key => key.startsWith(BROWSER_ENV_PREFIX))
			.map(key => `${key.substr(BROWSER_ENV_PREFIX.length)}:'${process.env[key]}'`)
			.join(',');
		res.end(`window.env = {${envStr}}`);
	});

	app.get(/^(\/.*)?$/, (_req, res) => {
		res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.header('Pragma', 'no-cache');
		res.header('Expires', '0');
		res.sendFile(path.resolve(distFolder, 'client/index.html'));
	});

	return app;
};
