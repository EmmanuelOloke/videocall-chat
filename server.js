const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  // done to avoid some cors error gotten with the newer version
  cors: {
    origin: 'http://127.0.0.1:5173',
    methods: ['GET', 'POST'],
  },
});

// Create a connection through socket.io
io.on('connection', (socket) => {
  socket.emit('me', socket.id); // connect two user with their socket id

  socket.on('disconnect', () => {
    socket.broadcast.emit('callEnded'); // disconnect when call is ended
  });

  socket.on('callUser', (data) => {
    // when a call is initiated
    io.to(data.userToCall).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on('answerCall', (data) => {
    io.to(data.to).emit('callAccepted', data.signal);
  });
});

server.listen(3000, () => console.log('server is running on port 3000'));
