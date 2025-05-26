import { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/ManageService.css';

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceName: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('https://servicenow.somee.com/api/PersonalServices');
        setServices(res.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  const handleCreateService = async () => {
    try {
      const res = await axios.post('https://servicenow.somee.com/api/PersonalServices', newService);
      setServices([...services, res.data]);
      setNewService({ serviceName: '', description: '' });
    } catch (error) {
      console.error('Error creating service:', error);
    }
  };

  const handleUpdateService = async () => {
    try {
      const res = await axios.put(
        `https://servicenow.somee.com/api/PersonalServices/${editingId}`,
        newService
      );
      setServices(services.map(s => 
        s.serviceId === editingId ? res.data : s
      ));
      setEditingId(null);
      setNewService({ serviceName: '', description: '' });
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const toggleServiceStatus = async (serviceId, isDeleted) => {
    try {
      await axios.put(`https://servicenow.somee.com/api/PersonalServices/${serviceId}/status`, { isDeleted });
      setServices(services.map(s => 
        s.serviceId === serviceId ? { ...s, isDeleted } : s
      ));
    } catch (error) {
      console.error('Error toggling service status:', error);
    }
  };

  const startEditing = (service) => {
    setEditingId(service.serviceId);
    setNewService({
      serviceName: service.serviceName,
      description: service.description
    });
  };

  return (
    <div className="manage-services">
      <h2>Gestión de Servicios</h2>
      
      <div className="service-form">
        <h3>{editingId ? 'Editar Servicio' : 'Crear Nuevo Servicio'}</h3>
        <input
          type="text"
          placeholder="Nombre del servicio"
          value={newService.serviceName}
          onChange={(e) => setNewService({...newService, serviceName: e.target.value})}
        />
        <textarea
          placeholder="Descripción"
          value={newService.description}
          onChange={(e) => setNewService({...newService, description: e.target.value})}
        />
        <button
          onClick={editingId ? handleUpdateService : handleCreateService}
          disabled={!newService.serviceName}
        >
          {editingId ? 'Actualizar' : 'Crear'}
        </button>
        {editingId && (
          <button onClick={() => {
            setEditingId(null);
            setNewService({ serviceName: '', description: '' });
          }}>
            Cancelar
          </button>
        )}
      </div>

      <div className="services-list">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.serviceId} className={service.isDeleted ? 'inactive' : ''}>
                <td>{service.serviceName}</td>
                <td>{service.description}</td>
                <td>{service.isDeleted ? 'Inactivo' : 'Activo'}</td>
                <td>
                  <button onClick={() => startEditing(service)}>Editar</button>
                  <button 
                    onClick={() => toggleServiceStatus(service.serviceId, !service.isDeleted)}
                    className={service.isDeleted ? 'activate-btn' : 'deactivate-btn'}
                  >
                    {service.isDeleted ? 'Activar' : 'Desactivar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}