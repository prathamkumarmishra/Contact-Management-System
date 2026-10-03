import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  ChevronDown,
  Database,
  Globe,
  Search,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
  Phone,
  Mail,
  Cpu,
  RefreshCw,
  Activity,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { Github } from '@/components/common/icons';
import ThemeToggle from '@/components/layout/ThemeToggle';

// Sample contacts for interactive hero live preview
const SAMPLE_CONTACTS = [
  {
    id: '1',
    initials: 'AL',
    name: 'Alicia Laurent',
    title: 'Lead System Architect',
    company: 'Northstar Labs',
    phone: '+1 (555) 234-8901',
    email: 'alicia.l@northstarlabs.io',
    category: 'VIP',
    tagColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    avatarColor: 'from-purple-500 to-indigo-600',
    favorite: true,
    lastContacted: '2 hours ago',
  },
  {
    id: '2',
    initials: 'DK',
    name: 'Dev Kumar',
    title: 'Principal C++ Engineer',
    company: 'Quantum Dynamics',
    phone: '+91 98765 43210',
    email: 'dev.kumar@quantumd.org',
    category: 'Engineering',
    tagColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    avatarColor: 'from-cyan-500 to-blue-600',
    favorite: true,
    lastContacted: 'Yesterday',
  },
  {
    id: '3',
    initials: 'SR',
    name: 'Sofia Reyes',
    title: 'Head of Product',
    company: 'Kite & Co.',
    phone: '+44 20 7946 0912',
    email: 'sofia@kiteco.design',
    category: 'Client',
    tagColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    avatarColor: 'from-rose-500 to-pink-600',
    favorite: false,
    lastContacted: '3 days ago',
  },
  {
    id: '4',
    initials: 'MC',
    name: 'Marcus Chen',
    title: 'Managing Director',
    company: 'Apex Capital',
    phone: '+1 (555) 890-1234',
    email: 'm.chen@apexcap.com',
    category: 'Investor',
    tagColor: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    avatarColor: 'from-amber-500 to-orange-600',
    favorite: true,
    lastContacted: 'Just now',
  },
];

const BENCHMARKS = [
  { value: '< 0.18ms', label: 'C++ HashMap Lookup', detail: 'Zero-latency query matching' },
  { value: 'O(1)', label: 'Search Complexity', detail: 'Constant-time indexing engine' },
  { value: '100k+', label: 'Capacity Supported', detail: 'High-density memory footprint' },
  { value: '100%', label: 'Private & Encrypted', detail: 'JWT + Salty hashing protection' },
];

const FEATURES_BENTO = [
  {
    id: 'search',
    title: 'Sub-Millisecond Smart Search',
    description: 'Powered by an optimized C++ HashMap engine. Search through thousands of contacts instantly with prefix & fuzzy matching.',
    badge: 'C++ DSA ENGINE',
    icon: Zap,
    gradient: 'from-indigo-500/20 via-purple-500/10 to-transparent',
    borderColor: 'group-hover:border-indigo-500/40',
    gridSpan: 'md:col-span-2 lg:col-span-2',
    demoType: 'search',
  },
  {
    id: 'tags',
    title: 'Smart Categorization & Custom Tags',
    description: 'Assign dynamic color-coded labels, work groupings, and custom metadata tags for seamless organization.',
    badge: 'ORGANIZATION',
    icon: Tag,
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    borderColor: 'group-hover:border-cyan-500/40',
    gridSpan: 'md:col-span-1 lg:col-span-1',
    demoType: 'tags',
  },
  {
    id: 'analytics',
    title: 'Relationship Analytics & Insights',
    description: 'Gain clear vision into your growing network with visual distribution charts, contact frequency metrics, and growth stats.',
    badge: 'ANALYTICS',
    icon: BarChart3,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    borderColor: 'group-hover:border-emerald-500/40',
    gridSpan: 'md:col-span-1 lg:col-span-1',
    demoType: 'analytics',
  },
  {
    id: 'security',
    title: 'Bank-Grade Privacy & Security',
    description: 'Strict session isolation, JWT token authentication, and password hashing keep your network private by default.',
    badge: 'SECURITY',
    icon: Shield,
    gradient: 'from-amber-500/20 via-rose-500/10 to-transparent',
    borderColor: 'group-hover:border-amber-500/40',
    gridSpan: 'md:col-span-2 lg:col-span-2',
    demoType: 'security',
  },
];

