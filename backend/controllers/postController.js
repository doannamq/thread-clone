import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary";

//create post
const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "PostedBy and text fields are required" });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
    }

    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });
    }

    // if (img) {
    //   const uploadResponse = await cloudinary.uploader.upload(img);
    //   img = uploadResponse.secure_url;
    // }

    // const newPost = new Post({
    //   postedBy,
    //   text,
    //   img,
    //   username: user.username,
    //   userProfilePic: user.profilePic,
    // });

    //img is an array
    let imgUrls = [];
    if (img && Array.isArray(img)) {
      for (const image of img) {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imgUrls.push(uploadResponse.secure_url);
      }
    }

    const newPost = new Post({
      postedBy,
      text,
      img: imgUrls,
      username: user.username,
      userProfilePic: user.profilePic,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(err);
  }
};

//get post
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to delete post" });
    }

    // if (post.img) {
    //   const imgId = post.img.split("/").pop().split(".")[0];
    //   await cloudinary.uploader.destroy(imgId);
    // }

    //img is an array
    if (post.img && Array.isArray(post.img)) {
      for (const imageUrl of post.img) {
        const imgId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId);
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Like unlike post
const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      //Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      //Like post
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Reply post
const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    // const userProfilePic = req.user.profilePic;
    const userProfilePic = Array.isArray(req.user.profilePic)
      ? req.user.profilePic[0]
      : req.user.profilePic;
    const username = req.user.username;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();

    res.status(200).json(reply);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Feed Post
const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const feedPosts = await Post.find({ postedBy: { $in: following } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const repostUnrepost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await User.findById(userId);

    const userRepostedPost = user.reposts.includes(postId);

    if (userRepostedPost) {
      //Un-repost
      await Post.updateOne({ _id: postId }, { $pull: { reposts: userId } });
      await User.updateOne({ _id: userId }, { $pull: { reposts: postId } });

      return res.status(200).json({ message: "Post un-reposted successfully" });
    } else {
      //Repost
      await Post.updateOne({ _id: postId }, { $push: { reposts: userId } });
      await User.updateOne({ _id: userId }, { $push: { reposts: postId } });

      return res.status(200).json({ message: "Post reposted successfully" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserReposted = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username })
      .select("reposts")
      .populate({
        path: "reposts",
        select: "text img postedBy likes replies reposts createdAt",
        populate: {
          path: "postedBy",
          select: "username profilePic",
        },
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.reposts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createPost,
  getPost,
  deletePost,
  likeUnlikePost,
  replyToPost,
  getFeedPosts,
  getUserPosts,
  repostUnrepost,
  getUserReposted,
};
