const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all chats for a user
exports.getUserChats = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        // Find all chats where the user is involved
        const chats = await Chat.find({ userId })
            .populate('agentId', 'name email')
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            data: chats
        });
    } catch (error) {
        console.error('Error fetching user chats:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all chats for an agent
exports.getAgentChats = async (req, res) => {
    try {
        const { agentId } = req.params;

        // Validate agentId
        if (!mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid agent ID'
            });
        }

        // Find all chats where the agent is involved
        const chats = await Chat.find({ agentId })
            .populate('userId', 'name email')
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            data: chats
        });
    } catch (error) {
        console.error('Error fetching agent chats:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Create or get a chat
exports.createOrGetChat = async (req, res) => {
    try {
        const { userId, agentId } = req.body;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(agentId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user or agent ID'
            });
        }

        // Check if users exist
        const userExists = await User.exists({ _id: userId, role: 'user' });
        const agentExists = await User.exists({ _id: agentId, role: 'agent' });

        if (!userExists || !agentExists) {
            return res.status(404).json({
                success: false,
                message: 'User or agent not found'
            });
        }

        // Find or create a chat between the user and agent
        let chat = await Chat.findOne({ userId, agentId });

        if (!chat) {
            chat = await Chat.create({
                userId,
                agentId,
                lastMessage: null
            });
        }

        return res.status(200).json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error('Error creating/getting chat:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get all agents
exports.getAllAgents = async (req, res) => {
    try {
        const agents = await User.find({ role: 'agent' })
            .select('name email')
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            data: agents
        });
    } catch (error) {
        console.error('Error fetching agents:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Get a specific chat by ID
exports.getChatById = async (req, res) => {
    try {
        const { chatId } = req.params;

        // Validate chatId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat ID'
            });
        }

        // Find the chat and populate user and agent details
        const chat = await Chat.findById(chatId)
            .populate('userId', 'name email')
            .populate('agentId', 'name email');

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: chat
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};