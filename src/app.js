import path from 'path';
import express from 'express';

export default () => {
	const app = express();
	const distFolder = path.resolve(__dirname, '../dist');

	app.use(express.static(path.resolve(distFolder, 'client')));
	app.get(/^(\/.*)?$/, (_req, res) => {
		res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.header('Pragma', 'no-cache');
		res.header('Expires', '0');
		res.sendFile(path.resolve(distFolder, 'client/index.html'));
	});

	return app;
};
