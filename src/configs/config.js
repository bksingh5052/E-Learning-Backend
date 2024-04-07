import dotenv from "dotenv"
dotenv.config();
const _config  = {
    mongodbUrl: process.env.MONGODB_URL,
    refreshTokenSecret : process.env.REFRESH_TOKEN_SECRET,
    accessTokenSecret : process.env.ACCESS_TOKEN_SECRET,
    port: process.env.PORT,
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
    resendApiKey: process.env.RESEND_API_KEY,
    backendBaseUrl: process.env.BACKEND_BASE_URL,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudinaryApiKey:  process.env.CLOUDINARY_API_KEY,
    cloudinayCloudName:  process.env.CLOUDINARY_CLOUD_NAME,

}

export const config = {
    get(key){
        const value = _config[key];
        if(!value){
            console.error(`The ${key} variable is not found. Make sure to pass  the correct environment variables`)
            process.exit(1)
        }
        return value;
    }
}