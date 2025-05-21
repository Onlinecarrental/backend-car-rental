const mongoose = require('mongoose');

const aboutusSchema = new mongoose.Schema({
    sectionType: {
        type: String,
        required: true,
        enum: ['hero', 'services', 'whyChoose', 'faqs']
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AboutUS', aboutusSchema);