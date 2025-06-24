import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../Models/userModel.js";
import JobApplication from "../Models/jobApplicationModel.js";
import moment from "moment";

import dotenv from "dotenv";
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

/**
 * @swagger
 * /admin/dashboardData:
 *   get:
 *     summary: Dashboard Data
 *     tags:
 *       - Admin
 *     description: >
 *     parameters:
 *       - in: header
 *         name: token
 *         description: Bearer token for admin authentication
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of applied candidates
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       403:
 *         description: Forbidden - user is not an admin
 *       500:
 *         description: Server error
 */
export const dashboardData = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user);
    if (!user || user.role !== "Admin") {
      return res.status(403).json({ statusCode: 403, message: "You are not an admin" });
    }

    const total = await JobApplication.countDocuments();
    const shortlisted = await JobApplication.countDocuments({ status: "shortlisted" });
    const rejected = await JobApplication.countDocuments({ status: "rejected" });
    const viewed = await JobApplication.countDocuments({ status: "viewed" });
    const view = await JobApplication.countDocuments({ status: "view" });

    return res.status(200).json({
      statusCode: 200,
      total,
      shortlisted,
      rejected,
      viewed,
      view,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
  }
};


/**
 * @swagger
 * /admin/allCandidates:
 *   get:
 *     summary: Get all applied candidates
 *     tags:
 *       - Admin
 *     description: >
 *       Retrieve a paginated, searchable, and sortable list of applied candidates.
 *       When searching (by skill or status), only results from the last 3 months are returned.
 *       Requires admin authentication.
 *     parameters:
 *       - in: header
 *         name: token
 *         description: Bearer token for admin authentication
 *         required: true
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - name: skill
 *         in: query
 *         description: Filter by candidate skill
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Filter by application status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [shortlisted, rejected, view, viewed]
 *     responses:
 *       200:
 *         description: A list of applied candidates
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       403:
 *         description: Forbidden - user is not an admin
 *       500:
 *         description: Server error
 */
export const allCandidates = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user);
    // console.log(user,"======>123")
    if (!user || user.role !== "Admin") {
      return res
        .status(403)
        .json({ statusCode: 403, message: "You are not Admins" });
    }
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      skill,
      status,
    } = req.query;
    const query = {};

    if (skill || status) {
      const threeMonthsAgo = moment().subtract(3, "months").toDate();
      query.createdAt = { $gte: threeMonthsAgo };
    }

    if (skill) {
      query.skills = { $in: [skill] };
    }
    const allowedStatus = ["shortlisted", "rejected", "view", "viewed"];
    if (status && allowedStatus.includes(status)) {
      query.status = status;
    }

    const total = await JobApplication.countDocuments(query);

    const candidates = await JobApplication.find(query)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      statusCode: 200,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: candidates,
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ statusCode: 500, error: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /admin/deleteCandidate/{id}:
 *   delete:
 *     summary: Delete an applied candidate
 *     tags:
 *       - Admin
 *     description: Delete a candidate application by ID. Only accessible by Admin.
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: Bearer token for admin authentication
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate application ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       403:
 *         description: Forbidden - user is not an admin
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Internal server error
 */
export const deleteCandidate = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "Admin") {
      return res
        .status(403)
        .json({ statusCode: 403, message: "You are not Admins" });
    }
    const { id } = req.params;
    const deleted = await JobApplication.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Candidate not found" });
    }
    res.status(200).json({
      statusCode: 200,
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /admin/updateStatus/{id}:
 *   patch:
 *     summary: Update a candidate application status
 *     tags:
 *       - Admin
 *     description: Update candidate status 
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: Bearer token for admin authentication
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate application ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [shortlisted, rejected]
 *                 example: shortlisted
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status or request
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       403:
 *         description: Forbidden - not an admin
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
export const updateCandidateStatus = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "Admin") {
      return res.status(403).json({
        statusCode: 403,
        message: "You are not Admins",
      });
    }
    const { id } = req.params;
    // console.log(req.params,"12345")
    const { status } = req.body;

    const allowedStatus = ["shortlisted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        statusCode: 400,
        message: "Status must be either 'shortlisted' or 'rejected'",
      });
    }
    const candidate = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!candidate) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Candidate not found" });
    }
    res.status(200).json({
      statusCode: 200,
      message: `Candidate status updated to '${status}'`,
      data: candidate,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /admin/getCandidateById/{id}:
 *   get:
 *     summary: Get candidate by ID 
 *     tags:
 *       - Admin
 *     description: Fetches candidate details".
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         description: Bearer token for admin authentication
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the candidate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate details retrieved and status updated if applicable
 *       403:
 *         description: Forbidden - not an admin
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
export const getCandidateById = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== "Admin") {
      return res.status(403).json({
        statusCode: 403,
        message: "You are not Admins",
      });
    }
    const { id } = req.params;
    //console.log(req.params,"1111123")
    const candidate = await JobApplication.findById(id);
    if (!candidate) {
      return res.status(404).json({
        statusCode: 404,
        message: "Candidate not found",
      });
    }
    const data = ["shortlisted", "rejected"];
    if (!data.includes(candidate.status)) {
      candidate.status = "viewed";
      await candidate.save();
    }

    res.status(200).json({
      statusCode: 200,
      message: "Candidate fetched successfully",
      data: candidate,
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};
