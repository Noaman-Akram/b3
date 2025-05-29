import React from 'react';
import { LayoutDashboard, Users, ClipboardList, DollarSign } from 'lucide-react';
import Card from '../components/ui/Card';
import StatsCard from '../components/ui/StatsCard';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartDataLabels
);

// Example placeholder data for charts
const orderStatusData = {
  labels: ['Completed', 'In Progress', 'Pending', 'Delayed'],
  datasets: [
    {
      label: 'Orders',
      data: [12, 7, 5, 2],
      backgroundColor: [
        '#2563eb', // blue-600
        '#16a34a', // green-600
        '#f59e42', // amber-500
        '#dc2626', // red-600
      ],
      borderWidth: 1,
    },
  ],
};

const orderStatusOptions = {
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#374151', // gray-700
        font: { size: 14 },
      },
    },
    datalabels: {
      color: '#111827', // gray-900
      font: { weight: 'bold' as const, size: 14 },
      formatter: (value: number, context: any) => {
        const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
        const percent = ((value / total) * 100).toFixed(1);
        return `${value} (${percent}%)`;
      },
    },
    title: {
      display: true,
      text: 'Orders by Status',
      color: '#111827',
      font: { size: 18, weight: 'bold' as const },
      padding: { top: 10, bottom: 10 },
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.chart.data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
          const percent = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percent}%)`;
        }
      }
    }
  },
};

const ordersOverTimeData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Orders',
      data: [10, 15, 12, 18, 20, 17, 22],
      fill: true,
      borderColor: '#2563eb', // blue-600
      backgroundColor: 'rgba(37, 99, 235, 0.1)', // blue-600, 10% opacity
      tension: 0.4,
    },
  ],
};

const ordersOverTimeOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Orders Over Time',
      color: '#111827',
      font: { size: 18, weight: 'bold' as const },
      padding: { top: 10, bottom: 10 },
    },
    tooltip: {
      callbacks: {
        title: function(context: any) {
          return `Month: ${context[0].label}`;
        },
        label: function(context: any) {
          return `Orders: ${context.parsed.y}`;
        }
      }
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Month',
        color: '#374151',
        font: { size: 14, weight: 'bold' as const },
      },
      ticks: { color: '#6b7280' }, // gray-500
      grid: { color: '#e5e7eb' }, // gray-200
    },
    y: {
      title: {
        display: true,
        text: 'Number of Orders',
        color: '#374151',
        font: { size: 14, weight: 'bold' as const },
      },
      ticks: { color: '#6b7280' },
      grid: { color: '#e5e7eb' },
    },
  },
};

const Dashboard: React.FC = () => {
  // TODO: Fetch real data from backend/services
  // const { data: orders, ... } = useOrders();
  // const { data: customers, ... } = useCustomers();

  // TODO: Calculate statistics from real data
  // const totalCustomers = ...;
  // const totalOrders = ...;
  // const totalRevenue = ...;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your business</p>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Customers" 
          value={"-"} // TODO: real value
          icon={<Users size={24} />}
        />
        <StatsCard 
          title="Total Orders" 
          value={"-"} // TODO: real value
          icon={<ClipboardList size={24} />}
        />
        <StatsCard 
          title="Total Revenue" 
          value={"-"} // TODO: real value
          icon={<DollarSign size={24} />}
        />
      </div>
      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Orders by Status">
          <div className="h-64 flex items-center justify-center">
            <Pie data={orderStatusData} options={orderStatusOptions} plugins={[ChartDataLabels]} />
          </div>
        </Card>
        <Card title="Orders by Type">
          {/* TODO: Pie or bar chart for order type */}
          <div className="h-64 flex items-center justify-center text-gray-400">[Order Type Chart]</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Orders Over Time">
          <div className="h-64 flex items-center justify-center">
            <Line data={ordersOverTimeData} options={ordersOverTimeOptions} />
          </div>
        </Card>
        <Card title="Average Order Value">
          {/* TODO: Visualization or stat for average order value */}
          <div className="h-64 flex items-center justify-center text-gray-400">[Average Order Value]</div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;