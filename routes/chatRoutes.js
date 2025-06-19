const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const messageController = require('../controllers/messageController');

// Chat routes
router.get('/user/:userId', chatController.getUserChats);
router.get('/agent/:agentId', chatController.getAgentChats);
router.get('/:chatId', chatController.getChatById);
router.post('/', chatController.createOrGetChat);
router.get('/agents', chatController.getAllAgents);

// Message routes
router.get('/:chatId/messages', messageController.getChatMessages);
router.post('/messages', messageController.sendMessage);
router.put('/messages/read', messageController.markMessagesAsRead);

module.exports = router;