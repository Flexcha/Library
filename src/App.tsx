import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { ToastContainer } from './components/common/ToastContainer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LibraryHome } from './components/LibraryHome.tsx';
import { CatalogBrowse } from './components/CatalogBrowse.tsx';
import { CuratedCollections } from './components/CuratedCollections.tsx';
import { LibraryServices } from './components/LibraryServices.tsx';
import { CirculationDesk } from './components/CirculationDesk.tsx';
import { MyLoans } from './components/MyLoans.tsx';
import { ReservationsView } from './components/ReservationsView.tsx';
import { FinesView } from './components/FinesView.tsx';
import { ReportsDashboard } from './components/ReportsDashboard.tsx';
import { UserManagement } from './components/UserManagement.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { BookOpen, MapPin, Clock, Shield } from 'lucide-react';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogCategoryId, setCatalogCategoryId] = useState('');
  const [targetBookId, setTargetBookId] = useState<number | null>(null);

  const { user } = useAuth();

  const isStaff = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';

  const handleHomeSearch = (query: string, categoryId?: string) => {
    setCatalogQuery(query);
    setCatalogCategoryId(categoryId || '');
    setTargetBookId(null);
    setActiveTab('catalog');
  };

  const handleOpenBook = (bookId: number) => {
    setTargetBookId(bookId);
    setActiveTab('catalog');
  };

  const handleExploreCategory = (categoryName: string) => {
    setCatalogQuery(categoryName);
    setCatalogCategoryId('');
    setTargetBookId(null);
    setActiveTab('catalog');
  };

  const isStaffTab = ['circulation', 'reservations', 'fines', 'dashboard', 'users'].includes(activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-[#f3f4f6]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Staff Banner */}
      {isStaffTab && (
        <div className="bg-[#1e1b4b]/60 border-b border-[#6366f1]/30 backdrop-blur-md px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm">
              <Shield className="w-4 h-4 text-[#818cf8]" />
              <span className="text-[#94a3b8]">Phân Phân Quyền Nghiệp Vụ:</span>
              <span className="text-white font-bold tracking-tight">
                {activeTab === 'circulation' ? 'Bàn Lưu Thông & Cho Mượn'
                  : activeTab === 'reservations' ? 'Quản Lý Hàng Đợi Giữ Sách'
                  : activeTab === 'fines' ? 'Quản Lý Tiền Phạt & Bồi Thường'
                  : activeTab === 'dashboard' ? 'Báo Cáo & Thống Kê'
                  : 'Quản Trị Người Dùng'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-sm font-semibold text-[#818cf8] hover:text-white transition cursor-pointer"
            >
              ← Về Trang Chủ
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <LibraryHome
            onSearch={handleHomeSearch}
            onNavigateTab={setActiveTab}
            onOpenBook={handleOpenBook}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogBrowse
            openAuthModal={() => setIsAuthModalOpen(true)}
            initialQuery={catalogQuery}
            initialCategoryId={catalogCategoryId}
            initialBookId={targetBookId}
          />
        )}

        {activeTab === 'collections' && (
          <CuratedCollections
            onOpenBook={handleOpenBook}
            onExploreCategory={handleExploreCategory}
          />
        )}

        {activeTab === 'services' && (
          <LibraryServices
            openAuthModal={() => setIsAuthModalOpen(true)}
            onExploreCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'my-loans' && user && <MyLoans />}
        {activeTab === 'circulation' && isStaff && <CirculationDesk />}
        {activeTab === 'reservations' && (isStaff || user) && <ReservationsView />}
        {activeTab === 'fines' && (isStaff || user) && <FinesView />}
        {activeTab === 'dashboard' && isStaff && <ReportsDashboard />}
        {activeTab === 'users' && isAdmin && <UserManagement />}
      </main>

      {/* Modern Executive Dark Footer */}
      <footer className="bg-[#0f172a] border-t border-[#1e293b] mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#1e293b]">
            {/* Brand */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">
                  LibraryOS
                </span>
              </div>
              <p className="text-[#94a3b8] text-sm leading-relaxed max-w-sm">
                Hệ thống Quản lý Thư viện Số Doanh nghiệp – Tra cứu, mượn trả, phân tích dữ liệu kho sách thời gian thực.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="badge badge-green font-mono text-xs">
                  ● PostgreSQL Engine Active
                </span>
                <span className="badge badge-blue font-mono text-xs">
                  Prisma ORM
                </span>
              </div>
            </div>

            {/* Hours */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm tracking-tight">Giờ Phục Vụ</h4>
              <ul className="space-y-2 text-[#94a3b8] text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#818cf8]" />
                  <span>Thứ 2 – Thứ 7: 08:00 – 21:00</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#818cf8]" />
                  <span>Chủ Nhật: 10:00 – 18:00</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#818cf8]" />
                  <span>124 Athenaeum, TP. Hồ Chí Minh</span>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm tracking-tight">Danh Mục Tra Cứu</h4>
              <ul className="space-y-2 text-[#94a3b8] text-sm">
                {[
                  { label: 'Tra cứu Catalog', tab: 'catalog' },
                  { label: 'Bộ sưu tập nổi bật', tab: 'collections' },
                  { label: 'Hướng dẫn dịch vụ', tab: 'services' },
                ].map(({ label, tab }) => (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className="hover:text-[#818cf8] transition cursor-pointer"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[#64748b] text-xs">
              © {new Date().getFullYear()} LibraryOS. Toàn quyền bảo lưu.
            </p>
            <div className="flex items-center gap-4 text-[#64748b] text-xs font-mono">
              <span>PostgreSQL · Prisma ORM · Express API · React UI</span>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
