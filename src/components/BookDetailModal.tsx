import React, { useState, useEffect } from 'react';
import { Book, CopyStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import {
  X,
  BookOpen,
  BookmarkPlus,
  Copy,
  Check,
  Layers,
  Trash2,
  Plus,
  FileText,
  Edit3,
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onPlaceReservation: (bookId: number) => Promise<void> | void;
  onUpdateCopyStatus?: (copyId: number, status: CopyStatus) => Promise<void> | void;
  onOpenAddCopy?: (book: Book) => void;
  onOpenEditBook?: (book: Book) => void;
  onDeleteBook?: (bookId: number) => Promise<void> | void;
  openAuthModal: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onPlaceReservation,
  onUpdateCopyStatus,
  onOpenAddCopy,
  onOpenEditBook,
  onDeleteBook,
  openAuthModal,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'availability' | 'citation'>('card');
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (book) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => setIsVisible(true), 15);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'auto';
      };
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
    }
  }, [book]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!book) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 250);
  };

  const authorsList = book.authors?.map((a) => a.name).join(', ') || 'Chưa rõ tác giả';

  const getCitation = (format: 'APA' | 'MLA' | 'CHICAGO') => {
    const year = book.publicationYear || 'n.d.';
    const title = book.title;
    const publisher = book.publisher?.name || 'Thư viện OS';
    const firstAuthor = book.authors?.[0]?.name || 'Tác giả';

    if (format === 'APA') {
      return `${firstAuthor} (${year}). ${title}${book.subtitle ? `: ${book.subtitle}` : ''}. ${publisher}.`;
    }
    if (format === 'MLA') {
      return `${firstAuthor}. ${title}. ${publisher}, ${year}.`;
    }
    return `${firstAuthor}. ${title}. ${publisher}, ${year}.`;
  };

  const handleCopyCitation = async (format: 'APA' | 'MLA' | 'CHICAGO') => {
    const text = getCitation(format);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCitation(format);
      toast.success(`Đã sao chép trích dẫn ${format}!`, 'Đã sao chép');
      setTimeout(() => setCopiedCitation(null), 2000);
    } catch {
      toast.error('Không thể sao chép trích dẫn.');
    }
  };

  const handleReserve = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsReserving(true);
    try {
      await onPlaceReservation(book.id);
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-200 cursor-pointer ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Side Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
        <aside
          className={`w-screen max-w-2xl bg-[#0d1322] border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
            isVisible ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Chi Tiết Đầu Sách
                </h3>
                <p className="text-xs font-mono text-slate-400">ISBN: {book.isbn}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 px-6 bg-slate-900/50 text-xs gap-6 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`py-3 font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'card'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Thông tin chung</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('availability')}
              className={`py-3 font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'availability'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Bản sao vật lý ({book.availableCopies}/{book.totalCopies})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('citation')}
              className={`py-3 font-semibold transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'citation'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Trích dẫn học thuật</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Banner */}
            <div className="ui-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full shrink-0 ${book.availableCopies > 0 ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse' : 'bg-rose-500'}`} />
                <div>
                  <span className="font-semibold text-sm text-white">
                    {book.availableCopies > 0 ? 'Có sẵn để mượn' : 'Hiện đã mượn hết'}
                  </span>
                  <p className="text-xs text-slate-400">
                    {book.availableCopies > 0
                      ? `Còn ${book.availableCopies} bản sẵn sàng phục vụ bạn đọc tại quầy.`
                      : `Tổng cộng ${book.totalCopies} bản. Bạn có thể đăng ký xếp hàng chờ mượn.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReserve}
                disabled={isReserving}
                className="btn-primary py-2 px-4 text-xs shrink-0 rounded-lg"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{book.availableCopies > 0 ? 'Đặt mượn sách' : 'Xếp hàng chờ'}</span>
              </button>
            </div>

            {/* TAB 1: General Info */}
            {activeTab === 'card' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-5">
                  {book.coverImageUrl && (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-32 h-44 object-cover rounded-xl border border-white/10 shadow-lg shrink-0"
                    />
                  )}

                  <div className="space-y-2 flex-1">
                    <span className="badge badge-blue">
                      {book.category?.name || 'Tổng quát'}
                    </span>
                    <h2 className="text-xl font-bold text-white leading-snug">
                      {book.title}
                    </h2>
                    {book.subtitle && <p className="text-xs text-slate-400">{book.subtitle}</p>}
                    <p className="text-sm text-slate-300">
                      Tác giả: <strong className="text-indigo-300 font-medium">{authorsList}</strong>
                    </p>
                    <p className="text-xs text-slate-400">
                      Nhà xuất bản: {book.publisher?.name || 'LibraryOS Press'} · Năm: {book.publicationYear || '2024'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Số trang: {book.pageCount || 300} trang · Ngôn ngữ: {book.language || 'Tiếng Việt'}
                    </p>
                  </div>
                </div>

                {book.description && (
                  <div className="ui-card p-4 space-y-2 border border-white/10">
                    <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Tóm tắt nội dung</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">{book.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Copies */}
            {activeTab === 'availability' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Danh sách Bản sao Vật lý</h4>
                  {isStaff && onOpenAddCopy && (
                    <button
                      type="button"
                      onClick={() => onOpenAddCopy(book)}
                      className="btn-secondary py-1.5 px-3 text-xs rounded-lg"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Thêm bản sao</span>
                    </button>
                  )}
                </div>

                {(!book.copies || book.copies.length === 0) ? (
                  <div className="ui-card p-6 text-center text-sm text-slate-400 border border-white/10">
                    Chưa có bản sao vật lý nào.
                  </div>
                ) : (
                  <div className="ui-card overflow-hidden divide-y divide-white/10 border border-white/10">
                    {book.copies.map((copy, idx) => (
                      <div key={copy.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-300 bg-slate-900 px-2 py-0.5 rounded border border-white/10">
                              {copy.copyCode}
                            </span>
                            <span className="text-slate-400">Bản #{idx + 1}</span>
                          </div>
                          <p className="text-slate-300">Vị trí giá: {copy.shelfLocation || 'Tầng 1 · Phân khu A'}</p>
                        </div>

                        <div>
                          {isStaff && onUpdateCopyStatus ? (
                            <select
                              value={copy.status}
                              onChange={(e) => onUpdateCopyStatus(copy.id, e.target.value as CopyStatus)}
                              className="ui-input py-1 text-xs cursor-pointer bg-slate-900 border-slate-700 text-white"
                            >
                              <option value="AVAILABLE">CÓ SẴN</option>
                              <option value="BORROWED">ĐANG MƯỢN</option>
                              <option value="RESERVED">ĐÃ ĐẶT</option>
                              <option value="LOST">MẤT</option>
                              <option value="DAMAGED">HƯ HỎNG</option>
                            </select>
                          ) : (
                            <span className={`badge ${
                              copy.status === 'AVAILABLE' ? 'badge-green' : copy.status === 'BORROWED' ? 'badge-yellow' : 'badge-red'
                            }`}>
                              {copy.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Citations */}
            {activeTab === 'citation' && (
              <div className="space-y-4">
                {(['APA', 'MLA', 'CHICAGO'] as const).map((fmt) => (
                  <div key={fmt} className="ui-card p-4 space-y-2 border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">Định dạng {fmt}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCitation(fmt)}
                        className="btn-secondary py-1 px-2.5 text-xs rounded-lg"
                      >
                        {copiedCitation === fmt ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-white/10 select-all">
                      {getCitation(fmt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 bg-slate-900/80">
            <div className="flex items-center gap-2">
              {isAdmin && onDeleteBook && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn xóa "${book.title}"?`)) {
                      onDeleteBook(book.id);
                      handleDismiss();
                    }
                  }}
                  className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-lg font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa sách</span>
                </button>
              )}
              {isStaff && onOpenEditBook && (
                <button
                  type="button"
                  onClick={() => onOpenEditBook(book)}
                  className="btn-secondary py-1.5 px-3 text-xs rounded-lg"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sửa thông tin</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="btn-secondary py-2 px-4 text-xs rounded-lg"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={handleReserve}
                disabled={isReserving}
                className="btn-primary py-2 px-4 text-xs rounded-lg"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{book.availableCopies > 0 ? 'Đặt mượn' : 'Xếp hàng chờ'}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

