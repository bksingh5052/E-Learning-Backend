import Category from "../models/category.model.js";
import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { ApiResponseHandler } from "../utils/ApiResponseHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createCategory = asyncHandler(async(req,res)=>{
    const { name, description } = req.body;
    if (!name) {
        return res
            .status(400)
            .json(
                new ApiErrorHandler(400,"Category name is required"));
    }
    const existingCategory = await Category.find({name})
    console.log(existingCategory)
    if(existingCategory.length>0){
        return res
        .status(400)
        .json(
            new ApiErrorHandler(400,"Category with this name is already created"));
    }
    const CategorysDetails = await Category.create({
        name: name,
        description: description,
    });
    console.log(CategorysDetails);
    return res.status(200).json(
        new ApiResponseHandler(200,CategorysDetails,"Category created successfully"));
})

const showAllCategories = asyncHandler(async(req,res)=>{
    const allCategories = await Category.find().select('-courses');
    return res.status(200).json(new ApiResponseHandler(200,allCategories,'Categorys fetched successfully'))
})


export {createCategory,showAllCategories}