import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/ProtectedRoute";
import Toaster from "./components/ui/Toaster";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CreateCompany from "./pages/CreateCompany";
import Dashboard from "./pages/Dashboard";
import BoardPage from "./pages/BoardPage";
import MyTasks from "./pages/MyTasks";
import Calendar from "./pages/Calendar";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import DMCA from "./pages/DMCA";
import InvitePage from "./pages/InvitePage";
import CompanyInvitePage from "./pages/CompanyInvitePage";
import AppLayout from "./components/layout/AppLayout";
import { CompanyProvider } from "./context/CompanyContext";

const App = () => (
  <BrowserRouter>
    <ThemeProvider>
    <AuthProvider>
      <CompanyProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Onboarding: new users must create a company */}
        <Route
          path="/create-company"
          element={
            <ProtectedRoute>
              <CreateCompany />
            </ProtectedRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
        </Route>

        <Route path="/invite/:token" element={<InvitePage />} />
        <Route path="/company-invite/:token" element={<CompanyInvitePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/dmca" element={<DMCA />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      <Toaster />
      </CompanyProvider>
    </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
