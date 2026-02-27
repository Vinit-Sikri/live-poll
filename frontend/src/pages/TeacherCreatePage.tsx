import { useState, useEffect } from "react";
import { socket } from "../services/socket";
import { useNavigate } from "react-router-dom";

export default function TeacherCreatePage() {
  const [question, setQuestion] = useState("");
  const [duration, setDuration] = useState(60);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    // UPDATED: Using sessionStorage instead of localStorage
    sessionStorage.setItem("role", "teacher");
    sessionStorage.removeItem("studentName");
    socket.connect();

    socket.on("student:list", (list) => setStudents(list));

    return () => {
      socket.off("student:list");
      socket.disconnect();
    };
  }, []);

  const updateOption = (index: number, field: string, value: any) => {
    const updated = [...options];
    updated[index] = { ...updated[index], [field]: value };
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const kickStudent = (id: string) => {
    socket.emit("student:kick", id);
  };

  const askQuestion = () => {
    if (!question.trim()) return;
    const correctIndex = options.findIndex((o) => o.isCorrect);
    socket.emit("poll:create", {
      question,
      options: options.map(o => o.text),
      duration,
      correctOptionIndex: correctIndex !== -1 ? correctIndex : 0
    });
    navigate("/results");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-1/4 bg-white border-r p-6 overflow-y-auto">
        <h2 className="font-bold text-xl mb-4">Students ({students.length})</h2>
        <div className="space-y-3">
          {students.map((s) => (
            <div key={s.id} className="flex justify-between items-center bg-gray-50 p-3 rounded shadow-sm">
              <span className="truncate">{s.name}</span>
              <button 
                onClick={() => kickStudent(s.id)}
                className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
              >
                Kick
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="bg-purple-600 text-white text-sm px-4 py-1 rounded-full">Interview Poll</span>
            <h1 className="text-3xl font-bold mt-4">Let’s Get Started</h1>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold">Enter your question</label>
              <select
                className="border rounded px-3 py-1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={90}>90 seconds</option>
              </select>
            </div>
            <textarea
              maxLength={100}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border rounded p-4 bg-gray-200"
              placeholder="Type your question here..."
            />
          </div>

          <div className="space-y-4">
            {options.map((opt, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded-full">{index + 1}</div>
                <input
                  type="text"
                  placeholder="Option text"
                  value={opt.text}
                  onChange={(e) => updateOption(index, "text", e.target.value)}
                  className="flex-1 border rounded p-2 bg-gray-200"
                />
                <input
                  type="radio"
                  name="correct"
                  checked={opt.isCorrect}
                  onChange={() => setOptions(options.map((o, i) => ({ ...o, isCorrect: i === index })))}
                />
              </div>
            ))}
          </div>

          <button onClick={addOption} className="mt-4 border border-purple-600 text-purple-600 px-4 py-2 rounded">+ Add More Option</button>
          
          <div className="flex justify-end mt-10">
            <button
              onClick={askQuestion}
              className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-8 py-3 rounded-full shadow-lg"
            >
              Ask Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}