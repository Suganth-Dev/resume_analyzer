import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuthStore } from './store/authStore';
import { useAdminStore } from './store/adminStore';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import History from './pages/History';
import ResumeDetails from './pages/ResumeDetails';
import Profile from './pages/Profile';

// Admin Page Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import ResumeManagement from './pages/admin/ResumeManagement';
import UserDetail from './pages/admin/UserDetail';
import Analytics from './pages/admin/Analytics';

// Route Guard for Private/Protected Pages
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? (
    <DashboardLayout>{children}</DashboardLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Route Guard for Guest Pages (Redirects authenticated users to dashboard)
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Route Guard for Administrative Pages
const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAdminStore();
  return isAdminAuthenticated ? (
    <AdminLayout>{children}</AdminLayout>
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

// Route Guard for Guest Admin Pages (Redirects authenticated admins to admin dashboard)
const AdminGuestRoute = ({ children }) => {
  const { isAdminAuthenticated } = useAdminStore();
  return !isAdminAuthenticated ? children : <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-dark-100 font-sans">
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Authentication Guest Routes */}
          <Route 
            path="/login" 
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            } 
          />
          <Route 
            path="/reset-password" 
            element={
              <GuestRoute>
                <ResetPassword />
              </GuestRoute>
            } 
          />

          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analyzer" 
            element={
              <ProtectedRoute>
                <ResumeAnalyzer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resume/:id" 
            element={
              <ProtectedRoute>
                <ResumeDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/login" 
            element={
              <AdminGuestRoute>
                <AdminLogin />
              </AdminGuestRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <AdminProtectedRoute>
                <UsersManagement />
              </AdminProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users/:id" 
            element={
              <AdminProtectedRoute>
                <UserDetail />
              </AdminProtectedRoute>
            } 
          />
          <Route 
            path="/admin/resumes" 
            element={
              <AdminProtectedRoute>
                <ResumeManagement />
              </AdminProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <AdminProtectedRoute>
                <Analytics />
              </AdminProtectedRoute>
            } 
          />

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toast Alerts */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="dark" 
        />
      </div>
    </Router>
  );
}

export default App;
