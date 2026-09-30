import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Book } from '../types/index.ts';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.getBooks({ size: 50 });
        setBooks(res.content || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  const literatureBooks = books.filter(
    (b) =>
      b.category?.name.toLowerCase().includes('literature') ||
      b.category?.name.toLowerCase().includes('fiction') ||
      b.category?.name.toLowerCase().includes('văn học') ||
      b.category?.name.toLowerCase().includes('tiểu thuyết')
  );

  const computingBooks = books.filter(
    (b) =>
      b.category?.name.toLowerCase().includes('computer') ||
      b.category?.name.toLowerCase().includes('programming') ||
      b.category?.name.toLowerCase().includes('software') ||
      b.category?.name.toLowerCase().includes('phần mềm') ||
      b.category?.name.toLowerCase().includes('điện toán')
  );

  const philosophyHistoryBooks = books.filter(
    (b) =>
      b.category?.name.toLowerCase().includes('philosophy') ||
      b.category?.name.toLowerCase().includes('history') ||
      b.category?.name.toLowerCase().includes('triết học') ||
      b.category?.name.toLowerCase().includes('lịch sử') ||
      b.category?.name.toLowerCase().includes('khoa học')
  );

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="ui-card p-6 sm:p-8 space-y-2 border border-white/10">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Bộ Sưu Tập Tuyển Chọn LibraryOS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Danh Mục Sách Tuyển Chọn & Khuyến Đọc
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Các bộ sưu tập sách được tổng hợp và phân loại theo từng chủ đề chuyên sâu bởi đội ngũ ban tuyển chọn thư viện.
        </p>
      </div>

      {/* Collection 1: Computing */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
              BỘ SƯU TẬP 01
            </span>
            <h2 className="text-lg font-bold text-white">
              Kinh Điển Công Nghệ & Phần Mềm
            </h2>
            <p className="text-xs text-slate-400">
              Kiến trúc hệ thống, tư duy lập trình và thuật toán máy tính.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onExploreCategory('Computer Science & Craft')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(computingBooks.length > 0 ? computingBooks.slice(0, 3) : books.slice(0, 3)).map((b) => (
            <div
              key={b.id}
              onClick={() => onOpenBook(b.id)}
              className="ui-card ui-card-hover p-4 cursor-pointer group flex flex-col justify-between space-y-3 border border-white/10"
            >
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-20 bg-slate-950 border border-white/10 rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {b.coverImageUrl ? (
                      <img src={b.coverImageUrl} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ISBN: {b.isbn}
                    </span>
                    <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {b.authors?.map((a) => a.name).join(', ') || 'Chưa rõ tác giả'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {b.description || 'Ấn bản thuộc bộ sưu tập lưu trữ chuyên ngành của thư viện.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className={`badge ${b.availableCopies > 0 ? 'badge-green' : 'badge-gray'}`}>
                  {b.availableCopies > 0 ? `Có sẵn ${b.availableCopies}` : 'Đã mượn'}
                </span>
                <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  Xem chi tiết &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collection 2: Literature */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
              BỘ SƯU TẬP 02
            </span>
            <h2 className="text-lg font-bold text-white">
              Văn Học Kinh Điển & Tiểu Thuyết Tuyển Chọn
            </h2>
            <p className="text-xs text-slate-400">
              Các tác phẩm văn học xuất sắc thuộc nền văn học thế giới.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onExploreCategory('Classic Literature & Fiction')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(literatureBooks.length > 0 ? literatureBooks.slice(0, 3) : books.slice(3, 6)).map((b) => (
            <div
              key={b.id}
              onClick={() => onOpenBook(b.id)}
              className="ui-card ui-card-hover p-4 cursor-pointer group flex flex-col justify-between space-y-3 border border-white/10"
            >
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-20 bg-slate-950 border border-white/10 rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {b.coverImageUrl ? (
                      <img src={b.coverImageUrl} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ISBN: {b.isbn}
                    </span>
                    <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {b.authors?.map((a) => a.name).join(', ') || 'Chưa rõ tác giả'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {b.description || 'Ấn bản thuộc bộ sưu tập lưu trữ chuyên ngành của thư viện.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className={`badge ${b.availableCopies > 0 ? 'badge-green' : 'badge-gray'}`}>
                  {b.availableCopies > 0 ? `Có sẵn ${b.availableCopies}` : 'Đã mượn'}
                </span>
                <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  Xem chi tiết &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collection 3: Philosophy & History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
              BỘ SƯU TẬP 03
            </span>
            <h2 className="text-lg font-bold text-white">
              Triết Học & Lịch Sử Văn Minh
            </h2>
            <p className="text-xs text-slate-400">
              Khảo sát tư tưởng triết học và các diễn biến lịch sử quan trọng.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onExploreCategory('Philosophy & Ethics')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(philosophyHistoryBooks.length > 0 ? philosophyHistoryBooks.slice(0, 3) : books.slice(6, 9)).map((b) => (
            <div
              key={b.id}
              onClick={() => onOpenBook(b.id)}
              className="ui-card ui-card-hover p-4 cursor-pointer group flex flex-col justify-between space-y-3 border border-white/10"
            >
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-20 bg-slate-950 border border-white/10 rounded shrink-0 flex items-center justify-center overflow-hidden">
                    {b.coverImageUrl ? (
                      <img src={b.coverImageUrl} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">
                      ISBN: {b.isbn}
                    </span>
                    <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {b.authors?.map((a) => a.name).join(', ') || 'Chưa rõ tác giả'}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {b.description || 'Ấn bản thuộc bộ sưu tập lưu trữ chuyên ngành của thư viện.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className={`badge ${b.availableCopies > 0 ? 'badge-green' : 'badge-gray'}`}>
                  {b.availableCopies > 0 ? `Có sẵn ${b.availableCopies}` : 'Đã mượn'}
                </span>
                <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  Xem chi tiết &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

