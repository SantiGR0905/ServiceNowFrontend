import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../assets/Registrarse.css';
import { useAuth } from '../services/AuthContext.jsx';

const Registrarse = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
        userTypeId: "",
        serviceId: ""
    });

    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [userTypes, setUserTypes] = useState([]);
    const [services, setServices] = useState([]);

    useEffect(() => {
        setUserTypes([
            { id: 2, name: "Profesional" },
            { id: 3, name: "Cliente" }
        ]);

        const loadServices = async () => {
            try {
                const response = await axios.get("http://servicenow.somee.com/api/PersonalServices");
                setServices(response.data);
            } catch (error) {
                console.error("Error al cargar servicios:", error);
            }
        };
        loadServices();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = "Nombre es requerido";
        if (!formData.lastName.trim()) newErrors.lastName = "Apellido es requerido";
        if (!formData.email.trim()) {
            newErrors.email = "Email es requerido";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Email no válido";
        }
        if (!formData.password) {
            newErrors.password = "Contraseña es requerida";
        } else if (formData.password.length < 6) {
            newErrors.password = "Mínimo 6 caracteres";
        }
        if (!formData.userTypeId) newErrors.userTypeId = "Seleccione un tipo de usuario";
        if (formData.userTypeId === "2" && !formData.serviceId) {
            newErrors.serviceId = "Seleccione un servicio";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const registerProvider = async (userId) => {
    try {
        console.log("Registering provider with userId:", userId, "and serviceId:", formData.serviceId);
      const response = await axios.post(
        "http://servicenow.somee.com/api/Providers",
        {
            UserId: userId,
            ServiceId: parseInt(formData.serviceId, 10),
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al registrar proveedor:", {
        requestData: {
          UsersUserId: userId,
          PersonalServicesServiceId: formData.serviceId
        },
        errorResponse: error.response?.data
      });
      throw error;
    }
  };

    const registerCustomer = async (userId) => {
    try {
      const response = await axios.post(
        "http://servicenow.somee.com/api/Customers",
        {
          UserId: userId
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al registrar cliente:", {
        requestData: {
          UserId: userId
        },
        errorResponse: error.response?.data
      });
      throw error;
    }
  };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Crear el usuario
            const createUserResponse = await axios.post("http://servicenow.somee.com/api/Users", formData, {
                headers: { "Content-Type": "application/json" }
            });

            const allUsersResponse = await axios.get("http://servicenow.somee.com/api/Users");
            const registeredUser = allUsersResponse.data.find(user => user.email === formData.email);

            if (!registeredUser || !registeredUser.userId) {
                throw new Error("No se pudo obtener el ID del usuario.");
            }

            // Registrar como profesional o cliente
            if (formData.userTypeId === "2") {
                await registerProvider(registeredUser.userId);
            } else if (formData.userTypeId === "3") {
                await registerCustomer(registeredUser.userId);
            }

            // Obtener permisos
            const permissionsResponse = await axios.get(
                `http://servicenow.somee.com/api/PermissionsXUsers?userTypeId=${registeredUser.userTypeId}`
            );

            const userPermission = Array.isArray(permissionsResponse.data)
                ? permissionsResponse.data[0]
                : permissionsResponse.data;

            if (!userPermission) {
                throw new Error("No se encontraron permisos.");
            }

            // Guardar sesión
            localStorage.setItem("userId", registeredUser.userId);
            localStorage.setItem("userTypeId", userPermission.userTypes.userTypeId);
            localStorage.setItem("permissionId", userPermission.permissions.permissionId);

            login(
                registeredUser.userId,
                userPermission.userTypes.userTypeId,
                userPermission.permissions.permissionId
            );

            // Redirigir según tipo
            switch (parseInt(userPermission.userTypes.userTypeId)) {
                case 1:
                    navigate("/Admin");
                    break;
                case 2:
                    navigate("/Provider");
                    break;
                case 3:
                    navigate("/Dashboard");
                    break;
                default:
                    navigate("/");
            }

        } catch (error) {
            console.error("Error en registro:", error);
            setErrorMessage(error.message || "Error durante el registro.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Registro de Usuario</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label>Nombre*</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={errors.firstName ? "error" : ""}
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                    <label>Apellido*</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={errors.lastName ? "error" : ""}
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                    <label>Email*</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "error" : ""}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label>Teléfono</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Opcional"
                    />
                </div>

                <div className="form-group">
                    <label>Contraseña*</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={errors.password ? "error" : ""}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                    <label>Tipo de Usuario*</label>
                    <select
                        name="userTypeId"
                        value={formData.userTypeId}
                        onChange={handleChange}
                        className={errors.userTypeId ? "error" : ""}
                    >
                        <option value="">Seleccione...</option>
                        {userTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                    {errors.userTypeId && <span className="error-message">{errors.userTypeId}</span>}
                </div>

                {formData.userTypeId === "2" && (
                    <div className="form-group">
                        <label>Servicio*</label>
                        <select
                            name="serviceId"
                            value={formData.serviceId}
                            onChange={handleChange}
                            className={errors.serviceId ? "error" : ""}
                        >
                            <option value="">Seleccione un servicio...</option>
                            {services.map(service => (
                                <option key={service.serviceId} value={service.serviceId}>
                                    {service.serviceName}
                                </option>
                            ))}
                        </select>
                        {errors.serviceId && <span className="error-message">{errors.serviceId}</span>}
                    </div>
                )}

                {errorMessage && <div className="error-message-global">{errorMessage}</div>}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Registrando..." : "Registrarse"}
                </button>
            </form>
        </div>
    );
};

export default Registrarse;
