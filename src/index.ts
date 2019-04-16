import Server from './server/server'
import router from './server/router'
import IoSocker from './server/IoSocket'
import {LISTEN_PORT, SERVERNAME, LISTEN_HOST} from "./globals";
import http = require("http");


console.log('Starting up...');

const expressServer = Server.init(LISTEN_PORT);
const server = http.createServer(expressServer.app);

expressServer.app.use(router);

const socketIO = new IoSocker(server);

server.listen(LISTEN_PORT, LISTEN_HOST, (fun) => {
    console.log(`${SERVERNAME} Server started, listening on: \x1b[36mhttp://${LISTEN_HOST}:${LISTEN_PORT}\x1b[0m`);
});