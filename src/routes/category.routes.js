import { Router } from "express";
import { authorizeForRole, verifyJWT } from "../middleware/auth.middleware.js";
import { createCategory, showAllCategories } from "../controllers/category.controller.js";



const router = Router();
router.post('/createCategory', verifyJWT, authorizeForRole(['Admin']),createCategory)
router.get('/showAllCategories', showAllCategories)


export default router;