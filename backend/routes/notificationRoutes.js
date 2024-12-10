import express from "express";
import {
  createLikeNotification,
  createCommentNotification,
  getNotifications,
  markAsRead,
  createFollowNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/like", createLikeNotification);
router.post("/comment", createCommentNotification);
router.post("/follow", createFollowNotification);
router.get("/:userId", getNotifications);
router.patch("/:notificationId/read", markAsRead);

export default router;
