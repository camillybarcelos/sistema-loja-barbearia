import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';

// Lazy loading dos componentes para melhor performance
const LoginForm = React.lazy(() => import('./components/Auth/LoginForm'));
const Layout = React.lazy(() => import('./components/Layout/Layout'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const POS = React.lazy(() => import('./pages/POS'));
const CashRegisterPage = React.lazy(() => import('./pages/CashRegisterPage'));
const Products = React.lazy(() => import('./pages/Products'));
const Services = React.lazy(() => import('./pages/Services'));
const Barbers = React.lazy(() => import('./pages/Barbers'));
const Customers = React.lazy(() => import('./pages/Customers'));
const Sales = React.lazy(() => import('./pages/Sales'));
const Commissions = React.lazy(() => import('./pages/Commissions'));
const Appointments = React.lazy(() => import('./pages/Appointments'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Settings = React.lazy(() => import('./pages/Settings'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));

// Componente de loading
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}

// Componente de erro
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      {children}
    </React.Suspense>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <ErrorBoundary>
            {user ? <Navigate to="/dashboard" /> : <LoginForm />}
          </ErrorBoundary>
        } 
      />
      <Route 
        path="/register" 
        element={
          <ErrorBoundary>
            <RegisterPage />
          </ErrorBoundary>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <Dashboard />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <POS />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cash-register"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <CashRegisterPage />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <Products />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <Services />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/barbers"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <Barbers />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <Customers />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <Sales />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/commissions"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <Commissions />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <Appointments />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Layout>
                <Reports />
              </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
            <Layout>
              <Settings />
            </Layout>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Suspense fallback={<LoadingSpinner />}>
            <AppRoutes />
            </Suspense>
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;