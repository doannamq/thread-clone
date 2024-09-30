import express from "express";
import {
  followUnFollowUser,
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
  getSuggestedUsers,
  freezeAccount,
  searchUsers,
  searchSuggestedUser,
  getFollowers,
  getFollowing,
} from "../controllers/userController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);

router.get("/search", protectRoute, searchUsers);
router.get("/search-suggested-users", protectRoute, searchSuggestedUser);

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser);
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);
router.get("/followers/:username", protectRoute, getFollowers);
router.get("/following/:username", protectRoute, getFollowing);
export default router;
