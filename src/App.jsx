import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./store/AuthContext";
import { ProjectsProvider } from "./store/ProjectsContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import Archived from "./pages/Archived";

function Layout() {
  const { pathname } = useLocation();
  // A tela de login ocupa a página inteira, sem navbar nem rodapé.
  if (pathname === "/login") return <Login />;

  return (
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectsProvider>
        <Layout />
      </ProjectsProvider>
    </AuthProvider>
  );
}
