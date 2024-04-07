import { v2 as cloudinary } from "cloudinary"; 
import { config } from "./config.js";

export function cloudinaryConnect() {
	try {
		cloudinary.config({
			//!    ########   Configuring the Cloudinary to Upload MEDIA ########
			cloud_name: config.get('cloudinayCloudName'),
			api_key: config.get('cloudinaryApiKey'),
			api_secret: config.get('cloudinaryApiSecret'),
            
		});
        console.log("Cloudinary Connected")
	} catch (error) {
		console.log(error);
	}
}