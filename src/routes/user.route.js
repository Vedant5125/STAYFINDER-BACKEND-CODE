import {Router} from "express"
import upload from "../middlewares/multer.middleware.js"
import { userRegister, 
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
} from "../controllers/user.controller.js"
import { getBookedDates, bookStay } from "../controllers/booking.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.single("profile"),
    userRegister);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/getCurrentUser").post(verifyJWT, getCurrentUser);
router.route("/updatePassword").post(verifyJWT, updatePassword);
router.route("/updateAccountDetails").post(verifyJWT, updateAccountDetails);
router.route("/updateprofileImage").post(
    verifyJWT,
    upload.single("profile"), 
    updateprofileImage);
router.route("/addToWishlist").post(verifyJWT, addToWishlist);
router.route("/showWishList").post(verifyJWT, showWishList);
router.route("/removeFromWishList").post(verifyJWT, removeFromWishList);
router.route("/getBookedDates/:id").get(verifyJWT, getBookedDates);
router.route("/bookStay/:id").post(verifyJWT, bookStay);


export default router