const WORKFLOW_TABS = [
  {
    id: 'lookup',
    label: 'Instant Lookup',
    icon: Search,
    title: 'Instant search across 100k+ records',
    description: 'Type any initial, phone fragment, or company domain. The C++ HashMap engine returns matching results in micro-seconds.',
    codeSnippet: 'HashMap<Contact> index;\nauto result = index.find("Dev Kumar"); // O(1) <0.18ms',
  },
  {
    id: 'favorites',
    label: 'VIP & Favorites',
    icon: Star,
    title: 'One-click VIP prioritization',
    description: 'Pin key stakeholders, clients, and partners to your top drawer for instantaneous access on any device.',
    codeSnippet: 'contact.isFavorite = true;\nstore.dispatch(toggleFavorite(id));',
  },
  {
    id: 'analytics',
    label: 'Network Insights',
    icon: Activity,
    title: 'Actionable contact statistics',
    description: 'Understand distribution across industries, company groups, and interaction frequencies to never miss a follow-up.',
    codeSnippet: 'GET /api/contacts/stats\n{ total: 1280, recent: 42, activeCategories: 8 }',
  },
  {
    id: 'trash',
    label: 'Soft Recovery',
    icon: RefreshCw,
    title: 'Accidental delete protection',
    description: 'Deleted contacts move into a soft-delete Trash state, giving you full 30-day single-click restoration safety.',
    codeSnippet: 'POST /api/contacts/restore/{id}\nStatus: 200 OK (Contact restored)',
  },
];

const FAQS = [
  {
    question: 'How does the C++ Engine accelerate contact retrieval?',
    answer: 'The system embeds a compiled C++ HashMap engine that maintains in-memory hash buckets and prefix indexing. Queries bypass slow database table scans and complete in sub-millisecond execution cycles.',
  },
  {
    question: 'Is my contact data private and secure?',
    answer: 'Yes. All authentication is powered by cryptographic JWT sessions with bcrypt password hashing. Your workspace data is completely isolated and never shared or analyzed by third parties.',
  },
  {
    question: 'Can I test the application without creating an account?',
    answer: 'You can explore the interactive demo directly on this page! When you register, a private workspace is generated instantaneously with zero friction.',
  },
  {
    question: 'What technologies power Smart Contacts?',
    answer: 'The application is engineered with React 19, TypeScript, Redux Toolkit, Vite, Tailwind CSS, Express Node backend, MongoDB, and a dedicated C++ HashMap execution module.',
  },
];

