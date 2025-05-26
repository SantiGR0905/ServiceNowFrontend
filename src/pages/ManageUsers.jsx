import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import '../assets/ManageUsers.css';

export default function ManageUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, typesRes] = await Promise.all([
          axios.get('https://servicenow.somee.com/api/Users'),
          axios.get('https://servicenow.somee.com/api/UserTypes')
        ]);
        setUsers(usersRes.data);
        setUserTypes(typesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const updateUserType = async (userId, userTypeId) => {
    try {
      await axios.put(`https://servicenow.somee.com/api/Users/${userId}/type`, { userTypeId });
      setUsers(users.map(u => 
        u.userId === userId ? { ...u, userTypes: userTypes.find(t => t.userTypeId === userTypeId) } : u
      ));
    } catch (error) {
      console.error('Error updating user type:', error);
    }
  };

  const toggleUserStatus = async (userId, isDeleted) => {
    try {
      await axios.put(`https://servicenow.somee.com/api/Users/${userId}/status`, { isDeleted });
      setUsers(users.map(u => 
        u.userId === userId ? { ...u, isDeleted } : u
      ));
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' ? true : 
                         filter === 'active' ? !user.isDeleted :
                         user.isDeleted;
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="manage-users">
      <h2>Gestión de Usuarios</h2>
      
      <div className="controls">
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.userId}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.userTypes?.userTypeId || ''}
                    onChange={(e) => updateUserType(user.userId, parseInt(e.target.value))}
                  >
                    {userTypes.map(type => (
                      <option key={type.userTypeId} value={type.userTypeId}>
                        {type.userType}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{user.isDeleted ? 'Inactivo' : 'Activo'}</td>
                <td>
                  <button 
                    onClick={() => toggleUserStatus(user.userId, !user.isDeleted)}
                    className={user.isDeleted ? 'activate-btn' : 'deactivate-btn'}
                  >
                    {user.isDeleted ? 'Activar' : 'Desactivar'}
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