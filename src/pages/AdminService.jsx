import axios from 'axios';
import { useEffect, useState } from 'react';

// --- COMPONENTE PRINCIPAL (export default) ---
const AdminService = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await AdminServiceAPI.getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Cargando estadísticas...</div>;
  if (!stats) return <div>Error al cargar datos</div>;

  return (
    <div className="admin-container">
      <h1>Panel de Administración</h1>
      <div className="stats-grid">
        <StatCard title="Usuarios totales" value={stats.totalUsers} />
        <StatCard title="Proveedores" value={stats.totalProviders} />
        <StatCard title="Citas" value={stats.totalAppointments} />
        <StatCard 
          title="Ingresos" 
          value={`$${stats.totalRevenue.toFixed(2)}`} 
        />
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---
const StatCard = ({ title, value }) => (
  <div className="stat-card">
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

// --- API FUNCTIONS (como objeto organizado) ---
const AdminServiceAPI = {
  getAdminStats: async () => {
    try {
      const [usersRes, appointmentsRes, paymentsRes] = await Promise.all([
        axios.get('https://servicenow.somee.com/api/Users'),
        axios.get('https://servicenow.somee.com/api/Appointments'),
        axios.get('https://servicenow.somee.com/api/Payments')
      ]);
      
      return {
        totalUsers: usersRes.data.filter(u => !u.isDeleted).length,
        totalProviders: usersRes.data.filter(u => !u.isDeleted && u.userTypes?.userType === 'Provider').length,
        totalAppointments: appointmentsRes.data.filter(a => !a.isDeleted).length,
        totalRevenue: paymentsRes.data
          .filter(p => !p.isDeleted && p.status === 'completed')
          .reduce((sum, payment) => sum + payment.amount, 0)
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  updateUserType: async (userId, userTypeId) => {
    return axios.put(`https://servicenow.somee.com/api/Users/${userId}/type`, { userTypeId });
  },

  toggleUserStatus: async (userId, isDeleted) => {
    return axios.put(`https://servicenow.somee.com/api/Users/${userId}/status`, { isDeleted });
  },

  toggleServiceStatus: async (serviceId, isDeleted) => {
    return axios.put(`https://servicenow.somee.com/api/PersonalServices/${serviceId}/status`, { isDeleted });
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    return axios.put(`https://servicenow.somee.com/api/Appointments/${appointmentId}/status`, { status });
  }
};

// --- EXPORTS ---
export default AdminService;
export { AdminServiceAPI }; // Opcional: si necesitas usar las funciones en otros componentes