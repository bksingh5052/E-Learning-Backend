import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { deleteAccount, getUserDetails, updateProfile, updateProfilePic } from "../controllers/profile.controller.js";

const router = Router();

router.get('/getUserDetails', verifyJWT, getUserDetails)
router.put('/updateProfile', verifyJWT, updateProfile)
router.put('/updateProfilePic', verifyJWT, updateProfilePic)
router.delete('/deleteAccount', verifyJWT, deleteAccount)



export default router;