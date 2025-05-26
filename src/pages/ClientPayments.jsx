import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../services/AuthContext';
import '../assets/ClientPayments.css';

export default function ClientPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get(`http://servicenow.somee.com/api/Payments?userId=${user.userId}`);
        setPayments(res.data.filter(p => !p.isDeleted));
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };
    fetchPayments();
  }, [user]);

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    if (filter === 'pending') return payment.status === 'pending';
    if (filter === 'completed') return payment.status === 'completed';
    return true;
  });

  const makePayment = async (paymentId) => {
    try {
      // Simulación de pago - en producción integrar con pasarela de pago
      await axios.put(`http://servicenow.somee.com/api/Payments/${paymentId}`, {
        status: 'completed',
        paymentDate: new Date().toISOString()
      });
      setPayments(payments.map(p => 
        p.paymentId === paymentId ? { ...p, status: 'completed', paymentDate: new Date().toISOString() } : p
      ));
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <div className="client-payments">
      <h2>Mis Pagos</h2>
      
      <div className="filters">
        <button onClick={() => setFilter('all')}>Todos</button>
        <button onClick={() => setFilter('pending')}>Pendientes</button>
        <button onClick={() => setFilter('completed')}>Completados</button>
      </div>

      <div className="payments-list">
        {filteredPayments.map(payment => (
          <div key={payment.paymentId} className="payment-card">
            <h3>Servicio: {payment.appointments?.personalServices?.serviceName}</h3>
            <p>Monto: ${payment.amount.toFixed(2)}</p>
            <p>Fecha: {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Pendiente'}</p>
            <p>Estado: {payment.status}</p>
            <p>Método: {payment.paymentMethod || 'No especificado'}</p>
            
            {payment.status === 'pending' && (
              <button 
                onClick={() => makePayment(payment.paymentId)}
                className="pay-button"
              >
                Pagar Ahora
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}