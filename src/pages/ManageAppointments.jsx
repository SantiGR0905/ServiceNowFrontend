import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import '../assets/ManageAppointments.css';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('http://servicenow.somee.com/api/Appointments');
        setAppointments(res.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };
    fetchAppointments();
  }, []);

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`http://servicenow.somee.com/api/Appointments/${appointmentId}/status`, { status });
      setAppointments(appointments.map(app => 
        app.appointmentId === appointmentId ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' ? true : appointment.status === filter;
    const matchesSearch = 
      appointment.users?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.users?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.personalServices?.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch && !appointment.isDeleted;
  });

  return (
    <div className="manage-appointments">
      <h2>Gestión de Citas</h2>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Buscar citas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      <div className="appointments-table">
        <table>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Cliente</th>
              <th>Prestador</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(appointment => (
              <tr key={appointment.appointmentId}>
                <td>{appointment.personalServices?.serviceName}</td>
                <td>{appointment.users?.firstName} {appointment.users?.lastName}</td>
                <td>{appointment.users1?.firstName} {appointment.users1?.lastName}</td>
                <td>{format(new Date(appointment.appointmentDate), 'PPpp')}</td>
                <td>{appointment.status}</td>
                <td>
                  {appointment.status === 'pending' && (
                    <>
                      <button onClick={() => updateAppointmentStatus(appointment.appointmentId, 'confirmed')}>
                        Confirmar
                      </button>
                      <button onClick={() => updateAppointmentStatus(appointment.appointmentId, 'cancelled')}>
                        Cancelar
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button onClick={() => updateAppointmentStatus(appointment.appointmentId, 'completed')}>
                      Completar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}   