import asyncHandler from "../utils/asyncHandler.js";
import uploadImage from "../utils/cloudinary.js";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
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

const showHostListings = asyncHandler (async (req, res) =>{
    const user = await User.findById(req.user?._id);
    if(!(user && user.role === "host")){
        throw new apiError(401, "Only hosts are allowed to see host uploaded stays")
    }
    const list = await Listing.find({host: user._id});
    if(!list){
        throw new apiError(400, "List not found")
    }
    if (list.length === 0) {
        return res
        .status(200)
        .json(new apiResponse(
            200, 
            [], 
            "No listings found for this host"
        ));
    }

    res
    .status(200)
    .json(new apiResponse(
        200, 
        list, 
        "Host's listings fetched"
    ));
})

const getListingById = asyncHandler( async(req, res) =>{
    const user = req.user?._id;
    const { id } = req.params;

    const listing = await Listing.findOne({
        _id: id, host: user
    })

    if (!listing) {
        throw new apiError(404, "Listing not found or you don't have permission");
    }

    return res.status(200).json(
        new apiResponse(
        200,
        listing,
        "Listing fetched successfully"
        )
    );
})

const updateHostList = asyncHandler( async (req, res) =>{
    const user = await User.findById(req.user?._id)
    if(!(user && user.role === "host")){
        throw new apiError(401, "Only hosts are allowed to update listings")
    }
    const { id } = req.params;
    const { title, price, description, location } = req.body;
    const updateFields = {
        title,
        price,
        description,
        "location.country": location?.country,
        "location.city": location?.city,
        "location.address": location?.address,
    };

    const list = await Listing.findByIdAndUpdate(
        { _id: id, host: user.id},
        {
            $set:{
                ...updateFields
            }
        },
        {new: true}
    )
    if(!list){
        throw new apiError(404, "Listing not found or not authorized");
    }

    return res
    .status(200)
    .json(new apiResponse(
        200, 
        list, 
        "Listing updated"
    ));
})

const updateThumbnail = asyncHandler( async (req, res) =>{
    const user = await User.findById(req.user?._id)
    if(!(user && user.role === "host")){
        throw new apiError(401, "Only hosts are allowed to update listings thumbnail")
    }
    const { id } = req.params;
    const thumbnailLocalPath = req.file.path;
    if(!thumbnailLocalPath){
        throw new apiError(400, "Thumbnail image file is missing")
    }

    const thumbnail = await uploadImage(thumbnailLocalPath);
    if(!thumbnail.url){
        throw new apiError(400, "Error while uploading thumbnail image")
    }

        const list = await Listing.findByIdAndUpdate(
        {_id: id, host: req.user?._id},
        {
            $set:{
                thumbnail: thumbnail.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(
        200,
        list,
        "thumbnail image updated successfully"
    ))
})

const updateSupportImages = asyncHandler( async (req, res) =>{
    const user = await User.findById(req.user?._id)
    if(!(user && user.role === "host")){
        throw new apiError(401, "Only hosts are allowed to update listings thumbnail")
    }
    const { id } = req.params;

    if (!req.files || !Array.isArray(req.files.supportImage) || req.files.supportImage.length === 0) {
        throw new apiError(400, "No support images provided");
    }

    const uploadedImages = await Promise.all(
        req.files.supportImage.map(file => uploadImage(file.path))
    );
    const imageUrls = uploadedImages.map(img => img.url);

    const list = await Listing.findByIdAndUpdate(
        {_id: id, host: req.user?._id},
        {
            $set: {
                supportImage: imageUrls
            }
        },
        {new: true}
    )

    if (!list) {
        throw new apiError(404, "Listing not found or you're not the host");
    }

    return res
    .status(200).
    json(
        new apiResponse(
            200, 
            list, 
            "Support images updated successfully"
        )
    );

})

const deleteStay = asyncHandler( async (req, res) =>{
    const user = await User.findById(req.user?._id);
    if(!(user && user.role === "host")){
        throw new apiError(401, "Only hosts are allowed to see host uploaded stays")
    }
    const { id } = req.params;

    await Listing.findOneAndDelete(
        {
            _id: id, 
            host: req.user?._id
        }
    )


    return res
    .status(200)
    .json(
        new apiResponse(
            200, 
            {}, 
            "Stay deleted successfully")
    );
})

export {
    uploadStay,
    showHostListings,
    updateHostList,
    updateThumbnail,
    updateSupportImages,
    deleteStay,
    getListingById
}