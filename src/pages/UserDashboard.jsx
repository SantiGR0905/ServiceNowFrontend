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

  // Debug inicial
  console.log('Render inicial - userId:', userId, 'authLoading:', authLoading);

  useEffect(() => {
    console.log('Efecto principal - userId:', userId);
    
    const verifyAuth = () => {
      if (!authLoading && !userId) {
        console.log('Usuario no autenticado - redirigiendo a login');
        navigate('/login');
      }
    };

    const fetchStats = async () => {
      try {
        console.log('Iniciando fetch para userId:', userId);
        setLoading(true);
        
        const appointmentsRes = await axios.get(
          `http://servicenow.somee.com/api/Appointments?userId=${userId}`
        );
        
        const paymentsRes = await axios.get(
          `http://servicenow.somee.com/api/Payments?userId=${userId}`
        );

        console.log('Datos recibidos - Citas:', appointmentsRes.data);
        console.log('Datos recibidos - Pagos:', paymentsRes.data);

        const processData = () => {
          const validAppointments = appointmentsRes.data.filter(a => !a.isDeleted);
          const pending = validAppointments.filter(a => !a.completed).length;
          const completed = validAppointments.filter(a => a.completed).length;
          const earnings = paymentsRes.data.reduce((sum, payment) => sum + payment.amount, 0);
          
          return { pending, completed, earnings };
        };

        setStats(processData());
      } catch (error) {
        console.error('Error en la solicitud:', error);
        setError('Error al cargar datos del panel');
        
        if (error.response?.status === 401) {
          console.log('Error de autenticación - cerrando sesión');
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
    
    if (userId && !authLoading) {
      console.log('UserId válido - obteniendo estadísticas');
      fetchStats();
    }
  }, [userId, authLoading, navigate, logout]);

  console.log('Pre-render - authLoading:', authLoading, 'userId:', userId, 'loading:', loading);

  if (authLoading) {
    console.log('Renderizando estado de carga de autenticación');
    return <div className="loading">Verificando credenciales...</div>;
  }

  if (!userId) {
    console.log('Renderizando redirección a login');
    return null; // La navegación ya se maneja en el efecto
  }

  if (loading) {
    console.log('Renderizando carga de datos');
    return <div className="loading">Cargando estadísticas...</div>;
  }

  if (error) {
    console.log('Renderizando error:', error);
    return <div className="alert error">{error}</div>;
  }

  console.log('Renderizando contenido principal');
 return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2 className="dashboard-title">Panel de Prestador</h2>
        <div className="dashboard-controls">
          <Link to="/Provider/Appointments" className="nav-button">
            <span className="nav-icon">📅</span>
            <span className="nav-text">Mis Citas</span>
          </Link>
          <Link to="/Provider/Availability" className="nav-button">
            <span className="nav-icon">⏰</span>
            <span className="nav-text">Disponibilidad</span>
          </Link>
          <Link to="/Provider/Profile" className="nav-button">
            <span className="nav-icon">👤</span>
            <span className="nav-text">Perfil</span>
          </Link>
          <Link to="/Provider/Services" className="nav-button">
            <span className="nav-icon">🛠️</span>
            <span className="nav-text">Servicios</span>
          </Link>
        </div>
      </header>

      <div className="stats-container">
        <div className="stat-card pending">
          <div className="stat-content">
            <h3 className="stat-title">Citas Pendientes</h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
          <div className="stat-decoration">❗</div>
        </div>

        <div className="stat-card completed">
          <div className="stat-content">
            <h3 className="stat-title">Citas Completadas</h3>
            <p className="stat-value">{stats.completed}</p>
          </div>
          <div className="stat-decoration">✅</div>
        </div>
      </div>
    </div>
  );
}