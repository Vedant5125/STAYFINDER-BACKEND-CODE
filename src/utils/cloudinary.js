import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadImage = async (filePath) => {
    try {
        if(!filePath) return null;
        response = await cloudinary.uploader.upload(filePath, {resource_type: "auto"})
        console.log("file is uploaded to cloudinary ",response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(filePath);
        console.error("Error uploading image to Cloudinary:", error);
        return null;
    }
}

export default uploadImage;