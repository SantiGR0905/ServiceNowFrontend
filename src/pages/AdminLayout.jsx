import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.userTypes?.userType !== 'Admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>ServiceNow Admin</h2>
        <nav>
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/users">Usuarios</Link></li>
            <li><Link to="/admin/services">Servicios</Link></li>
            <li><Link to="/admin/appointments">Citas</Link></li>
            <li><Link to="/admin/reports">Reportes</Link></li>
          </ul>
        </nav>
        <button onClick={logout} className="logout-btn">Cerrar Sesión</button>
      </aside>
      
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}