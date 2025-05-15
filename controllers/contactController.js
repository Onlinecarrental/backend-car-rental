const ContactMessage = require('../models/ContactMessage');

exports.createContact = async (req, res) => {
  try {
    const { name, email, message, role } = req.body;
    const contact = new ContactMessage({ name, email, message, role });
    await contact.save();
    res.status(201).json({ message: 'Contact message saved!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};