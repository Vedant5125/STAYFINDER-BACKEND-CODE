import asyncHandler from "../utils/asyncHandler.js";
import uploadImage from "../utils/cloudinary.js"
import Listing from "../models/listing.model.js"
import User from "../models/user.model.js"
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";

const uploadStay = asyncHandler (async (req, res) =>{
    const user = await User.findOne(req.user._id);
    if(!(user && user.role === "host")){
        throw new apiError(401, "Only hosts are allowed to upload stays")
    }

    const {title, description, price, type, guest} = req.body;
    const location = {
        country: req.body["location.country"],
        city: req.body["location.city"],
        address: req.body["location.address"],
    };

     if(
        [title, description, location.country, location.city, location.address, price, type, guest].some((field)=> field?.trim() === "")
    ){
        throw new apiError(400, "All fields are required");
    }

    const thumbnailLocalPath = req.files?.thumbnail[0].path;
    if(!thumbnailLocalPath){
        throw new apiError(400, "thumbnail image is required")
    }
    const thumbnail = await uploadImage(thumbnailLocalPath);
    if(!thumbnail){
        throw new apiError(400, "Profile image is required")
    }

    let supportImageUrls  = [];
    if (req.files && Array.isArray(req.files.supportImg) && req.files.supportImg.length > 0) {
    for (const file of req.files.supportImg) {
        const localPath = file.path; // This is already in public/temp from multer config

        const uploaded = await uploadImage(localPath); // Upload to Cloudinary

        if (uploaded?.url) {
        supportImageUrls.push(uploaded.url);
        }

        // Temp file is deleted inside uploadImage using fs.unlinkSync
    }
    }


    const listing = await Listing.create({
        title, 
        description, 
        location, 
        price, 
        type, 
        guest,
        thumbnail: thumbnail.url,
        supportImage: supportImageUrls,
        host : user._id
    })

    const listingCreated = await Listing.findById(listing._id)
    if(!listingCreated){
        throw new apiError(500, "Something went wrong while uploading new stay")
    }

    return res.status(201).json(
        new apiResponse(200, listingCreated, "Stay created successfully")
    )
})

export {uploadStay}