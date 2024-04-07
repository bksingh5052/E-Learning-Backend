import { Router } from "express";
import { registerUser, loginUser, logoutUser, changePassword, verifyEmail } from "../controllers/auth.controller.js";
import { verifyJWT} from "../middleware/auth.middleware.js";

const router = Router()

router.post("/login",  loginUser)
router.post("/signup", registerUser)
router.post("/logout", verifyJWT, logoutUser)
router.put("/changePassword", verifyJWT, changePassword)






export default router