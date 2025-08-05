import {Router} from "express"
import upload from "../middlewares/multer.middleware.js"
import { userRegister, loginUser, logoutUser, refreshAccessToken, getCurrentUser, updatePassword, updateAccountDetails, updateprofileImage } from "../controllers/user.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "profile",
            maxCount: 1
        }
        // {
        //     name: "supportImg",
        //     maxCount: 3
        // }
    ])
    , userRegister);
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


export default router