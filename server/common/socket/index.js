const socketio = require('socket.io');

module.exports = server => {
  const io = socketio(server);
  io.on('connection', socket => {
    socket.emit('test', 'Socket connected');
    socket.on('join', () => {});
    socket.on('disconnect', () => {});
  });
  return io;
};
