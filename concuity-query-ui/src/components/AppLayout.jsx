import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from './../context/AuthContext';
import { ROLES } from '../constants';

export default function AppLayout() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Concuity Query Service</h1>
        <div className="app-header-right">
          <span className="app-user">
            {user.displayName}{' '}
            <span className="app-role">
              ({user.role === ROLES.ADMIN ? 'Administrator' : 'Client User'})
            </span>
          </span>
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
