
const jwt = require('jsonwebtoken');
module.exports = (req,res,next)=>{
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message:'No token' });
  const token = header.split(' ')[1];
  try { const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret'); req.userId = payload.userId; next(); } catch(e){ res.status(401).json({ message:'Invalid token' }); }
};
