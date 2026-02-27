import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";

export default function StudentJoinPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!name.trim()) return;
    setError("");

    if (!socket.connected) socket.connect();

    // Check with the server if the name is unique
    socket.emit("student:join", name.trim(), (response: { success: boolean; message?: string }) => {
      if (response && !response.success) {
        setError(response.message || "Name already taken");
        socket.disconnect();
      } else {
        // UPDATED: Using sessionStorage so a new tab starts fresh
        sessionStorage.setItem("studentName", name.trim());
        sessionStorage.setItem("role", "student");
        navigate("/waiting");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-[600px] text-center bg-white p-12 rounded-2xl shadow-xl">
        <span className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm">
          Interview Poll
        </span>

        <h1 className="text-3xl font-semibold mt-6">
          Let’s <span className="font-bold">Get Started</span>
        </h1>

        <p className="text-gray-500 mt-4 mb-6">
          If you're a student, you'll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates.
        </p>

        {error && <div className="mb-4 text-red-500 bg-red-50 py-2 rounded font-medium">{error}</div>}

        <input
          type="text"
          placeholder="Enter your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleContinue()}
          className="w-full px-4 py-3 border rounded-md mb-8 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}