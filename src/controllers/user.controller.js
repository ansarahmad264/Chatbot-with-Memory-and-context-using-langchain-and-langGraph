import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"


const userSignup = asyncHandler(async (req, res) => {
    // ALL THE COMMENTED CODE IS TO REMOVE THE IMAGE HANDLING and GENDER FIELD TEMPORARILY

    const { fullName, username, email, password, confirmPassword } = req.body

    if (password != confirmPassword) {
        throw new ApiError(400, "Password Do not Match")
    }

    if (!email || !username) {
        throw new ApiError(400, "email and username are Required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(400, "User with this Email or username already exist")
    }

    //IMAGE FUNCTIONALITY
    const avatar = `https://avatar.iran.liara.run/username?username=${username}`

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        profilePic: avatar,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Server was unable to save user to the Database")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: true })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something Went wrong while generating Refresh and Access Token")
    }
}

const userLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "All Fields are Required")
    }

    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        throw new ApiError(404, "This User Doesnot Exist")
    }

    if (user.authProvider == "google") {
        throw new ApiError(404, "You have registed via social platform , please try to go with that!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid User Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false,
    }

    return res.header('token', accessToken)
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User Logged in Successfully"
            )
        )

})

const userLogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: false,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User Logged out Successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unathurized request")
    }

    const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "Invalid Refresh Token")
    }

    if (incommingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh Token Expired or used ")
    }

    const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: false,
    }

    return res.header('token', newAccessToken)
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                },
                "AccessTokenRefreshed"
            )
        )


})

const googleCallback = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: false,
        }

        res .header('token', accessToken)
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .redirect("http://13.201.93.112.nip.io:3000/user/chatbot")

    } catch (err) {
        res.status(500).json({ message: 'Internal error', error: err.message });
    }
});

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("fullName username profilePic email -_id")

    if (!user) {
        return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    return res.json(new ApiResponse(200, { user },))
})


export {
    userSignup,
    userLogin,
    userLogout,
    refreshAccessToken,
    googleCallback,
    getUserProfile
}