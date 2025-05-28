const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

exports.register = async (req, res) => {
    const { username, password } = req.body // ✅ вот они!
    try {
        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ username, password: hashedPassword })
        await newUser.save()
        res.status(201).json({ message: 'User created' })
    } catch (err) {
        res.status(500).json({ message: 'Error creating user' })
    }
}

exports.login = async (req, res) => {
    const { username, password } = req.body // ✅ вот они!
    try {
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' })
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.json({ token, id: user._id, username: user.username })
    } catch (err) {
        res.status(500).json({ message: 'Login error' })
    }
}
