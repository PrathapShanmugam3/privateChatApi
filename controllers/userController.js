
const User = require('../models/User');
exports.listUsers = async (req,res)=>{
  try {
    const users = await User.find({}, 'username avatar online').sort({username:1});
    res.json(users);
  } catch(e){ res.status(500).json({ message: e.message }); }
};
