'use strict';

const os = require('os');
const nodeStatic = require('node-static');
const socketIO = require('socket.io');

const https = require('https');
const fs = require('fs');

var fileServer = new (nodeStatic.Server)();
let serverApp = https.createServer({
    key: fs.readFileSync('../../cert/privkey.pem'),
    cert: fs.readFileSync('../../cert/cert.pem')

}, (req, res) => {
    fileServer.serve(req, res);
}).listen(8000,()=> {
    console.log('server start port 8000')
});


