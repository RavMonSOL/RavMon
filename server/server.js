const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

app.use('/api/user', require('./routes/user'));
app.use('/api/shop', require('./routes/shop'));
app.use('/api/battle', require('./routes/battle'));
app.use('/api/stake', require('./routes/stake'));

const battleQueue = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinQueue', (data) => {
    battleQueue.push({ socket, data });
    if (battleQueue.length >= 2) {
      const [player1, player2] = battleQueue.splice(0, 2);
      player1.socket.emit('matchFound', player2.data);
      player2.socket.emit('matchFound', player1.data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const index = battleQueue.findIndex((q) => q.socket.id === socket.id);
    if (index !== -1) battleQueue.splice(index, 1);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
