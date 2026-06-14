import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, 
  CalendarDays, 
  Laptop, 
  Award,
  Layers
} from 'lucide-react';
import API from '../api/api';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, reportRes] = await Promise.all([
          API.get('/employees/stats'),
          API.get('/reports/stats')
        ]);
        setStats(statsRes.data.data);
        setReportData(reportRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="spinner" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  // Calculate Asset Stats from reportData
  const totalAssets = reportData?.assetStatusCount?.reduce((sum, item) => sum + item.count, 0) || 0;
  const allocatedAssets = reportData?.assetStatusCount?.find(item => item.status === 'Allocated')?.count || 0;

  // Chart 1: Department wise distribution
  const deptLabels = reportData?.departmentWiseCount?.map(item => item.department) || [];
  const deptCounts = reportData?.departmentWiseCount?.map(item => item.count) || [];
  
  const deptChartData = {
    labels: deptLabels,
    datasets: [{
      label: 'Employees',
      data: deptCounts,
      backgroundColor: [
        'rgba(0, 242, 254, 0.65)',
        'rgba(138, 43, 226, 0.65)',
        'rgba(245, 166, 35, 0.65)',
        'rgba(16, 185, 129, 0.65)',
        'rgba(244, 63, 94, 0.65)'
      ],
      borderColor: [
        '#00f2fe',
        '#8a2be2',
        '#f5a623',
        '#10b981',
        '#f43f5e'
      ],
      borderWidth: 1
    }]
  };

  // Chart 2: Hiring trend (Line Chart)
  const hiringMonths = reportData?.hiringTrendData?.map(item => item.month) || [];
  const hiringCounts = reportData?.hiringTrendData?.map(item => item.count) || [];

  const hiringChartData = {
    labels: hiringMonths,
    datasets: [{
      label: 'Hired Employees',
      data: hiringCounts,
      fill: true,
      backgroundColor: 'rgba(0, 242, 254, 0.1)',
      borderColor: '#00f2fe',
      tension: 0.4,
      pointBackgroundColor: '#00f2fe'
    }]
  };

  // Chart 3: Leave trend (Stacked Bar Chart)
  const leaveMonths = reportData?.leaveTrendData?.map(item => item.month) || [];
  const leavePending = reportData?.leaveTrendData?.map(item => item.Pending) || [];
  const leaveApproved = reportData?.leaveTrendData?.map(item => item.Approved) || [];
  const leaveRejected = reportData?.leaveTrendData?.map(item => item.Rejected) || [];

  const leaveChartData = {
    labels: leaveMonths,
    datasets: [
      {
        label: 'Approved',
        data: leaveApproved,
        backgroundColor: 'rgba(16, 185, 129, 0.75)',
        borderColor: '#10b981',
        borderWidth: 1
      },
      {
        label: 'Pending',
        data: leavePending,
        backgroundColor: 'rgba(245, 166, 35, 0.75)',
        borderColor: '#f5a623',
        borderWidth: 1
      },
      {
        label: 'Rejected',
        data: leaveRejected,
        backgroundColor: 'rgba(244, 63, 94, 0.75)',
        borderColor: '#f43f5e',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#9ca3af', font: { family: 'Inter' } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="glow-text" style={{ margin: 0, fontSize: '28px' }}>Welcome back, {user?.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here is your enterprise operations overview.</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="dashboard-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon cyan">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span>Total Employees</span>
            <h2>{stats?.totalEmployees || 0}</h2>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon violet">
            <Layers size={24} />
          </div>
          <div className="stat-details">
            <span>Departments</span>
            <h2>{stats?.totalDepartments || 0}</h2>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon emerald">
            <Laptop size={24} />
          </div>
          <div className="stat-details">
            <span>Asset Allocations</span>
            <h2>{allocatedAssets} / {totalAssets}</h2>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon amber">
            <CalendarDays size={24} />
          </div>
          <div className="stat-details">
            <span>Pending Leaves</span>
            <h2>{stats?.pendingLeaves || 0}</h2>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="chart-grid">
        <div className="chart-card glass-panel">
          <h3>Department Wise Employees</h3>
          <div style={{ height: '260px', position: 'relative' }}>
            <Doughnut 
              data={deptChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#9ca3af', font: { family: 'Inter' } }
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="chart-card glass-panel">
          <h3>Monthly Hiring Trend</h3>
          <div style={{ height: '260px', position: 'relative' }}>
            <Line data={hiringChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="chart-card glass-panel" style={{ minHeight: '380px' }}>
          <h3>Leave Application Trends</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Bar 
              data={leaveChartData} 
              options={{
                ...chartOptions,
                scales: {
                  x: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                  y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
