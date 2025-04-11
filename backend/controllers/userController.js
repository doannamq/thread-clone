import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/GenerateTokenAndSetCookie.js";
import { json } from "express";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

//Signup user
const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "This username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      });
    } else {
      res
        .status(404)
        .json({ error: "Unable to authenticate user information" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};

//Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect username or password" });
    }

    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in loginuser: ", error.message);
  }
};

//Logout user
const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in logout user: ", error.message);
  }
};

//Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email and new password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password reset successful.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in resetPassword: ", error.message);
  }
};

//Follow and Unfollow user
const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in followUnFollowUser: ", err.message);
  }
};

//Update user
const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;

  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (req.params.id !== userId.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    //user profilePic is an array
    if (profilePic && profilePic.length > 0) {
      if (user.profilePic && user.profilePic.length > 0) {
        for (const pic of user.profilePic) {
          await cloudinary.uploader.destroy(pic.split("/").pop().split(".")[0]);
        }
      }
      const uploadResponses = await Promise.all(
        profilePic.map((pic) => cloudinary.uploader.upload(pic))
      );
      profilePic = uploadResponses.map((response) => response.secure_url);
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          // "replies.$[reply].userProfilePic": user.profilePic,
          //user profilePic is an array
          "replies.$[reply].userProfilePic": user.profilePic[0],
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    //password should be null in response
    user.password = null;

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: err.message });
    console.log("Error in updateUser: ", err.message);
  }
};

//User profile
const getUserProfile = async (req, res) => {
  const { query } = req.params;
  //
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500), json({ error: error.message });
    console.log("Error in getUserProfile: ", error.message);
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByYou = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: {
          size: 10,
        },
      },
    ]);

    const filterdUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id)
    );
    const suggestedUsers = filterdUsers.slice(0, 5);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isFrozen = true;
    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.query.q || "";
    const user = await User.find({
      username: { $regex: query, $options: "i" },
    }).select("name username profilePic followers");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.find(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const usersFollowedByYou = await User.findById(userId).select("following");
    const mostFollowedUsers = await User.find({
      _id: { $nin: usersFollowedByYou.following },
    })
      .sort({ followersCount: -1 })
      .limit(10);

    res.status(200).json(mostFollowedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFollowers = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username }).select("followers");
    const followers = user.followers;
    const followerDetails = await User.find({ _id: { $in: followers } }).select(
      "username name profilePic"
    );
    res.status(200).json(followerDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFollowing = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username }).select("following");
    const following = user.following;
    const followingDetails = await User.find({
      _id: { $in: following },
    }).select("username name profilePic");
    res.status(200).json(followingDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCurrentUserProfile = async (req, res) => {
  try {
    // req.user đã được set bởi protectRoute middleware
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error in getCurrentUserProfile: ", error.message);
  }
};
export {
  signupUser,
  loginUser,
  logoutUser,
  followUnFollowUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers,
  freezeAccount,
  searchUsers,
  searchSuggestedUser,
  getFollowers,
  getFollowing,
  getCurrentUserProfile,
  resetPassword,
};
