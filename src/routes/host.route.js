import {Router} from "express"
import upload from "../middlewares/multer.middleware.js"
import verifyJWT from "../middlewares/auth.middleware.js"
import {uploadStay, showHostListings, updateHostList, updateThumbnail, updateSupportImages, deleteStay} from "../controllers/host.controller.js"

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
    uploadStay);
router.route("/showHostListings").post(verifyJWT, showHostListings);
router.route("/updateHostList/:id").put(verifyJWT, updateHostList);
router.route("/updateThumbnail/:id").put(
    verifyJWT,
    upload.single("thumbnail"), 
    updateThumbnail);
router.route("/updateSupportImages/:id").put(
    verifyJWT,
    upload.fields([
            { 
                name: "supportImage",
                maxCount: 3 
            }
        ]),
    updateSupportImages)
router.route("/deleteStay/:id").delete(verifyJWT, deleteStay)

export default router