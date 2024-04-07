import Section from "../models/section.model.js";
import SubSection from "../models/subSection.model.js"
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";


const createSubSection = asyncHandler(async(req,res)=>{
    const { title, description } = req.body
    const {sectionId} = req.params
    const video = req.files.video

    // Check if all necessary fields are provided
    if (!sectionId || !title || !description || !video) {
      return res
        .status(404)
        .json(
            new ApiErrorHandler(404,"All Fields are Required"))
    }
    console.log(video)

    // Upload the video file to Cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      "video"
    )
    console.log(uploadDetails)
    // Create a new sub-section with the necessary information
    const SubSectionDetails = await SubSection.create({
      title,
      timeDuration: `${uploadDetails.duration}`,
      description,
      videoUrl: uploadDetails.secure_url,
    })

    // Update the corresponding section with the newly created sub-section
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection")

    // Return the updated section in the response
    return res.status(200).json(
        new ApiResponseHandler(200,updatedSection,"Successfully Updated Section"))
})


const updateSubSection = asyncHandler(async (req,res)=>{
    const {  title, description } = req.body
    const {sectionId, subSectionId} = req.params;
    const subSection = await SubSection.findById(subSectionId)

    if (!subSection) {
      return res.status(404).json(
        new ApiErrorHandler(400,"SubSection not found"))
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        "video"
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    console.log("updated section", updatedSection)

    return res.status(200).json(
        new ApiResponseHandler(200,subSection,"Successfully Updated Sub-section"))
})


const deleteSubSection = asyncHandler(async (req,res)=>{
    const { subSectionId, sectionId } = req.params
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json(
            new ApiErrorHandler(404,"SubSection not found"))
    }

    // find updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    )

    return res.status(200).json(
        new ApiResponseHandler(200,updatedSection,"SubSection deleted successfully"))
})


export {createSubSection,updateSubSection,deleteSubSection}