const express = require('express');
const router = express.Router();
const multer = require('multer');
const aboutController = require('../controllers/aboutController');

const upload = multer({
  dest: 'uploads/about/'
});

router.get('/', aboutController.getAllSections);
router.patch('/:sectionType', upload.single('image'), aboutController.updateSection);

module.exports = router;