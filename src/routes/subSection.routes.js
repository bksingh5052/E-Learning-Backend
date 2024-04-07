import Router from 'express'
import { authorizeForRole, verifyJWT } from '../middleware/auth.middleware.js';
import { createSubSection, deleteSubSection, updateSubSection } from '../controllers/subSection.conroller.js';


const router = Router();
router.post('/createSubSection/:sectionId', verifyJWT, authorizeForRole(['Admin']),createSubSection)
router.put('/updateSubSection/:sectionId/:subSectionId', verifyJWT, authorizeForRole(['Admin']), updateSubSection)
router.delete('/deleteSubSection/:sectionId/:subSectionId', verifyJWT, authorizeForRole(['Admin']), deleteSubSection)

export default router;