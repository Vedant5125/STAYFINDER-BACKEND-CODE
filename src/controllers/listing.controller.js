import asyncHandler from "../utils/asyncHandler.js";
import Listing from "../models/listing.model.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";


const getAllListings = asyncHandler(async (req, res) => {
    const listings = await Listing.find().select("-__v"); 
    return res.status(200).json(
        new apiResponse(200, listings, "All listings fetched successfully")
    );
});

const listingDetails = asyncHandler( async(req, res) =>{
    const { id } = req.params;
    const list = await Listing.findById(id).select("-__v")
        .populate({
            path: 'host',
            select: 'fullname'
        });
    return res
    .status(200)
    .json(
        new apiResponse(200, list, "listing details fetched successfully")
    );

})

export { getAllListings, listingDetails }