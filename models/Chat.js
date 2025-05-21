const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastMessage: {
        text: String,
        timestamp: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create a compound index for userId and agentId to ensure unique chat sessions
chatSchema.index({ userId: 1, agentId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);