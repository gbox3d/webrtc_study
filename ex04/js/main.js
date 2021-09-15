'use strict';
const socket = io.connect();

var isInitiator;

socket.on('created', function (room, clientId) {
  isInitiator = true;
  console.log(`create ${room} ${clientId}`)
});

socket.on('full', function (room) {
  console.log('Message from client: Room ' + room + ' is full :^(');
});

socket.on('ipaddr', function (ipaddr) {
  console.log('Message from client: Server IP address is ' + ipaddr);
});

socket.on('joined', function (room, clientId) {

  console.log(`joined ${clientId}`)
  isInitiator = false;
});

socket.on('log', function (array) {
  console.log.apply(console, array);
});

socket.on('message', function (msg) {

  let _list = document.querySelector('#log-msg')
  let _el = document.createElement('div')
  _el.innerText = msg

  _list.appendChild(_el)
})

//------------
document.addEventListener("DOMContentLoaded", function () {

  document.querySelector('#cheat button').addEventListener('click', function (evt) {
    let msg = evt.target.parentElement.querySelector('input').value
    socket.send(msg)
  });

  document.querySelector('#enter-room').addEventListener('click', function (evt) {
    window.room = prompt("Enter room name:");
    if (room !== "") {
      console.log('Message from client: Asking to join room ' + room);
      socket.emit('create or join', room);
    }
  });

  document.querySelector('#emit').addEventListener('click',function(evt) {
    // let msg = evt.target.parentElement.querySelector('input').value
    socket.emit('ipaddr')
  })

})



