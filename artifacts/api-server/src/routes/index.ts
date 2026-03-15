import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import peopleRouter from "./people.js";
import reviewsRouter from "./reviews.js";
import feedRouter from "./feed.js";
import moderationRouter from "./moderation.js";
import reviewActionsRouter from "./review-actions.js";

const router: IRouter = Router();

router.use("/", healthRouter);
router.use("/auth", authRouter);
router.use("/people", peopleRouter);
router.use("/people", reviewsRouter);
router.use("/reviews", reviewActionsRouter);
router.use("/feed", feedRouter);
router.use("/moderation", moderationRouter);

export default router;
