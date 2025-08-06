import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import uploadImage from "../utils/cloudinary.js";
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new apiError(404, "User not found during token generation");
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}) //refresh token saved to DB
        
        return {accessToken, refreshToken};

    } catch (error) {
        console.log(error);
        throw new apiError(500, "Something went wrong while generating Refresh and Access Token")
        
    }
}

const userRegister = asyncHandler(  async(req, res) =>{

    const {fullname, email, password, phone, role} = req.body;

    if(
        [fullname, email, password, phone, role].some((field)=> field?.trim() === "")
    ){
        throw new apiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ phone }, { email }]
    });
    if(existingUser && (existingUser.role === role)){
        throw new apiError(409, "Phone or Email already exists for this role");
    }

    const profileLocalPath = req.files?.profile[0].path;
    // let supportImgLocalPath;
    if(!profileLocalPath){
        throw new apiError(400, "Profile image is required")
    }
    // if(req.files && Array.isArray(req.files.supportImg) && req.files.supportImg.length >0){
    //     supportImgLocalPath = req.files?.supportImg[0].path;
    // }
    const profile = await uploadImage(profileLocalPath)
    // const supportImg = await uploadImage(supportImgLocalPath)
    if(!profile){
        throw new apiError(400, "Profile image is required")
    }

    const user = await User.create({
        fullname,
        email,
        password,
        phone,
        role,
        profile: profile.url,
        // supportImg: supportImg?.url || ""
    })
    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // console.log("User created in DB")
    if(!userCreated){
        throw new apiError(500, "Something went wrong while registering user")
    }
    return res.status(201).json(
        new apiResponse(200, userCreated, "User registered successfully")
    )

})

const loginUser = asyncHandler( async(req, res) =>{
    const {email, phone, password, role} = req.body;
    
    if(!(email || phone)){
        throw new apiError(400, "Email or Phone is required")
    }

    const user = await User.findOne({
        $or: [{email}, {phone}]
    })
    if(!(user && user.role === role)){
        throw new apiError(400, "User with provided credentials and role does not exist")
    }
    const validPassword = await user.isPasswordCorrect(password)
    if(!validPassword){
        throw new apiError(400, "Password does not match");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler( async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(
            200,
            {},
            "User logged out successfully"
        )
    )
})

const refreshAccessToken = asyncHandler( async(req, res) =>{
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
        if(!incomingRefreshToken){
            throw new apiError(401, "Unauthorized request - error in incomingRefreshToken")
        }
    
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
        if(!user){
            throw new apiError(401, "Invalid Refresh Token");
        }
    
        if(!(incomingRefreshToken === user?.refreshToken)){
            throw new apiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(new apiResponse(
            200,
            {accessToken, newRefreshToken},
            "Access and refreshed "
        ))
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }
})

const getCurrentUser = asyncHandler( async (req, res) =>{
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully")
})

const updatePassword = asyncHandler( async(req, res) =>{
    const {oldPassword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    if(!oldPassword){
        throw new apiError(400, "Old password is required")
    }
    if(!newPassword){
        throw new apiError(400, "New password is required")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new apiError(400, "Old password is incorrect")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new apiResponse(
        200,
        {},
        "Password changed successfully"
    ))

})

const updateAccountDetails = asyncHandler( async(req, res) =>{
    const { fullname, email, phone } = req.body;

    if([ fullname, email, phone ].some((fields) => fields?.trim() === "")){
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname, 
                email, 
                phone,
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(
        200,
        user,
        "Updated account detaills successfully"
    ))

})

const updateprofileImage = asyncHandler( async(req, res) =>{
    const profileLocalPath = req.file.path;
    if(!profileLocalPath){
        throw new apiError(400, "Profile image file is missing")
    }

    const profile = await uploadImage(profileLocalPath);
    if(!profile.url){
        throw new apiError(400, "Error while uploading profile image")
    }

        const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                profile: profile.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(
        200,
        user,
        "Profile image updated successfully"
    ))
})

const addToWishlist = asyncHandler( async(req, res) =>{
    const user = await User.findById(req.user?._id); 
    const {listingId} = req.body;
    if(!(user && user.role === "user")){
        throw new apiError(401, "User not found or host can't add to wishlist");
    }
    if(!listingId){
        throw new apiError(401, "Listing not found");
    }

    if (user.wishList.includes(listingId)) {
        throw new apiError(400, "Listing already in wishlist");
    }

    user.wishList.push(listingId);
    await user.save();

    return res
    .status(200)
    .json(
        new apiResponse(200, listingId, "Listing added to wishlist")
    )
})

const showWishList = asyncHandler( async(req, res) =>{
    const user = await User.findById(req.user?._id); 
    if (!user.wishList || user.wishList.length === 0) {
        return res
        .status(200)
        .json(
            new apiResponse(200, [], "No items in wishlist")
        );
    }

    const listings = await Listing.find(
        { _id: { $in: user.wishList } }
    ).select("title description thumbnail price location type supportImage guest host");

    return res
    .status(200)
    .json(
        new apiResponse(200, listings, "wishLists fetched successfully")
    )
})

const removeFromWishList = asyncHandler( async(req, res) =>{
    const { listingId } = req.body;
    console.log(listingId)
    if (!listingId) {
        throw new apiError(400, "Listing not found");
    }
    const user = await User.findById(req.user?._id); 
    if (!user.wishList || user.wishList.length === 0) {
        return res
        .status(200)
        .json(
            new apiResponse(200, [], "No items in wishlist")
        );
    }

    const list = await User.findByIdAndUpdate(
        {_id: user.id},
        {
            $pull: { wishList: listingId }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200, list, "Listing removed from wishlist")
    )
})

export {
    userRegister,
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    getCurrentUser,
    updatePassword,
    updateAccountDetails,
    updateprofileImage,
    addToWishlist,
    showWishList,
    removeFromWishList
}