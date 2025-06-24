import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    otp: { type: String },
    otpExpires: { type: Date },
    otpVerified: { type: String },
    password: { type: String, required: true },
    phoneNumber: { type: String, default: 0 },
    status: {
      type: String,
      enum: ["block", "unblock"],
      default: "unblock",
    },
    role: {
      type: String,
      enum: [ "user", "Admin"],
      default: "user",
    },
    createdOn: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

const UserModel = mongoose.model("User", userSchema);

export const createDefaultAdmin = async () => {
  try {
    const adminExists = await UserModel.findOne({ role: "Admin" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Aniket@2024@", 10);
      const admin = new UserModel({
        name: "Aniket Yadav",
        email: "yaniket2070@gmail.com",
        password: hashedPassword,
        role: "Admin",
      });
      await admin.save();
      console.log("Default admin created 😎🧐🤓");
    } else {
      console.log("Default admin already created 😛😁😄.");
    }
  } catch (error) {
    console.error("Error creating default admin user:", error);
  }
};

createDefaultAdmin();

export default UserModel;
