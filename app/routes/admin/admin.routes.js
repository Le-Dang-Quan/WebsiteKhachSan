const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');
const upload = require('../../middlewares/upload.middlewares'); // Đường dẫn đến file middleware upload

router.get('/', adminController.view);
router.post('/', upload.single('QrCode'), adminController.update);

module.exports = router;