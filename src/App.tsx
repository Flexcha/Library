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
import { MapPin, Phone, Mail, Clock, Library, Shield } from 'lucide-react';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Search and filter parameters to pass from Home / Collections to Catalog
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogCategoryId, setCatalogCategoryId] = useState('');
  const [targetBookId, setTargetBookId] = useState<number | null>(null);

  const { user } = useAuth();

  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'ADMIN';

  // Handler for searching from the Library Homepage
  const handleHomeSearch = (query: string, categoryId?: string) => {
    setCatalogQuery(query);
    setCatalogCategoryId(categoryId || '');
    setTargetBookId(null);
    setActiveTab('catalog');
  };

  // Handler for opening a specific book from Homepage or Collections
  const handleOpenBook = (bookId: number) => {
    setTargetBookId(bookId);
    setActiveTab('catalog');
  };

  // Handler for exploring a specific category from Collections
  const handleExploreCategory = (categoryName: string) => {
    setCatalogQuery(categoryName);
    setCatalogCategoryId('');
    setTargetBookId(null);
    setActiveTab('catalog');
  };

  const isStaffTab = ['circulation', 'reservations', 'fines', 'dashboard', 'users'].includes(activeTab);

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-stone-900 flex flex-col font-sans selection:bg-[#fef3c7] selection:text-[#78350f]">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Staff View Banner indicator when staff is working on back-office operations */}
      {isStaffTab && (
        <div className="bg-[#f4f0e6] border-b border-[#e6e0d4] py-2 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-700">
              <Shield className="w-4 h-4 text-[#92400e]" />
              <span className="font-semibold text-stone-900">Cổng Quản Trị Nhân Viên:</span>
              <span className="capitalize">{activeTab === 'circulation' ? 'Bàn Lưu Thông & Mượn Trả' : activeTab === 'reservations' ? 'Hàng Đợi Giữ Sách' : activeTab === 'fines' ? 'Quản Lý Tiền Phạt' : activeTab === 'dashboard' ? 'Báo Cáo Hoạt Động' : 'Quản Trị Người Dùng'}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="text-[#92400e] hover:underline font-medium cursor-pointer"
            >
              &larr; Trở về Giao diện Bạn đọc Công cộng
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 1. Public Library Home Front Door */}
        {activeTab === 'home' && (
          <LibraryHome
            onSearch={handleHomeSearch}
            onNavigateTab={setActiveTab}
            onOpenBook={handleOpenBook}
            openAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* 2. Public Catalog Stacks / OPAC */}
        {activeTab === 'catalog' && (
          <CatalogBrowse
            openAuthModal={() => setIsAuthModalOpen(true)}
            initialQuery={catalogQuery}
            initialCategoryId={catalogCategoryId}
            initialBookId={targetBookId}
          />
        )}

        {/* 3. Curated Collections & Reading Lists */}
        {activeTab === 'collections' && (
          <CuratedCollections
            onOpenBook={handleOpenBook}
            onExploreCategory={handleExploreCategory}
          />
        )}

        {/* 5. Visitor Guide & Library Services */}
        {activeTab === 'services' && (
          <LibraryServices
            openAuthModal={() => setIsAuthModalOpen(true)}
            onExploreCatalog={() => setActiveTab('catalog')}
          />
        )}

        {/* 6. Patron Portal: Virtual Library Card & Loans */}
        {activeTab === 'my-loans' && user && <MyLoans />}

        {/* Staff Administration Portals */}
        {activeTab === 'circulation' && isStaff && <CirculationDesk />}

        {activeTab === 'reservations' && (isStaff || user) && <ReservationsView />}

        {activeTab === 'fines' && (isStaff || user) && <FinesView />}

        {activeTab === 'dashboard' && isStaff && <ReportsDashboard />}

        {activeTab === 'users' && isAdmin && <UserManagement />}
      </main>

      {/* Stately Library Footer */}
      <footer className="border-t-2 border-[#b8ac95] bg-[#f4eee2] text-stone-700 py-10 mt-12 text-xs font-serif-data">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#ded5c2]">
            {/* Library Colophon */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded bg-[#92400e] text-white flex items-center justify-center">
                  <Library className="w-4 h-4 text-white" />
                </div>
                <span className="font-serif-display font-bold text-base text-stone-900">
                  Thư viện &amp; Viện Lưu trữ Athenaeum
                </span>
              </div>
              <p className="text-stone-600 leading-relaxed max-w-md text-xs font-serif-data">
                Thư viện nghiên cứu và phục vụ mượn tài liệu học thuật công cộng, thúc đẩy phát triển văn học,
                khoa học điện toán, khoa học tự nhiên và tri thức nhân văn. Mục lục tra cứu tuân thủ chặt chẽ
                tiêu chuẩn phân loại Thập phân Dewey &amp; Thư viện Quốc hội Hoa Kỳ (LOC).
              </p>
              <div className="flex items-center gap-3 text-stone-500 pt-1 text-xs">
                <span>Cổng Thư Viện Mở</span>
                <span>·</span>
                <span>Phục vụ Học Giả &amp; Bạn Đọc</span>
              </div>
            </div>

            {/* Hours & Access */}
            <div className="space-y-2">
              <h4 className="font-serif-display font-semibold text-stone-900 text-sm">Thời Gian &amp; Địa Điểm</h4>
              <ul className="space-y-1.5 text-stone-600 text-xs">
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Thứ Hai – Thứ Bảy: 8:00 – 21:00</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Chủ Nhật: 10:00 – 18:00</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>124 Đường Athenaeum, Quận 1</span>
                </li>
              </ul>
            </div>

            {/* Circulation & Services */}
            <div className="space-y-2">
              <h4 className="font-serif-display font-semibold text-stone-900 text-sm">Liên Kết Nhanh</h4>
              <ul className="space-y-1 text-stone-600 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className="hover:text-[#92400e] hover:underline cursor-pointer font-semibold text-[#92400e]"
                  >
                    Không Gian &amp; Dịch Vụ Thư Viện
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('catalog')}
                    className="hover:text-[#92400e] hover:underline cursor-pointer"
                  >
                    Mục lục Tra cứu Trực tuyến (OPAC)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('collections')}
                    className="hover:text-[#92400e] hover:underline cursor-pointer"
                  >
                    Danh mục Đọc Tuyển chọn &amp; Khuyên đọc
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className="hover:text-[#92400e] hover:underline cursor-pointer"
                  >
                    Nội quy Phòng đọc &amp; Dịch vụ Độc giả
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} Hội đồng Quản trị Thư viện Athenaeum. Toàn quyền bảo lưu.
            </div>
            <div className="flex items-center space-x-4">
              <span>Cổng Thư viện Công cộng</span>
              <span>·</span>
              <span>Tiêu chuẩn Phân loại Dewey &amp; LOC</span>
              <span>·</span>
              <span>Mượn trả &amp; Tiếp cận Phòng Nghiên cứu</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Toast Notifications */}
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
