import {Router} from "express"
import upload from "../middlewares/multer.middleware.js"
import verifyJWT from "../middlewares/auth.middleware.js"
import {uploadStay} from "../controllers/host.controller.js"

const router = Router()

router.route("/uploadStay").post(
    verifyJWT,
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1
        },
        {
            name: "supportImg",
            maxCount: 3
        }
    ]),
    uploadStay)

export default router