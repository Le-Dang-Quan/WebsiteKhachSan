const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/website/message.controller');

router.post('/:id', messageController.postMessage);
router.get('/last/:id', messageController.getNewMessages);
router.get('/:id/admin', messageController.indexAdmin);
router.get('/:id', messageController.index);

module.exports = router;