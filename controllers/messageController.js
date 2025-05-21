const Message = require('../models/Message');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');

// Get all messages for a chat
exports.getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;

        // Validate chatId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
        }

        // Check if chat exists
        const chatExists = await Chat.exists({ _id: chatId });
        if (!chatExists) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Get all messages for the chat
        const messages = await Message.find({ chatId })
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { chatId, senderId, sender, text } = req.body;

        // Validate required fields
        if (!chatId || !senderId || !sender || !text) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID, sender ID, sender type, and text are required'
            });
        }

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(senderId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID or sender ID'
            });
        }

        // Validate sender type
        if (!['user', 'agent'].includes(sender)) {
            return res.status(400).json({
                success: false,
                message: 'Sender must be either "user" or "agent"'
            });
        }

        // Check if chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Create the message
        const message = await Message.create({
            chatId,
            senderId,
            sender,
            text,
            read: false
        });

        // Update last message in chat
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: {
                text,
                timestamp: new Date()
            },
            updatedAt: new Date()
        });

        return res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { chatId, recipientType } = req.body;

        // Validate required fields
        if (!chatId || !recipientType) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID and recipient type are required'
            });
        }

        // Validate chatId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
        }

        // Validate recipient type
        if (!['user', 'agent'].includes(recipientType)) {
            return res.status(400).json({
                success: false,
                message: 'Recipient type must be either "user" or "agent"'
            });
        }

        // Mark messages as read where the recipient is the opposite of the sender
        const sender = recipientType === 'user' ? 'agent' : 'user';

        const result = await Message.updateMany(
            {
                chatId,
                sender,
                read: false
            },
            {
                read: true
            }
        );

        return res.status(200).json({
            success: true,
            message: `Marked ${result.modifiedCount} messages as read`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};