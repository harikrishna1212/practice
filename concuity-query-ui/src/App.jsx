import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLES } from './constants';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import UserQueryListPage from './pages/user/UserQueryListPage';
import CreateQueryPage from './pages/user/CreateQueryPage';
import AdminQueryListPage from './pages/admin/AdminQueryListPage';
import AdminQueryDetailPage from './pages/admin/AdminQueryDetailPage';

function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Navigate to={user.role === ROLES.ADMIN ? '/admin/queries' : '/queries'} replace />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/queries"
          element={
            <RequireRole role={ROLES.USER}>
              <UserQueryListPage />
            </RequireRole>
          }
        />
        <Route
          path="/queries/new"
          element={
            <RequireRole role={ROLES.USER}>
              <CreateQueryPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/queries"
          element={
            <RequireRole role={ROLES.ADMIN}>
              <AdminQueryListPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/queries/:id"
          element={
            <RequireRole role={ROLES.ADMIN}>
              <AdminQueryDetailPage />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
