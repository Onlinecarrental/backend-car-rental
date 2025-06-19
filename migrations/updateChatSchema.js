const mongoose = require('mongoose');
require('dotenv').config();

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Update existing chats to include the status field
const updateChatSchema = async () => {
    try {
        await connectDB();
        
        const db = mongoose.connection.db;
        const chatsCollection = db.collection('chats');
        
        // Add status field to all existing chats and set to 'active'
        const result = await chatsCollection.updateMany(
            { status: { $exists: false } }, // Only update docs without status
            { $set: { status: 'active' } }
        );
        
        console.log(`Updated ${result.modifiedCount} chats with status field`);
        
        // Create indexes
        await chatsCollection.createIndex({ userId: 1, agentId: 1, status: 1 }, { unique: true });
        await chatsCollection.createIndex({ status: 1, updatedAt: -1 });
        
        console.log('Created indexes');
        
        process.exit(0);
    } catch (error) {
        console.error('Error updating chat schema:', error);
        process.exit(1);
    }
};

// Run the migration
updateChatSchema();
