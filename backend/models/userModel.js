// import mongoose from "mongoose";

// const userSchema = mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       minLength: 6,
//       required: true,
//     },
//     profilePic: {
//       type: String,
//       default: "",
//     },
//     followers: {
//       type: [String],
//       default: [],
//     },
//     following: {
//       type: [String],
//       default: [],
//     },
//     bio: {
//       type: String,
//       default: "",
//     },
//     isFrozen: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const User = mongoose.model("User", userSchema);

// export default User;

import mongoose from "mongoose";

const repostSchema = mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    postedBy: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      default: "",
    },
    img: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minLength: 6,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
    followers: {
      type: [String],
      default: [],
    },
    following: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    reposts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;

// reposts: {
//   type: [repostSchema],
//   default: [],
// },
