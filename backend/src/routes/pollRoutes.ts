import { Router } from "express";
import pollController from "../controllers/pollController";

const router = Router();

router.post("/create", pollController.createPoll);
router.get("/active", pollController.getActivePoll);
router.get("/history", pollController.getHistory);
router.post("/vote", pollController.submitVote);
router.get("/results/:pollId", pollController.getResults);

export default router;