import { Schema, model } from "mongoose";

// Define the Section schema
const sectionSchema = new Schema({
	sectionName: {
		type: String,
	},
	subSection: [
		{
			type: Schema.Types.ObjectId,
			required: true,
			ref: "SubSection",
		},
	],
});

// Export the Section model
export default model("Section", sectionSchema);