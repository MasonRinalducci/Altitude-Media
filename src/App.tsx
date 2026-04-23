import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Handshake, 
  Smartphone, 
  LineChart, 
  Megaphone, 
  Search, 
  Bell, 
  Settings, 
  Play, 
  Rocket, 
  ArrowUpRight,
  MonitorPlay,
  MousePointer2,
  Square,
  TrendingUp,
  Users,
  Clock,
  Plus,
  Filter,
  Download,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Image as ImageIcon,
  FileVideo,
  FileAudio,
  Sparkles,
  Compass,
  ArrowUpDown,
  Folder,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Star,
  ShieldCheck,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError } from './lib/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';

// --- Types ---
type Page = 'Welcome' | 'Dashboard' | 'Media Engine' | 'Sponsorships' | 'Social Formats' | 'Timeline' | 'Campaigns' | 'Feedback';
type Format = 'Instagram Reel' | 'TikTok Ad' | 'YouTube Short' | 'LinkedIn Post';
type Style = 'Cinematic Alpinism' | 'Fast-Paced Action' | 'Informative Overlay' | 'Brutal Grit';

interface Asset {
  id: number;
  type: 'Video' | 'Audio' | 'Image';
  name: string;
  size: string;
}

// --- Components ---

const Sidebar = ({ currentPage, onPageChange, isOpen, onClose, user }: { currentPage: Page, onPageChange: (page: Page) => void, isOpen: boolean, onClose: () => void, user: User | null }) => {
  const navItems: { icon: any, label: Page }[] = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Zap, label: 'Media Engine' },
    { icon: Handshake, label: 'Sponsorships' },
    { icon: Smartphone, label: 'Social Formats' },
    { icon: LineChart, label: 'Timeline' },
    { icon: Megaphone, label: 'Campaigns' },
    { icon: MessageSquare, label: 'Feedback' },
    { icon: Rocket, label: 'Welcome' },
  ];

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 h-full flex flex-col z-50 bg-surface w-64 border-r border-white/5 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-8 flex flex-col gap-2 relative">
          <button onClick={onClose} className="lg:hidden absolute right-4 top-8 text-slate-500">
            <Plus size={24} className="rotate-45" />
          </button>
          <h1 className="font-black text-primary font-headline text-2xl tracking-tighter italic uppercase">Altitude Media</h1>
          <p className="font-label text-[10px] tracking-[0.2em] text-slate-500 uppercase">High-Altitude Media</p>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                onPageChange(item.label);
                onClose();
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 transition-colors duration-100 group ${
                currentPage === item.label 
                  ? 'border-r-4 border-secondary bg-surface-high text-secondary' 
                  : 'text-slate-500 hover:bg-surface-high hover:text-primary'
              }`}
            >
              <item.icon size={18} className={currentPage === item.label ? 'fill-secondary/20' : ''} />
              <span className={`font-label text-xs tracking-widest uppercase ${currentPage === item.label ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {user && (
          <div className="p-4 border-t border-white/5 bg-surface-high/20 mx-3 mb-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-black font-black text-xs uppercase shrink-0">
                {user.email?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label text-[10px] text-white truncate uppercase tracking-tighter">{user.email?.split('@')[0]}</p>
                <p className="font-label text-[8px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full py-2 border border-white/10 text-[9px] font-label font-black uppercase tracking-widest text-slate-500 hover:text-red-500 hover:border-red-500/30 transition-all"
            >
              Sign Out
            </button>
          </div>
        )}

        <div className="p-6">
          <button className="w-full bg-secondary text-background py-4 font-label text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:brightness-110 transition-all">
            Start Ascent
            <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>
    </>
  );
};

const TopBar = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  return (
    <header className="flex justify-between items-center w-full lg:w-[calc(100%-16rem)] lg:ml-64 px-4 lg:px-8 py-4 fixed top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center gap-4 lg:gap-8">
        <button onClick={onOpenSidebar} className="lg:hidden text-primary p-1">
          <MoreVertical size={24} />
        </button>
        <div className="hidden md:flex items-center gap-3">
          <Search size={18} className="text-primary" />
          <input
            type="text"
            placeholder="SEARCH PROJECTS..."
            className="bg-transparent border-none focus:ring-0 font-label text-xs tracking-widest text-slate-400 w-48 lg:w-64 placeholder:text-slate-600"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 lg:gap-6">
        <button className="text-slate-400 hover:text-primary transition-colors hidden sm:block">
          <Bell size={18} />
        </button>
        <button className="text-slate-400 hover:text-primary transition-colors hidden sm:block">
          <Settings size={18} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/20">
          <div className="text-right hidden sm:block">
            <p className="font-label text-[10px] tracking-tighter text-slate-400 uppercase">Pro Elite</p>
            <p className="font-headline font-bold text-sm tracking-tight">ALEX_HONNOLD</p>
          </div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqRYptUfkyCb767WNczjtt67H2xoFGO7xrbYmZMV1IT8oivWXpZmOdBzkaBijbi93i4LrYkrUokF4sYDFU6L4aI8OiUZ6LkEgVY0PCz_TgsyJQWzILwmWQwr8jxMe0QZCDGfmzY5drCZntEtU5oITZ3Uz2YV8nSePWx52l3ih5mYoHMEqiw40CJegAdfLgHgHeG3UfQELxEUYV0RusfAHeWvl6WfotyuhOh2j0BAml8BPlm8DFYAAqtJ0qN2kX4sh_dBc3hho0J5U"
            alt="User profile"
            className="w-8 h-8 lg:w-10 lg:h-10 object-cover grayscale brightness-125 border border-primary/50"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};

