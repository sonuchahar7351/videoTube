const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require('jsonwebtoken');
const User = require("../models/user.model.js");

const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(new ApiError(401, "Unauthorized request"));
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return next(new ApiError(401, "Invalid access token"));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new ApiError(401, error?.message || "Invalid access token"));
    }
});

module.exports = verifyJwt;
