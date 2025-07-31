import {Router} from "express"
import upload from "../middlewares/multer.middleware.js"
import userRegister from "../controllers/user.controller.js"
import { loginUser, logoutUser } from "../controllers/user.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "profile",
            maxCount: 1
        },
        {
            name: "supportImg",
            maxCount: 3
        }
    ])
    , userRegister);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser)


export default router