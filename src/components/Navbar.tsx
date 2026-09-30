import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/client.ts';
import { NotificationItem } from '../types/index.ts';
import {
  BookOpen,
  BookCopy,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Users,
  Bell,
  LogOut,
  LogIn,
  Clock,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Shield,
  Home,
  Layers,
  CheckCheck,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, openAuthModal }) => {
  const { user, logout, switchAccount } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [staffMenuOpen, setStaffMenuOpen] = useState(false);
  const staffMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (user) {
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
      } catch {
        // Polling errors ignored
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (staffMenuRef.current && !staffMenuRef.current.contains(e.target as Node)) {
        setStaffMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const isStaff = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';
  const isStaffTabActive = ['circulation', 'my-loans', 'reservations', 'fines', 'dashboard', 'users'].includes(activeTab);

  const navTabClass = (tab: string) =>
    `relative px-3.5 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
      activeTab === tab
        ? 'text-white bg-[#6366f1]/20 border border-[#6366f1]/40 shadow-lg shadow-[#6366f1]/15'
        : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/10 shadow-xl">
      {/* Demo Switcher Sub-bar */}
      <div className="bg-[#0b0f19]/80 border-b border-white/5 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs text-white font-semibold">LibraryOS Pro</span>
            <span className="text-white/20 text-xs">·</span>
            <span className="text-xs text-[#94a3b8] font-mono">PostgreSQL Database Connected</span>
          </div>

          {/* Quick Account Switcher for Demo */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#94a3b8] font-medium mr-1 hidden sm:inline">Chuyển tài khoản demo:</span>
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
              {([
                { role: 'MEMBER', label: 'Bạn đọc' },
                { role: 'LIBRARIAN', label: 'Thủ thư' },
                { role: 'ADMIN', label: 'Admin' },
                { role: 'SUPERADMIN', label: 'SuperAdmin' },
                { role: 'GUEST', label: 'Khách' },
              ] as const).map(({ role, label }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => switchAccount(role)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    (role === 'GUEST' && !user) || user?.role === role
                      ? 'bg-gradient-to-r from-[#6366f1] to-[#3b82f6] text-white shadow-md'
                      : role === 'SUPERADMIN'
                      ? 'text-amber-400 hover:text-white hover:bg-amber-500/20'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Logo */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-[#6366f1]/30 transition-transform group-hover:scale-105">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-white font-extrabold text-lg tracking-tight leading-tight">
                LibraryOS
              </div>
              <div className="text-[11px] text-[#818cf8] font-medium leading-tight">Hệ Thống Thư Viện Số</div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 flex-1">
            <button type="button" onClick={() => setActiveTab('home')} className={navTabClass('home')}>
              <Home className="w-4 h-4 text-[#818cf8]" />
              <span>Trang chủ</span>
            </button>
            <button type="button" onClick={() => setActiveTab('catalog')} className={navTabClass('catalog')}>
              <BookOpen className="w-4 h-4 text-[#38bdf8]" />
              <span>Tra cứu sách</span>
            </button>
            <button type="button" onClick={() => setActiveTab('collections')} className={navTabClass('collections')}>
              <Sparkles className="w-4 h-4 text-[#f59e0b]" />
              <span>Bộ sưu tập</span>
            </button>
            <button type="button" onClick={() => setActiveTab('services')} className={navTabClass('services')}>
              <Layers className="w-4 h-4 text-[#a78bfa]" />
              <span>Dịch vụ</span>
            </button>
            {user && !isStaff && (
              <button type="button" onClick={() => setActiveTab('my-loans')} className={navTabClass('my-loans')}>
                <Clock className="w-4 h-4 text-[#34d399]" />
                <span>Phiếu mượn của tôi</span>
              </button>
            )}

            {/* Staff Dropdown */}
            {isStaff && (
              <div className="relative" ref={staffMenuRef}>
                <button
                  type="button"
                  onClick={() => setStaffMenuOpen(!staffMenuOpen)}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                    isStaffTabActive
                      ? 'text-white bg-[#6366f1]/20 border border-[#6366f1]/40 shadow-lg shadow-[#6366f1]/15'
                      : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4 text-[#818cf8]" />
                  <span>Quản Lý Nghiệp Vụ</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${staffMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {staffMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-[#0f172a] border border-[#6366f1]/30 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl">
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#818cf8] border-b border-white/10 mb-1">
                      Bàn Nghiệp Vụ Thủ Thư
                    </div>
                    {[
                      { tab: 'circulation', icon: BookCopy, label: 'Mượn & Trả Sách (Lưu thông)' },
                      { tab: 'my-loans', icon: Clock, label: 'Phiếu Mượn Cá Nhân' },
                      { tab: 'reservations', icon: CalendarCheck, label: 'Quản Lý Đặt Chỗ' },
                      { tab: 'fines', icon: CreditCard, label: 'Xử Lý Tiền Phạt' },
                      { tab: 'dashboard', icon: BarChart3, label: 'Báo Cáo & Thống Kê' },
                    ].map(({ tab, icon: Icon, label }) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => { setActiveTab(tab); setStaffMenuOpen(false); }}
                        className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors cursor-pointer ${
                          activeTab === tab ? 'text-[#818cf8] bg-[#6366f1]/15 font-semibold' : 'text-[#cbd5e1] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#818cf8]" />
                        <span>{label}</span>
                      </button>
                    ))}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => { setActiveTab('users'); setStaffMenuOpen(false); }}
                        className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-3 transition-colors cursor-pointer border-t border-white/10 mt-1 pt-2 ${
                          activeTab === 'users' ? 'text-[#818cf8] bg-[#6366f1]/15 font-semibold' : 'text-[#cbd5e1] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Users className="w-4 h-4 text-[#f59e0b]" />
                        <span>Quản Lý Người Dùng</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Right User Bar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-[#0f172a] border border-[#6366f1]/30 rounded-xl shadow-2xl py-0 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0b0f19]">
                      <span className="text-sm font-bold text-white">Thông báo mới</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 text-xs text-[#818cf8] hover:underline cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Đọc tất cả</span>
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-[#94a3b8]">
                          Không có thông báo mới
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`px-4 py-3 cursor-pointer transition-colors text-sm ${
                              n.isRead ? 'opacity-60 bg-[#0f172a]' : 'bg-[#6366f1]/10'
                            } hover:bg-white/5`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-white text-xs uppercase tracking-wide">
                                {n.type.toLowerCase().replace(/_/g, ' ')}
                              </span>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#6366f1] shrink-0 mt-1" />}
                            </div>
                            <p className="text-[#cbd5e1] text-xs mt-1 leading-relaxed">{n.message}</p>
                            <span className="text-[#64748b] text-[11px] font-mono mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Info / Login Button */}
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white leading-tight">
                    {user.fullName.replace(/\s*\(.*?\)/g, '')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded-lg text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="btn-primary"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0f172a] border-t border-white/10 px-4 py-3 space-y-1">
          {[
            { tab: 'home', icon: Home, label: 'Trang chủ' },
            { tab: 'catalog', icon: BookOpen, label: 'Tra cứu sách' },
            { tab: 'collections', icon: Sparkles, label: 'Bộ sưu tập' },
            { tab: 'services', icon: Layers, label: 'Dịch vụ' },
            ...(user && !isStaff ? [{ tab: 'my-loans', icon: Clock, label: 'Phiếu mượn của tôi' }] : []),
          ].map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab ? 'bg-[#6366f1]/20 text-[#818cf8]' : 'text-[#cbd5e1] hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}

          {isStaff && (
            <div className="pt-2 mt-2 border-t border-white/10">
              <p className="px-3 text-[11px] font-bold text-[#818cf8] uppercase tracking-wider mb-1">Quản lý nghiệp vụ</p>
              {[
                { tab: 'circulation', icon: BookCopy, label: 'Mượn & Trả Sách (Lưu thông)' },
                { tab: 'my-loans', icon: Clock, label: 'Phiếu Mượn Cá Nhân' },
                { tab: 'reservations', icon: CalendarCheck, label: 'Quản Lý Đặt Chỗ' },
                { tab: 'fines', icon: CreditCard, label: 'Xử Lý Tiền Phạt' },
                { tab: 'dashboard', icon: BarChart3, label: 'Báo Cáo Thống Kê' },
                ...(isAdmin ? [{ tab: 'users', icon: Users, label: 'Quản Lý Người Dùng' }] : []),
              ].map(({ tab, icon: Icon, label }) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === tab ? 'bg-[#6366f1]/20 text-[#818cf8]' : 'text-[#cbd5e1] hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