const WelcomePage = ({ onEnter }: { onEnter: () => void, key?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070" 
          alt="Mountain Range" 
          className="w-full h-full object-cover grayscale brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center space-y-12 max-w-4xl"
      >
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 border border-primary/30 bg-primary/5 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <p className="font-label text-[10px] tracking-[0.4em] text-primary uppercase font-black">
              SYSTEM_INITIALIZED // ALTITUDE_MEDIA_V2.6
            </p>
          </motion.div>
          
          <h1 className="font-headline text-7xl sm:text-8xl lg:text-[10rem] font-black italic tracking-tighter text-on-surface uppercase leading-[0.8] mix-blend-difference">
            THE <span className="text-primary">ASCENT</span><br />
            <span className="text-secondary">STARTS</span> HERE.
          </h1>
        </div>
        
        <div className="space-y-8">
          <p className="font-body text-slate-400 text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed font-light">
            Welcome to the future of high-altitude media deployment. Precision tools for elite creators and global expeditions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#c3f400', color: '#0c0e11' }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnter}
              className="group relative bg-primary text-background px-12 py-6 font-label text-xs font-black tracking-[0.4em] uppercase flex items-center gap-4 transition-all shadow-[0_0_60px_-15px_rgba(255,143,112,0.5)] overflow-hidden"
            >
              <span className="relative z-10">Initialize Mission Control</span>
              <Rocket size={18} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <div className="absolute inset-0 bg-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </motion.button>
            
            <div className="flex items-center gap-4 px-6 py-4 border border-white/10 bg-white/5 backdrop-blur-md">
              <div className="text-left">
                <p className="font-label text-[8px] text-slate-500 uppercase tracking-widest">Active Uplink</p>
                <p className="font-headline text-sm font-bold text-white tracking-tight">KINETIC_GLOBAL_NET</p>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-left">
                <p className="font-label text-[8px] text-slate-500 uppercase tracking-widest">Signal Strength</p>
                <p className="font-headline text-sm font-bold text-secondary tracking-tight">99.9%</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* HUD elements */}
      <div className="absolute top-12 left-12 font-label text-[10px] text-slate-500 space-y-2 hidden md:block tracking-[0.2em] uppercase">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-primary"></div>
          <p>CORE_TEMP: <span className="text-white">32°C</span></p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-secondary"></div>
          <p>UPTIME: <span className="text-white">99.99%</span></p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-tertiary"></div>
          <p>ENCRYPTION: <span className="text-white">AES-256</span></p>
        </div>
      </div>
      
      <div className="absolute bottom-12 right-12 font-label text-[10px] text-slate-500 text-right hidden md:block tracking-[0.3em] uppercase">
        <p className="text-white font-black mb-1">ALTITUDE MEDIA GROUP</p>
        <p>STRATEGIC_OPERATIONS_CENTER</p>
        <p className="mt-4 text-[8px] opacity-50">VER: 2.6.0_STABLE</p>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Decorative lines */}
      <div className="absolute top-0 bottom-0 left-12 w-px bg-white/5 hidden lg:block"></div>
      <div className="absolute top-0 bottom-0 right-12 w-px bg-white/5 hidden lg:block"></div>
      <div className="absolute left-0 right-0 top-12 h-px bg-white/5 hidden lg:block"></div>
      <div className="absolute left-0 right-0 bottom-12 h-px bg-white/5 hidden lg:block"></div>
    </motion.div>
  );
};

// --- Page Components ---

