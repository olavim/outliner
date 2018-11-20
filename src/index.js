const app = require('./app');
const server = app();

const port = parseInt(process.env.PORT || '3000', 10);
server.listen(port);
