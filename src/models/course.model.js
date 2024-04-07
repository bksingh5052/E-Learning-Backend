import { Schema, model } from "mongoose";


// Define the Courses schema
const coursesSchema = new Schema({
	courseName: {
		 type: String,
		 required: true 
		},
	courseDescription: { 
		type: String,
		required: true },
	instructor: {
		type: String,
		required: true,
	},
	whatYouWillLearn: {
		type: String,
	},
	courseContent: [
		{
			type: Schema.Types.ObjectId,
			ref: "Section",
		},
	],
	price: {
		type: Number,
	},
	thumbnail: {
		type: String,
	},
	category: {
		type: Schema.Types.ObjectId,
		// required: true,
		ref: "Category",
	},
	studentsEnrolled: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
	status: {
		type: String,
		enum: ["Draft", "Published"],
	},
	
},{timestamps :true});

// Export the Courses model
export default model("Course", coursesSchema);