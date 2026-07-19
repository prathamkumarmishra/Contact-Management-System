import { cn } from '@/utils/cn';
import {
  Users,
  Star,
  UserPlus,
  ShieldAlert,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import contactService from '@/services/contactService';
import type { Contact } from '@/types/contact';
import { toast } from 'sonner';

// ChartJS dependencies
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const categoryColors: Record<string, string> = {
  work: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  friend: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  family: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  personal: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  other: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
};

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentInteractions, setRecentInteractions] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch all contacts (for stats calculation)
        const contactsResponse = await contactService.getContacts({ limit: 1000 });
        setContacts(contactsResponse.data.contacts || []);

        // Fetch top recent interactions from C++ Max-Heap
        const recentResponse = await contactService.getRecentInteractions(5);
        setRecentInteractions(recentResponse.data.contacts || []);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Failed to query C++ stats engine');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute stats
  const totalContacts = contacts.length;
  const favoriteContacts = contacts.filter(c => c.isFavorite).length;
  const blockedContacts = contacts.filter(c => c.isBlocked).length;
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const addedThisMonth = contacts.filter(c => new Date(c.createdAt) > thirtyDaysAgo).length;

  const stats = [
    {
      title: 'Total Contacts',
      value: totalContacts,
      change: '+12%',
      gradient: 'from-blue-500 to-cyan-400',
      icon: Users
    },
    {
      title: 'Favorites',
      value: favoriteContacts,
      change: '+4%',
      gradient: 'from-amber-500 to-yellow-400',
      icon: Star
    },
    {
      title: 'Added 30d',
      value: addedThisMonth,
      change: '+15%',
      gradient: 'from-emerald-500 to-green-400',
      icon: UserPlus
    },
    {
      title: 'Blocked',
      value: blockedContacts,
      change: '0%',
      gradient: 'from-rose-500 to-red-400',
      icon: ShieldAlert
    }
  ];

  // Group contacts by category for Doughnut Chart
  const categoryCounts = contacts.reduce((acc: Record<string, number>, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const doughnutData = {
    labels: ['Work', 'Personal', 'Family', 'Friend', 'Other'],
    datasets: [
      {
        data: [
          categoryCounts.work || 0,
          categoryCounts.personal || 0,
          categoryCounts.family || 0,
          categoryCounts.friend || 0,
          categoryCounts.other || 0
        ],
        backgroundColor: [
          'rgba(6, 182, 212, 0.7)',  // Work (Cyan)
          'rgba(168, 85, 247, 0.7)', // Personal (Purple)
          'rgba(16, 185, 129, 0.7)', // Family (Emerald)
          'rgba(245, 158, 11, 0.7)',  // Friend (Amber)
          'rgba(107, 114, 128, 0.7)'  // Other (Gray)
        ],
        borderColor: [
          'rgba(6, 182, 212, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(107, 114, 128, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'var(--text-secondary)',
          font: { family: 'Outfit', size: 11 }
        }
      }
    }
  };

  // Group contacts by creation month (last 6 months) for Line Chart
  const getTimelineData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = new Date().getMonth();
    const last6Months: Array<{ name: string; index: number; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      last6Months.push({ name: months[idx], index: idx, count: 0 });
    }

    // Count creations
    contacts.forEach(c => {
      const date = new Date(c.createdAt);
      const m = date.getMonth();
      const match = last6Months.find(lm => lm.index === m);
      if (match) {
        match.count += 1;
      }
    });

    return {
      labels: last6Months.map(lm => lm.name),
      data: last6Months.map(lm => lm.count)
    };
  };

  const timeline = getTimelineData();

  const lineData = {
    labels: timeline.labels,
    datasets: [
      {
        label: 'New Contacts',
        data: timeline.data,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: 'var(--text-tertiary)', font: { family: 'Outfit' } },
        grid: { color: 'var(--border-color)', opacity: 0.1 }
      },
      x: {
        ticks: { color: 'var(--text-tertiary)', font: { family: 'Outfit' } },
        grid: { display: false }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="skeleton h-80 lg:col-span-2 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Welcome back! Here's an overview of your C++ indexed contacts store.
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.ADD_CONTACT)}
          className="btn btn-primary flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ title, value, change, icon: Icon, gradient }, index) => (
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
              <div className="min-w-0">
                <p className="text-sm text-[var(--text-secondary)] truncate">{title}</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-1.5">{value}</p>
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-success-500 min-w-0">
                  <span className="truncate">{change} Growth</span>
                </div>
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Timeline Growth Chart */}
        <div className={cn(
          'lg:col-span-2 rounded-2xl p-6',
          'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm',
          'animate-fade-in-up stagger-5'
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Contact Growth</h2>
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] font-medium shrink-0">
              <TrendingUp className="w-4 h-4" />
              Last 6 Months
            </div>
          </div>
          <div className="h-64 relative">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* C++ Heap Priority Interactions */}
        <div className={cn(
          'rounded-2xl p-6',
          'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm',
          'animate-fade-in-up stagger-6'
        )}>
          <div className="flex items-center justify-between gap-3 mb-5 min-w-0">
            <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">C++ Heap Priorities</h2>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-500 px-2 py-0.5 rounded-md bg-primary-500/10 border border-primary-500/20 shrink-0">
              <Sparkles className="w-3 h-3 animate-pulse" />
              MAX-HEAP
            </div>
          </div>
          
          <div className="space-y-3.5">
            {recentInteractions.length > 0 ? (
              recentInteractions.map(({ id, firstName, lastName, company, category, contactCount }) => (
                <div
                  key={id}
                  onClick={() => navigate(`/contacts/${id}`)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border border-transparent',
                    'hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-color)] transition-all cursor-pointer'
                  )}
                >
                  <div className="w-9 h-9 rounded-lg gradient-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {firstName[0]}{lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{firstName} {lastName}</p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate">{company || 'No company'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize border max-w-[76px] truncate', categoryColors[category] || categoryColors.other)}>
                      {category}
                    </span>
                    <span className="text-[10px] text-primary-500 font-semibold flex items-center gap-1 whitespace-nowrap">
                      <PhoneCall className="w-2.5 h-2.5" />
                      {contactCount} calls
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 border border-dashed border-[var(--border-color)] rounded-xl p-4 text-center">
                <Clock className="w-8 h-8 text-[var(--text-tertiary)] mb-2" />
                <p className="text-sm text-[var(--text-secondary)] font-medium">No interactions recorded</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Interactions populate when contacts are viewed or called.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Split Chart */}
        <div className={cn(
          'rounded-2xl p-6',
          'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm',
          'animate-fade-in-up stagger-7'
        )}>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Category Distribution</h2>
          <div className="h-56 relative">
            {totalContacts > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-[var(--text-tertiary)]">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Feature info list */}
        <div className={cn(
          'lg:col-span-2 rounded-2xl p-6',
          'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm',
          'animate-fade-in-up stagger-8 flex flex-col justify-between'
        )}>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">System Metrics & C++ Engine Status</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Your contact management backend leverages native C++ execution structures to maintain sub-millisecond execution times. Below are the current active indices:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]/30 text-center">
                <span className="text-xs text-[var(--text-tertiary)] block">Trie Nodes</span>
                <span className="text-lg font-bold text-primary-500 block mt-1">O(L) Prefix</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]/30 text-center">
                <span className="text-xs text-[var(--text-tertiary)] block">BST Tree Depth</span>
                <span className="text-lg font-bold text-cyan-500 block mt-1">O(log N) Sorted</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]/30 text-center">
                <span className="text-xs text-[var(--text-tertiary)] block">HashMap Load</span>
                <span className="text-lg font-bold text-emerald-500 block mt-1">O(1) Checks</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]">
            <span className="min-w-0">Server status: Online (Connected to child_process spawn)</span>
            <button onClick={() => navigate(ROUTES.CONTACTS)} className="text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1 shrink-0">
              <span>View Contacts List</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