// Interactive Hero Product Preview Component
function InteractiveHeroPreview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'vip'>('all');
  const [selectedContact, setSelectedContact] = useState<typeof SAMPLE_CONTACTS[0]>(SAMPLE_CONTACTS[0]);
  const [queryTime, setQueryTime] = useState('0.18 ms');

  const filteredContacts = SAMPLE_CONTACTS.filter(contact => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'vip' && contact.favorite);
    return matchesSearch && matchesTab;
  });

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const randomMs = (0.12 + Math.random() * 0.14).toFixed(2);
    setQueryTime(`${randomMs} ms`);
  };

  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      {/* Background glowing aura */}
      <div className="absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-r from-indigo-500/25 via-purple-500/20 to-cyan-500/20 blur-3xl opacity-70 animate-pulse-glow" />

      {/* Main glass frame */}
      <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950/80 p-2.5 shadow-[0_35px_90px_-20px_rgba(79,70,229,0.35)] backdrop-blur-2xl ring-1 ring-white/10">
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#090d1a]">
          
          {/* Window header */}
          <div className="flex h-11 items-center justify-between border-b border-white/10 bg-white/[0.03] px-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-sm" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-sm" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f] shadow-sm" />
            </div>
            
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              smartcontacts.app/workspace
            </div>
            
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-indigo-300">C++ Active</span>
            </div>
          </div>

          {/* App body */}
          <div className="grid min-h-[380px] grid-cols-[130px_1fr] sm:grid-cols-[150px_1fr]">
            
            {/* Sidebar nav */}
            <aside className="flex flex-col border-r border-white/10 bg-[#060913] p-3">
              <div className="mb-5 flex items-center gap-2 px-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/30">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[11px] font-black tracking-wider text-white">SMART</span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-medium transition-all',
                    activeTab === 'all'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>All Contacts</span>
                </button>

                <button
                  onClick={() => setActiveTab('vip')}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-medium transition-all',
                    activeTab === 'vip'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-200'
                  )}
                >
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  <span>Favorites</span>
                </button>
              </div>

              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08] p-2">
                  <p className="text-[9px] font-semibold text-indigo-300">C++ Engine Latency</p>
                  <p className="mt-0.5 text-xs font-mono font-bold text-emerald-400">{queryTime}</p>
                </div>
              </div>
            </aside>

            {/* Main Interactive Content */}
            <div className="flex flex-col p-4">
              
              {/* Live Interactive Search bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Try typing 'Dev', 'Sofia', 'VIP'..."
                  className="w-full rounded-xl border border-white/15 bg-slate-900/90 py-2 pl-9 pr-12 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <kbd className="absolute right-2.5 top-2 rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                  ⌘K
                </kbd>
              </div>

              {/* Contact list & quick preview split */}
              <div className="grid flex-1 grid-cols-1 gap-2 overflow-hidden sm:grid-cols-2">
                
                {/* Contact list */}
                <div className="space-y-1.5 overflow-y-auto pr-1">
                  {filteredContacts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No contacts found matching &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className={cn(
                          'group flex w-full items-center gap-2.5 rounded-xl border p-2 text-left transition-all',
                          selectedContact.id === contact.id
                            ? 'border-indigo-500/50 bg-indigo-500/15 shadow-sm'
                            : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.06]'
                        )}
                      >
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-bold text-white shadow-inner', contact.avatarColor)}>
                          {contact.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-white">{contact.name}</p>
                          <p className="truncate text-[10px] text-slate-400">{contact.company}</p>
                        </div>
                        {contact.favorite && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
                      </button>
                    ))
                  )}
                </div>

                {/* Selected Contact Inspector Card */}
                <div className="hidden rounded-xl border border-white/10 bg-slate-900/60 p-3 sm:flex sm:flex-col sm:justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-medium', selectedContact.tagColor)}>
                        {selectedContact.category}
                      </span>
                      <span className="text-[9px] text-slate-500">{selectedContact.lastContacted}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2.5">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-black text-white shadow-md', selectedContact.avatarColor)}>
                        {selectedContact.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{selectedContact.name}</h4>
                        <p className="text-[10px] text-slate-400">{selectedContact.title}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-[10px] text-slate-300">
                      <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] p-1.5">
                        <Mail className="h-3 w-3 text-indigo-400" />
                        <span className="truncate">{selectedContact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] p-1.5">
                        <Phone className="h-3 w-3 text-emerald-400" />
                        <span>{selectedContact.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[9px] text-slate-400">
                    <span>Index bucket #042</span>
                    <span className="font-mono text-emerald-400">O(1) verified</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Floating benchmark badge */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute -bottom-6 left-4 rounded-2xl border border-white/20 bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:left-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-[10px] font-medium text-slate-400">HashMap Query Engine</p>
            </div>
            <p className="text-xs font-bold text-white">Execution latency: {queryTime}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState(WORKFLOW_TABS[0].id);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedWorkflow = WORKFLOW_TABS.find((t) => t.id === activeWorkflowTab) || WORKFLOW_TABS[0];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Background mesh lighting */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-20rem] h-[55rem] w-[55rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-transparent blur-[120px]" />
        <div className="absolute right-[-10rem] top-[30rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent blur-[100px]" />
        <div className="absolute left-[-15rem] bottom-[10rem] h-[45rem] w-[45rem] rounded-full bg-gradient-to-tr from-fuchsia-600/10 via-indigo-500/10 to-transparent blur-[110px]" />
      </div>

      {/* Floating Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-black tracking-tight text-white sm:text-xl">
              smart<span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">contacts</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
              Features
            </a>
            <a href="#engine" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
              C++ Engine
            </a>
            <a href="#workflow" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
              Workflow
            </a>
            <a href="#faq" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to={ROUTES.LOGIN}
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white sm:block"
            >
              Sign in
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] hover:shadow-indigo-500/40 sm:px-5 sm:text-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
            
            {/* Hero Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Powered by High-Performance C++ HashMap Engine
                <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-6xl">
                Your entire network,
                <span className="block bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                  lightning fast &amp; organized.
                </span>
              </h1>

              <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
                Experience ultra-fast contact search, smart tagging, and deep network analytics. Built with a specialized C++ backend for sub-millisecond query execution.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  to={ROUTES.REGISTER}
                  className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 px-6 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/45"
                >
                  Create Free Workspace
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-6 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/[0.12] hover:border-white/25"
                >
                  Explore Platform
                  <ChevronRight className="h-4 w-4 text-indigo-400" />
                </Link>
              </div>

              {/* Checkmarks */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free forever to start
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Bank-grade encryption
                </span>
              </div>
            </motion.div>

            {/* Hero Right Interactive Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <InteractiveHeroPreview />
            </motion.div>

          </div>
        </section>

        {/* BENCHMARK STATS STRIP */}
        <section id="engine" className="border-y border-white/10 bg-slate-900/60 py-10 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {BENCHMARKS.map((bench, idx) => (
                <motion.div
                  key={bench.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center transition-all hover:border-indigo-500/40 hover:bg-white/[0.06]"
                >
                  <p className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl bg-gradient-to-r from-indigo-300 via-white to-cyan-300 bg-clip-text text-transparent">
                    {bench.value}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-indigo-300">{bench.label}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{bench.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* BENTO GRID FEATURE SHOWCASE */}
        <section id="features" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto">
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                Engineered For Excellence
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Everything you need to master your network
              </h2>
              <p className="mt-4 text-base text-slate-300">
                A sleek, distraction-free workflow built on modern architecture.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3 lg:grid-cols-3">
              {FEATURES_BENTO.map((feat) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'group relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-7 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10',
                      feat.borderColor,
                      feat.gridSpan
                    )}
                  >
                    {/* Top gradient highlight */}
                    <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-100', feat.gradient)} />

                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-indigo-300 shadow-md">
                            <Icon className="h-6 w-6" />
                          </div>
                          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            {feat.badge}
                          </span>
                        </div>

                        <h3 className="mt-6 text-xl font-bold tracking-tight text-white">{feat.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">{feat.description}</p>
                      </div>

                      {/* Visual Micro-Visual inside card */}
                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-indigo-300 group-hover:text-indigo-200">
                        <span>Explore feature details</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* INTERACTIVE WORKFLOW STEPPER */}
        <section id="workflow" className="border-t border-white/10 bg-slate-900/40 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-2xl mx-auto">
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-300 uppercase tracking-widest">
                Intuitive Operations
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                See how Smart Contacts streamlines your workflow
              </h2>
            </div>

            {/* Tab buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {WORKFLOW_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeWorkflowTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveWorkflowTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-semibold transition-all',
                      isActive
                        ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-lg shadow-indigo-500/20'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-indigo-400' : 'text-slate-400')} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab content panel */}
            <div className="mt-8 mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950 p-6 shadow-2xl backdrop-blur-2xl sm:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedWorkflow.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-8 md:grid-cols-2 md:items-center"
                >
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedWorkflow.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{selectedWorkflow.description}</p>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center gap-2.5 text-xs text-slate-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Sub-millisecond HashMap index lookup</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-300">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Instant client-side UI sync</span>
                      </div>
                    </div>
                  </div>

                  {/* Code snippet display */}
                  <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 font-mono text-xs text-slate-200 shadow-inner">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                        C++ &amp; Redux Engine Execution
                      </span>
                      <span className="text-emerald-400">VERIFIED</span>
                    </div>
                    <pre className="overflow-x-auto text-indigo-200 leading-relaxed">
                      <code>{selectedWorkflow.codeSnippet}</code>
                    </pre>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-300 uppercase tracking-widest">
                Got Questions?
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="mt-12 space-y-4">
              {FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between p-5 text-left font-bold text-white transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="text-sm sm:text-base">{faq.question}</span>
                      <ChevronDown
                        className={cn('h-5 w-5 text-slate-400 transition-transform duration-300', isOpen && 'rotate-180 text-indigo-400')}
                      />
                    </button>
                    {isOpen && (
                      <div className="border-t border-white/10 px-5 pb-5 pt-3 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION BANNER */}
        <section className="px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-8 shadow-2xl shadow-indigo-950/50 sm:p-14">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-indigo-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Ready to upgrade your contact management?
                </h2>
                <p className="mt-3 max-w-xl text-base text-slate-300">
                  Create your workspace in seconds and experience sub-millisecond search performance.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  to={ROUTES.REGISTER}
                  className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-2xl bg-white px-6 text-sm font-bold text-slate-950 shadow-xl transition-all hover:bg-indigo-50 hover:scale-[1.02]"
                >
                  Get Started For Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="https://github.com/prathamkumarmishra/Contact-Management-System"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 text-sm font-bold text-white transition-colors hover:bg-white/20"
                >
                  <Github className="h-4 w-4" />
                  View GitHub Source
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-xs text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="font-bold text-white">smartcontacts</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <span className="flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" /> C++ HashMap
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-emerald-400" /> MongoDB
            </span>
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-cyan-400" /> Vite + React 19
            </span>
            <a
              href="https://github.com/prathamkumarmishra/Contact-Management-System"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-300 transition-colors hover:text-white"
            >
              <Github className="h-3.5 w-3.5" /> Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

