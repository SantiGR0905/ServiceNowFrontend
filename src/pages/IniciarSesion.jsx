    import { useEffect, useState } from "react";
    import { useNavigate, Link } from "react-router-dom";
    import axios from 'axios';
    import { useAuth } from '../services/AuthContext.jsx';
    import '../assets/IniciarSesion.css';

    const Login = () => {
        const { login } = useAuth();
        const navigate = useNavigate();
        const [formData, setFormData] = useState({
            email: "",
            password: ""
        });
        const [errorMessage, setErrorMessage] = useState("");
        const [isLoading, setIsLoading] = useState(false);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleLogin = async (e) => {
            e.preventDefault();
            setErrorMessage("");

            if (!formData.email || !formData.password) {
                setErrorMessage("Por favor, completa todos los campos.");
                return;
            }

            setIsLoading(true);

            try {
                // 1. Autenticación
                const authResponse = await axios.post(
                    "http://servicenow.somee.com/api/Users/login",
                    formData,
                    {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );

                console.log("Login successful", authResponse.data);

                // 2. Obtener datos del usuario autenticado
                // Obtener todos los usuarios
                const allUsersResponse = await axios.get("http://servicenow.somee.com/api/Users");
                const allUsers = allUsersResponse.data;

                // Buscar el usuario con el mismo email
                const loggedInUser = allUsers.find(user => user.email === formData.email);

                if (!loggedInUser || !loggedInUser.userId) {
                    throw new Error("Usuario no encontrado");
                }


                if (!loggedInUser || !loggedInUser.userId) {
                    throw new Error("Usuario no encontrado en la base de datos");
                }

                // 3. Obtener permisos del usuario
                const permissionsResponse = await axios.get(
                    `http://servicenow.somee.com/api/PermissionsXUsers?userTypeId=${loggedInUser.userTypes.userTypeId}`
                );

                const userPermission = Array.isArray(permissionsResponse.data ) ?
                                    permissionsResponse.data[loggedInUser.userTypes.userTypeId - 1] :
                                    permissionsResponse.data;

                if (!userPermission) {
                    throw new Error("No se encontraron permisos para este usuario");
                }

                console.log("User permissions:", permissionsResponse.data);
                console.log("permission:", userPermission); 
                // 4. Guardar datos y redirigir
                localStorage.setItem("userId", loggedInUser.userId);
                localStorage.setItem("userTypeId", loggedInUser.userTypes.userTypeId);
                localStorage.setItem("permissionId", userPermission.permissions.permissionId);
                
                login(
                    loggedInUser.userId,
                    userPermission.userTypes.userTypeId,
                    userPermission.permissions.permissionId
                );
                // Redirección según tipo de usuario
                switch(loggedInUser.userTypes.userTypeId) {
                    case 1: // Admin
                        navigate("/Admin");
                        break;
                    case 2: // Profesional
                        navigate("/Provider");
                        break;
                    case 3: // Cliente
                        navigate("/Profile  ");
                        break;
                    default:
                        navigate("/");
                }

            } catch (error) {
                console.error("Login error:", error);
                
                let message = "Error al iniciar sesión";
                if (error.response) {
                    if (error.response.status === 404) {
                        message = "Credenciales incorrectas";
                    } else if (error.response.data?.message) {
                        message = error.response.data.message;
                    }
                } else if (error.message) {
                    message = error.message;
                }
                
                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <div className="login">
                <div className="login-container">
                    <h2>Iniciar Sesión</h2>
                    {errorMessage && <p className="error">{errorMessage}</p>}
                    <form onSubmit={handleLogin}>
                        <div>
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                            />
                        </div>
                        <div>
                            <label>Password:</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                            />
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? "Iniciando sesión..." : "Login"}
                            </button>
                        </div>
                        <div className="Registrar">
                            <p>¿No tienes cuenta?</p>
                            <Link to="/Registrarse">Registrate aquí</Link>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    export default Login;