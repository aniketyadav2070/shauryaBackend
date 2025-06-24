import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../Models/userModel.js";

import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
/**
 * @swagger
 * /admin/adminLogin:
 *   post:
 *     summary: Admin login
 *     description: Logs in an admin using email and password.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
export const adminLogin = async (req, res) => {
  const validationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  try {
    const { email, password } = await validationSchema.validateAsync(req.body);

    const admin = await UserModel.findOne({
      email,
      role: { $in: ["Admin"] },
    });

    if (!admin) {
      return res.status(400).json({
        statusCode: 400,
        message: "You are not an admin",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        statusCode: 400,
        message: "Password is incorrect",
      });
    }

    const token = jwt.sign({ userId: admin._id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      statusCode: 200,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};
