import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Category from "../models/category.model.js";
import Course from "../models/course.model.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import { convertSecondsToDuration } from "../utils/secToDuration.js";
import User from "../models/user.model.js";
import Section from "../models/section.model.js";
import SubSection from "../models/subSection.model.js";

const createCourse = asyncHandler(async (req, res) => {
  // Get all required fields from request body
  let {
    courseName,
    courseDescription,
    whatYouWillLearn,
    price,
    // tag: _tag,
    category, //we will take category id from client
    status,
    instructor,
  } = req.body;

  // Get thumbnail image from request files
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send("Thumbnail is Required");
    return;
  }
  const thumbnail = req.files.thumbnailImage;

  // Check if any of the required fields are missing
  if (
    [courseName, courseDescription, whatYouWillLearn, price, category].some(
      (field) => field?.trim() === ""
    )
  ) {
    return res
      .status(400)
      .json(new ApiErrorHandler(400, "All fields are required"));
  }

  if (!status || status === undefined) {
    status = "Draft";
  }

  // Check if the category given is valid
  const categoryDetails = await Category.findById(category);
  if (!categoryDetails) {
    return res
      .status(404)
      .json(new ApiErrorHandler(400, "Category Details Not Found"));
  }
  // Upload the Thumbnail to Cloudinary
  const thumbnailImage = await uploadImageToCloudinary(thumbnail);
  console.log(thumbnailImage);
  // Create a new course with the given details
  const newCourse = await Course.create({
    courseName,
    courseDescription,
    instructor,
    whatYouWillLearn,
    price,
    // tag,
    category,
    thumbnail: thumbnailImage.secure_url,
    status: status,
    // instructions,
  });

  // Add the new course to the Categories
  const categoryDetails2 = await Category.findByIdAndUpdate(
    { _id: category },
    {
      $push: {
        courses: newCourse._id,
      },
    },
    { new: true }
  );
  console.log("HEREEEEEEEE");
  // Return the new course and a success message
  res
    .status(200)
    .json(
      new ApiResponseHandler(200, newCourse, "Course Created Successfully")
    );
});

const editCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { updates } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json(new ApiErrorHandler(404, "Course not found"));
  }
  // If Thumbnail Image is found, update it
  if (req.files) {
    const thumbnail = req.files.thumbnailImage;
    const thumbnailImage = await uploadImageToCloudinary(thumbnail);
    course.thumbnail = thumbnailImage.secure_url;
  }

  // Update only the fields that are present in the request body
  for (const key in updates) {
    if (key === "category") {
      // removing course id from previous category
      console.log(course.category.toString());
      console.log(updates[key]);
      await Category.findByIdAndUpdate(course.category.toString(), {
        $pull: { courses: courseId },
      });
      // adding course id in new category
      await Category.findByIdAndUpdate(updates[key], {
        $push: { courses: courseId },
      });
      course[key] = updates[key];
    }
    course[key] = updates[key];
  }

  await course.save();

  const updatedCourse = await Course.findOne({
    _id: courseId,
  })
    .populate("category")
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec();

  res.json(
    new ApiResponseHandler(200, updatedCourse, "Course updated successfully")
  );
});

const getAllCourses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) - 1 || 0;
  const limit = parseInt(req.query.limit) || 5;
  const category = req.query.category || "all";

  if (category === "all") {
    const total = (await Course.find({ status: "Published" })).length
    const allCourses = await Course.find({ status: "Published" })
      .skip(page * limit)
      .limit(limit);
    return res
      .status(200)
      .json(
        new ApiResponseHandler(
          200,
          {total,page:page+1,limit,allCourses},
          "All Courses Found Successfully"
        )
      );
  }
  console.log("1");
  console.log(category);
  const total = (await Course.find({
    category: category,
    status: "Published",
  })).length
  const allCourses = await Course.find({
    category: category,
    status: "Published",
  })
    .skip(page * limit)
    .limit(limit);
  return res
    .status(200)
    .json(
    new ApiResponseHandler(200, {total,page:page+1,limit,allCourses}, "All Courses Found Successfully")
    );
});
const getAllCoursesForAdmin = asyncHandler(async (req, res) => {
  const allCourses = await Course.find()
    .populate("category")
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec();

  return res
    .status(200)
    .json(
      new ApiResponseHandler(200, allCourses, "All Courses Found Successfully")
    );
});

