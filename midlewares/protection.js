const appError = require("../utils/appError");
const jwt = require("jsonwebtoken");
exports.protect = async (req, res, next) => {
  // 1) get the token if it exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new appError("your are not logged in to get access.", 401));
  }
  //2) verification token
  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    jwt.verify(token, process.env.JWT_SECRET, async (err, authData) => {
      if (err) {
        return next(new appError("Invalid Token.", 401));
      } else {
        req.auth = authData;
        next();
      }
      //3) check this user exists
      // const userExist = await User.findOne({ where: { id: authData.id } });
      // console.log(userExist);
      // if (userExist) {
      //   next();
      // } else {
      //   return next(new appError("This user is not exist.", 401));
      // }
    });
  } catch (err) {
    console.log(err);
    return next(new appError(err, 401));
  }
};
