const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.userId } }).select('_id username');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

module.exports = router;
