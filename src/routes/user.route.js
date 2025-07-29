import {Router} from "express"
import upload from "../middlewares/multer.middleware.js"
import userRegister from "../controllers/user.controller.js"

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
    , userRegister)
// router.route("/login").post(userLogin)


export default router