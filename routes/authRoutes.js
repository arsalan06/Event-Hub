const authControler = require("../controlers/authControler");
const express = require("express");
const authRouter = express.Router();
const {signup, login, verifyOtp, resetPassword}=authControler
const {protect} =require("../midlewares/protection")
authRouter.post("/signup",signup);
authRouter.post("/login",login);
authRouter.post("/verifyOtp",verifyOtp);
authRouter.route("/resetPassword").post(protect,resetPassword);
module.exports = authRouter