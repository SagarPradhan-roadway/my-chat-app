import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

// +++++++++++++++++
import crypto from "crypto";
import { sendEmail } from "../lib/sendEmail.js";

//signup new user



export const signup = async (req, res) => {
    const {fullName, email, password, bio} = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({success: false, message: "Missing Details"})
        }
        const user = await User.findOne({email});

        if (user) {
            return res.json({success: false, message: "Account already exists"})
        }

        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedpassword, bio
        });

        const token = generateToken(newUser._id)

        res.json({success: true, userData: newUser, token, message: "Account created successfully"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }

}

//controller to login a user

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });

    if (!userData) {
      // No user with that email found
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(userData._id);

    res.json({ success: true, userData, token, message: "Login Successful" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// +++++++++++++++++++++++++++++++++++++++++++
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    await sendEmail(email, otp);

    res.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyOtpAndReset = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpire < Date.now()) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// +++++++++++++++++++++++++++++++++++++++++++


//to check user is authenicated
export const checkAuth = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ success: true, user });
};

//controller to update user profile details
export const updateprofile = async (req, res) => {
    try {
        const {profilePic, bio, fullName} = req.body;

        const userId = req.user._id;
        let updateUser;

        if (!profilePic) {
           updateUser =  await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updateUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true})
        }

        res.json({success:true, user: updateUser})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// ++++++++++++++++++++++++++++++++++++++++++++++

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // 👉 In real app send email, here just return token
    res.json({
      success: true,
      message: "Reset token generated",
      token: resetToken
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const resetPasswordDirect = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    user.password = hashedpassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};