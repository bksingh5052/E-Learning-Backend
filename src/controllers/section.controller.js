import Course from '../models/course.model.js'
import Section from "../models/section.model.js";
import SubSection from "../models/subSection.model.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { ApiResponseHandler } from '../utils/ApiResponseHandler.js';
import { asyncHandler } from "../utils/asyncHandler.js";


const createSection = asyncHandler(async(req,res)=>{
    const { sectionName } = req.body;
    const {courseId} = req.params;

		// Validate the input
		if (!sectionName || !courseId) {
			return res.status(400).json(
                new ApiErrorHandler(400,"Missing required properties"));
		}

		// Create a new section with the given name
		const newSection = await Section.create({ sectionName });

		// Add the new section to the course's content array
		const updatedCourse = await Course.findByIdAndUpdate(
			courseId,
			{
				$push: {
					courseContent: newSection._id,
				},
			},
			{ new: true }
		)
			.populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();

		// Return the updated course object in the response
		res.status(200).json(
            new ApiResponseHandler(200,updatedCourse,"Section created successfully"));
})
const updateSection = asyncHandler(async(req,res)=>{
    const { sectionName} = req.body;
    const {courseId ,sectionId } = req.params;

		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);
		const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();
        console.log(course)

		res.status(200).json(
            new ApiResponseHandler(200,section,"Section updated successfully"));
})
const deleteSection = asyncHandler(async(req,res)=>{
    const { sectionId, courseId }  = req.params;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		if(!section) {
			return res.status(404).json(
                new ApiErrorHandler(404,"Section not Found"))
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json(
            new ApiResponseHandler(200,course,"Section deleted"));
})




export{createSection,updateSection,deleteSection}