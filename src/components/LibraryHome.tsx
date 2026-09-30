import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Book, Category } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Search,
  BookOpen,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Bookmark,
  Users,
  Building2,
  BookmarkCheck,
} from 'lucide-react';

interface LibraryHomeProps {
  onSearch: (query: string, categoryId?: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenBook: (bookId: number) => void;
  openAuthModal: () => void;
}

export const LibraryHome: React.FC<LibraryHomeProps> = ({
  onSearch,
  onNavigateTab,
  onOpenBook,
  openAuthModal,
}) => {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [booksRes, catsRes] = await Promise.all([
          api.getBooks({ size: 8 }),
          api.getCategories(),
        ]);
        setFeaturedBooks(booksRes.content || []);
        setCategories(catsRes || []);
      } catch (err) {
        console.error('Failed to load library homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery.trim());
  };

  const handleCategoryClick = (categoryId: number) => {
    onSearch('', String(categoryId));
  };

  return (
    <div className="space-y-10 pb-8">
      {/* 1. Hero Banner */}
      <section className="glass-panel border border-indigo-500/20 rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hệ Thống Thư Viện Số Digital Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Tra cứu, Mượn sách và Quản lý Thư viện Chuyên nghiệp
          </h1>

          <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
            Truy cập hàng ngàn đầu sách học thuật, tài liệu nghiên cứu và ấn phẩm chuyên ngành. Tìm kiếm nhanh chóng, mượn trả dễ dàng.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên sách, tác giả, chủ đề hoặc mã ISBN..."
                  className="ui-input pl-10 pr-4 py-3.5 text-sm rounded-xl bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-400 focus:border-indigo-500 shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="btn-primary py-3.5 px-7 text-sm rounded-xl shrink-0"
              >
                <span>Tìm kiếm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Category Chips */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-medium text-slate-400">Chủ đề phổ biến:</span>
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:border-indigo-500/50 hover:bg-indigo-600/20 hover:text-indigo-200 transition-all cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
          {[
            { icon: BookOpen, label: 'Giờ mở cửa', value: '08:00 – 21:00 (Thứ 2 – T7)' },
            { icon: MapPin, label: 'Địa điểm', value: '124 Athenaeum, TP. Hồ Chí Minh' },
            { icon: Calendar, label: 'Quy định mượn', value: '14 ngày/lần · Gia hạn tối đa 2 lần' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">{label}</div>
                <div className="text-sm font-semibold text-slate-200">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Quick Action Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            tab: 'catalog',
            icon: BookOpen,
            title: 'Tra cứu Catalog',
            desc: 'Tìm kiếm và đặt giữ sách trực tuyến',
          },
          {
            tab: 'collections',
            icon: Sparkles,
            title: 'Bộ sưu tập',
            desc: 'Danh mục sách chuyên đề tuyển chọn',
          },
          {
            tab: 'services',
            icon: Building2,
            title: 'Dịch vụ Thư viện',
            desc: 'Phòng học nhóm, tra cứu tài liệu',
          },
          ...(user
            ? [{
                tab: 'my-loans',
                icon: Bookmark,
                title: 'Phiếu mượn cá nhân',
                desc: 'Theo dõi hạn trả và gia hạn sách',
              }]
            : [{
                tab: '_auth',
                icon: Users,
                title: 'Đăng ký Bạn đọc',
                desc: 'Tạo tài khoản sử dụng dịch vụ',
              }]),
        ].map(({ tab, icon: Icon, title, desc }) => (
          <div
            key={tab}
            onClick={() => tab === '_auth' ? openAuthModal() : onNavigateTab(tab)}
            className="ui-card ui-card-hover p-5 cursor-pointer flex flex-col justify-between gap-4 group border border-white/10"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base mb-1">
                  {title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all">
              <span>Khám phá</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </section>

      {/* 3. Featured Books Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Sách Nổi Bật Mới Nhập Kho
            </h2>
            <p className="text-slate-400 text-sm">Các đầu sách được quan tâm nhiều nhất trong tuần</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('catalog')}
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-800/50 border border-slate-700/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredBooks.map((book) => {
              // Direct access to computed backend fields guarantees exact DB synchronization across pages!
              const totalCopies = book.totalCopies ?? (book.copies?.length || 0);
              const availableCopies = book.availableCopies ?? (book.copies?.filter((c) => c.status === 'AVAILABLE').length || 0);

              return (
                <div
                  key={book.id}
                  onClick={() => onOpenBook(book.id)}
                  className="ui-card ui-card-hover overflow-hidden cursor-pointer group flex flex-col justify-between border border-white/10"
                >
                  {/* Cover image placeholder or img */}
                  <div className="h-48 bg-slate-950/60 border-b border-white/10 flex items-center justify-center relative overflow-hidden p-2">
                    {book.coverImageUrl ? (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="w-full h-full object-cover rounded group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <BookOpen className="w-10 h-10 stroke-1" />
                        <span className="text-[11px] font-mono text-slate-400">{book.isbn}</span>
                      </div>
                    )}
                    {availableCopies === 0 && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="badge badge-red shadow-sm">Đã mượn hết</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between bg-slate-900/60">
                    <div>
                      <h4 className="text-slate-100 text-sm font-semibold line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
                        {book.title}
                      </h4>
                      <p className="text-slate-400 text-xs line-clamp-1 mt-1">
                        {book.authors?.map((a) => a.name).join(', ') || (book as any).bookAuthors?.map((ba: any) => ba.author?.name).join(', ') || 'Chưa rõ tác giả'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <span className={`badge ${availableCopies > 0 ? 'badge-green' : 'badge-red'}`}>
                        {availableCopies > 0 ? `Có sẵn ${availableCopies}` : `Tổng ${totalCopies} bản`}
                      </span>
                      {book.category && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[90px]">{book.category.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Non-user Register CTA */}
      {!user && (
        <section className="glass-panel border border-indigo-500/20 rounded-2xl p-8 text-center space-y-4 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-xl font-bold text-white">Bạn chưa có thẻ thư viện?</h3>
            <p className="text-sm text-slate-300">
              Đăng ký tài khoản trực tuyến để đăng ký mượn sách, giữ chỗ và sử dụng phòng đọc.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={openAuthModal}
              className="btn-primary px-6 rounded-xl"
            >
              <Users className="w-4 h-4" />
              <span>Đăng ký ngay</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('catalog')}
              className="btn-secondary px-6 rounded-xl"
            >
              <span>Tra cứu sách trước</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

