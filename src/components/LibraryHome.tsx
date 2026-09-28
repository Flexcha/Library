import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Book, Category } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import {
  Search,
  BookOpen,
  Library,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Users,
  Building2,
  Compass,
  FileText,
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
  const toast = useToast();

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
    <div className="space-y-12 pb-8 font-serif-data">
      {/* 1. Grand Editorial Library Hero Section */}
      <section className="relative overflow-hidden bg-white border border-[#e6e0d4] rounded-xl p-8 sm:p-12 text-stone-900 library-card-emboss">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#92400e] tracking-wider uppercase">
            <Library className="w-3.5 h-3.5" />
            <span>Cổng Thông Tin &amp; Tra Cứu Thư Viện</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-serif-display tracking-tight text-stone-900 leading-[1.12] text-balance">
            Thánh Đường Văn Chương, Nghiên Cứu &amp; Khai Phóng Trí Tuệ
          </h1>

          <p className="drop-cap text-stone-700 text-sm sm:text-base leading-relaxed max-w-2xl font-serif">
            Chào mừng bạn đọc đến với Thư viện Athenaeum. Nơi hội tụ các trước tác văn chương kinh điển,
            nghệ thuật điện toán, khoa học tự nhiên và tri thức nhân loại. Tra cứu hàng ngàn thư mục lưu trữ,
            trải nghiệm không gian đọc nghiên cứu thanh tịnh, và quản lý mượn trả bằng thẻ bạn đọc số.
          </p>

          {/* Central Catalog Search Station */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm mục lục theo tựa đề, tác giả, chủ đề hoặc mã số ISBN..."
                  className="w-full pl-11 pr-4 py-3 bg-[#faf7ef] border border-[#dcd6c8] focus:border-[#92400e] focus:bg-white rounded text-stone-900 placeholder:text-stone-400 text-xs sm:text-sm transition outline-none shadow-2xs font-serif"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#92400e] hover:bg-[#78350f] text-white font-medium rounded text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
              >
                <span>Tra Cứu Mục Lục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Subject Discovery Links (Unboxed Editorial Links) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs text-stone-600">
            <span className="font-semibold text-stone-800 font-serif">Chủ đề Phổ biến:</span>
            {categories.slice(0, 5).map((cat, idx) => (
              <React.Fragment key={cat.id}>
                {idx > 0 && <span className="text-stone-300 select-none" aria-hidden="true">·</span>}
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="hover:text-[#92400e] hover:underline transition-colors cursor-pointer text-stone-700 font-serif"
                >
                  {cat.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Live Reading Rooms Operational Status Strip */}
        <div className="mt-10 pt-6 border-t border-[#f1ede4] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-stone-600 font-serif-data">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-700 shrink-0" />
            <div>
              <span className="font-semibold text-stone-900 block font-serif">Mở Cửa Hôm Nay</span>
              <span className="tabular-nums">8:00 – 21:00 (Phòng đọc &amp; Kho sách)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#92400e] shrink-0" />
            <div>
              <span className="font-semibold text-stone-900 block font-serif">Trụ Sở &amp; Các Tầng Kho</span>
              <span>124 Đường Athenaeum · Tầng 1–4</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#92400e] shrink-0" />
            <div>
              <span className="font-semibold text-stone-900 block font-serif">Đặc Quyền Mượn Sách</span>
              <span className="tabular-nums">14 ngày mỗi lượt · 2 lần gia hạn online</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Patron Quick Action Stations with Editorial Numbering */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 01 / CATALOGUE */}
        <div
          onClick={() => onNavigateTab('catalog')}
          className="bg-white border border-[#e6e0d4] hover:border-[#92400e] rounded-lg p-5 shadow-2xs hover:shadow-xs transition-colors cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#92400e] uppercase tracking-wider block font-semibold">
              01 / MỤC LỤC SÁCH
            </span>
            <h3 className="font-bold font-serif-display text-stone-900 text-base group-hover:text-[#92400e] transition-colors">
              Kho Sách &amp; Thư Mục
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed font-serif">
              Tra cứu sách lưu hành, chuyên khảo và kiểm tra vị trí tài liệu trên giá.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#92400e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Vào Kho Sách</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 02 / LIBRARY SERVICES & READING ROOMS */}
        <div
          onClick={() => onNavigateTab('services')}
          className="bg-white border border-[#e6e0d4] hover:border-[#92400e] rounded-lg p-5 shadow-2xs hover:shadow-xs transition-colors cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block font-medium">
              02 / KHÔNG GIAN &amp; DỊCH VỤ
            </span>
            <h3 className="font-bold font-serif-display text-stone-900 text-base group-hover:text-[#92400e] transition-colors">
              Phòng Đọc &amp; Dịch Vụ Bạn Đọc
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed font-serif">
              Hướng dẫn tham quan 4 tầng phòng đọc học thuật, giờ mở cửa, không gian nghiên cứu và quy định lưu thông.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#92400e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Xem Hướng Dẫn &amp; Dịch Vụ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 03 / PATRON CARD */}
        <div
          onClick={() => (user ? onNavigateTab('my-loans') : openAuthModal())}
          className="bg-white border border-[#e6e0d4] hover:border-[#92400e] rounded-lg p-5 shadow-2xs hover:shadow-xs transition-colors cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#92400e] uppercase tracking-wider block font-semibold">
              03 / THẺ ĐỘC GIẢ
            </span>
            <h3 className="font-bold font-serif-display text-stone-900 text-base group-hover:text-[#92400e] transition-colors">
              {user ? 'Sổ Mượn Bạn Đọc' : 'Đăng Ký Làm Thẻ'}
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed font-serif">
              {user
                ? 'Kiểm tra sách đang mượn, hạn trả, gia hạn online và theo dõi hàng đợi.'
                : 'Thẻ miễn phí dành cho học giả, nghiên cứu sinh và bạn đọc yêu sách.'}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#92400e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>{user ? 'Mở Thẻ Độc Giả' : 'Đăng Ký Thành Viên'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 04 / CURATORIAL */}
        <div
          onClick={() => onNavigateTab('collections')}
          className="bg-white border border-[#e6e0d4] hover:border-[#92400e] rounded-lg p-5 shadow-2xs hover:shadow-xs transition-colors cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#92400e] uppercase tracking-wider block font-semibold">
              04 / GIÁM TUYỂN
            </span>
            <h3 className="font-bold font-serif-display text-stone-900 text-base group-hover:text-[#92400e] transition-colors">
              Danh Mục Tuyển Chọn
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed font-serif">
              Lộ trình đọc chuyên đề: Nền tảng Khoa học Máy tính, Văn chương Kinh điển &amp; Triết học.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#92400e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Xem Tuyển Tập</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* 05 / VISITOR GUIDE */}
        <div
          onClick={() => onNavigateTab('services')}
          className="bg-white border border-[#e6e0d4] hover:border-[#92400e] rounded-lg p-5 shadow-2xs hover:shadow-xs transition-colors cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#92400e] uppercase tracking-wider block font-semibold">
              05 / HƯỚNG DẪN
            </span>
            <h3 className="font-bold font-serif-display text-stone-900 text-base group-hover:text-[#92400e] transition-colors">
              Nội Quy &amp; Dịch Vụ
            </h3>
            <p className="text-stone-600 text-xs leading-relaxed font-serif">
              Chỉ dẫn các tầng, quy tắc phòng đọc tĩnh lặng, tra cứu vi phim và hỗ trợ thủ thư.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#92400e] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Xem Hướng Dẫn</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </section>

      {/* 3. Librarian's Curated Recommendations / Featured Stacks */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e6e0d4] pb-3">
          <div>
            <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tuyển Chọn Của Thủ Thư</span>
            </div>
            <h2 className="text-2xl font-bold font-serif-display text-stone-900 tracking-tight">
              Sách Tiêu Biểu Tại Các Kho
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Những tác phẩm kinh điển và trước tác có giá trị học thuật cao sẵn sàng phục vụ bạn đọc
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('catalog')}
            className="text-xs font-semibold text-[#92400e] hover:text-[#78350f] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Xem Toàn Bộ Mục Lục</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#e6e0d4] rounded-lg h-80 animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredBooks.slice(0, 4).map((book) => {
              const hasCopies = book.availableCopies > 0;
              return (
                <div
                  key={book.id}
                  onClick={() => onOpenBook(book.id)}
                  className="bg-white border border-[#e6e0d4] hover:border-[#92400e] rounded-lg overflow-hidden shadow-2xs hover:shadow-xs transition-colors flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Spine Call Number Header */}
                    <div className="bg-[#f5efe4] px-3 py-1.5 border-b border-[#e6e0d4] flex items-center justify-between text-[10px] text-stone-700 font-mono">
                      <span className="font-semibold tracking-wider">MÃ #{book.isbn.slice(-4)}</span>
                      <span className="uppercase text-[9px] tracking-wide text-stone-500">{book.category?.name || 'Tổng quát'}</span>
                    </div>

                    {/* Book Jacket Thumbnail */}
                    <div className="h-48 w-full bg-[#faf7ef] flex items-center justify-center p-3 border-b border-[#e6e0d4] overflow-hidden">
                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="h-full max-w-[80%] object-cover rounded shadow-sm book-spine-shadow group-hover:scale-102 transition duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                          <BookOpen className="w-10 h-10 mb-2 text-stone-400" />
                          <span className="text-[11px] font-serif-display text-stone-600 italic">
                            {book.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Title */}
                    <div className="p-4 space-y-2">
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 tabular-nums font-mono">
                        {book.publicationYear && <span>{book.publicationYear}</span>}
                        {book.publicationYear && book.pageCount && <span aria-hidden="true" className="text-stone-300 font-sans">·</span>}
                        {book.pageCount && <span>{book.pageCount} trang</span>}
                        {book.language && <span aria-hidden="true" className="text-stone-300 font-sans">·</span>}
                        {book.language && <span className="font-serif">{book.language}</span>}
                      </div>

                      <h3 className="font-semibold text-stone-900 font-serif-display text-base leading-snug line-clamp-2 group-hover:text-[#92400e] transition-colors">
                        {book.title}
                      </h3>

                      <p className="text-xs text-stone-600 font-serif line-clamp-1">
                        {book.authors.map((a) => a.name).join(', ') || 'Nhiều tác giả'}
                      </p>

                      {book.description && (
                        <p className="text-xs text-stone-500 font-serif line-clamp-2 leading-relaxed pt-1">
                          {book.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Availability Footnote & Action */}
                  <div className="p-4 pt-0">
                    <div className="pt-2.5 border-t border-[#f1ede4] flex items-center justify-between text-xs font-serif-data">
                      <span
                        className={`font-medium flex items-center gap-1.5 text-[11px] ${
                          hasCopies ? 'text-emerald-800' : 'text-amber-900'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            hasCopies ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        />
                        <span className="tabular-nums">
                          {hasCopies ? `Còn ${book.availableCopies} cuốn trên giá` : 'Đang trong hàng đợi'}
                        </span>
                      </span>

                      <span className="text-xs font-semibold text-[#92400e] group-hover:underline flex items-center gap-1">
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Explore Collections by Subject Stacks */}
      <section className="bg-white border border-[#e6e0d4] rounded-xl p-8 shadow-2xs space-y-6">
        <div className="border-b border-[#f1ede4] pb-4">
          <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Quy Chuẩn Phân Loại &amp; Ngành Tri Thức</span>
          </div>
          <h2 className="text-2xl font-bold font-serif-display text-stone-900 tracking-tight">
            Khám Phá Sách Theo Chuyên Ngành
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Các kho sách được sắp xếp theo chuẩn phân loại quốc tế. Chọn chuyên ngành để khảo sát tài liệu:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="p-4 rounded-lg bg-[#fbf9f5] border border-[#e6e0d4] hover:border-[#92400e] hover:bg-white transition cursor-pointer group flex flex-col justify-between space-y-2"
            >
              <div>
                <span className="text-[10px] font-mono text-stone-400 block uppercase">
                  PHÂN KHU {String(cat.id).padStart(2, '0')}
                </span>
                <h3 className="font-semibold text-stone-900 font-serif-display text-sm group-hover:text-[#92400e] transition">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-stone-500 text-xs line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </div>
              <span className="text-[11px] font-medium text-[#92400e] flex items-center gap-1 group-hover:translate-x-1 transition pt-1">
                <span>Duyệt Kho Sách</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Library Services & Reading Room Guidelines */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#e6e0d4] rounded-lg p-6 shadow-2xs space-y-3">
          <div className="w-8 h-8 rounded bg-[#f4f0e6] text-[#92400e] flex items-center justify-center">
            <BookmarkCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold font-serif-display text-stone-900 text-base">
            Quy Định Mượn Trả &amp; Lưu Hành
          </h3>
          <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#92400e] font-bold">•</span>
              <span><strong>Hạn Mượn 14 Ngày:</strong> Thời hạn tiêu chuẩn cho toàn bộ sách được phép lưu hành.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#92400e] font-bold">•</span>
              <span><strong>Tối Đa 2 Lần Gia Hạn:</strong> Gia hạn sách trực tuyến nếu tài liệu chưa có bạn đọc khác đặt trước.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#92400e] font-bold">•</span>
              <span><strong>Giữ Sách Đặt Trước:</strong> Sách trả về sẽ được giữ tại bàn thủ thư trong 3 ngày làm việc.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-[#e6e0d4] rounded-lg p-6 shadow-2xs space-y-3">
          <div className="w-8 h-8 rounded bg-[#f4f0e6] text-[#92400e] flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="font-bold font-serif-display text-stone-900 text-base">
            Phòng Đọc &amp; Buồng Nghiên Cứu
          </h3>
          <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#92400e] font-bold">•</span>
              <span><strong>Đại Sảnh Đọc Sách (Tầng 1):</strong> Bàn đọc mở tràn ngập ánh sáng tự nhiên từ cửa vòm.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#92400e] font-bold">•</span>
              <span><strong>Buồng Đọc Yên Tĩnh (Tầng 2):</strong> Buồng cá nhân trang bị cổng sạc điện &amp; wifi tốc độ cao.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#92400e] font-bold">•</span>
              <span><strong>Kho Bản Thảo Quý Hiếm (Tầng 4):</strong> Phòng đọc giám sát đặc biệt dành cho tài liệu cổ.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-[#e6e0d4] rounded-lg p-6 shadow-2xs space-y-3">
          <div className="w-8 h-8 rounded bg-[#f4f0e6] text-[#92400e] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="font-bold font-serif-display text-stone-900 text-base">
            Dịch Vụ Hỗ Trợ Nghiên Cứu
          </h3>
          <ul className="text-xs text-stone-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-[#92400e] font-bold">•</span>
              <span><strong>Tư Vấn Thủ Thư:</strong> Các chuyên viên thư viện hướng dẫn tra cứu mục lục và trích dẫn khoa học.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#92400e] font-bold">•</span>
              <span><strong>Mượn Liên Thư Viện:</strong> Yêu cầu mượn tài liệu từ các viện nghiên cứu liên kết.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#92400e] font-bold">•</span>
              <span><strong>Cơ Sở Dữ Liệu Số:</strong> Hỗ trợ truy cập và đối soát nguồn học liệu điện tử chất lượng cao.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 7. Upcoming Literary Events & Cultural Calendar */}
      <section className="bg-white border border-[#e6e0d4] rounded-xl p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1ede4] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Chương Trình Văn Hóa &amp; Tọa Đàm</span>
            </div>
            <h2 className="text-2xl font-bold font-serif-display text-stone-900 tracking-tight">
              Sự Kiện Sắp Diễn Ra
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Các buổi nói chuyện chuyên đề, tọa đàm tác phẩm mở cửa tự do cho bạn đọc có thẻ
            </p>
          </div>
          <span className="text-xs text-stone-500 font-mono">Vé Vào Cửa Miễn Phí</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-4 bg-[#fbf9f5] border border-[#e6e0d4] rounded-lg space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-bold tracking-wider">
              Thứ Năm · 18:00
            </span>
            <h3 className="font-bold text-stone-900 font-serif-display text-sm">
              Tọa đàm: Cấu trúc Triết học trong Văn học Hiện thực
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Thảo luận các tư tưởng triết học nền tảng của văn hào Tolstoy và Dostoevsky. Điều phối bởi GS. Elena Vance tại Đại Sảnh Đọc.
            </p>
            <div className="text-[11px] text-stone-500 pt-1">
              Địa điểm: <strong>Đại Sảnh Đọc, Tầng 1</strong>
            </div>
          </div>

          <div className="p-4 bg-[#fbf9f5] border border-[#e6e0d4] rounded-lg space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-bold tracking-wider">
              Thứ Bảy · 14:00
            </span>
            <h3 className="font-bold text-stone-900 font-serif-display text-sm">
              Nghệ thuật &amp; Mã nguồn: Nền tảng Unix &amp; C Cổ điển
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Nhìn lại nguyên lý thiết kế thanh lịch của Kernighan &amp; Ritchie và tinh thần thủ công trong kỹ nghệ phần mềm.
            </p>
            <div className="text-[11px] text-stone-500 pt-1">
              Địa điểm: <strong>Buồng Kỹ thuật số A, Tầng 2</strong>
            </div>
          </div>

          <div className="p-4 bg-[#fbf9f5] border border-[#e6e0d4] rounded-lg space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-bold tracking-wider">
              Thứ Ba Tuần Tới · 19:00
            </span>
            <h3 className="font-bold text-stone-900 font-serif-display text-sm">
              Triển lãm Lưu trữ: Nghệ thuật Đóng sách &amp; Kiểu chữ Cổ
            </h3>
            <p className="text-stone-600 leading-relaxed">
              Trưng bày các ấn bản thế kỷ 19 đóng bìa da thủ công và giới thiệu phương pháp bảo tồn giấy cổ không axit.
            </p>
            <div className="text-[11px] text-stone-500 pt-1">
              Địa điểm: <strong>Phòng Trưng bày Phía Tây, Tầng 4</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Patron Inscription / Library Card Invitation Banner */}
      {!user && (
        <section className="bg-[#f4f0e6] border border-[#e6e0d4] rounded-xl p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider">
              <Library className="w-4 h-4" />
              <span>Đăng Ký Thành Viên Độc Giả</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900">
              Nhận Thẻ Thư Viện Athenaeum Ngay Hôm Nay
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Thẻ thư viện cấp miễn phí cho mọi nghiên cứu sinh, sinh viên và độc giả. Thành viên có thẻ được mượn sách 14 ngày,
              gia hạn online 2 lần và đăng ký giữ buồng đọc nghiên cứu yên tĩnh.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={openAuthModal}
              className="px-6 py-3 bg-[#92400e] hover:bg-[#78350f] text-white font-medium rounded text-sm transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Library className="w-4 h-4" />
              <span>Đăng Ký Thẻ Bạn Đọc</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('catalog')}
              className="px-6 py-3 bg-white hover:bg-[#fbf9f5] border border-[#dcd6c8] text-stone-800 font-medium rounded text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Khám Phá Kho Sách</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
