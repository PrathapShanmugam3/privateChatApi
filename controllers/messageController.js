
const Message = require('../models/Message');
exports.getPrivateMessages = async (req,res)=>{
  const { room } = req.params;
  try {
    const msgs = await Message.find({ room }).sort({ createdAt: 1 }).populate('sender','username avatar').populate('receiver','username avatar');
    res.json(msgs);
  } catch(e){ res.status(500).json({ message: e.message }); }
};
