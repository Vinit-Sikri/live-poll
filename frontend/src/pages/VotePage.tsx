import { useEffect, useState, useRef } from "react";
import { socket } from "../services/socket";
import { useNavigate } from "react-router-dom";

export default function VotePage() {
  const [poll, setPoll] = useState<any>(null); 
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<"participants" | "chat">("participants");
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isTeacher = sessionStorage.getItem("role") === "teacher";
  const myName = isTeacher ? "Teacher" : sessionStorage.getItem("studentName") || "Student";

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const fetchActive = () => {
      socket.emit("poll:getActive");
      socket.emit("student:getList");
    };

    if (socket.connected) {
      fetchActive();
    } else {
      socket.on("connect", fetchActive);
    }

    const handleActive = (data: any) => {
      setPoll(data.poll);
      setTimeLeft(data.remainingTime);
      setHasVoted(false);
    };

    const handleEnded = () => {
      navigate("/results");
    };

    const handleStudentList = (list: { id: string; name: string }[]) => {
      setStudents(list);
    };

    const handleChatHistory = (history: any) => setChatMessages(history);
    const handleNewMessage = (msg: any) => setChatMessages((prev) => [...prev, msg]);
    const handleKicked = () => {
      socket.disconnect();
      navigate("/kicked");
    };

    socket.on("poll:active", handleActive);
    socket.on("poll:ended", handleEnded);
    socket.on("student:list", handleStudentList);
    socket.on("chat:history", handleChatHistory);
    socket.on("chat:newMessage", handleNewMessage);
    socket.on("student:kicked_by_teacher", handleKicked);

    return () => {
      socket.off("connect", fetchActive);
      socket.off("poll:active", handleActive);
      socket.off("poll:ended", handleEnded);
      socket.off("student:list", handleStudentList);
      socket.off("chat:history", handleChatHistory);
      socket.off("chat:newMessage", handleNewMessage);
      socket.off("student:kicked_by_teacher", handleKicked);
    };
  }, [navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeTab]);

  const submitVote = () => {
    if (selected === null || !poll || hasVoted) return;

    const studentId = `${myName}_${Math.random()}`; 
    
    sessionStorage.setItem("myLastVoteIndex", selected.toString());

    socket.emit("poll:vote", {
        pollId: poll._id,
        studentId: studentId,
        optionIndex: selected
    });

    setHasVoted(true);
  };

  const handleKick = (id: string) => {
    socket.emit("student:kick", id);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit("chat:sendMessage", { sender: myName, text: newMessage });
    setNewMessage("");
  };

  if (!poll) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="w-[700px]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Question</h2>
          <span className="text-red-500 font-semibold">⏱ {timeLeft}s</span>
        </div>

        <div className="bg-gray-700 text-white p-3 rounded-t-md">
          {poll.question}
        </div>

        <div className="border border-purple-400 rounded-b-md p-6 space-y-4 bg-white text-center">
          {hasVoted ? (
            <div className="py-8">
               <div className="animate-pulse flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 text-3xl">✓</div>
                  <h3 className="text-2xl font-bold text-gray-800">Answer Submitted!</h3>
                  <p className="text-gray-500 mt-2">Waiting for the timer to end to show results...</p>
               </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 text-left">
                {poll.options.map((opt: string, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelected(index)}
                    className={`p-3 rounded cursor-pointer border transition ${
                      selected === index
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-300 bg-gray-100 hover:border-purple-300"
                    }`}
                  >
                    <span className="font-medium">{index + 1}. {opt}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={submitVote}
                  disabled={selected === null}
                  className={`px-8 py-3 rounded-full text-white transition-colors duration-300 ${
                    selected === null ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-purple-600 to-indigo-500"
                  }`}
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSidebar && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl flex flex-col z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex gap-4">
              <button 
                className={`font-bold pb-1 ${activeTab === "participants" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-400"}`}
                onClick={() => setActiveTab("participants")}
              >
                Participants ({students.length})
              </button>
              <button 
                className={`font-bold pb-1 ${activeTab === "chat" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-400"}`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
            </div>
            <button onClick={() => setShowSidebar(false)} className="text-gray-500 font-bold mb-1">✕</button>
          </div>

          {activeTab === "participants" ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {students.map((s) => (
                <div key={s.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm truncate w-40">{s.name} {s.name === myName && "(You)"}</span>
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
          ) : (
            <div className="flex-1 flex flex-col p-4 bg-gray-50 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                {chatMessages.map((msg, idx) => {
                  const isMe = msg.sender === myName;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-[10px] text-gray-400 mb-1">{msg.sender}</span>
                      <div className={`text-sm py-2 px-3 rounded-2xl max-w-[85%] shadow-sm ${isMe ? "bg-purple-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border"}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-purple-500"
                  placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center shrink-0">➤</button>
              </div>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={() => setShowSidebar(!showSidebar)}
        className="absolute bottom-8 right-8 bg-purple-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform z-40"
      >
        {showSidebar ? "✕" : "💬"}
      </button>
    </div>
  );
}