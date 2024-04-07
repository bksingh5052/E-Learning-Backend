import {ApiErrorHandler} from "../utils/ApiErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { config } from "../configs/config.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json(new ApiErrorHandler(401, "Unauthorized request"));
    }

    const decodedToken = jwt.verify(token, config.get('accessTokenSecret'));

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res
        .status(401)
        .json(new ApiErrorHandler(401, "Invalid Access Token"));
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(new ApiErrorHandler(401, error?.message || "Invalid access token"));
  }
});


export const authorizeForRole = accountTypes=> asyncHandler( async(req,res,next)=>{
  const userId = req.user._id;
  const user = await User.findById(userId);

  const accountType = user.accountType;


  if(!accountTypes.includes(accountType)){
      return res.status(401).json(
        new ApiErrorHandler(401,"You're not authorized"))
  }
  next(); 
}
)
