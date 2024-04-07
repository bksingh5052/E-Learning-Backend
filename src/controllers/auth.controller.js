import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Token from "../models/token.model.js";
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { emaiVerification } from "../mail/templates/email-verification template.js";
import { config } from "../configs/config.js";
import Profile from "../models/profile.model.js";

const generateAccessAndRefereshTokens = async (req,res,userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    res.status(500).json( new ApiErrorHandler(
      500,
      "Something went wrong while generating referesh and access token"
    ))
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, accountType,gender } = req.body;

  if ([name, email, password].some((field) => field?.trim() === "")) {
    return res
      .status(400)
      .json(new ApiErrorHandler(400, "All fields are required"));
  }
  const strongePasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/;
  const mailFormate = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const isMailIsFormate = mailFormate.test(email)
  if(!isMailIsFormate){
    return res
      .status(400)
      .json(new ApiErrorHandler(401, "Please enter valid email"));
  }
  const isPasswordStronge = strongePasswordPattern.test(password)
  if(!isPasswordStronge){
    return res
      .status(400)
      .json(new ApiErrorHandler(401, "Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters"));
  }


  const existedUser = await User.findOne({ email });

  if (existedUser) {
    if(!existedUser.isVerified){
      const token = await Token.findOne({userId:existedUser._id}).sort({ createdAt: -1 }).limit(1)
      const url = `${config.get('backendBaseUrl')}/auth/${existedUser._id}/verify/${token.token}`;
      const {error,data} = await emaiVerification(existedUser.email, "Verify Email", url);
      // console.log(res)
      if(error){
        return res.status(error.statusCode).json(new ApiErrorHandler(error.statusCode, error.message))
      }

      return res
    .status(200)
    .json(
      new ApiResponseHandler(
        200,
        "An email has been send to your account please verify"
      )
    );
    }

    return res
      .status(400)
      .json(new ApiErrorHandler(409, "User with email already exists"));
  }



  const image = `https://api.dicebear.com/5.x/initials/svg?seed=${name.split(' ')[0]}%20${name.split(' ').length > 1? name.split(" ")[1]: ""}`


  const profile = await Profile.create({
    gender: null,
    dateOfBirth: null,
    about: null,
    contactNumber: null
  })
  const user = await User.create({
    name,
    image,
    email,
    password,
    accountType,
    additionalDetails: profile._id
  });



  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return res
      .status(500)
      .json(
        new ApiErrorHandler(
          500,
          "Something went wrong while registering the user"
        )
      );
  }


  const token = await new Token({
    userId: createdUser._id,
    token: crypto.randomUUID(32).toString("hex"),
  }).save();

  const url = `${config.get('backendBaseUrl')}/auth/${createdUser._id}/verify/${token.token}`;
  const {error,data} = await emaiVerification(createdUser.email, "Verify Email", url);
  if(error){

    return res.status(error.statusCode).json(new ApiErrorHandler(error.statusCode, error.message))
  }
  return res
    .status(200)
    .json(
      new ApiResponseHandler(
        200,
        "An email has been send to your account please verify"
      )
    );
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json(new ApiErrorHandler(400, "email is required"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(401)
      .json(new ApiErrorHandler(404, "User does not exist"));
  }
  if(!user.isVerified){
    const token = await Token.find({userId:user._id})
    // console.log(token)
    if(token.length > 0){
      return res.status(400).json(new ApiErrorHandler(400, "Please verify your account to login"));
    }
    const createdToken = await new Token({
      userId: user._id,
      token: crypto.randomUUID(32).toString("hex"),
    }).save();
  
    const url = `${config.get('backendBaseUrl')}/auth/${user._id}/verify/${createdToken.token}`;
    const {error,data} = await emaiVerification(user.email, "Verify Email", url);
    if(error){
  
      return res.status(error.statusCode).json(new ApiErrorHandler(error.statusCode, error.message))
    }
    return res
      .status(200)
      .json(
        new ApiResponseHandler(
          200,
          "An email has been send to your account please verify"
        )
      );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json(new ApiErrorHandler(401, "Invalid user credentials"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(req,res,
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponseHandler(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });
  if (!user) {
    return res.status(401).json(new ApiErrorHandler(401, "Invalid link"));
  }
  const token = await Token.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if(!token){
    return res.status(401).json(new ApiErrorHandler(401, "Invalid link"));
  }

  user.isVerified = true
  await user.save()
  await Token.deleteOne({_id:token._id})
  const verifiedUser = await User.findById(user._id).select("-password -refreshToken")
  // res.redirect('/login');
  return res
    .status(200)
    .json(
      new ApiResponseHandler(
        200,
        {
          user: verifiedUser,
        },
        "You have verified your account, Please Loggin"
      )
    );


});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponseHandler(200, {}, "User logged Out"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const _id = req.user._id;
  let user = await User.findById(_id);
  if (!user) {
    return res
      .status(401)
      .json(new ApiErrorHandler(404, "User does not exist"));
  }
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    return res
      .status(401)
      .json(new ApiErrorHandler(401, "Invalid user credentials"));
  }

  user.password = newPassword;
  user.save();

  return res
    .status(200)
    .json(new ApiResponseHandler(200, {}, "Password changged successfully"));
});

export { registerUser, loginUser, logoutUser, verifyEmail,changePassword };
