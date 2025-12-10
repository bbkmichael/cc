cd ~/cloud-computing/cc/coursework-mingle/src/middleware
cat > auth.js << 'EOF'
const jwt = require('jsonwebtoken');

// verifin access token
module.exports = function(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'no token provided' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach user payload
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'no valid or expired token' });
  }
};
EOF

