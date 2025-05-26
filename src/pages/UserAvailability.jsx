import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import '../assets/UserAvailability.css';

export default function UserAvailability() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [timeRange, setTimeRange] = useState({
    start: '09:00',
    end: '17:00'
  });
  const [providerId, setProviderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Obtener providerId
  useEffect(() => {
    const fetchProviderId = async () => {
      try {
        const response = await axios.get(
          'http://servicenow.somee.com/api/Providers',
          {
            params: { usersUserId: user.userId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.length > 0) {
          setProviderId(response.data[0].providerId);
        } else {
          throw new Error('Usuario no registrado como proveedor');
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error.response?.data?.message || 'Error de autenticación');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) fetchProviderId();
  }, [user]);

  // 2. Obtener disponibilidad
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await axios.get(
          `http://servicenow.somee.com/api/Availability`,
          {
            params: { providerId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setAvailability(res.data);
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar disponibilidad');
      }
    };

    if (providerId) fetchAvailability();
  }, [providerId]);

  // 3. Manejar guardado de disponibilidad
  const handleSaveAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validaciones
      if (!providerId) throw new Error('Proveedor no identificado');
      if (selectedDays.length === 0) throw new Error('Selecciona al menos un día');
      
      // Convertir a formato DateTime ISO válido
      const createDateTime = (time) => {
        const date = new Date();
        date.setFullYear(2024, 0, 1); // Fecha dummy
        const [hours, minutes] = time.split(':');
        date.setHours(hours, minutes, 0, 0);
        return date.toISOString();
      };

      // Eliminar disponibilidad existente para los días seleccionados
      const daysToUpdate = [...new Set(selectedDays.map(date => date.getDay()))];
      await Promise.all(
        availability
          .filter(a => daysToUpdate.includes(a.weekDay))
          .map(a => 
            axios.delete(`http://servicenow.somee.com/api/Availability/${a.availabilityId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            })
          )
      );

      // Crear nueva disponibilidad
      const newAvailability = daysToUpdate.map(weekDay => ({
        weekDay,
        startTime: createDateTime(timeRange.start),
        endTime: createDateTime(timeRange.end),
        providerId
      }));

      await Promise.all(
        newAvailability.map(avail => 
          axios.post('http://servicenow.somee.com/api/Availability', avail, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
        )
      );

      // Actualizar lista
      const res = await axios.get(
        `http://servicenow.somee.com/api/Availability?providerId=${providerId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setAvailability(res.data);
      setSelectedDays([]);

    } catch (error) {
      console.error('Error:', {
        request: error.config?.data,
        response: error.response?.data
      });
      setError(error.response?.data?.title || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Formatear hora ISO
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="availability-container">
      <h2>Gestión de Disponibilidad</h2>
      
      <div className="content-wrapper">
        <DayPicker
          mode="multiple"
          selected={selectedDays}
          onSelect={setSelectedDays}
          disabled={{ before: new Date() }}
        />

        <div className="time-configuration">
          <input
            type="time"
            value={timeRange.start}
            onChange={e => setTimeRange({...timeRange, start: e.target.value})}
          />
          <input
            type="time"
            value={timeRange.end}
            onChange={e => setTimeRange({...timeRange, end: e.target.value})}
          />
          <button onClick={handleSaveAvailability}>
            Guardar
          </button>
        </div>

        <div className="current-availability">
          {availability.map(avail => (
            <div key={avail.availabilityId}>
              {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][avail.weekDay]}: 
              {formatTime(avail.startTime)} - {formatTime(avail.endTime)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}