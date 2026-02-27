import { Request, Response } from "express";
import pollService from "../services/pollService";

class PollController {
  async createPoll(req: Request, res: Response) {
    try {
      const { question, options, duration, correctOptionIndex } = req.body;

      const poll = await pollService.createPoll(
        question,
        options,
        duration,
        correctOptionIndex || 0
      );

      res.status(201).json(poll);
    } catch {
      res.status(500).json({ message: "Failed to create poll" });
    }
  }

  async getActivePoll(req: Request, res: Response) {
    try {
      const data = await pollService.getActivePoll();

      if (!data) {
        return res.status(404).json({ message: "No active poll" });
      }

      res.json(data);
    } catch {
      res.status(500).json({ message: "Failed to fetch poll" });
    }
  }

  async submitVote(req: Request, res: Response) {
    try {
      const { pollId, studentId, optionIndex } = req.body;

      const vote = await pollService.submitVote(
        pollId,
        studentId,
        optionIndex
      );

      res.status(201).json(vote);
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Already voted" });
      }

      res.status(500).json({ message: "Vote failed" });
    }
  }

  async getResults(req: Request, res: Response) {
    try {
      const pollId = req.params.pollId as string;
      const results = await pollService.getResults(pollId);

      if (!results) {
        return res.status(404).json({ message: "Poll not found" });
      }

      res.json(results);
    } catch {
      res.status(500).json({ message: "Failed to get results" });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const history = await pollService.getHistory();
      res.json(history);
    } catch {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  }
}

export default new PollController();