const { User } = require("../models");
const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const nodemailer = require("nodemailer");
// const bcrypt = require('bcrypt');
const otpGenerator = require("otp-generator");
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "sandbox.smtp.mailtrap.io",
//   port: 25,

//   auth: {
//     user: "2bade481c14129",
//     pass: "3eae85a648ca98",
//   },
// });
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
// const correctPassword = async (candidatePassword, userPassword) => {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };
exports.signup = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(
        new appError("Password and confirm password is not same", 401)
      );
    }
    const verificationCode = otpGenerator.generate(4, {
      upperCase: false,
      specialChars: false,
    });
    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const newUser = await User.create({
      fullName,
      email,
      password,
      verificationCode,
      verificationCodeExpiresAt,
    });
    // const mailOptions = {
    //   from: process.env.EVENT_HUB_EMAIL,
    //   to: email,
    //   subject: "Hello from NodeMailer",
    //   text: verificationCode,
    // };
    // console.log("be")
    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error("here is error:",error);
    //   } else {
    //     console.log("Email sent:", info.response);
    //   }
    // });
    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
        otp: verificationCode,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      status: "Fail",
      message: err,
    });
  }
};
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return next(new appError("this user does not exist", 401));
    } else {
      if (user.verificationCode === otp) {
        const currentDateTime = new Date();
        const otpExpirationDateTime = new Date(user.verificationCodeExpiresAt);

        if (currentDateTime <= otpExpirationDateTime) {
          user.isVerified = true;
          const newUser = {
            fullName: user.fullName,
            email: user.email,
            password: user.password,
            isVerified: true,
          };
          const updatedUser = await User.update(newUser, {
            where: { email: email },
          });
          res.status(401).json({
            status: "success",
            data: {
              isVerified: (updatedUser[0] = 1 ? true : false),
            },
          });
        } else {
          return next(new appError("otp is expired", 401));
        }
      } else {
        return next(new appError("Otp is not correct", 401));
      }
    }
  } catch (err) {
    res.status(401).json({
      status: "Fail",
      message: err,
    });
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new appError("please provide email or password", 401));
    } else if (email && password) {
      const user = await User.scope("withCreditionals").findOne({
        where: { email: email },
      });
      if (!user || !user.isVerified) {
        return next(new appError("This user does not exist", 401));
      }
      const correct = await user.comparePassword(password);
      if (!correct) {
        return next(new appError("please provide valid password", 401));
      }
      const token = signToken(user.id);
      user.password = undefined;
      res.status(201).json({
        status: "success",
        token,
        data: {
          user,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      status: "Fail",
      message: err,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    console.log("user");
    console.log("user");
    console.log(req.auth);
    const user = await User.scope("withCreditionals").findOne({
      where: { id: req.auth.id },
    });
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(
        new appError("Password and confirm password is not same", 401)
      );
    }
    if (!user) {
      return next(new appError("This user does not exist.", 401));
    }
    const newUser = {
      password: password,
    };
    const updatedUser = await User.update(newUser, {
      where: { id: user.id },
    });
    if (updatedUser[0] == 1) {
      res.status(401).json({
        status: "success",
        data: {
          message: "Password updated successfuly",
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      status: "Fail",
      message: err,
    });
  }
};
