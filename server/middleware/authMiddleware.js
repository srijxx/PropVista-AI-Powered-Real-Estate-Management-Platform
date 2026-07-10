const jwt = require("jsonwebtoken");

/**
 * authMiddleware
 * Verifies the Bearer token in the Authorization header.
 * Attaches decoded payload to req.user = { id, email }.
 */
module.exports = function auth(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token — authorization denied" });
  }

  const token = authHeader.slice(7).trim(); // remove "Bearer "

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    const msg = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    res.status(401).json({ message: msg });
  }
};
