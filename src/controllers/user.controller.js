import asyncHandler from "../utils/asyncHandler.js"
import User from "../models/user.model.js"
import uploadImage from "../utils/cloudinary.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"

const userRegister = asyncHandler(  async(req, res) =>{

    const {fullname, email, password, phone, role} = req.body;

    if(
        [fullname, email, password, phone, role].some((field)=> field?.trim() === "")
    ){
        throw new apiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ phone }, { email }, {role}]
    });
    if(existingUser){
        throw new apiError(409, "Username or Email already exists");
    }

    console.log(req.files?.profile)
    console.log(req.files?.supportImg)
    const profileLocalPath = req.files?.profile[0].path;
    let supportImgLocalPath;
    if(!profileLocalPath){
        throw new apiError(400, "Profile image is required")
    }
    if(req.files && Array.isArray(req.files.supportImg) && req.files.supportImg.length >0){
        supportImgLocalPath = req.files?.supportImg[0].path;
    }
    const profile = await uploadImage(profileLocalPath)
    const supportImg = await uploadImage(supportImgLocalPath)
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
        supportImg: supportImg?.url || ""
    })
    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    console.log("User created in DB")
    if(!userCreated){
        throw new apiError(500, "Something went wrong while registering user")
    }
    return res.status(201).json(
        new apiResponse(200, userCreated, "User registered successfully")
    )

})

export default userRegister