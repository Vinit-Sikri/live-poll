import { useEffect, useState, useRef } from "react";
import { socket } from "../services/socket";
import { useNavigate } from "react-router-dom";

export default function ResultsPage() {
  const [results, setResults] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<"participants" | "chat">("participants");
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const storedVote = sessionStorage.getItem("myLastVoteIndex");
  const myVoteIndex = storedVote ? parseInt(storedVote) : null;
  const isTeacher = sessionStorage.getItem("role") === "teacher";
  const myName = isTeacher ? "Teacher" : sessionStorage.getItem("studentName") || "Student";

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const fetchResults = () => {
      socket.emit("poll:getResults");
      socket.emit("student:getList");
    };

    if (socket.connected) {
      fetchResults();
    } else {
      socket.on("connect", fetchResults);
    }

    const handleResults = (data: any) => setResults(data);
    const handleActive = () => { if (!isTeacher) navigate("/vote"); };
    const handleStudentList = (list: { id: string; name: string }[]) => setStudents(list);
    const handleChatHistory = (history: any) => setChatMessages(history);
    const handleNewMessage = (msg: any) => setChatMessages((prev) => [...prev, msg]);
    const handleKicked = () => { socket.disconnect(); navigate("/kicked"); };

    socket.on("poll:results", handleResults);
    socket.on("poll:active", handleActive);
    socket.on("student:list", handleStudentList);
    socket.on("chat:history", handleChatHistory);
    socket.on("chat:newMessage", handleNewMessage);
    socket.on("student:kicked_by_teacher", handleKicked);

    return () => {
      socket.off("connect", fetchResults);
      socket.off("poll:results", handleResults);
      socket.off("poll:active", handleActive);
      socket.off("student:list", handleStudentList);
      socket.off("chat:history", handleChatHistory);
      socket.off("chat:newMessage", handleNewMessage);
      socket.off("student:kicked_by_teacher", handleKicked);
    };
  }, [isTeacher, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeTab]);

  const handleKick = (id: string) => {
    socket.emit("student:kick", id);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit("chat:sendMessage", { sender: myName, text: newMessage });
    setNewMessage("");
  };

  if (!results) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
       <p className="animate-pulse font-semibold text-gray-600">Loading poll results...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="w-[700px]">
        <h2 className="font-semibold text-lg mb-2">Question Results</h2>

        <div className="bg-gray-700 text-white p-3 rounded-t-md">
          {results.question}
        </div>

        <div className="border border-purple-400 rounded-b-md p-4 space-y-4 bg-white">
          {results.options.map((opt: string, index: number) => {
            const votesForOption = results.counts[index] || 0;
            const percent = results.totalVotes === 0 
                ? 0 
                : Math.round((votesForOption / results.totalVotes) * 100);

            const isCorrectOption = index === results.correctOptionIndex;
            const isMyVote = index === myVoteIndex;
            const isMyIncorrectVote = isMyVote && !isCorrectOption;

            let barColor = "bg-gray-300";
            if (isCorrectOption) barColor = "bg-green-500";
            else if (isMyIncorrectVote) barColor = "bg-red-500";
            else if (isTeacher) barColor = "bg-gradient-to-r from-purple-600 to-indigo-500";

            return (
              <div key={index} className="relative">
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span className="flex items-center gap-2">
                    {index + 1}. {opt}
                    {isCorrectOption && <span className="text-green-600 text-xs font-bold">(Correct)</span>}
                    {!isTeacher && isMyVote && <span className="text-gray-500 text-xs italic">(Your Vote)</span>}
                  </span>
                  <span>{percent}% ({votesForOption} votes)</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className={`${barColor} h-6 transition-all duration-700`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {isTeacher && (
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => navigate("/history")}
              className="bg-white text-purple-600 border border-purple-600 px-8 py-3 rounded-full shadow-md hover:bg-purple-50 transition-colors font-medium"
            >
              View History
            </button>
            <button
              onClick={() => navigate("/teacher")}
              className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white px-8 py-3 rounded-full shadow-md font-medium hover:opacity-90 transition-opacity"
            >
              + Ask a new question
            </button>
          </div>
        )}
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