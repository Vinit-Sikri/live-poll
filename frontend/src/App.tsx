import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { socket } from "./services/socket";
import RoleSelectPage from "./pages/RoleSelectPage.tsx";
import StudentJoinPage from "./pages/StudentJoinPage.tsx";
import TeacherCreatePage from "./pages/TeacherCreatePage.tsx";
import WaitingPage from "./pages/WaitingPage.tsx";
import VotePage from "./pages/VotePage.tsx";
import ResultsPage from "./pages/ResultsPage.tsx";
import HistoryPage from "./pages/HistoryPage.tsx";
import KickedPage from "./pages/KickedPage.tsx";

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("student:kicked_action", () => {
      socket.disconnect();
      navigate("/kicked");
    });

    socket.on("poll:active", () => {
      // UPDATED: Check sessionStorage for the role
      const role = sessionStorage.getItem("role");
      if (role === "student") navigate("/vote");
    });

    return () => {
      socket.off("student:kicked_action");
      socket.off("poll:active");
    };
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<RoleSelectPage />} />
      <Route path="/student" element={<StudentJoinPage />} />
      <Route path="/teacher" element={<TeacherCreatePage />} />
      <Route path="/waiting" element={<WaitingPage />} />
      <Route path="/vote" element={<VotePage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/kicked" element={<KickedPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}