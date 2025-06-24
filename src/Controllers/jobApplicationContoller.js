import Job from "../Models/jobApplicationModel.js";
import Joi from "joi";

/**
 * @swagger
 * /api/applyJob:
 *   post:
 *     summary: Submit job application form
 *     description: Apply for a job by submitting personal details and uploading a resume PDF
 *     tags:
 *       - Job Application
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - jobRole
 *               - degree
 *               - skills
 *               - mobileNo
 *               - gender
 *               - resume
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               jobRole:
 *                 type: string
 *               degree:
 *                 type: string
 *               skills:
 *                 type: string
 *                 example: "Node.js,Express,MongoDB"
 *               mobileNo:
 *                 type: number
 *               gender:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [shortlisted, rejected, view, viewed]
 *               resume:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Application submitted
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
export const applyJob = async (req, res) => {
  const validationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    jobRole: Joi.string().required(),
    gender : Joi.string().required(),
    degree: Joi.string().required(),
    skills: Joi.string().required(),
    mobileNo: Joi.number().integer().min(6000000000).max(9999999999).required(),
    status: Joi.string()
      .valid("shortlisted", "rejected", "view", "viewed")
      .optional(),
  });

  try {
    const validatedBody = await validationSchema.validateAsync(req.body);
    const { name, email, jobRole, degree, skills,gender, mobileNo, status } =
      validatedBody;
    const resume = req.file?.path;
    if (!resume) {
      return res.status(400).json({ message: "Resume PDF is required" });
    }
    const newJob = new Job({
      name,
      email,
      jobRole,
      degree,
      skills: skills.split(",").map((s) => s.trim()),
      mobileNo,
      gender,
      status,
      resume,
    });
    await newJob.save();
    res.status(201).json({ message: "Application submitted", data: newJob });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit application",
      error: error.message,
    });
  }
};
