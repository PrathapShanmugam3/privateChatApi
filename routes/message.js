
const express = require('express');
const router = express.Router();
const msgCtrl = require('../controllers/messageController');
router.get('/room/:room', msgCtrl.getPrivateMessages);
module.exports = router;
