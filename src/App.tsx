import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Payment from './pages/Payment';
import Success from './pages/Success';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminReservations from './pages/admin/Reservations';
import AdminCreateReservation from './pages/admin/CreateReservation';
import AdminUsuarios from './pages/admin/Usuarios';
import AdminTables from './pages/admin/Tables';
import AdminReports from './pages/admin/Reports';
import AdminValidarVoucher from './pages/admin/ValidarVoucher';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/pagamento" element={<Payment />} />
      <Route path="/sucesso" element={<Success />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <ProtectedRoute>
            <AdminReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-reservation"
        element={
          <ProtectedRoute>
            <AdminCreateReservation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute>
            <AdminUsuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tables"
        element={
          <ProtectedRoute>
            <AdminTables />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/validar-voucher"
        element={
          <ProtectedRoute>
            <AdminValidarVoucher />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
