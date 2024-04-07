import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Schema, model } from "mongoose";
import { config } from "../configs/config.js";

// Define the user schema using the Mongoose Schema constructor
const userSchema = new Schema(
  {
    // Define the name field with type String, required, and trimmed
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Define the email field with type String, required, and trimmed
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
      index: true,
    },

    // Define the password field with type String and required
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    // Define the role field with type String and enum values of "Admin", "Student", or "Visitor"
    accountType: {
      type: String,
      enum: ["Admin", "Student"],
      default : "Student",
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    additionalDetails: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      // required: true
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    refreshToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    image: {
      type: String, //cloudinary url
    },

  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      accountType: this.accountType,
    },
    config.get('accessTokenSecret'),
    {
      expiresIn: config.get('accessTokenExpiry'),
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    config.get('refreshTokenSecret'),
    {
      expiresIn: config.get('refreshTokenExpiry'),
    }
  );
};

// Export the Mongoose model for the user schema, using the name "user"
export default model("User", userSchema);
