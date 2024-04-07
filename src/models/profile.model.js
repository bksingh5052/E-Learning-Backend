import { Schema, model } from "mongoose";

// Define the Profile schema
const profileSchema = new Schema({
	gender: {
		type: String,
	},
	dateOfBirth: {
		type: String,

	},
	about: {
		type: String,
		trim: true,

	},
	contactNumber: {
		type: Number,
		trim: true,
	
	},
});

// Export the Profile model
export default model("Profile", profileSchema);
