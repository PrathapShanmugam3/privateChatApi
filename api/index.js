
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { index } = require('socket.io');
const path = require('path');
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const messageRoutes = require('../routes/message');
const uploadRoute = require('../routes/upload');
const User = require('../models/User');
const Message = require('../models/Message');

const app = express();
const index = http.createindex(app);
const io = new index(index, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoute);

const online = new Map();

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('user_online', async ({ userId }) => {
    online.set(userId, socket.id);
    try { await User.findByIdAndUpdate(userId, { online: true }); } catch (e) { }
    io.emit('online_users', Array.from(online.keys()));
  });

  socket.on('join_private', ({ room }) => { socket.join(room); });

  socket.on('typing', ({ room, from }) => { socket.to(room).emit('typing', { from }); });

  socket.on('stop_typing', ({ room, from }) => { socket.to(room).emit('stop_typing', { from }); });

  socket.on('private_message', async (data) => {
    const msg = new Message({ room: data.room, sender: data.from, receiver: data.to, content: data.content, type: data.type || 'text', delivered: online.has(data.to) });
    await msg.save();
    io.to(data.room).emit('private_message', msg);
    const sockId = online.get(data.to);
    if (sockId) io.to(sockId).emit('notification', { room: data.room, from: data.from });
  });

  socket.on('message_seen', async ({ messageId, userId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { seen: true });
      const msg = await Message.findById(messageId);
      io.to(msg.room).emit('message_seen', { messageId, by: userId });
    } catch (e) { }
  });

  socket.on('disconnect', async () => {
    for (const [uid, sid] of online.entries()) {
      if (sid === socket.id) {
        online.delete(uid);
        await User.findByIdAndUpdate(uid, { online: false }).catch(() => { });
        io.emit('online_users', Array.from(online.keys()));
        break;
      }
    }
    console.log('socket disconnected', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB connected');
  const port = process.env.PORT || 5000;
  index.listen(port, () => console.log('index listening on', port));
}).catch(err => console.error(err));
