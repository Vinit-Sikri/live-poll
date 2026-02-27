import { useEffect, useState } from "react";
import { socket } from "../services/socket";
import { useNavigate } from "react-router-dom";

export default function WaitingPage() {
  const navigate = useNavigate();
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const isTeacher = localStorage.getItem("role") === "teacher";

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("student:getList");

    const handleActive = () => {
      navigate("/vote");
    };

    const handleStudentList = (list: { id: string; name: string }[]) => {
      setStudents(list);
    };

    const handleKicked = () => {
      socket.disconnect();
      navigate("/kicked");
    };

    socket.on("poll:active", handleActive);
    socket.on("student:list", handleStudentList);
    socket.on("student:kicked_by_teacher", handleKicked);

    return () => {
      socket.off("poll:active", handleActive);
      socket.off("student:list", handleStudentList);
      socket.off("student:kicked_by_teacher", handleKicked);
    };
  }, [navigate]);

  const handleKick = (id: string) => {
    socket.emit("student:kick", id);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-10">
        <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm">
          Interview Poll
        </span>
      </div>

      <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-purple-600 border-solid mb-6"></div>
      
      <h2 className="text-xl font-semibold text-gray-700">
        Wait for the teacher to ask questions..
      </h2>

      {showStudents && (
        <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl p-4 border-l z-50 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Participants ({students.length})</h3>
            <button onClick={() => setShowStudents(false)} className="text-gray-500">✕</button>
          </div>
          <div className="space-y-2">
            {students.map((s) => (
              <div key={s.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-sm truncate w-32">{s.name}</span>
                {isTeacher && (
                  <button 
                    onClick={() => handleKick(s.id)}
                    className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                  >
                    KICK
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setShowStudents(!showStudents)}
        className="absolute bottom-8 right-8 bg-purple-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform z-50"
      >
        {showStudents ? "✕" : "💬"}
      </button>
    </div>
  );
}