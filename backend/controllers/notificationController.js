import Notification from "../models/notificationModel.js";

// Create a notification for a like
const createLikeNotification = async (req, res) => {
  const { postId, senderId, receiverId } = req.body;

  try {
    const notification = new Notification({
      type: "like",
      postId,
      senderId,
      receiverId,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create like notification", error });
  }
};

// Create a notification for a comment
const createCommentNotification = async (req, res) => {
  const { postId, senderId, receiverId } = req.body;

  try {
    const notification = new Notification({
      type: "comment",
      postId,
      senderId,
      receiverId,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create comment notification", error });
  }
};

const createFollowNotification = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    const notifcation = new Notification({
      type: "follow",
      senderId,
      receiverId,
    });

    await notifcation.save();
    res.status(200).json(notifcation);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to follow user notification", error });
  }
};

// Get notifications for a user
const getNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ receiverId: userId })
      .sort({
        createdAt: -1,
      })
      .populate("senderId", "username profilePic");
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to mark notification as read", error });
  }
};

export {
  createCommentNotification,
  createLikeNotification,
  createFollowNotification,
  getNotifications,
  markAsRead,
};
