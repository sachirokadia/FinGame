import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import OnboardingTour from "./components/OnboardingTour";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import AppLayout from "./components/AppLayout";
import AddExpenseModal from "./components/AddExpenseModal";
import XPToast from "./components/XPToast";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import QuestsPage from "./pages/QuestsPage";
import StoryPage from "./pages/StoryPage";
import StatsPage from "./pages/StatsPage";

const PUBLIC_PATHS = ["/", "/login", "/register"];
const APP_PATHS    = ["/dashboard", "/quests", "/story", "/stats"];

function AppContent() {
  const location = useLocation();
  const { user, loading, completeTour, authError, clearAuthError } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showTour, setShowTour]         = useState(false);

  const isPublic = PUBLIC_PATHS.includes(location.pathname);
  const isApp    = APP_PATHS.includes(location.pathname);

  useEffect(() => {
    if (loading || !user || user.tourCompleted || location.pathname !== "/dashboard") {
      setShowTour(false); return;
    }
    const timer = window.setTimeout(() => setShowTour(true), 500);
    return () => clearTimeout(timer);
  }, [user, loading, location.pathname]);

  useEffect(() => {
    const openHandler = () => setAddModalOpen(true);
    window.addEventListener("open-add-expense", openHandler);
    return () => window.removeEventListener("open-add-expense", openHandler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {!isPublic && <Navbar />}
      <XPToast />
      {authError && !isPublic && (
        <div className="fixed top-20 inset-x-4 z-50 flex justify-center">
          <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3 border border-error/30 max-w-md w-full">
            <span className="text-error text-sm flex-1">{authError}</span>
            <button type="button" onClick={clearAuthError} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout onAddClick={() => setAddModalOpen(true)}><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/quests"    element={<ProtectedRoute><AppLayout onAddClick={() => setAddModalOpen(true)}><QuestsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/story"     element={<ProtectedRoute><AppLayout onAddClick={() => setAddModalOpen(true)}><StoryPage /></AppLayout></ProtectedRoute>} />
        <Route path="/stats"     element={<ProtectedRoute><AppLayout onAddClick={() => setAddModalOpen(true)}><StatsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/add" element={<Navigate to="/dashboard" replace />} />
        <Route path="*"    element={<Navigate to="/" replace />} />
      </Routes>
      {isApp && <div className="lg:hidden"><BottomNav onAddClick={() => setAddModalOpen(true)} /></div>}
      <AddExpenseModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
      {showTour && (
        <OnboardingTour onComplete={async () => { setShowTour(false); await completeTour(); }} />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
