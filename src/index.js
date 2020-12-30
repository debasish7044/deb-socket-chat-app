var Filter = require('bad-words');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/user');
const express = require('express');
const app = express();

//create express server with http method intentianally
const server = http.createServer(app);
const io = socketio(server);

//used path npm for joining the static file directory
const publicPathDirctory = path.join(__dirname, '../public');
app.use(express.static(publicPathDirctory));

//socket connection setup
io.on('connection', (socket) => {
  //joining room
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    //sending welcome message to client
    socket.emit(
      'message',
      generateMessage('Admin (Debasish)', `Welcome ${user.username} :)`)
    );
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage(
          'Admin(debasish)',
          `${user.username} has joind the room`
        )
      );

    //sending all users in a particular room from server to client
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  //receving sendMessage and sending to client side
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('profane is not allowed');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  //receving sendLocation event from user and sending to client side
  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });
  //setting up user left message when diconnecting server
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin(Debasish)', `${user.username} has left the chat`)
      );
      //after disconnection user room data
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`app is running on ${port} port`);
});
