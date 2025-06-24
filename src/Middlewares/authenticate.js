import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";

import dotenv from "dotenv";
dotenv.config();
export const authenticate = async (req, res, next) => {
  const token =
    req.header("Authorization") ||
    req.header("authorization") ||
    req.header("token");
  if (!token) {
    return res
      .status(401)
      .json({ status: 401, message: "Unauthorized - No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    // console.log(user,"------.123")
    if (!user) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ statusCode: 401, message: "Token invalid or expired" });
  }
};
