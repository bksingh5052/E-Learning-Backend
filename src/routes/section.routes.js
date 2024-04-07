import { Router } from "express";
import { authorizeForRole, verifyJWT } from "../middleware/auth.middleware.js";
import { createSection, deleteSection, updateSection } from "../controllers/section.controller.js";



const router = Router();
router.post('/createSection/:courseId', verifyJWT, authorizeForRole(['Admin']),createSection)
router.put('/updateSection/:courseId/:sectionId', verifyJWT, authorizeForRole(['Admin']),updateSection)
router.delete('/deleteSection/:courseId/:sectionId', verifyJWT, authorizeForRole(['Admin']),deleteSection)

export default router;