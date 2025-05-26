import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../assets/UserDashboard.css';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { userId, authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    earnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Efecto ejecutado - userId:', userId); // Debug
    
    const fetchData = async () => {
      if (!userId) {
        navigate('/login');
        return;
      }

      try {
        console.log('Iniciando carga de estadísticas...'); // Debug
        setLoading(true);
        
        const appointmentsRes = await axios.get(
          `http://servicenow.somee.com/api/Appointments?userId=${userId}`
        );
        
        const paymentsRes = await axios.get(
          `http://servicenow.somee.com/api/Payments?userId=${userId}`
        );

        console.log('Respuesta de citas:', appointmentsRes.data); // Debug
        console.log('Respuesta de pagos:', paymentsRes.data); // Debug

        const pending = appointmentsRes.data.filter(a => !a.isDeleted && !a.completed).length;
        const completed = appointmentsRes.data.filter(a => !a.isDeleted && a.completed).length;
        const earnings = paymentsRes.data.reduce((sum, payment) => sum + payment.amount, 0);

        setStats({ pending, completed, earnings });
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId, navigate]);

  console.log('Estado de renderizado:', { authLoading, userId, loading }); // Debug

  if (authLoading) {
    return <div className="loading">Verificando autenticación...</div>;
  }

  if (!userId) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  if (error) {
    return <div className="alert error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Panel de Prestador</h2>
        <div className="dashboard-actions">
          <button onClick={logout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="navigation-links">
        <Link to="/Provider/Appointments" className="nav-link">
          <i className="icon-calendar"></i> Mis Citas
        </Link>
        <Link to="/Provider/Availability" className="nav-link">
          <i className="icon-clock"></i> Disponibilidad
        </Link>
        <Link to="/Provider/Profile" className="nav-link">
          <i className="icon-user"></i> Perfil
        </Link>
        <Link to="/Provider/Services" className="nav-link">
          <i className="icon-service"></i> Servicios
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card pending">
          <h3><i className="icon-pending"></i> Citas Pendientes</h3>
          <p>{stats.pending}</p>
        </div>
        
        <div className="stat-card completed">
          <h3><i className="icon-completed"></i> Citas Completadas</h3>
          <p>{stats.completed}</p>
        </div>
        
        <div className="stat-card earnings">
          <h3><i className="icon-earnings"></i> Ganancias Totales</h3>
          <p>${stats.earnings.toLocaleString()}</p>
        </div>
      </div>

      <div className="quick-actions">
        <button 
          className="action-btn"
          onClick={() => navigate('/Provider/NewService')}
        >
          <i className="icon-plus"></i> Nuevo Servicio
        </button>
        <button 
          className="action-btn"
          onClick={() => navigate('/Provider/Reports')}
        >
          <i className="icon-report"></i> Generar Reporte
        </button>
      </div>
    </div>
  );
}