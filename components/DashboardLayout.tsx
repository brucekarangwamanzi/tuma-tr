import React, { ReactNode, useState, useEffect } from 'react';
import { Role, SiteContent } from '../types';
import { HomeIcon, PackageIcon, MessageIcon, UsersIcon, ShieldCheckIcon, CogIcon, LogoutIcon, BrainCircuitIcon, MapPinIcon, PlusCircleIcon, MegaphoneIcon, XMarkIcon } from './Icons';
import { getSiteContent } from '../services/api';

interface DashboardLayoutProps {
  userRole: Role;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

const navItems = {
  [Role.USER]: [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'orders', label: 'My Orders', icon: PackageIcon },
    { id: 'new_order', label: 'New Order', icon: PlusCircleIcon },
    { id: 'messages', label: 'Inbox', icon: MessageIcon },
    { id: 'gemini_maps', label: 'Logistics Query', icon: MapPinIcon },
  ],
  [Role.ORDER_PROCESSOR]: [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'orders', label: 'All Orders', icon: PackageIcon },
    { id: 'messages', label: 'User Messages', icon: MessageIcon },
  ],
  [Role.ADMIN]: [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'orders', label: 'Manage Orders', icon: PackageIcon },
    { id: 'messages', label: 'All Messages', icon: MessageIcon },
    { id: 'users', label: 'Manage Users', icon: UsersIcon },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheckIcon },
    { id: 'gemini_thinking', label: 'Advanced Query', icon: BrainCircuitIcon },
  ],
  [Role.SUPER_ADMIN]: [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'orders', label: 'Manage Orders', icon: PackageIcon },
    { id: 'messages', label: 'All Messages', icon: MessageIcon },
    { id: 'users', label: 'Manage Users', icon: UsersIcon },
    { id: 'verifications', label: 'Verifications', icon: ShieldCheckIcon },
    { id: 'cms', label: 'Site Management', icon: CogIcon },
    { id: 'gemini_thinking', label: 'Advanced Query', icon: BrainCircuitIcon },
  ],
};

const RoleBadge: React.FC<{ role: Role }> = ({ role }) => {
    const roleStyles: { [key in Role]: string } = {
        [Role.USER]: 'bg-blue-500 text-blue-100',
        [Role.ORDER_PROCESSOR]: 'bg-green-500 text-green-100',
        [Role.ADMIN]: 'bg-yellow-500 text-yellow-100',
        [Role.SUPER_ADMIN]: 'bg-red-500 text-red-100',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${roleStyles[role]}`}>
            {role.replace('_', ' ')}
        </span>
    );
};

const AnnouncementBanner: React.FC<{ announcement: SiteContent['dashboardAnnouncement'], onDismiss: () => void }> = ({ announcement, onDismiss }) => (
    <div className="bg-cyan-500/20 border-b-2 border-cyan-500/50 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <MegaphoneIcon className="w-6 h-6 text-cyan-300 flex-shrink-0" />
            <p className="text-sm font-medium">{announcement.message}</p>
        </div>
        <button onClick={onDismiss} className="p-1 rounded-full hover:bg-white/10">
            <XMarkIcon className="w-5 h-5"/>
        </button>
    </div>
);


const DashboardLayout: React.FC<DashboardLayoutProps> = ({ userRole, activeView, setActiveView, onLogout, children }) => {
  const items = navItems[userRole];
  const [announcement, setAnnouncement] = useState<SiteContent['dashboardAnnouncement'] | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  
  useEffect(() => {
    const fetchContent = async () => {
        try {
            const content = await getSiteContent();
            if (content.dashboardAnnouncement && content.dashboardAnnouncement.active) {
                setAnnouncement(content.dashboardAnnouncement);
                setShowAnnouncement(true);
            }
        } catch (error) {
            console.error("Failed to fetch site content for announcements:", error);
        }
    };
    fetchContent();
  }, []);

  return (
    <div className="flex h-screen text-white">
      <aside className="w-64 flex-shrink-0 bg-gray-800/50 p-4 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400 mb-8">Tuma-Africa</h1>
          <nav className="space-y-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  activeView === item.id 
                    ? 'bg-cyan-500 text-white shadow-lg' 
                    : 'hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
        >
          <LogoutIcon className="w-5 h-5"/>
          <span>Logout</span>
        </button>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800/30 p-4 shadow-md flex justify-between items-center">
          <h2 className="text-xl font-semibold capitalize">{activeView.replace('_', ' ')}</h2>
          <RoleBadge role={userRole} />
        </header>
        {announcement && showAnnouncement && (
            <AnnouncementBanner announcement={announcement} onDismiss={() => setShowAnnouncement(false)} />
        )}
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;