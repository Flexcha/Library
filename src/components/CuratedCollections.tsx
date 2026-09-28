import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Book } from '../types/index.ts';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Library,
  BookmarkCheck,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

interface CuratedCollectionsProps {
  onOpenBook: (bookId: number) => void;
  onExploreCategory: (categoryName: string) => void;
}

export const CuratedCollections: React.FC<CuratedCollectionsProps> = ({
  onOpenBook,
  onExploreCategory,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await api.getBooks({ size: 50 });
        setBooks(res.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Curate collections based on categories or keywords
  const literatureBooks = books.filter(
    (b) =>
      b.category?.name.toLowerCase().includes('literature') ||
      b.category?.name.toLowerCase().includes('fiction') ||
      b.category?.name.toLowerCase().includes('văn học') ||
      b.category?.name.toLowerCase().includes('classics') ||
      b.category?.name.toLowerCase().includes('tiểu thuyết')
  );

  const computingBooks = books.filter(
    (b) =>
      b.category?.name.toLowerCase().includes('computer') ||
      b.category?.name.toLowerCase().includes('programming') ||
      b.category?.name.toLowerCase().includes('software') ||
      b.category?.name.toLowerCase().includes('systems') ||
      b.category?.name.toLowerCase().includes('phần mềm') ||
      b.category?.name.toLowerCase().includes('điện toán') ||
      b.category?.name.toLowerCase().includes('algorithms') ||
      b.category?.name.toLowerCase().includes('mathematics')
  );

  const philosophyHistoryBooks = books.filter(
    (b) =>
      b.category?.name.toLowerCase().includes('philosophy') ||
      b.category?.name.toLowerCase().includes('history') ||
      b.category?.name.toLowerCase().includes('triết học') ||
      b.category?.name.toLowerCase().includes('lịch sử') ||
      b.category?.name.toLowerCase().includes('sử liệu') ||
      b.category?.name.toLowerCase().includes('anthropology') ||
      b.category?.name.toLowerCase().includes('ethics') ||
      b.category?.name.toLowerCase().includes('sciences') ||
      b.category?.name.toLowerCase().includes('khoa học')
  );

  return (
    <div className="space-y-10 pb-8">
      {/* Header */}
      <div className="bg-white border border-[#e6e0d4] rounded-lg p-6 sm:p-8 shadow-2xs font-serif-data">
        <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
          <Sparkles className="w-4 h-4" />
          <span>Bộ Sưu Tập Giám Tuyển &amp; Danh Mục Đọc Sách</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-display tracking-tight">
          Bộ Sưu Tập Đặc Biệt &amp; Khuyến Đọc Của Thủ Thư
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
          Các lộ trình đọc theo chủ đề do các thủ thư nghiên cứu cao cấp của Athenaeum giám tuyển.
          Khám phá nền tảng văn học kinh điển, tài liệu công nghệ nền tảng và các cột mốc tư tưởng triết học.
        </p>
      </div>

      {/* Collection 1: Foundational Software Craft & Computing */}
      <section className="space-y-4 font-serif-data">
        <div className="flex items-center justify-between border-b border-[#e6e0d4] pb-2">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-semibold tracking-wider">
              BỘ SƯU TẬP GIÁM TUYỂN I
            </span>
            <h2 className="text-xl font-bold font-serif-display text-stone-900">
              Kinh Điển Điện Toán: Nền Tảng Kiến Trúc &amp; Nghệ Thuật Lập Trình
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Những tác phẩm kinh điển về thiết kế ngôn ngữ lập trình, phân tích thuật toán và hệ thống vượt thời gian.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onExploreCategory('Computer Science & Craft')}
            className="text-xs font-semibold text-[#92400e] hover:underline flex items-center gap-1 cursor-pointer shrink-0 font-serif"
          >
            <span>Xem Toàn Bộ Kho</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(computingBooks.length > 0 ? computingBooks.slice(0, 3) : books.slice(0, 3)).map((b) => (
            <div
              key={b.id}
              onClick={() => onOpenBook(b.id)}
              className="bg-white border border-[#e6e0d4] hover:border-[#b45309] rounded-lg p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group cursor-pointer space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-24 bg-[#fbf9f5] border border-[#e6e0d4] rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {b.coverImageUrl ? (
                      <img src={b.coverImageUrl} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase block">
                      MÃ #{b.isbn.slice(-4)}
                    </span>
                    <h3 className="font-semibold text-stone-900 font-serif-display text-sm leading-snug group-hover:text-[#92400e] transition">
                      {b.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      {b.authors.map((a) => a.name).join(', ')}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                  {b.description || 'Tác phẩm trụ cột được bảo tồn trong bộ sưu tập nghiên cứu vĩnh viễn của Athenaeum.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f1ede4] flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{b.availableCopies > 0 ? `Còn ${b.availableCopies} bản` : 'Đang mượn'}</span>
                </span>
                <span className="text-xs font-semibold text-[#92400e] group-hover:underline">
                  Xem Chi Tiết &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collection 2: Masterpieces of Literature */}
      <section className="space-y-4 font-serif-data">
        <div className="flex items-center justify-between border-b border-[#e6e0d4] pb-2">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-semibold tracking-wider">
              BỘ SƯU TẬP GIÁM TUYỂN II
            </span>
            <h2 className="text-xl font-bold font-serif-display text-stone-900">
              Kiệt Tác Văn Học: Những Tiểu Thuyết Thế Kỷ XIX &amp; XX
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Những tác phẩm kinh điển trường tồn của văn học thế giới soi rọi tâm hồn con người và nghệ thuật tự sự.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onExploreCategory('Classic Literature & Fiction')}
            className="text-xs font-semibold text-[#92400e] hover:underline flex items-center gap-1 cursor-pointer shrink-0 font-serif"
          >
            <span>Xem Toàn Bộ Kho</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(literatureBooks.length > 0 ? literatureBooks.slice(0, 3) : books.slice(3, 6)).map((b) => (
            <div
              key={b.id}
              onClick={() => onOpenBook(b.id)}
              className="bg-white border border-[#e6e0d4] hover:border-[#b45309] rounded-lg p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group cursor-pointer space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-24 bg-[#fbf9f5] border border-[#e6e0d4] rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {b.coverImageUrl ? (
                      <img src={b.coverImageUrl} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase block">
                      MÃ #{b.isbn.slice(-4)}
                    </span>
                    <h3 className="font-semibold text-stone-900 font-serif-display text-sm leading-snug group-hover:text-[#92400e] transition">
                      {b.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      {b.authors.map((a) => a.name).join(', ')}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                  {b.description || 'Tác phẩm văn học thiết yếu trong các bản in hiệu đính kinh điển.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f1ede4] flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{b.availableCopies > 0 ? `Còn ${b.availableCopies} bản` : 'Đang mượn'}</span>
                </span>
                <span className="text-xs font-semibold text-[#92400e] group-hover:underline">
                  Xem Chi Tiết &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collection 3: History & Philosophy */}
      <section className="space-y-4 font-serif-data">
        <div className="flex items-center justify-between border-b border-[#e6e0d4] pb-2">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-semibold tracking-wider">
              BỘ SƯU TẬP GIÁM TUYỂN III
            </span>
            <h2 className="text-xl font-bold font-serif-display text-stone-900">
              Đời Sống Tự Vấn: Triết Học, Lịch Sử Văn Minh &amp; Đạo Đức Học
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Khảo sát lịch sử và những trăn trở đạo đức từ thời cổ đại đến tư tưởng đương đại.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onExploreCategory('Philosophy & Ethics')}
            className="text-xs font-semibold text-[#92400e] hover:underline flex items-center gap-1 cursor-pointer shrink-0 font-serif"
          >
            <span>Xem Toàn Bộ Kho</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(philosophyHistoryBooks.length > 0 ? philosophyHistoryBooks.slice(0, 3) : books.slice(6, 9)).map((b) => (
            <div
              key={b.id}
              onClick={() => onOpenBook(b.id)}
              className="bg-white border border-[#e6e0d4] hover:border-[#b45309] rounded-lg p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group cursor-pointer space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-24 bg-[#fbf9f5] border border-[#e6e0d4] rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {b.coverImageUrl ? (
                      <img src={b.coverImageUrl} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase block">
                      MÃ #{b.isbn.slice(-4)}
                    </span>
                    <h3 className="font-semibold text-stone-900 font-serif-display text-sm leading-snug group-hover:text-[#92400e] transition">
                      {b.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      {b.authors.map((a) => a.name).join(', ')}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-500 line-clamp-3 leading-relaxed">
                  {b.description || 'Khám phá triết học kinh điển và hiện đại về tri thức và công lý.'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#f1ede4] flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>{b.availableCopies > 0 ? `Còn ${b.availableCopies} bản` : 'Đang mượn'}</span>
                </span>
                <span className="text-xs font-semibold text-[#92400e] group-hover:underline">
                  Xem Chi Tiết &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
