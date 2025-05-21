require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const Message = require('./models/Message');
const Chat = require('./models/Chat');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join a chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  // Leave a chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`Socket ${socket.id} left chat: ${chatId}`);
  });

  // Handle new message
  socket.on('send_message', async (messageData) => {
    try {
      const { chatId, senderId, sender, text } = messageData;

      // Save message to database
      const message = await Message.create({
        chatId,
        senderId,
        sender,
        text,
        read: false,
        createdAt: new Date()
      });

      // Update last message in chat
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
          text,
          timestamp: new Date()
        },
        updatedAt: new Date()
      });

      // Broadcast message to chat room
      io.to(chatId).emit('new_message', {
        id: message._id,
        chatId,
        senderId,
        sender,
        text,
        read: false,
        createdAt: message.createdAt
      });
    } catch (error) {
      console.error('Error sending message via socket:', error);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { chatId, user } = data;
    socket.to(chatId).emit('user_typing', user);
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    const { chatId, user } = data;
    socket.to(chatId).emit('user_stop_typing', user);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start the application
connectDB();
