import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import '../assets/UserProfile.css';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName,
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber,
        email: user.email
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      const response = await axios.put(
        `http://servicenow.somee.com/api/Users/${user.userId}`,
        profile
      );
      updateUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>
      
      {isEditing ? (
        <div className="edit-form">
          <label>
            Nombre:
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            />
          </label>
          <label>
            Apellido:
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => setProfile({...profile, lastName: e.target.value})}
            />
          </label>
          <label>
            Teléfono:
            <input
              type="tel"
              value={profile.phoneNumber}
              onChange={(e) => setProfile({...profile, phoneNumber: e.target.value})}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({...profile, email: e.target.value})}
              disabled
            />
          </label>
          <div className="form-actions">
            <button onClick={handleUpdateProfile}>Guardar Cambios</button>
            <button onClick={() => setIsEditing(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="profile-view">
          <h3>{profile.firstName} {profile.lastName}</h3>
          <p><strong>Teléfono:</strong> {profile.phoneNumber}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
        </div>
      )}
    </div>
  );
}