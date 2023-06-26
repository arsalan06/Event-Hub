const jwt = require("jsonwebtoken");
exports.verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        res.send({
          status: 402,
          message: "Invalid Token",
        });
      } else {
        req.auth = authData;
        next();
      }
    });
  } else {
    res.send({
      status: 400,
      message: "Token is not valid",
    });
  }
};