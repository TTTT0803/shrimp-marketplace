module.exports = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chi Admin moi co quyen truy cap' });
  }
  next();
};