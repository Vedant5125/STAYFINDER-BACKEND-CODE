import asyncHandler from "../utils/asyncHandler.js"
import User from "../models/user.model.js"
import uploadImage from "../utils/cloudinary.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"

const generateAccessAndRefreshTokens = async (userId) =>{
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

const loginUser = asyncHandler( async(req, res) =>{
    const {email, phone, password} = req.body;
    
    if(!(email || phone)){
        throw new apiError(400, "Email or Phone is required")
    }

    const user = await User.findOne({
        $or: [{email}, {phone}]
    })
    if(!user){
        throw new apiError(400, "User does not exist")
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

export default userRegister; 
export {loginUser , logoutUser}