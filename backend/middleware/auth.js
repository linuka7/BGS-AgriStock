const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  const token =
    authorizationHeader &&
    authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  try {
    const decodedUser = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decodedUser;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or expired.",
    });
  }
}

module.exports = authenticateToken;