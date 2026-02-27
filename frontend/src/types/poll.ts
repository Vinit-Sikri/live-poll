export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  _id?: string;
  question: string;
  options: PollOption[];
  duration: number;
  startTime: string;
}