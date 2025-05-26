import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { Link } from 'react-router-dom'; 
import '../assets/AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalAppointments: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, appointmentsRes, paymentsRes] = await Promise.all([
          axios.get('https://servicenow.somee.com/api/Users'),
          axios.get('https://servicenow.somee.com/api/Appointments'),
          axios.get('https://servicenow.somee.com/api/Payments')
        ]);
        
        const providers = usersRes.data.filter(u => 
          !u.isDeleted && u.userTypes?.userType === 'Provider'
        ).length;
        
        setStats({
          totalUsers: usersRes.data.filter(u => !u.isDeleted).length,
          totalProviders: providers,
          totalAppointments: appointmentsRes.data.filter(a => !a.isDeleted).length,
          totalRevenue: paymentsRes.data
            .filter(p => !p.isDeleted && p.status === 'completed')
            .reduce((sum, payment) => sum + payment.amount, 0)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Panel de Administración</h2>

       {/* Agregar enlaces de navegación */}
      <div className="navigation-links">
        <Link to="/Admin/Layout" className="nav-link">Panel de Control</Link>
        <Link to="/Admin/Appointments" className="nav-link">Gestionar Citas</Link>
        <Link to="/Admin/Services" className="nav-link">Gestionar Servicios</Link>
        <Link to="/Admin/Users" className="nav-link">Gestionar Usuarios</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Usuarios Totales</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Prestadores</h3>
          <p>{stats.totalProviders}</p>
        </div>
        <div className="stat-card">
          <h3>Citas Totales</h3>
          <p>{stats.totalAppointments}</p>
        </div>
      </div>
    </div>
  );
}