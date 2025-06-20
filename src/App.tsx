import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

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
          <Suspense fallback={<LoadingSpinner />}>
            {user ? <Navigate to="/dashboard" /> : <LoginForm />}
          </Suspense>
        } 
      />
      <Route 
        path="/register" 
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <RegisterPage />
          </Suspense>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="pos" element={<POS />} />
                    <Route path="cash-register" element={<CashRegisterPage />} />
                    <Route path="products" element={<Products />} />
                    <Route path="services" element={<Services />} />
                    <Route path="barbers" element={<Barbers />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="sales" element={<Sales />} />
                    <Route path="commissions" element={<Commissions />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Layout>
              </Suspense>
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