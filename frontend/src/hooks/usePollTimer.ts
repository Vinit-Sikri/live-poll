import { useEffect, useState } from "react";
import type { Poll } from "../types/poll";

export const usePollTimer = (poll: Poll | null) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!poll) return;

    const interval = setInterval(() => {
      const start = new Date(poll.startTime).getTime();
      const end = start + poll.duration * 1000;
      const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));

      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [poll]);

  return timeLeft;
};