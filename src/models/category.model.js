import { Schema, model } from "mongoose";

// Define the Tags schema
const categorySchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	description: { type: String },
	courses: [
		{
			type: Schema.Types.ObjectId,
			ref: "Course",
		},
	],
});

// Export the Tags model
export default model("Category", categorySchema);