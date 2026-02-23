import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WaterProvider } from "./context/WaterContext";
import LoginPage from "./components/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import IntelligencePage from "./components/IntelligencePage";
import LogisticsPage from "./components/LogisticsPage";

import Analytics from "./components/Analytics";

function AuthenticatedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route element={
        <AuthenticatedRoute>
          <DashboardLayout />
        </AuthenticatedRoute>
      }>
        <Route path="/dashboard" element={<IntelligencePage />} />
        <Route path="/logistics" element={<LogisticsPage />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <WaterProvider>
          <AppRoutes />
        </WaterProvider>
      </AuthProvider>
    </Router>
  );
}



