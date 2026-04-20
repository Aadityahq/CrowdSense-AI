function getSession(req, res) {
  return res.json({
    uid: req.user?.uid || null,
    email: req.user?.email || null,
    role: req.user?.role || null,
  });
}

module.exports = { getSession };
