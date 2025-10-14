import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AppProvider } from './contexts/AppContext';
import { useEffect } from 'react';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import GrievancesPage from './pages/GrievancesPage';
import GrievanceDetailPage from './pages/GrievanceDetailPage';
import GrievanceFormPage from './pages/GrievanceFormPage';
import ProfilePage from './pages/ProfilePage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminGrievancesPage from './pages/admin/AdminGrievancesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSchemesPage from './pages/admin/AdminSchemesPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/schemes/:id" element={<SchemeDetailPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/voice-assistant" element={<VoiceAssistantPage />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          {/* Protected User Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="citizen">
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/applications" element={
            <ProtectedRoute requiredRole="citizen">
              <ApplicationsPage />
            </ProtectedRoute>
          } />

          <Route path="/applications/new" element={
            <ProtectedRoute requiredRole="citizen">
              <ApplicationFormPage />
            </ProtectedRoute>
          } />

          <Route path="/applications/:id" element={
            <ProtectedRoute requiredRole="citizen">
              <ApplicationDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/grievances" element={
            <ProtectedRoute requiredRole="citizen">
              <GrievancesPage />
            </ProtectedRoute>
          } />

          <Route path="/grievances/new" element={
            <ProtectedRoute requiredRole="citizen">
              <GrievanceFormPage />
            </ProtectedRoute>
          } />

          <Route path="/grievances/:id" element={
            <ProtectedRoute requiredRole="citizen">
              <GrievanceDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/applications" element={
            <ProtectedRoute requiredRole={['admin', 'staff']}>
              <AdminApplicationsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/grievances" element={
            <ProtectedRoute requiredRole={['admin', 'staff']}>
              <AdminGrievancesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/schemes" element={
            <ProtectedRoute requiredRole={['admin', 'staff']}>
              <AdminSchemesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/services" element={
            <ProtectedRoute requiredRole={['admin', 'staff']}>
              <AdminServicesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/announcements" element={
            <ProtectedRoute requiredRole={['admin', 'staff']}>
              <AdminAnnouncementsPage />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
                <a href="/" className="btn-primary">
                  Go Home
                </a>
              </div>
            </div>
          } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </AppProvider>
  );
}

export default App;
