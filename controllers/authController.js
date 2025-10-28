
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req,res)=>{
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message:'username & password required' });
  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message:'username taken' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();
    res.json({ userId: user._id, username: user.username });
  } catch(e){ res.status(500).json({ message: e.message }); }
};

exports.login = async (req,res)=>{
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message:'username & password required' });
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message:'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message:'invalid credentials' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn:'7d' });
    res.json({ token, userId: user._id, username: user.username, avatar: user.avatar });
  } catch(e){ res.status(500).json({ message: e.message }); }
};
