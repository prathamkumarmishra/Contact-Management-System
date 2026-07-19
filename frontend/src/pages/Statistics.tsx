import { cn } from '@/utils/cn';
import { Users, Star, ShieldAlert, UserPlus, BarChart3, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import contactService from '@/services/contactService';
import type { Contact } from '@/types/contact';
import { toast } from 'sonner';

// ChartJS
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
  Filler
} from 'chart.js';
import { Doughnut, Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Statistics() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const response = await contactService.getContacts({ limit: 1000 });
        setContacts(response.data.contacts || []);
      } catch (error) {
        console.error('Failed to load statistics data:', error);
        toast.error('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  // Compute stats
  const totalContacts = contacts.length;
  const favorites = contacts.filter(c => c.isFavorite).length;
  const blocked = contacts.filter(c => c.isBlocked).length;
  const regular = totalContacts - favorites - blocked;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const addedThisMonth = contacts.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length;

  // Category counts
  const categoryCounts = contacts.reduce((acc: Record<string, number>, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  // Top companies
  const companyCounts = contacts.reduce((acc: Record<string, number>, c) => {
    if (c.company) {
      acc[c.company] = (acc[c.company] || 0) + 1;
    }
    return acc;
  }, {});
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Growth timeline - last 6 months
  const getTimelineData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const last6: Array<{ name: string; index: number; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      last6.push({ name: months[idx], index: idx, count: 0 });
    }
    contacts.forEach(c => {
      const m = new Date(c.createdAt).getMonth();
      const match = last6.find(lm => lm.index === m);
      if (match) match.count += 1;
    });
    return { labels: last6.map(l => l.name), data: last6.map(l => l.count) };
  };

  const timeline = getTimelineData();

  // ═══ CHART CONFIGS ═══

  const categoryDoughnut = {
    labels: ['Work', 'Personal', 'Family', 'Friend', 'Other'],
    datasets: [{
      data: [
        categoryCounts.work || 0,
        categoryCounts.personal || 0,
        categoryCounts.family || 0,
        categoryCounts.friend || 0,
        categoryCounts.other || 0
      ],
      backgroundColor: [
        'rgba(6, 182, 212, 0.75)',
        'rgba(168, 85, 247, 0.75)',
        'rgba(16, 185, 129, 0.75)',
        'rgba(245, 158, 11, 0.75)',
        'rgba(107, 114, 128, 0.75)'
      ],
      borderColor: [
        'rgba(6, 182, 212, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(107, 114, 128, 1)'
      ],
      borderWidth: 2
    }]
  };

  const growthLine = {
    labels: timeline.labels,
    datasets: [{
      label: 'New Contacts',
      data: timeline.data,
      fill: true,
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderColor: 'rgba(99, 102, 241, 1)',
      tension: 0.4,
      pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      pointBorderColor: '#fff',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  };

  const statusPie = {
    labels: ['Regular', 'Favorites', 'Blocked'],
    datasets: [{
      data: [regular, favorites, blocked],
      backgroundColor: [
        'rgba(99, 102, 241, 0.75)',
        'rgba(245, 158, 11, 0.75)',
        'rgba(239, 68, 68, 0.75)'
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2
    }]
  };

  const companyBar = {
    labels: topCompanies.map(c => c[0]),
    datasets: [{
      label: 'Contacts',
      data: topCompanies.map(c => c[1]),
      backgroundColor: 'rgba(6, 182, 212, 0.6)',
      borderColor: 'rgba(6, 182, 212, 1)',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const chartTextColor = 'rgb(148, 163, 184)';

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: chartTextColor, font: { family: 'Outfit', size: 11 } }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: chartTextColor, font: { family: 'Outfit' } },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      x: {
        ticks: { color: chartTextColor, font: { family: 'Outfit' } },
        grid: { display: false }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: chartTextColor, font: { family: 'Outfit' } },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      y: {
        ticks: { color: chartTextColor, font: { family: 'Outfit', size: 11 } },
        grid: { display: false }
      }
    }
  };

  const stats = [
    { title: 'Total Contacts', value: totalContacts, icon: Users, gradient: 'from-blue-500 to-cyan-400' },
    { title: 'Favorites', value: favorites, icon: Star, gradient: 'from-amber-500 to-yellow-400' },
    { title: 'Blocked', value: blocked, icon: ShieldAlert, gradient: 'from-rose-500 to-red-400' },
    { title: 'Added (30d)', value: addedThisMonth, icon: UserPlus, gradient: 'from-emerald-500 to-green-400' },
  ];

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-96" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Statistics</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Detailed analytics and insights about your contacts</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ title, value, icon: Icon, gradient }, index) => (
          <div
            key={title}
            className={cn(
              'relative overflow-hidden rounded-2xl p-5',
              'bg-[var(--card-bg)] border border-[var(--border-color)]',
              'hover:shadow-lg hover:border-primary-500/20',
              'transition-all duration-300 hover:-translate-y-0.5',
              'animate-fade-in-up',
              `stagger-${index + 1}`
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{title}</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-1.5">{value}</p>
              </div>
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center',
                `bg-gradient-to-br ${gradient}`,
                'text-white shadow-sm'
              )}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Contact Growth */}
        <div className={cn(
          'rounded-2xl p-6',
          'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm',
          'animate-fade-in-up stagger-5'
        )}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Contact Growth</h2>
          </div>
          <div className="h-64 relative">
            <Line data={growthLine} options={lineOptions} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className={cn(
          'rounded-2xl p-6',
          'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm',
          'animate-fade-in-up stagger-6'
        )}>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Category Distribution</h2>
          <div className="h-64 relative">
            {totalContacts > 0 ? (
              <Doughnut data={categoryDoughnut} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--text-tertiary)]">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className={cn(
          'rounded-2xl p-6',
          'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm',
          'animate-fade-in-up stagger-7'
        )}>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Status Breakdown</h2>
          <div className="h-64 relative">
            {totalContacts > 0 ? (
              <Pie data={statusPie} options={pieOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--text-tertiary)]">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Top Companies */}
        <div className={cn(
          'rounded-2xl p-6',
          'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm',
          'animate-fade-in-up stagger-8'
        )}>
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Top Companies</h2>
          </div>
          <div className="h-64 relative">
            {topCompanies.length > 0 ? (
              <Bar data={companyBar} options={barOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--text-tertiary)]">
                No company data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
