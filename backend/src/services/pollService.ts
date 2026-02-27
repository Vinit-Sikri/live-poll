import Poll from "../models/Poll";
import Vote from "../models/Vote";

class PollService {
  async createPoll(question: string, options: string[], duration: number, correctOptionIndex: number) {
    await Poll.updateMany({ isActive: true }, { isActive: false });

    const poll = new Poll({
      question,
      options,
      duration,
      correctOptionIndex,
      startTime: new Date(),
      isActive: true,
    });

    return await poll.save();
  }

  async getActivePoll() {
    const poll = await Poll.findOne({ isActive: true });

    if (!poll) return null;

    const now = Date.now();
    const endTime = poll.startTime.getTime() + poll.duration * 1000;
    const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));

    return { poll, remainingTime };
  }

  async submitVote(pollId: string, studentId: string, optionIndex: number) {
    const vote = new Vote({
      pollId,
      studentId,
      optionIndex,
    });

    return await vote.save();
  }

  async getResults(pollId: string) {
    const poll = await Poll.findById(pollId);
    const votes = await Vote.find({ pollId });

    if (!poll) return null;

    const counts = new Array(poll.options.length).fill(0);

    votes.forEach((v) => {
      counts[v.optionIndex]++;
    });

    return {
      question: poll.question,
      options: poll.options,
      correctOptionIndex: poll.correctOptionIndex,
      counts,
      totalVotes: votes.length,
    };
  }

  async closePollIfExpired() {
    const poll = await Poll.findOne({ isActive: true });

    if (!poll) return null;

    const now = Date.now();
    const endTime = poll.startTime.getTime() + poll.duration * 1000;

    if (now >= endTime) {
      poll.isActive = false;
      await poll.save();

      return poll;
    }

    return null;
  }

  async getHistory() {
    const pastPolls = await Poll.find({ isActive: false }).sort({ createdAt: -1 });

    const historyData = await Promise.all(
      pastPolls.map(async (poll) => {
        const votes = await Vote.find({ pollId: poll._id });
        const counts = new Array(poll.options.length).fill(0);

        votes.forEach((v) => {
          if (v.optionIndex >= 0 && v.optionIndex < counts.length) {
            counts[v.optionIndex]++;
          }
        });

        const formattedOptions = poll.options.map((text, index) => ({
          text,
          votes: counts[index],
        }));

        return {
          _id: poll._id,
          question: poll.question,
          options: formattedOptions,
          duration: poll.duration,
          startTime: poll.startTime,
        };
      })
    );

    return historyData;
  }
}

export default new PollService();