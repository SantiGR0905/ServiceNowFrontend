import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import '../assets/UserServices.css';

export default function UserServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceId: '',
    description: ''
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [personalRes, allRes] = await Promise.all([
          axios.get(`http://servicenow.somee.com/api/PersonalServices?userId=${user.userId}`),
          axios.get('http://servicenow.somee.com/api/PersonalServices')
        ]);
        setServices(personalRes.data);
        setAllServices(allRes.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, [user]);

  const handleAddService = async () => {
    try {
      await axios.post('http://servicenow.somee.com/api/PersonalServices', {
        ...newService,
        userId: user.userId
      });
      const res = await axios.get(`http://servicenow.somee.com/api/PersonalServices?userId=${user.userId}`);
      setServices(res.data);
      setNewService({ serviceId: '', description: '' });
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  return (
    <div className="services-management">
      <h2>Mis Servicios Ofrecidos</h2>
      
      <div className="services-list">
        {services.map(service => (
          <div key={service.serviceId} className="service-card">
            <h3>{service.serviceName}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>

      <div className="add-service-form">
        <h3>Agregar Servicio</h3>
        <select
          value={newService.serviceId}
          onChange={(e) => setNewService({...newService, serviceId: e.target.value})}
        >
          <option value="">Seleccione un servicio</option>
          {allServices.map(service => (
            <option key={service.serviceId} value={service.serviceId}>
              {service.serviceName}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Descripción del servicio"
          value={newService.description}
          onChange={(e) => setNewService({...newService, description: e.target.value})}
        />
        <button onClick={handleAddService}>Agregar Servicio</button>
      </div>
    </div>
  );
}