const DashboardPage = () => {
  const stats = [
    { label: 'Total Views', value: '2.4M', change: '+12%', icon: TrendingUp },
    { label: 'Engagement', value: '8.2%', change: '+3.1%', icon: Users },
    { label: 'Active Projects', value: '14', change: '0', icon: Zap },
    { label: 'Avg. Duration', value: '42s', change: '-2s', icon: Clock },
  ];

  const recentActivity = [
    { id: 1, title: 'El Capitan Ascent Reel', status: 'Rendered', time: '2h ago' },
    { id: 2, title: 'Patagonia Winter Series', status: 'Draft', time: '5h ago' },
    { id: 3, title: 'Yosemite Speed Climb', status: 'Published', time: '1d ago' },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-headline text-4xl lg:text-5xl font-black italic tracking-tighter text-on-surface uppercase mb-2 leading-none">
          Mission <span className="text-primary">Control</span>
        </h2>
        <p className="font-body text-slate-400 max-w-lg text-sm lg:text-base">Real-time performance metrics and high-altitude deployment status.</p>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface p-4 lg:p-6 border-l-2 border-primary">
            <div className="flex justify-between items-start mb-4">
              <stat.icon size={20} className="text-slate-500" />
              <span className={`text-[10px] font-label font-bold ${stat.change.startsWith('+') ? 'text-secondary' : stat.change === '0' ? 'text-slate-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
            <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="font-headline text-xl lg:text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* AI Curator Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-primary/20 relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x"></div>
        <div className="p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center relative">
              <Sparkles className="text-primary animate-pulse" size={32} />
              <div className="absolute -inset-2 border border-primary/10 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="font-label text-xs tracking-[0.4em] text-primary uppercase font-black">AI_CURATOR_INSIGHTS</h3>
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="font-label text-[8px] text-slate-500 uppercase tracking-widest">v2.6_CO-PILOT</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-label text-[10px] text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Compass size={12} /> Strategic Pivot Point
                </p>
                <p className="font-body text-slate-200 text-sm leading-relaxed">
                  Data suggests a <span className="text-white font-bold italic">40% drop-off</span> at marked 00:12 in "El Capitan" series. Recommendation: Pivot from linear narrative to <span className="text-secondary text-xs uppercase font-black tracking-widest">Kinetic Rapid-Cut</span> sequence to retain mobile viewers.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-label text-[10px] text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap size={12} /> Creative Guidance
                </p>
                <p className="font-body text-slate-200 text-sm leading-relaxed">
                  Current color grade on "Patagonia" series lacks the <span className="text-white font-bold italic">Alpine HDR</span> vibrancy required for high-altitude immersion. AI Suggestion: Apply <span className="text-primary text-xs uppercase font-black tracking-widest">Altitude_Grit_LUT</span> to optimize for OLED mobile displays.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-48 space-y-3">
            <button className="w-full bg-primary/10 border border-primary/30 text-primary py-3 font-label text-[10px] font-black tracking-[0.2em] uppercase hover:bg-primary hover:text-background transition-all">
              Apply Suggestion
            </button>
            <button className="w-full border border-white/10 text-slate-500 py-3 font-label text-[10px] font-black tracking-[0.2em] uppercase hover:text-white transition-all">
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-surface p-6 lg:p-8 border border-white/5">
          <h3 className="font-label text-xs tracking-[0.3em] text-primary uppercase font-black mb-6">Performance Graph</h3>
          <div className="h-48 lg:h-64 flex items-end gap-1 lg:gap-2">
            {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 bg-primary/20 border-t-2 border-primary relative group"
              >
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 bg-surface p-6 lg:p-8 border border-white/5">
          <h3 className="font-label text-xs tracking-[0.3em] text-primary uppercase font-black mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex justify-between items-center p-3 bg-surface-high border-l-2 border-secondary">
                <div>
                  <p className="font-headline text-sm font-bold">{activity.title}</p>
                  <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest">{activity.time}</p>
                </div>
                <span className="text-[10px] font-label text-secondary font-black uppercase tracking-tighter">{activity.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaEnginePage = ({ assets, setAssets }: { assets: Asset[], setAssets: React.Dispatch<React.SetStateAction<Asset[]>> }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Video' | 'Audio' | 'Image'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredAndSortedAssets = useMemo(() => {
    let result = activeTab === 'All' 
      ? [...assets] 
      : assets.filter(asset => asset.type === activeTab);

    return result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'type') comparison = a.type.localeCompare(b.type);
      else if (sortBy === 'size') {
        const parseSize = (s: string) => parseFloat(s.replace(/[^0-9.]/g, ''));
        comparison = parseSize(a.size) - parseSize(b.size);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [assets, activeTab, sortBy, sortOrder]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAssets: Asset[] = (Array.from(files) as File[]).map((file, index) => ({
        id: assets.length + index + 1,
        type: (file.type.startsWith('video/') ? 'Video' : file.type.startsWith('audio/') ? 'Audio' : 'Image') as 'Video' | 'Audio' | 'Image',
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + 'MB'
      }));
      setAssets(prev => [...newAssets, ...prev]);
      setIsPortalOpen(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="font-headline text-4xl lg:text-5xl font-black italic tracking-tighter text-on-surface uppercase mb-2 leading-none">
            Asset <span className="text-primary">Vault</span>
          </h2>
          <p className="font-body text-slate-400 max-w-lg text-sm lg:text-base">Manage and synchronize your high-fidelity media assets.</p>
        </div>
        <button 
          onClick={() => setIsPortalOpen(true)}
          className="w-full sm:w-auto bg-secondary text-background px-8 py-4 font-label text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_20px_-5px_rgba(195,244,0,0.3)]"
        >
          <Plus size={16} />
          Upload Asset
        </button>
      </section>

      {/* Interactive Tabs & Sorting */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="flex flex-wrap items-center gap-2 lg:gap-4">
          {(['All', 'Video', 'Audio', 'Image'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 lg:px-6 py-2 font-label text-[10px] uppercase tracking-[0.2em] transition-all duration-200 border ${
                activeTab === tab 
                  ? 'bg-primary/10 border-primary text-primary font-black scale-105' 
                  : 'bg-surface border-white/5 text-slate-500 hover:text-white hover:border-white/20'
              }`}
            >
              {tab}{tab === 'All' ? '' : 's'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface border border-white/5 p-1">
            <span className="font-label text-[8px] text-slate-600 uppercase tracking-widest px-2">Sort by:</span>
            {(['name', 'size', 'type'] as const).map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (sortBy === option) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(option);
                    setSortOrder('asc');
                  }
                }}
                className={`px-3 py-1.5 font-label text-[8px] uppercase tracking-widest transition-all flex items-center gap-2 ${
                  sortBy === option 
                    ? 'bg-surface-high text-on-surface border border-white/10' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {option}
                {sortBy === option && <ArrowUpDown size={10} className={sortOrder === 'desc' ? 'rotate-180' : ''} />}
              </button>
            ))}
          </div>
          <button className="text-slate-500 hover:text-white p-2 border border-white/5 bg-surface"><Filter size={18} /></button>
        </div>
      </div>

      {/* Asset Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredAndSortedAssets.map((asset) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={asset.id} 
              className="group bg-surface p-6 border border-white/5 hover:border-primary/50 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
              </div>
              <div className="w-full aspect-video bg-surface-high mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                {asset.type === 'Video' ? <MonitorPlay size={48} className="text-slate-800 group-hover:text-primary/30 transition-colors" /> : asset.type === 'Audio' ? <Zap size={48} className="text-slate-800 group-hover:text-secondary/30 transition-colors" /> : <ImageIcon size={48} className="text-slate-800 group-hover:text-tertiary/30 transition-colors" />}
                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 text-[8px] font-label text-white uppercase tracking-widest backdrop-blur-sm">
                  {asset.type}
                </div>
              </div>
              <p className="font-headline text-sm font-bold truncate tracking-tight">{asset.name}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="font-label text-[10px] text-slate-500 uppercase tracking-[0.2em]">{asset.size}</p>
                <div className="flex gap-3">
                  <button className="text-slate-500 hover:text-primary transition-colors"><Download size={14} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* File Upload Portal (Modal) */}
      <AnimatePresence>
        {isPortalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPortalOpen(false)}
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-surface border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-headline text-3xl font-black italic tracking-tighter uppercase text-primary">UPLOAD_PORTAL</h3>
                    <p className="font-label text-[10px] text-slate-500 uppercase tracking-[0.4em]">Initialize Media Transfer</p>
                  </div>
                  <button 
                    onClick={() => setIsPortalOpen(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      handleFileChange({ target: { files: e.dataTransfer.files } } as any);
                    }
                  }}
                  className="border-2 border-dashed border-white/5 hover:border-primary/50 bg-white/[0.02] transition-all cursor-pointer group flex flex-col items-center justify-center py-16 px-8 text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-primary" />
                  </div>
                  <p className="font-headline text-xl font-bold mb-2">DRAG & DROP MEDIA</p>
                  <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest max-w-xs">
                    SELECT HIGH-FIDELITY ASSETS FROM YOUR LOCAL SYSTEM ARCHIVE
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="video/*,audio/*,image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface-high p-4 border border-white/5 flex items-center gap-3">
                    <FileVideo size={20} className="text-secondary" />
                    <div>
                      <p className="font-label text-[8px] text-slate-500 uppercase">Capability</p>
                      <p className="font-headline text-xs font-bold">4K VIDEO</p>
                    </div>
                  </div>
                  <div className="bg-surface-high p-4 border border-white/5 flex items-center gap-3">
                    <FileAudio size={20} className="text-primary" />
                    <div>
                      <p className="font-label text-[8px] text-slate-500 uppercase">Capability</p>
                      <p className="font-headline text-xs font-bold">LOSSLESS</p>
                    </div>
                  </div>
                  <div className="bg-surface-high p-4 border border-white/5 flex items-center gap-3">
                    <ImageIcon size={20} className="text-tertiary" />
                    <div>
                      <p className="font-label text-[8px] text-slate-500 uppercase">Capability</p>
                      <p className="font-headline text-xs font-bold">RAW IMAGE</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-primary text-background py-5 font-label text-xs font-black tracking-[0.3em] uppercase hover:brightness-110 transition-all"
                >
                  BROWSE LOCAL SYSTEM
                </button>
              </div>
              
              {/* HUD Frame Decor */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-secondary"></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SponsorshipsPage = () => {
  const sponsors = [
    { name: 'North Face', status: 'Active', tier: 'Global Partner', revenue: '$120k' },
    { name: 'Red Bull', status: 'Active', tier: 'Title Sponsor', revenue: '$250k' },
    { name: 'GoPro', status: 'Pending', tier: 'Equipment Partner', revenue: '$45k' },
    { name: 'Patagonia', status: 'Expired', tier: 'Apparel Partner', revenue: '$80k' },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-headline text-4xl lg:text-5xl font-black italic tracking-tighter text-on-surface uppercase mb-2 leading-none">
          Partner <span className="text-primary">Network</span>
        </h2>
        <p className="font-body text-slate-400 max-w-lg text-sm lg:text-base">Manage contracts and sponsorship synchronization.</p>
      </section>

      <div className="bg-surface border border-white/5 overflow-x-auto no-scrollbar">
        <table className="w-full text-left min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="p-4 lg:p-6 font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">Partner</th>
              <th className="p-4 lg:p-6 font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">Status</th>
              <th className="p-4 lg:p-6 font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">Tier</th>
              <th className="p-4 lg:p-6 font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">Revenue</th>
              <th className="p-4 lg:p-6 font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.map((sponsor) => (
              <tr key={sponsor.name} className="border-b border-white/5 hover:bg-surface-high transition-colors">
                <td className="p-4 lg:p-6 font-headline font-bold">{sponsor.name}</td>
                <td className="p-4 lg:p-6">
                  <span className={`px-3 py-1 text-[10px] font-label font-black uppercase tracking-widest ${
                    sponsor.status === 'Active' ? 'bg-secondary/10 text-secondary' : 
                    sponsor.status === 'Pending' ? 'bg-primary/10 text-primary' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {sponsor.status}
                  </span>
                </td>
                <td className="p-4 lg:p-6 font-label text-xs text-slate-400">{sponsor.tier}</td>
                <td className="p-4 lg:p-6 font-headline font-bold text-white">{sponsor.revenue}</td>
                <td className="p-4 lg:p-6">
                  <button className="text-slate-500 hover:text-white"><ChevronRight size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface TimelineTrackProps {
  track: string;
  i: number;
  playheadPosition: number;
  setPlayheadPosition: (pos: number) => void;
  isSubtrack?: boolean;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({ 
  track, 
  i, 
  playheadPosition, 
  setPlayheadPosition, 
  isSubtrack = false 
}) => {
  return (
    <div className={`flex group hover:bg-white/[0.03] transition-colors relative mb-1 last:mb-0 ${isSubtrack ? 'h-10 opacity-70 hover:opacity-100' : 'h-14'}`}>
      <div className={`w-32 bg-neutral-950 border-r border-white/10 flex items-center px-4 gap-3 shrink-0 z-10 ${isSubtrack ? 'pl-8' : ''}`}>
         <div className={`p-1.5 rounded-sm ${i === 0 ? 'bg-primary/20 text-primary' : i === 1 ? 'bg-secondary/20 text-secondary' : 'bg-tertiary/20 text-tertiary'}`}>
           {i === 0 ? <FileVideo size={10} /> : i === 1 ? <FileAudio size={10} /> : <Megaphone size={10} />}
         </div>
         <span className={`font-label text-[10px] font-black text-slate-500 truncate uppercase tracking-tighter group-hover:text-white transition-colors`}>{track}</span>
      </div>
      <div className="flex-1 relative cursor-pointer bg-white/[0.01]" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setPlayheadPosition(x);
      }}>
        <div 
          className={`absolute top-2 border-l-2 shadow-lg group/clip hover:brightness-110 transition-all ${
            isSubtrack ? 'h-6' : 'h-10'
          } ${
            i === 0 ? 'bg-primary/40 border-primary' : 
            i === 1 ? 'bg-secondary/40 border-secondary' : 
            'bg-tertiary/20 border-tertiary border-dashed'
          }`} 
          style={{ left: `${i * 15 + 10}%`, width: `${25 + i * 5}%` }}
        >
          <div className="px-3 py-2 font-label text-[9px] text-white font-black uppercase truncate flex flex-col gap-1 h-full">
             <span className="truncate">{i === 0 ? 'AERIAL_SUMMIT_PRO_LOG_01' : i === 1 ? 'WIND_AMB_CLEAN_V2' : 'AI_TRANSCRIBED_SPEECH'}</span>
             
             {!isSubtrack && (
               <div className="flex gap-2 mt-auto">
                   {[...Array(3)].map((_, k) => (
                     <div key={k} className="w-1.5 h-1.5 bg-white/40 rotate-45 group-hover/clip:bg-white transition-colors" />
                   ))}
               </div>
             )}
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 group-hover/clip:bg-white/40 cursor-ew-resize" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 group-hover/clip:bg-white/40 cursor-ew-resize" />
        </div>
      </div>
    </div>
  );
};

const TimelinePage = ({ assets }: { assets: Asset[] }) => {
  const [playheadPosition, setPlayheadPosition] = useState(33);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [activeTracks, setActiveTracks] = useState(['Video 1', 'Audio 1', 'Captions']);
  const [isGrouped, setIsGrouped] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Video', 'Audio', 'AI']);

  const groups = useMemo(() => [
    { name: 'Video', tracks: activeTracks.filter(t => t.toLowerCase().includes('video')), color: 'text-primary' },
    { name: 'Audio', tracks: activeTracks.filter(t => t.toLowerCase().includes('audio')), color: 'text-secondary' },
    { name: 'AI', tracks: activeTracks.filter(t => t.toLowerCase().includes('caption') || t.toLowerCase().includes('ai')), color: 'text-tertiary' },
  ], [activeTracks]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };
  
  const aiTools = [
    { label: 'Auto-Clip', icon: Zap, color: 'text-primary' },
    { label: 'Smart Captions', icon: Megaphone, color: 'text-secondary' },
    { label: 'Remove BG', icon: Users, color: 'text-tertiary' },
    { label: 'Audio Sync', icon: FileAudio, color: 'text-white' },
  ];

  const handleAiAction = (action: string) => {
    setIsAiProcessing(true);
    setTimeout(() => setIsAiProcessing(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <section className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <LineChart size={24} className="text-secondary" />
          </div>
          <div>
            <h2 className="font-headline text-4xl lg:text-5xl font-black italic tracking-tighter text-on-surface uppercase mb-2 leading-none">
              AI <span className="text-secondary">SEQUENCE</span> EDITOR
            </h2>
            <p className="font-body text-slate-400 max-w-lg text-sm lg:text-base">Advanced non-linear deployment with high-altitude AI integration.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsGrouped(!isGrouped)}
            className={`border px-6 py-3 font-label text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
              isGrouped ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-surface border-white/5 text-slate-500 hover:bg-surface-high'
            }`}
          >
            <Folder size={14} />
            {isGrouped ? 'Ungroup Tracks' : 'Group Tracks'}
          </button>
          <button className="bg-surface border border-white/5 px-6 py-3 font-label text-[10px] font-black tracking-widest uppercase hover:bg-surface-high transition-all">Draft Save</button>
          <button className="bg-primary text-background px-6 py-3 font-label text-[10px] font-black tracking-widest uppercase hover:brightness-110 transition-all shadow-[0_0_20px_-5px_rgba(255,143,112,0.4)]">Export Final</button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Media Pool (From Media Engine) */}
        <div className="lg:col-span-3 bg-surface border border-white/5 flex flex-col min-h-[300px] lg:min-h-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface-high/50">
            <h3 className="font-label text-[10px] tracking-[0.2em] text-primary font-black uppercase">Asset Pool</h3>
            <span className="text-[8px] font-label text-slate-600">{assets.length} ITEMS</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-black/20">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative bg-surface-high/30 border border-white/5 p-3 hover:border-primary/30 transition-all cursor-move active:scale-95 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background border border-white/5 group-hover:border-primary/20 transition-colors">
                    {asset.type === 'Video' ? <MonitorPlay size={14} className="text-primary" /> : asset.type === 'Audio' ? <Zap size={14} className="text-secondary" /> : <ImageIcon size={14} className="text-tertiary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-headline text-[11px] font-bold truncate group-hover:text-primary transition-colors">{asset.name}</p>
                    <p className="font-label text-[8px] text-slate-600 uppercase tracking-widest">{asset.size}</p>
                  </div>
                  <Plus size={12} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <div className="text-center py-12 opacity-30">
                <Upload size={32} className="mx-auto mb-2" />
                <p className="font-label text-[10px] uppercase">Pool Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Editor Main Section */}
        <div className="lg:col-span-9 flex flex-col gap-6 relative">
          {/* Neural Background Decor */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
          
          {/* AI Tool Bar */}
          <div className="bg-surface border border-white/5 p-2 flex gap-2 overflow-x-auto no-scrollbar">
            {aiTools.map((tool) => (
              <button 
                key={tool.label}
                onClick={() => handleAiAction(tool.label)}
                className="flex items-center gap-2 px-4 py-3 bg-surface-high hover:bg-secondary/10 hover:border-secondary/30 transition-all border border-white/5 group relative overflow-hidden shrink-0"
              >
                <tool.icon size={14} className={tool.color} />
                <span className="font-label text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{tool.label}</span>
                {isAiProcessing && <motion.div className="absolute bottom-0 left-0 h-0.5 bg-secondary" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} />}
              </button>
            ))}
          </div>

          {/* Timeline & Preview Container */}
          <div className="flex-1 min-h-[400px] bg-surface border border-white/5 flex flex-col overflow-hidden relative shadow-2xl">
            {/* Visualizer / Overlay Area */}
            <div className="flex-1 bg-black relative group overflow-hidden flex items-center justify-center border-b border-white/5">
              {/* Background Noise/Grain */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url(https://grainy-gradients.vercel.app/noise.svg)' }}></div>
              
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
              </div>
              
              {/* Fake Video Preview */}
              <div className="relative w-full max-w-2xl aspect-video bg-neutral-900 shadow-2xl flex items-center justify-center overflow-hidden border border-white/5">
                <div className="absolute top-4 left-4 font-mono text-[10px] text-primary/50 tracking-widest uppercase flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,143,112,0.5)]"></div>
                  REC_LIVE // 24FPS // PRO_RES
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                   <div className="flex flex-col items-end">
                     <span className="font-label text-[8px] text-slate-500 uppercase tracking-widest">Master TC</span>
                     <span className="font-mono text-[12px] text-white">00:00:14:02</span>
                   </div>
                </div>
                <MonitorPlay size={64} className="text-white/5" />
                
                {/* Visualizer Overlay */}
                <div className="absolute left-8 bottom-8 flex gap-1 h-32 items-end opacity-20">
                   {[...Array(20)].map((_, i) => (
                     <div key={i} className="w-1 bg-secondary" style={{ height: `${Math.random() * 100}%` }}></div>
                   ))}
                </div>

                {/* AI Overlay Mockup */}
                <AnimatePresence>
                  {isAiProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 border-4 border-secondary/30 bg-secondary/10 backdrop-blur-[4px] flex items-center justify-center z-50"
                    >
                      <div className="text-center relative">
                        <div className="absolute -inset-12 border border-secondary/20 rounded-full animate-ping"></div>
                        <div className="flex gap-2 justify-center mb-4">
                          {[0, 1, 2, 3].map(i => (
                            <motion.div key={i} className="w-1.5 h-8 bg-secondary shadow-[0_0_10px_rgba(195,244,0,0.5)]" animate={{ height: [8, 32, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }} />
                          ))}
                        </div>
                        <p className="font-headline text-sm font-black uppercase tracking-[0.4em] text-secondary">AI_NEURAL_PROCESSING</p>
                        <p className="font-label text-[8px] text-white/50 uppercase mt-2 tracking-widest">Optimizing for high-altitude dynamic light</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Timeline Tracks */}
            <div className="h-72 bg-neutral-950 flex flex-col overflow-hidden relative">
              {/* Ruler */}
              <div className="h-10 border-b border-white/5 flex relative overflow-hidden bg-neutral-900">
                <div className="w-32 border-r border-white/10 h-full flex items-center justify-center">
                   <Clock size={14} className="text-slate-600" />
                </div>
                <div className="flex-1 relative">
                  {[...Array(40)].map((_, i) => (
                    <div key={i} className="absolute h-full flex flex-col justify-end pb-1" style={{ left: `${i * 2.5}%` }}>
                      <div className={`w-px ${i % 5 === 0 ? 'h-4 bg-white/20' : 'h-2 bg-white/5'}`} />
                      {i % 5 === 0 && <span className="text-[8px] font-label text-slate-500 mt-1 pl-1">{i}s</span>}
                    </div>
                  ))}
                </div>
              </div>
              {/* Tracks Scrollable */}
              <div className="flex-1 overflow-y-auto no-scrollbar relative pt-2">
                {/* Playhead */}
                <div 
                  className="absolute top-0 bottom-0 w-[2px] bg-secondary z-[40] pointer-events-none shadow-[0_0_10px_rgba(195,244,0,0.5)]" 
                  style={{ left: `calc(128px + ${playheadPosition}%)` }}
                >
                  <div className="w-4 h-4 bg-secondary absolute -top-2 -left-2 rotate-45 flex items-center justify-center">
                     <div className="w-1 h-3 bg-black -rotate-45" />
                  </div>
                </div>

                {!isGrouped ? (
                  activeTracks.map((track, i) => (
                    <TimelineTrack 
                      key={track} 
                      track={track} 
                      i={i} 
                      playheadPosition={playheadPosition} 
                      setPlayheadPosition={setPlayheadPosition} 
                    />
                  ))
                ) : (
                  groups.map((group) => (
                    <div key={group.name} className="mb-2">
                       {/* Group Header */}
                       <div 
                         onClick={() => toggleGroup(group.name)}
                         className="flex h-8 bg-neutral-900/80 border-y border-white/5 cursor-pointer hover:bg-neutral-800 transition-colors"
                       >
                          <div className="w-32 border-r border-white/10 flex items-center px-4 gap-2 shrink-0">
                             {expandedGroups.includes(group.name) ? <ChevronDown size={10} className="text-slate-500" /> : <ChevronRight size={10} className="text-slate-500" />}
                             <span className={`font-label text-[9px] font-black uppercase tracking-widest ${group.color}`}>{group.name}</span>
                             <span className="text-[8px] text-slate-600 font-bold ml-auto">{group.tracks.length}</span>
                          </div>
                          <div className="flex-1 bg-white/[0.02]" />
                       </div>
                       
                       {/* Grouped Tracks */}
                       <AnimatePresence>
                         {expandedGroups.includes(group.name) && (
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: 'auto', opacity: 1 }}
                             exit={{ height: 0, opacity: 0 }}
                             className="overflow-hidden bg-white/[0.01]"
                           >
                             {group.tracks.map((track, i) => (
                               <TimelineTrack 
                                 key={track} 
                                 track={track} 
                                 i={groups.indexOf(group)} 
                                 playheadPosition={playheadPosition} 
                                 setPlayheadPosition={setPlayheadPosition} 
                                 isSubtrack
                               />
                             ))}
                           </motion.div>
                         )}
                       </AnimatePresence>
                    </div>
                  ))
                )}
                
                {/* Empty Space Grid */}

                <div className="absolute inset-0 pointer-events-none opacity-[0.02] -z-10" style={{ backgroundImage: 'linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '10%' }}></div>
              </div>

              {/* View Controls */}
              <div className="p-3 bg-neutral-900 border-t border-white/5 flex justify-between items-center text-slate-500">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <Search size={14} />
                       <div className="w-32 h-1 bg-neutral-800 rounded-full relative overflow-hidden">
                          <motion.div className="absolute inset-y-0 left-0 bg-primary/60" initial={{ width: '40%' }} />
                       </div>
                    </div>
                    <span className="font-label text-[10px] uppercase tracking-widest text-slate-600">Zoom: 1.5X</span>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="bg-neutral-800 px-3 py-1 text-[10px] font-mono border border-white/5">00:00:14:02 / 00:01:25:00</div>
                    <div className="flex gap-4">
                       <button className="hover:text-white transition-colors"><ArrowUpRight size={14} /></button>
                       <button className="hover:text-white transition-colors"><Settings size={14} /></button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedbackPage = ({ user }: { user: User | null }) => {
  const [rating, setRating] = React.useState(0);
  const [category, setCategory] = React.useState<'Bug' | 'Feature Request' | 'Praise' | 'Other'>('Praise');
  const [comment, setComment] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [feedbacks, setFeedbacks] = React.useState<any[]>([]);
  const [isAdminView, setIsAdminView] = React.useState(false);

  const isAdmin = user?.email === 'Mason.Rinalducci@gmail.com';

  React.useEffect(() => {
    if (isAdmin && isAdminView) {
      const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeedbacks(data);
      }, (error) => {
        handleFirestoreError(error, 'list', 'feedbacks');
      });
      return () => unsubscribe();
    }
  }, [isAdmin, isAdminView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please sign in to submit feedback');
    if (rating === 0) return alert('Please select a rating');
    if (!comment.trim()) return alert('Please enter a comment');

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        userId: user.uid,
        userEmail: user.email,
        rating,
        category,
        comment,
        createdAt: serverTimestamp(),
      });
      setRating(0);
      setComment('');
      alert('Feedback submitted! Thank you for helping us reach new heights.');
    } catch (error) {
      handleFirestoreError(error, 'create', 'feedbacks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `feedbacks/${id}`);
    }
  };

  const signIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-8">
        <div className="p-8 bg-surface border border-white/5 max-w-md w-full flex flex-col gap-6">
          <MessageSquare size={48} className="text-primary mx-auto" />
          <div>
            <h2 className="font-headline text-3xl font-black italic uppercase tracking-tighter mb-2">Login Required</h2>
            <p className="font-body text-slate-400 text-sm">Please sign in with Google to submit feedback and participate in the community.</p>
          </div>
          <button 
            onClick={signIn}
            className="w-full py-4 bg-primary text-black font-label font-black uppercase tracking-widest text-[12px] hover:bg-secondary transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-4xl">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline text-4xl lg:text-5xl font-black italic tracking-tighter text-on-surface uppercase mb-2 leading-none">
            Feedback <span className="text-secondary">Hub</span>
          </h2>
          <p className="font-body text-slate-400 text-sm lg:text-base">Help us shape the future of high-altitude media production.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAdminView(!isAdminView)}
            className={`flex items-center gap-2 px-6 py-2 border font-label text-[10px] font-black uppercase tracking-widest transition-colors ${isAdminView ? 'bg-primary text-black border-primary' : 'border-white/20 text-slate-400 hover:border-primary hover:text-white'}`}
          >
            {isAdminView ? <History size={14} /> : <ShieldCheck size={14} />}
            {isAdminView ? 'Submit New Feedback' : 'Review Submissions'}
          </button>
        )}
      </section>

      {!isAdminView ? (
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-surface p-10 border border-white/5 space-y-8"
        >
          <div className="space-y-4">
            <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest">Rate your experience</p>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 transition-all ${rating >= star ? 'text-primary scale-110' : 'text-slate-800'}`}
                >
                  <Star fill={rating >= star ? 'currentColor' : 'none'} size={32} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="font-label text-[10px] text-slate-500 uppercase tracking-widest block">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-surface-high border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              >
                <option value="Praise">Praise</option>
                <option value="Bug">Technical Bug</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="font-label text-[10px] text-slate-500 uppercase tracking-widest block">Logged in as</label>
              <div className="px-4 py-3 bg-surface-high/50 border border-white/5 text-sm text-slate-400 select-none italic">
                {user.email}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="font-label text-[10px] text-slate-500 uppercase tracking-widest block">Your Message</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what's on your mind... Improvements, critiques, or crazy ideas."
              rows={5}
              className="w-full bg-surface-high border border-white/10 px-4 py-4 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto px-12 py-4 bg-primary text-black font-label font-black uppercase tracking-[0.2em] text-[12px] hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? 'Transmitting Data...' : 'Submit Feedback'}
          </button>
        </motion.form>
      ) : (
        <div className="space-y-6">
          {feedbacks.length === 0 ? (
            <div className="py-20 text-center text-slate-500 border border-dashed border-white/10">No feedback submissions yet.</div>
          ) : (
            feedbacks.map((f) => (
              <motion.div 
                key={f.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-surface p-6 border border-white/5 flex flex-col gap-4 relative group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="flex text-primary">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill={f.rating >= s ? 'currentColor' : 'none'} className={f.rating >= s ? '' : 'text-slate-800'} />
                      ))}
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest ${f.category === 'Bug' ? 'bg-red-500/20 text-red-500' : f.category === 'Feature Request' ? 'bg-blue-500/20 text-blue-500' : 'bg-green-500/20 text-green-500'}`}>
                      {f.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-label text-[10px] text-slate-500 uppercase tabular-nums">
                      {f.createdAt?.toDate ? f.createdAt.toDate().toLocaleString() : 'Just now'}
                    </span>
                    <button 
                      onClick={() => handleDelete(f.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-white transition-all p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{f.comment}</p>
                <div className="pt-4 border-t border-white/5 text-[9px] font-mono text-slate-600 flex justify-between">
                  <span>UID: {f.userId}</span>
                  <span>EMAIL: {f.userEmail}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const CampaignsPage = () => {
  const campaigns = [
    { name: 'Everest 2026 Live', reach: '1.2M', progress: 75, status: 'Active' },
    { name: 'Alpine Gear Launch', reach: '450k', progress: 40, status: 'Active' },
    { name: 'Winter Training Series', reach: '890k', progress: 100, status: 'Completed' },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-headline text-4xl lg:text-5xl font-black italic tracking-tighter text-on-surface uppercase mb-2 leading-none">
          Deployment <span className="text-primary">Campaigns</span>
        </h2>
        <p className="font-body text-slate-400 max-w-lg text-sm lg:text-base">Orchestrate and monitor multi-platform social campaigns.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <div key={campaign.name} className="bg-surface p-8 border border-white/5 flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-headline text-2xl font-bold">{campaign.name}</h3>
                <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest">Platform: Multi-Channel</p>
              </div>
              <span className={`px-4 py-1 text-[10px] font-label font-black uppercase tracking-widest ${campaign.status === 'Active' ? 'bg-secondary/10 text-secondary' : 'bg-slate-800 text-slate-500'}`}>
                {campaign.status}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between font-label text-[10px] uppercase tracking-widest text-slate-500">
                <span>Campaign Progress</span>
                <span>{campaign.progress}%</span>
              </div>
              <div className="w-full h-2 bg-surface-high">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${campaign.progress}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="flex gap-8">
                <div>
                  <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest">Total Reach</p>
                  <p className="font-headline text-xl font-bold">{campaign.reach}</p>
                </div>
                <div>
                  <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest">Conversions</p>
                  <p className="font-headline text-xl font-bold">12.4k</p>
                </div>
              </div>
              <button className="text-primary hover:text-white flex items-center gap-2 font-label text-[10px] uppercase tracking-widest font-black">
                View Analytics <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('Welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);
  const [assets, setAssets] = useState<Asset[]>([
    { id: 1, type: 'Video', name: 'Summit_Drone_01.mp4', size: '124MB' },
    { id: 2, type: 'Audio', name: 'Wind_Ambiance_Loop.wav', size: '12MB' },
    { id: 3, type: 'Image', name: 'Base_Camp_Sunset.jpg', size: '8MB' },
    { id: 4, type: 'Video', name: 'Climb_Action_POV.mp4', size: '85MB' },
    { id: 5, type: 'Video', name: 'Glacier_Time_Lapse.mp4', size: '210MB' },
    { id: 6, type: 'Audio', name: 'Cinematic_Orchestral.mp3', size: '15MB' },
  ]);
  const [selectedFormat, setSelectedFormat] = useState<Format>('Instagram Reel');
  const [selectedStyle, setSelectedStyle] = useState<Style>('Cinematic Alpinism');
  const [ctaLabel, setCtaLabel] = useState('BOOK NOW');
  const [hashtag, setHashtag] = useState('#KINETIC_FLOW');
  const [handle, setHandle] = useState('@kinetic_global');
  const [accentColor, setAccentColor] = useState('#ff8f70');

  const formats = [
    { id: 'Instagram Reel', icon: MonitorPlay, sub: 'High-Engagement Vertical', ratio: '9:16' },
    { id: 'TikTok Ad', icon: MousePointer2, sub: 'Direct Conversion Logic', ratio: '9:16' },
    { id: 'YouTube Short', icon: Zap, sub: 'Algorithm Optimized', ratio: '9:16' },
    { id: 'LinkedIn Post', icon: Square, sub: 'Professional Square', ratio: '1:1' },
  ] as const;

  const styles = [
    { id: 'Cinematic Alpinism', desc: 'High contrast / Slow mo / Grain', color: 'bg-secondary' },
    { id: 'Fast-Paced Action', desc: 'Snap cuts / Kinetic Blur / Bass boost', color: 'bg-primary' },
    { id: 'Informative Overlay', desc: 'HUD Data / Text tracking / Minimal', color: 'bg-tertiary' },
    { id: 'Brutal Grit', desc: 'Monochrome / Sharp Noise / Raw', color: 'bg-white' },
  ] as const;

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {currentPage === 'Welcome' ? (
          <WelcomePage key="welcome" onEnter={() => setCurrentPage('Dashboard')} />
        ) : (
          <motion.div 
            key="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen"
          >
            <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} user={user} />
            <TopBar onOpenSidebar={() => setIsSidebarOpen(true)} />
            
            <main className="lg:ml-64 mt-20 p-4 lg:p-8 h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {currentPage === 'Dashboard' && (
                  <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <DashboardPage />
                  </motion.div>
                )}
                {currentPage === 'Media Engine' && (
                  <motion.div key="media-engine" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <MediaEnginePage assets={assets} setAssets={setAssets} />
                  </motion.div>
                )}
                {currentPage === 'Sponsorships' && (
                  <motion.div key="sponsorships" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <SponsorshipsPage />
                  </motion.div>
                )}
                {currentPage === 'Timeline' && (
                  <motion.div key="timeline" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <TimelinePage assets={assets} />
                  </motion.div>
                )}
                {currentPage === 'Feedback' && (
                  <motion.div key="feedback" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <FeedbackPage user={user} />
                  </motion.div>
                )}
                {currentPage === 'Campaigns' && (
                  <motion.div key="campaigns" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <CampaignsPage />
                  </motion.div>
                )}
                {currentPage === 'Social Formats' && (
                  <motion.div 
                    key="social-formats"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                  >
                    {/* Left Column */}
                    <div className="lg:col-span-7 space-y-10">
                      <section>
                        <motion.h2 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="font-headline text-4xl lg:text-5xl font-black italic tracking-tighter text-on-surface uppercase mb-2 leading-none"
                        >
                          Template <span className="text-primary">Architect</span>
                        </motion.h2>
                        <p className="font-body text-slate-400 max-w-lg text-sm lg:text-base">
                          Configure your high-velocity social deployment. Select your format, inject the aesthetic, and synchronize branding.
                        </p>
                      </section>

                      {/* 01 // Select Format */}
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-label text-xs tracking-[0.3em] text-primary uppercase font-black">01 // Select Format</h3>
                          <span className="text-[10px] font-label text-slate-600 uppercase tracking-widest hidden sm:block">Ratio Lock Active</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {formats.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => setSelectedFormat(f.id)}
                              className={`group relative aspect-[16/9] sm:aspect-[4/3] p-6 flex flex-col justify-between transition-all border-l-2 ${
                                selectedFormat === f.id 
                                  ? 'bg-surface-high border-secondary' 
                                  : 'bg-surface border-transparent hover:bg-surface-high hover:border-secondary/50'
                              }`}
                            >
                              <f.icon size={32} className={`transition-colors ${selectedFormat === f.id ? 'text-white' : 'text-slate-600 group-hover:text-white'}`} />
                              <div className="text-left">
                                <p className="font-headline text-lg font-bold leading-tight">{f.id} ({f.ratio})</p>
                                <p className="font-label text-[10px] text-slate-500 uppercase tracking-widest mt-1">{f.sub}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </section>

                      {/* 02 // Style Preference */}
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-label text-xs tracking-[0.3em] text-primary uppercase font-black">02 // Style Preference</h3>
                          <span className="text-[10px] font-label text-slate-600 uppercase tracking-widest hidden sm:block">4 Presets Loaded</span>
                        </div>
                        <div className="space-y-2">
                          {styles.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => setSelectedStyle(s.id)}
                              className={`flex items-center justify-between p-4 cursor-pointer group transition-colors ${
                                selectedStyle === s.id ? 'bg-surface-high' : 'bg-surface hover:bg-surface-high'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-1.5 ${selectedStyle === s.id ? s.color : 'bg-slate-700 group-hover:' + s.color}`}></div>
                                <span className={`font-headline text-sm font-bold tracking-wide ${selectedStyle === s.id ? 'text-on-surface' : 'text-slate-400 group-hover:text-on-surface'}`}>
                                  {s.id}
                                </span>
                              </div>
                              <span className="font-label text-[10px] text-slate-500 uppercase tracking-widest italic hidden sm:block">{s.desc}</span>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* 03 // CTA & Branding */}
                      <section className="pb-12">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-label text-xs tracking-[0.3em] text-primary uppercase font-black">03 // CTA & Branding</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-surface p-6 lg:p-8">
                          <div className="space-y-6">
                            <div>
                              <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Button Label</label>
                              <input
                                value={ctaLabel}
                                onChange={(e) => setCtaLabel(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 font-headline font-bold text-lg p-0 pb-1"
                                type="text"
                              />
                            </div>
                            <div>
                              <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Primary Hashtag</label>
                              <input
                                value={hashtag}
                                onChange={(e) => setHashtag(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 font-headline font-bold text-lg p-0 pb-1"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="space-y-6">
                            <div>
                              <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Social Handle</label>
                              <input
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary focus:ring-0 font-headline font-bold text-lg p-0 pb-1"
                                type="text"
                              />
                            </div>
                            <div>
                              <label className="block font-label text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">Accent Color</label>
                              <div className="flex gap-2">
                                {['#ff8f70', '#c3f400', '#aaffdc', '#ffffff'].map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setAccentColor(color)}
                                    className={`w-6 h-6 transition-all ${accentColor === color ? 'ring-2 ring-offset-2 ring-offset-background ring-white' : ''}`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* Right Column: Live Preview */}
                    <div className="lg:col-span-5 h-full relative">
                      <div className="lg:sticky lg:top-0 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-label text-xs tracking-[0.3em] text-primary uppercase font-black">Live Engine Preview</h3>
                          <div className="flex gap-2 items-center">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <span className="font-label text-[10px] text-slate-400 uppercase tracking-tighter">Rendering Live</span>
                          </div>
                        </div>

                        {/* Preview Canvas */}
                        <div className={`relative w-full max-w-[380px] mx-auto bg-black overflow-hidden shadow-[0_0_100px_-20px_rgba(195,244,0,0.1)] transition-all duration-500 ${selectedFormat === 'LinkedIn Post' ? 'aspect-square' : 'aspect-[9/16]'}`}>
                          <motion.div 
                            key={selectedStyle}
                            initial={{ scale: 1.1, opacity: 0 }}
                            animate={{ scale: 1.05, opacity: 1 }}
                            transition={{ duration: 0.7 }}
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxrAMLze43-XxHgYtLB4NuyipLtti3LM7xMLi-JP7vtx-EPF8B8D_ogQg3hXvDyVoDbTHeoHlSxdC_t1r7lNdfG1EiWjsx2Fbym2PXWLdB6rueB66-nhJ6Qr4PXkA7n-oXZgQ7p8iBe5sfA4XhYqXBTuTnhug9XNOEwqT23-UDHfKCUkWtgRW54W5mMGAciUp5nhWpz2We4xHIgANnquUdCn6mq7ynr8vZQGOYllIGIthvRPUgv3d9Nb0J9mOlkGaiEm13eQIWpWw')" }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                          </motion.div>

                          {/* HUD Overlays */}
                          <div className="absolute top-10 left-6 right-6">
                            <div className="flex justify-between items-start">
                              <div className="font-headline text-3xl font-black italic text-white tracking-tighter leading-none">
                                PEAK<br />PERFORMANCE
                              </div>
                              <div className="text-right">
                                <p className="font-label text-[10px] text-secondary font-black tracking-widest">ELEV 4.2k</p>
                                <p className="font-label text-[10px] text-white tracking-tighter">V8 GRADE</p>
                              </div>
                            </div>
                          </div>

                          {/* Branding Overlay */}
                          <div className="absolute bottom-12 left-6 right-6 space-y-4">
                            <div className="bg-white text-black font-headline font-black text-xs py-1 px-3 inline-block tracking-widest uppercase">
                              {hashtag}
                            </div>
                            <h4 className="font-headline text-4xl font-bold text-white tracking-tighter leading-none uppercase">
                              The Impossible<br />Ascent.
                            </h4>
                            <div className="flex items-center justify-between pt-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 border border-white/20 flex items-center justify-center">
                                  <Play size={12} className="text-white fill-white" />
                                </div>
                                <span className="font-label text-[10px] text-white/60 tracking-widest uppercase">{handle}</span>
                              </div>
                              <button 
                                className="text-black px-6 py-2 font-headline font-black text-xs tracking-widest transition-colors"
                                style={{ backgroundColor: accentColor }}
                              >
                                {ctaLabel}
                              </button>
                            </div>
                          </div>

                          {/* HUD Elements */}
                          <div className="absolute top-0 bottom-0 left-4 w-px bg-white/10"></div>
                          <div className="absolute top-0 bottom-0 right-4 w-px bg-white/10"></div>
                          <div className="absolute inset-0 border-[16px] border-transparent pointer-events-none">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-secondary"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/30"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/30"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button className="flex-1 border border-outline-variant py-4 font-label text-[10px] font-black tracking-widest uppercase hover:bg-surface-high transition-all">
                            Reset Prefs
                          </button>
                          <button className="flex-1 bg-white text-black py-4 font-label text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-secondary transition-all">
                            Render Output
                            <Rocket size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
