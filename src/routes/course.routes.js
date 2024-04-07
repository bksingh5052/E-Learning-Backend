import { Router } from "express";
import { verifyJWT,authorizeForRole } from "../middleware/auth.middleware.js";
import {createCourse,editCourse,getAllCourses,getAllCoursesForAdmin,getCourseDetails,getFullCourseDetails,deleteCourse,enrollInCourse}  from "../controllers/course.controller.js";



const router = Router();

// Courses can Only be Created by Admin
router.post('/createCourse', verifyJWT, authorizeForRole(['Admin']), createCourse)
// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get all Registered Courses (also drafted course will show here)
router.get("/getAllCoursesForAdmin",verifyJWT, authorizeForRole(['Admin']), getAllCoursesForAdmin)
// Get Details for a Specific Courses
router.get("/getCourseDetails/:courseId", getCourseDetails)
// Get Details for a Specific Courses(only enrolled student can see this course details)
router.get("/getFullCourseDetails/:courseId", verifyJWT, authorizeForRole(['Admin','Student']),getFullCourseDetails)
// Edit Course routes
router.put("/editCourse/:courseId", verifyJWT, authorizeForRole(['Admin']), editCourse)
// Delete a Course
router.delete("/deleteCourse/:courseId", verifyJWT, authorizeForRole(['Admin']), deleteCourse)
// Enroll in course
router.put('/enrollInCourse/:courseId',verifyJWT,authorizeForRole(['Student']), enrollInCourse)


export default router;