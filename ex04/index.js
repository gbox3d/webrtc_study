'use strict';

const os = require('os');
const nodeStatic = require('node-static');
const socketIO = require('socket.io');

const https = require('https');
const fs = require('fs');

console.log(`socket-io version : ${require('socket.io/package').version}`)

var fileServer = new (nodeStatic.Server)();
let serverApp = https.createServer({
  key: fs.readFileSync('../../cert/privkey.pem'),
  cert: fs.readFileSync('../../cert/cert.pem')

}, (req, res) => {
  fileServer.serve(req, res);
}).listen(8000, () => {
  console.log('server start port 8000')
});

var io = socketIO(serverApp);

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
    socket.send(`your message ${message}`); //자기 자신의 메씨지 보내기 
    
  });

  socket.on('create or join', function (room) {
    log('Received request to create or join room ' + room);

    console.log(io.sockets.adapter.rooms)

    //방에 접속한 사람수 구하기 3.x버전용으로 수정 함
    // var clientsInRoom = io.sockets.adapter.rooms[room];
    let clientsInRoom = io.sockets.adapter.rooms.get(room)
    // var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
    let numClients = clientsInRoom ? clientsInRoom.size : 0;
    log('Room ' + room + ' now has ' + numClients + ' client(s)');

    console.log('Room ' + room + ' now has ' + numClients + ' client(s)')

    if (numClients === 0) {
      socket.join(room);
      log('Client ID ' + socket.id + ' created room ' + room);
      socket.emit('created', room, socket.id);
      console.log('Client ID ' + socket.id + ' created room ' + room)

    } else if (numClients === 1) {
      log('Client ID ' + socket.id + ' joined room ' + room);
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room, socket.id);
      io.sockets.in(room).emit('ready');

      console.log('Client ID ' + socket.id + ' joined room ' + room)


    } else { // max two clients
      socket.emit('full', room);
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

});

