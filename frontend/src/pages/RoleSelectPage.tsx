import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelectPage() {
  const [role, setRole] = useState<"student" | "teacher" | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!role) return;
    if (role === "student") navigate("/student");
    if (role === "teacher") navigate("/teacher");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[720px] text-center">

        <span className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm">
          Intervue Poll
        </span>

        <h1 className="text-3xl font-semibold mt-6">
          Welcome to the <span className="font-bold">Live Polling System</span>
        </h1>

        <p className="text-gray-500 mt-3 mb-10">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="flex gap-6 mb-10">

          <div
            onClick={() => setRole("student")}
            className={`flex-1 p-6 rounded-lg border cursor-pointer transition ${
              role === "student"
                ? "border-purple-500 bg-white"
                : "border-gray-300 bg-white"
            }`}
          >
            <h2 className="font-semibold text-lg mb-2">I’m a Student</h2>
            <p className="text-gray-500 text-sm">
              Submit answers and participate in live polls.
            </p>
          </div>

          <div
            onClick={() => setRole("teacher")}
            className={`flex-1 p-6 rounded-lg border cursor-pointer transition ${
              role === "teacher"
                ? "border-purple-500 bg-white"
                : "border-gray-300 bg-white"
            }`}
          >
            <h2 className="font-semibold text-lg mb-2">I’m a Teacher</h2>
            <p className="text-gray-500 text-sm">
              Create polls and view results in real time.
            </p>
          </div>

        </div>

        <button
          onClick={handleContinue}
          className="px-12 py-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium"
        >
          Continue
        </button>

      </div>
    </div>
  );
}