const getCourseDetails = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const courseDetails = await Course.findOne({
    _id: courseId,
  })
    .populate("category")
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
        select: "-videoUrl",
      },
    })
    .exec();

  if (!courseDetails) {
    return res
      .status(400)
      .json(
        new ApiErrorHandler(400, `Could not find course with id: ${courseId}`)
      );
  }

  let totalDurationInSeconds = 0;
  courseDetails.courseContent.forEach((content) => {
    content.subSection.forEach((subSection) => {
      const timeDurationInSeconds = parseInt(subSection.timeDuration);
      totalDurationInSeconds += timeDurationInSeconds;
    });
  });

  const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

  return res
    .status(200)
    .json(
      new ApiResponseHandler(
        200,
        { courseDetails, totalDuration },
        "Course details found successfully"
      )
    );
});

const getFullCourseDetails = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (user.accountType === "Student") {
    if (!user.courses.includes(courseId)) {
      return res
        .status(405)
        .json(new ApiErrorHandler(405, "You haven't enrolled in this course "));
    }
  }
  const courseDetails = await Course.findOne({
    _id: courseId,
  })
    .populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    })
    .exec();

  if (!courseDetails) {
    return res
      .status(400)
      .json(
        new ApiErrorHandler(400, `Could not find course with id: ${courseId}`)
      );
  }
  let totalDurationInSeconds = 0;
  courseDetails.courseContent.forEach((content) => {
    content.subSection.forEach((subSection) => {
      const timeDurationInSeconds = parseInt(subSection.timeDuration);
      totalDurationInSeconds += timeDurationInSeconds;
    });
  });

  const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

  return res
    .status(200)
    .json(
      new ApiResponseHandler(
        200,
        { courseDetails, totalDuration },
        "Course details found successfully"
      )
    );
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Find the course
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json(new ApiErrorHandler(404, "Course not found"));
  }
  // remove couse from category
  const category = await Category.findByIdAndUpdate(course.category, {
    $pull: { courses: courseId },
  });

  // Unenroll students from the course
  const studentsEnrolled = course.studentsEnrolled;
  for (const studentId of studentsEnrolled) {
    await User.findByIdAndUpdate(studentId, {
      $pull: { courses: courseId },
    });
  }

  // Delete sections and sub-sections
  const courseSections = course.courseContent;
  for (const sectionId of courseSections) {
    // Delete sub-sections of the section
    const section = await Section.findById(sectionId);
    if (section) {
      const subSections = section.subSection;
      for (const subSectionId of subSections) {
        await SubSection.findByIdAndDelete(subSectionId);
      }
    }

    // Delete the section
    await Section.findByIdAndDelete(sectionId);
  }

  // Delete the course
  await Course.findByIdAndDelete(courseId);

  return res
    .status(200)
    .json(new ApiResponseHandler(200, {}, "Course deleted successfully"));
});

const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;
  const course = await Course.findById(courseId);
  const userEnrolledInCourse = course.studentsEnrolled.includes(userId);
  if (userEnrolledInCourse) {
    return res
      .status(401)
      .json(
        new ApiErrorHandler(401, "You are already enrolled in this course")
      );
  }
  course.studentsEnrolled.push(userId);
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: { courses: courseId },
    },
    { new: true }
  );
  await course.save();
  return res
    .status(200)
    .json(
      new ApiResponseHandler(
        200,
        user,
        "You have enrolled in this course succesfully"
      )
    );
});

export {
  createCourse,
  editCourse,
  getAllCourses,
  getAllCoursesForAdmin,
  getCourseDetails,
  getFullCourseDetails,
  deleteCourse,
  enrollInCourse,
};
