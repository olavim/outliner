import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/', (req, res) => {
	res.json({status: 'ok'});
});

app.listen(3001, () => {
	console.log('Server listening on port 3001');
});
