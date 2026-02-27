import { useEffect, useState } from "react";
import axios from "axios";
import type { Poll } from "../types/poll";

export default function HistoryPage() {
  const [history, setHistory] = useState<Poll[]>([]);

  useEffect(() => {
    axios
      .get("https://live-polling-system-dema.onrender.com/api/polls/history")
      .then(res => setHistory(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-12">
      <div className="w-[750px]">
        <h1 className="text-3xl font-semibold mb-8">View Poll History</h1>

        <div className="space-y-10">
          {history.map((poll, idx) => {
            const totalVotes = poll.options.reduce(
              (sum, o) => sum + o.votes,
              0
            );

            return (
              <div key={poll._id}>
                <h2 className="font-semibold mb-2">
                  Question {idx + 1}
                </h2>

                <div className="bg-gray-700 text-white p-3 rounded-t-md">
                  {poll.question}
                </div>

                <div className="border border-purple-400 rounded-b-md p-4 space-y-4 bg-white">
                  {poll.options.map((opt, i) => {
                    const percent =
                      totalVotes === 0
                        ? 0
                        : Math.round((opt.votes / totalVotes) * 100);

                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>
                            {i + 1}. {opt.text}
                          </span>
                          <span>{percent}%</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-indigo-500 h-6 transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}