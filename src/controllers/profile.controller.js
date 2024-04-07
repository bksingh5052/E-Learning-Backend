import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import Profile from "../models/profile.model.js";
import Course from "../models/course.model.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import mongoose from "mongoose"

const getUserDetails = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const userDetails = await User.findById(id)
    .populate("additionalDetails")
    .populate('courses')
    .exec();
  //   console.log(userDetails)
  res
    .status(200)
    .json(
      new ApiResponseHandler(200, userDetails, "User Data fetched successfully")
    );
});


const updateProfile = asyncHandler(async ( req, res ) => {
  const {
    name ,
    dateOfBirth ,
    about ,
    contactNumber,
    gender ,
  } = req.body
  const userId = req.user._id

  // Find the profile by id
  const userDetails = await User.findById(userId)
  console.log(userDetails)

  const profile = await Profile.findById(userDetails.additionalDetails)
  console.log(profile)

    const user = await User.findByIdAndUpdate(userId, {
      name
    })
    await user.save()
 



  // Update the profile fields
  profile.dateOfBirth = dateOfBirth
  profile.about = about
  profile.contactNumber = contactNumber
  profile.gender = gender

  // // Save the updated profile
  await profile.save()

  // // Find the updated user details
  const updatedUserDetails = await User.findById(userId)
    .populate("additionalDetails")
    .exec()

  return res.status(200).json(
    new ApiResponseHandler(200, updatedUserDetails,"Profile updated successfully"))
 })

 const updateProfilePic  = asyncHandler(async ( req, res)=>{
  const displayPicture = req.files.displayPicture
    const userId = req.user._id
    const image = await uploadImageToCloudinary(
      displayPicture,
    )
    const updatedProfile = await User.findByIdAndUpdate(
      userId ,
      { image: image.secure_url },
      { new: true }
    )
    res.status(200).json(
      new ApiResponseHandler(200,updateProfile,"Image Updated successfully"))
})



const deleteAccount  = asyncHandler(async(req,res)=>{
  const userId = req.user._id
  const user = await User.findById(userId)
  if (!user) {
    return res.status(404).json(
      new ApiErrorHandler(404, "User not found"))
  }

  // Delete Assosiated Profile with the User
  await Profile.findByIdAndDelete({
    _id: new mongoose.Types.ObjectId(user.additionalDetails),
  })
  for (const courseId of user.courses) {
    await Course.findByIdAndUpdate(
      courseId,
      { $pull: { studentsEnroled: id } },
      { new: true }
    )
  }
  // Now Delete User
  await User.findByIdAndDelete(userId)
  res.status(200).json(
    new ApiResponseHandler(200,{},"User deleted successfully"))
})




export { getUserDetails,updateProfile,deleteAccount,updateProfilePic };
