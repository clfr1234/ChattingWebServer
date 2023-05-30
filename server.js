const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 7020;
let accessor = { room1: 0, room2: 0 };
let welcome = "새로운 유저 접속!";
let leftuser = "유저가 나갔어요 ㅠㅠ";

app.use("/public", express.static("public"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/selectRoom.html');
});

app.get('/room1.html', function (req, res) {
  res.sendFile(__dirname + '/public/room1.html');
});

app.get('/room2.html', function (req, res) {
  res.sendFile(__dirname + '/public/room2.html');
});

io.on('connection', (socket) => {
  let roomId = null;
  socket.on('join room', (room) => {
    socket.join(room);
    roomId = room;
    accessor[roomId]++;
    let connectcount = "접속자 수 : " + accessor[roomId];
    console.log('user connected / 방: ' + roomId + ' / 접속자 수 : ' + accessor[roomId]);
    io.to(roomId).emit('chat message', welcome);
    io.to(roomId).emit('chat message', connectcount);
  });
  socket.on('disconnect', () => {
    if (roomId) {
      accessor[roomId]--;
      let disconnectcount = "접속자 수 : " + accessor[roomId];
      io.to(roomId).emit('chat message', leftuser);
      console.log('user disconnected / 방: ' + roomId + ' / 접속자 수 : ' + accessor[roomId]);
      io.to(roomId).emit('chat message', disconnectcount);
    }
  });
  socket.on('chat message', msg => {
    io.to(roomId).emit('chat message', msg);
    console.log("user : " + msg);
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});