'use strict';

var os = require('os');
var nodeStatic = require('node-static');
var http = require('https');
var socketIO = require('socket.io');
const fs = require('fs')

var fileServer = new (nodeStatic.Server)();

const options = {
  key: fs.readFileSync('/home/ubiqos/work/project/cert_files/2022_2/private.key'),
  cert: fs.readFileSync('/home/ubiqos/work/project/cert_files/2022_2/certificate.crt'),
  ca: fs.readFileSync('/home/ubiqos/work/project/cert_files/2022_2/ca_bundle.crt'),
};


// console.log('start port 8080 https ')

var app = http.createServer(options,function (req, res) {
  fileServer.serve(req, res);
}).listen(8000);

var io = socketIO(app);
io.sockets.on('connection', function (socket) {

  // convenience function to log server messages on the client
  function log() {
    var array = ['Message from server:'];
    array.push.apply(array, arguments);
    socket.emit('log', array);
  }

  socket.on('message', function (message) {
    log('Client said: ', message);
    // for a real app, would be room-only (not broadcast)
    socket.broadcast.emit('message', message);
  });

  socket.on('create or join', function (room) {
    log('Received request to create or join room ' + room);

    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    console.log('Room ' + room + ' now has ' + numClients + ' client(s)')

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);

      console.log(`create ${room}`)

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');

      console.log(`join ${room}`)
      
    } else { // max two clients
      socket.emit('full', room);

      console.log(`full ${room}`)
    }
  });

  socket.on('ipaddr', function () {
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
      ifaces[dev].forEach(function (details) {
        if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
          socket.emit('ipaddr', details.address);
        }
      });
    }
  });

  socket.on('bye', function () {
    console.log('received bye');
  });

});
