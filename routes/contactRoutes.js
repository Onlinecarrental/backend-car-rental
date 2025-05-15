const express = require('express');
const router = express.Router();
const { createContact, getAllContacts } = require('../controllers/contactController');
const { validateContact } = require('../middlewares/contactValidation');

router.post('/', validateContact, createContact);
router.get('/', getAllContacts);

module.exports = router;