import express from "express";
import {
  createLikeNotification,
  createCommentNotification,
  getNotifications,
  markAsRead,
  createFollowNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Route to create a like notification
router.post("/like", createLikeNotification);

// Route to create a comment notification
router.post("/comment", createCommentNotification);

//Route to create a follow notification
router.post("/follow", createFollowNotification);

// Route to get notifications for a user
router.get("/:userId", getNotifications);

// Route to mark a notification as read
router.patch("/:notificationId/read", markAsRead);

export default router;
