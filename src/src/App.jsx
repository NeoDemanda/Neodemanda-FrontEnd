import { Routes, Route, Navigate } from "react-router-dom";
import { ProjectsProvider } from "./store/ProjectsContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import Archived from "./pages/Archived";

export default function App() {
  return (
    <ProjectsProvider>
      <div className="flex min-h-screen flex-col bg-page">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/novo-projeto" element={<NewProject />} />
            <Route path="/arquivados" element={<Archived />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ProjectsProvider>
  );
}
