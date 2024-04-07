import { ApiErrorHandler } from "./ApiErrorHandler.js"

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(error.code || 500).json(
            new ApiErrorHandler(error.code || 500, error.message))
    }
}


export { asyncHandler }