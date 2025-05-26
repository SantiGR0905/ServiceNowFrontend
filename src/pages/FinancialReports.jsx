import { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/FinancialReports.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function FinancialReports() {
  const [payments, setPayments] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get('http://servicenow.somee.com/api/Payments');
        setPayments(res.data.filter(p => !p.isDeleted && p.status === 'completed'));
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    const processData = () => {
      const filtered = payments.filter(p => p.paymentDate);
      
      if (timeRange === 'month') {
        const monthlyData = {};
        filtered.forEach(payment => {
          const date = new Date(payment.paymentDate);
          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          
          if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = 0;
          }
          monthlyData[monthYear] += payment.amount;
        });
        
        setReportData(
          Object.entries(monthlyData)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } else {
        const dailyData = {};
        filtered.forEach(payment => {
          const date = new Date(payment.paymentDate);
          const dateStr = date.toISOString().split('T')[0];
          
          if (!dailyData[dateStr]) {
            dailyData[dateStr] = 0;
          }
          dailyData[dateStr] += payment.amount;
        });
        
        setReportData(
          Object.entries(dailyData)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(-30) // Últimos 30 días
        );
      }
    };
    
    processData();
  }, [payments, timeRange]);

  return (
    <div className="financial-reports">
      <h2>Reportes Financieros</h2>
      
      <div className="controls">
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="month">Por Mes</option>
          <option value="day">Por Día (últimos 30)</option>
        </select>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={reportData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" name="Ingresos ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="summary">
        <h3>Resumen Financiero</h3>
        <p>
          <strong>Ingresos totales:</strong> $
          {payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
        </p>
        <p>
          <strong>Total de transacciones:</strong> {payments.length}
        </p>
        <p>
          <strong>Promedio por transacción:</strong> $
          {(payments.reduce((sum, p) => sum + p.amount, 0) / (payments.length || 1)).toFixed(2)}
        </p>
      </div>
    </div>
  );
}