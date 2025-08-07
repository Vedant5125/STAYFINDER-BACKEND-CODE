import {Router} from "express"
import {getAllListings, listingDetails} from "../controllers/listing.controller.js"

const router = Router()

router.route("/getAllListings").get(getAllListings);
router.route("/listingDetails/:id").get(listingDetails);

export default router;