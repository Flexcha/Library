import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../api/client.ts';
import { NotificationItem, UserRole } from '../types/index.ts';
import {
  BookOpen,
  Library,
  BookCopy,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Users,
  Bell,
  LogOut,
  LogIn,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Menu,
  X,
  Compass,
  Building2,
  Sparkles,
  ChevronDown,
  Shield,
  Layers,
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

  const fetchNotifications = async () => {
    if (user) {
      try {
        const notifs = await api.getNotifications();
        setNotifications(notifs);
      } catch {
        // Ignore background polling errors
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Close staff menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (staffMenuRef.current && !staffMenuRef.current.contains(e.target as Node)) {
        setStaffMenuOpen(false);
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

  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'ADMIN';

  const isStaffTabActive = ['circulation', 'reservations', 'fines', 'dashboard', 'users'].includes(activeTab);

  return (
    <header className="bg-[#fcfbf7] border-b border-[#ded5c2] text-stone-900 sticky top-0 z-40 shadow-2xs font-serif-data">
      {/* Upper Library Masthead Ribbon - Clean Operational Status & Persona Simulator */}
      <div className="bg-[#f5efe4] px-4 py-1.5 text-[11px] text-stone-700 border-b border-[#ded5c2]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Library Hours & Operational Notice */}
          <div className="flex items-center gap-2 text-stone-800 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-700" />
            <span className="font-semibold text-stone-900 font-serif">Hôm nay tại Thư viện Athenaeum:</span>
            <span>Các phòng đọc mở cửa 8:00 – 21:00</span>
            <span className="text-stone-400 hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline text-stone-600">124 Đường Athenaeum · Kho Nghiên cứu Tầng 1–4</span>
          </div>

          {/* Perspective Switcher / Demo Role Simulator */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto justify-end">
            <span className="text-[10px] text-stone-600 font-sans font-medium uppercase tracking-wider mr-1 shrink-0">
              Chế độ xem:
            </span>
            <div className="inline-flex rounded-md p-0.5 bg-[#eae2d3] border border-[#d6ccb8] text-[11px]">
              <button
                type="button"
                onClick={() => switchAccount('MEMBER')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
                  user?.role === 'MEMBER'
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="Duyệt với tư cách bạn đọc công cộng có thẻ thư viện"
              >
                Bạn đọc
              </button>
              <button
                type="button"
                onClick={() => switchAccount('LIBRARIAN')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
                  user?.role === 'LIBRARIAN'
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="Truy cập bàn lưu thông & công cụ giám tuyển thủ thư"
              >
                Thủ thư
              </button>
              <button
                type="button"
                onClick={() => switchAccount('ADMIN')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
                  user?.role === 'ADMIN'
                    ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="Toàn quyền quản trị viên thư viện"
              >
                Quản trị viên
              </button>
              <button
                type="button"
                onClick={() => switchAccount('GUEST')}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
                  !user
                    ? 'bg-stone-900 text-white font-semibold shadow-2xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
                title="Duyệt với tư cách khách vãng lai"
              >
                Khách vãng lai
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Masthead: Brand Logo & User Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5 sm:py-4">
          {/* Zone 1: Brand Title & Logo */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer select-none group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-[#92400e] text-white flex items-center justify-center shadow-xs group-hover:bg-[#78350f] transition-all ring-1 ring-[#b45309]/30">
              <Library className="w-5 h-5 sm:w-6 sm:h-6 text-[#fdfbf7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-display font-bold text-xl sm:text-2xl tracking-tight text-stone-900 block leading-tight">
                  Thư viện Athenaeum
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 font-sans mt-0.5">
                Cổng Tra Cứu &amp; Quản Lý Mượn Trả Trực Tuyến
              </p>
            </div>
          </div>

          {/* Right Controls: Patron Card / Profile / Bell / Mobile Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-[#f4f0e6] relative transition cursor-pointer border border-transparent hover:border-[#e6e0d4]"
                  aria-label="Xem thông báo"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#92400e] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e6e0d4] rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-[#e6e0d4] flex items-center justify-between bg-[#fbf9f5]">
                      <span className="text-xs font-semibold text-stone-900 font-serif-display uppercase tracking-wider">
                        Thông báo Thư viện
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-[#92400e] hover:underline font-medium cursor-pointer"
                        >
                          Đánh dấu đã đọc tất cả
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-[#f1ede4]">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-stone-500 font-serif-display">
                          Hiện không có thông báo lưu thông nào.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`p-3 text-xs transition cursor-pointer ${
                              n.isRead ? 'bg-white opacity-70' : 'bg-[#fbf9f5]'
                            } hover:bg-[#f4f0e6]`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-stone-900 capitalize">
                                {n.type.toLowerCase().replace('_', ' ')}
                              </span>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#92400e] shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-stone-600 mt-1 text-[11px] leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-stone-400 mt-1.5 block font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile or Sign-in Action */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div
                  onClick={() => setActiveTab('my-loans')}
                  className="hidden sm:flex flex-col text-right cursor-pointer group"
                >
                  <span className="text-xs font-semibold text-stone-900 group-hover:text-[#92400e] transition">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 uppercase">
                    {user.role === 'ADMIN' ? 'QUẢN TRỊ' : user.role === 'LIBRARIAN' ? 'THỦ THƯ' : 'BẠN ĐỌC'} · #{user.id.toString().padStart(4, '0')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 rounded text-stone-500 hover:text-stone-900 hover:bg-[#f4f0e6] transition cursor-pointer"
                  title="Đăng xuất khỏi tài khoản"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#92400e] hover:bg-[#78350f] text-white text-xs font-medium rounded shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng ký Thẻ / Đăng nhập</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Navigation Menu UNDER THE LOGO */}
      <nav
        aria-label="Menu điều hướng chính"
        className="border-t border-[#ded5c2] bg-[#f8f4eb] shadow-2xs font-sans"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto lg:overflow-visible no-scrollbar py-1 gap-2">
            {/* Primary Tab Navigation links directly beneath logo */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
              {/* 1. Trang Chủ */}
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className={`px-3 py-2 text-xs transition-colors cursor-pointer relative whitespace-nowrap rounded font-medium flex items-center gap-1.5 ${
                  activeTab === 'home'
                    ? 'bg-[#ede5d4] text-[#92400e] font-bold shadow-2xs ring-1 ring-[#d5ccba]'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-[#eee8dc]'
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>Trang Chủ</span>
                {activeTab === 'home' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#92400e] rounded-full" />
                )}
              </button>

              {/* 2. Tra cứu Mục lục (Catalog) */}
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer relative whitespace-nowrap rounded font-medium ${
                  activeTab === 'catalog'
                    ? 'bg-[#ede5d4] text-[#92400e] font-bold shadow-2xs ring-1 ring-[#d5ccba]'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-[#eee8dc]'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tra cứu Mục lục</span>
                {activeTab === 'catalog' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#92400e] rounded-full" />
                )}
              </button>

              {/* 4. Bộ sưu tập Tuyển chọn */}
              <button
                type="button"
                onClick={() => setActiveTab('collections')}
                className={`px-3 py-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer relative whitespace-nowrap rounded font-medium ${
                  activeTab === 'collections'
                    ? 'bg-[#ede5d4] text-[#92400e] font-bold shadow-2xs ring-1 ring-[#d5ccba]'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-[#eee8dc]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bộ sưu tập Tuyển chọn</span>
                {activeTab === 'collections' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#92400e] rounded-full" />
                )}
              </button>

              {/* 5. Hướng dẫn & Dịch vụ */}
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`px-3 py-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer relative whitespace-nowrap rounded font-medium ${
                  activeTab === 'services'
                    ? 'bg-[#ede5d4] text-[#92400e] font-bold shadow-2xs ring-1 ring-[#d5ccba]'
                    : 'text-stone-700 hover:text-stone-900 hover:bg-[#eee8dc]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hướng dẫn &amp; Dịch vụ</span>
                {activeTab === 'services' && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#92400e] rounded-full" />
                )}
              </button>

              {/* 6. Sổ Mượn Bạn đọc (Patron Card Link) */}
              {user && (
                <button
                  type="button"
                  onClick={() => setActiveTab('my-loans')}
                  className={`px-3 py-2 text-xs flex items-center gap-1.5 transition-colors cursor-pointer relative whitespace-nowrap rounded font-medium ${
                    activeTab === 'my-loans'
                      ? 'bg-[#ede5d4] text-[#92400e] font-bold shadow-2xs ring-1 ring-[#d5ccba]'
                      : 'text-stone-700 hover:text-stone-900 hover:bg-[#eee8dc]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Sổ Mượn Bạn đọc</span>
                  {activeTab === 'my-loans' && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#92400e] rounded-full" />
                  )}
                </button>
              )}
            </div>

            {/* Right utility items in the sub-menu bar: Staff Portal & API */}
            <div className="flex items-center space-x-2 shrink-0">
              {/* Staff Desk Dropdown for Librarians/Admins */}
              {isStaff && (
                <div className="relative" ref={staffMenuRef}>
                  <button
                    type="button"
                    onClick={() => setStaffMenuOpen(!staffMenuOpen)}
                    className={`px-3 py-1.5 text-xs font-serif font-semibold rounded border flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                      isStaffTabActive
                        ? 'bg-[#f4eee2] text-[#92400e] border-[#92400e]'
                        : 'bg-[#fcfbf7] text-stone-800 border-[#d5ccba] hover:bg-[#f2ece0]'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-[#92400e]" />
                    <span>Cổng Nhân viên</span>
                    <ChevronDown className="w-3 h-3 text-stone-500" />
                  </button>

                  {staffMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 aged-paper border border-[#ded5c2] rounded-lg shadow-xl py-1.5 z-50 font-serif-data">
                      <div className="px-3 py-1.5 border-b border-[#ded5c2] text-[10px] uppercase font-mono text-stone-500 font-semibold">
                        Nghiệp vụ Lưu thông &amp; Quản trị
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('circulation');
                          setStaffMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-[#f2ece0] hover:text-[#92400e] flex items-center gap-2 cursor-pointer font-serif"
                      >
                        <BookCopy className="w-4 h-4 text-stone-500" />
                        <span>Bàn Lưu thông &amp; Cho mượn</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('reservations');
                          setStaffMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-[#f2ece0] hover:text-[#92400e] flex items-center gap-2 cursor-pointer font-serif"
                      >
                        <CalendarCheck className="w-4 h-4 text-stone-500" />
                        <span>Hàng đợi Giữ sách</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('fines');
                          setStaffMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-[#f2ece0] hover:text-[#92400e] flex items-center gap-2 cursor-pointer font-serif"
                      >
                        <CreditCard className="w-4 h-4 text-stone-500" />
                        <span>Sổ Quản lý Tiền phạt &amp; Phí</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('dashboard');
                          setStaffMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-[#f2ece0] hover:text-[#92400e] flex items-center gap-2 cursor-pointer font-serif"
                      >
                        <BarChart3 className="w-4 h-4 text-stone-500" />
                        <span>Thống kê &amp; Chỉ số Kho lưu</span>
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('users');
                            setStaffMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-[#f2ece0] hover:text-[#92400e] flex items-center gap-2 cursor-pointer border-t border-[#ded5c2] font-serif"
                        >
                          <Users className="w-4 h-4 text-stone-500" />
                          <span>Danh bạ Độc giả &amp; Nhân sự</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#e6e0d4] px-4 pt-3 pb-6 space-y-2 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded font-medium ${
              activeTab === 'home' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
            }`}
          >
            Trang Chủ
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('catalog');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded font-medium ${
              activeTab === 'catalog' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
            }`}
          >
            Tra cứu Mục lục Sách
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('collections');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded font-medium ${
              activeTab === 'collections' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
            }`}
          >
            Bộ sưu tập Tuyển chọn
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('services');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded font-medium ${
              activeTab === 'services' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
            }`}
          >
            Hướng dẫn &amp; Dịch vụ Độc giả
          </button>

          {user && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('my-loans');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded font-medium ${
                activeTab === 'my-loans' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
              }`}
            >
              Thẻ Độc giả &amp; Sổ Mượn Sách
            </button>
          )}

          {isStaff && (
            <div className="pt-2 border-t border-[#f1ede4] space-y-1">
              <span className="text-[10px] font-mono uppercase text-stone-400 px-3">Cổng Nhân viên</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('circulation');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded font-medium ${
                  activeTab === 'circulation' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
                }`}
              >
                Bàn Lưu thông &amp; Cho mượn
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reservations');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded font-medium ${
                  activeTab === 'reservations' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
                }`}
              >
                Hàng đợi Giữ sách
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('fines');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded font-medium ${
                  activeTab === 'fines' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
                }`}
              >
                Quản lý Tiền phạt &amp; Phí
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded font-medium ${
                  activeTab === 'dashboard' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
                }`}
              >
                Báo cáo &amp; Thống kê Lưu hành
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('users');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded font-medium ${
                    activeTab === 'users' ? 'bg-[#f4f0e6] text-[#92400e] font-semibold' : 'text-stone-700'
                  }`}
                >
                  Danh bạ Độc giả &amp; Phân quyền
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
