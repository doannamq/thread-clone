import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { getMessage, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protectRoute, sendMessage);
router.get("/:otherUserId", protectRoute, getMessage);

export default router;
