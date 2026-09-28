import React, { useState, useEffect } from 'react';
import { Book, CopyStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import {
  X,
  BookOpen,
  Library,
  Calendar,
  Building2,
  BookmarkPlus,
  Copy,
  Check,
  Printer,
  Barcode,
  Layers,
  Globe,
  Clock,
  Trash2,
  Plus,
  ShieldCheck,
  FileText,
  AlertCircle,
  ExternalLink,
  Tag,
  Hash,
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

// Generate realistic Dewey Decimal and Library of Congress (LOC) classification
function getArchivalClassification(book: Book) {
  const categoryName = (book.category?.name || '').toLowerCase();
  const authorLastName = book.authors[0]?.name
    ? book.authors[0].name.split(' ').pop()?.slice(0, 3).toUpperCase() || 'ATH'
    : 'ATH';
  const year = book.publicationYear || 2024;

  if (
    categoryName.includes('computer') ||
    categoryName.includes('algorithm') ||
    categoryName.includes('software') ||
    categoryName.includes('technology')
  ) {
    return {
      dewey: `005.13 ${authorLastName}`,
      loc: `QA76.73 .${authorLastName} ${year}`,
      cutter: `.${authorLastName}76`,
      section: 'Computation & Mathematical Sciences Stacks',
      floor: 'Floor 3 · Stacks Row 14 · Bay B',
      subjectHeading: 'Computer science -- Data structures -- Algorithms -- Programming',
    };
  }
  if (
    categoryName.includes('literature') ||
    categoryName.includes('fiction') ||
    categoryName.includes('classic') ||
    categoryName.includes('novel')
  ) {
    return {
      dewey: `823.914 ${authorLastName}`,
      loc: `PR6029 .${authorLastName} ${year}`,
      cutter: `.${authorLastName}82`,
      section: 'Belles-Lettres & Classical Literature Stacks',
      floor: 'Floor 2 · Stacks Row 08 · Bay D',
      subjectHeading: 'Fiction -- World literature -- Modern English prose',
    };
  }
  if (
    categoryName.includes('philosophy') ||
    categoryName.includes('ethics') ||
    categoryName.includes('logic')
  ) {
    return {
      dewey: `190 ${authorLastName}`,
      loc: `B804 .${authorLastName} ${year}`,
      cutter: `.${authorLastName}19`,
      section: 'Philosophy & Humanist Studies Alcove',
      floor: 'Floor 4 · Stacks Row 22 · Bay A',
      subjectHeading: 'Philosophy, Modern -- Epistemology -- Moral theory',
    };
  }
  if (categoryName.includes('history') || categoryName.includes('civilization')) {
    return {
      dewey: `909.82 ${authorLastName}`,
      loc: `D21.3 .${authorLastName} ${year}`,
      cutter: `.${authorLastName}90`,
      section: 'World Annals & Historical Depository',
      floor: 'Floor 2 · Stacks Row 19 · Bay C',
      subjectHeading: 'World history -- Historiography -- 20th century documentation',
    };
  }
  if (
    categoryName.includes('science') ||
    categoryName.includes('physics') ||
    categoryName.includes('natural')
  ) {
    return {
      dewey: `501 ${authorLastName}`,
      loc: `Q162 .${authorLastName} ${year}`,
      cutter: `.${authorLastName}50`,
      section: 'Physical & Natural Sciences Stacks',
      floor: 'Floor 3 · Stacks Row 05 · Bay A',
      subjectHeading: 'Science -- Empirical methods -- Natural philosophy',
    };
  }
  return {
    dewey: `020.92 ${authorLastName}`,
    loc: `Z674 .${authorLastName} ${year}`,
    cutter: `.${authorLastName}02`,
    section: 'General Research Stacks',
    floor: 'Floor 1 · Main Stacks Row 02 · Bay A',
    subjectHeading: 'General knowledge -- Archival studies -- Bibliography',
  };
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
  const [activeTab, setActiveTab] = useState<'card' | 'history' | 'availability' | 'citation'>('card');
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [showCallSlip, setShowCallSlip] = useState(false);

  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'ADMIN';

  // Trigger slide-in animation on mount
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

  // Handle ESC key to close
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
    }, 300);
  };

  const archivalMeta = getArchivalClassification(book);
  const authorsList = book.authors.map((a) => a.name).join(', ') || 'Anonymous';
  const primaryAuthor = book.authors[0]?.name || 'Anonymous Author';

  // Format AACR2 author main entry (e.g. "KOBRIN, Michael" or "ORWELL, George")
  const authorParts = primaryAuthor.split(' ');
  const aacr2Author =
    authorParts.length > 1
      ? `${authorParts[authorParts.length - 1].toUpperCase()}, ${authorParts.slice(0, -1).join(' ')}.`
      : `${primaryAuthor.toUpperCase()}.`;

  // Citations generator
  const getCitation = (format: 'APA' | 'MLA' | 'CHICAGO') => {
    const year = book.publicationYear || 'n.d.';
    const title = book.title;
    const publisher = book.publisher?.name || 'The Athenaeum Press';
    const firstAuthor = book.authors[0]?.name || 'Unknown Author';

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
      toast.success(`Đã sao chép trích dẫn định dạng ${format} vào bộ nhớ tạm!`, 'Sao Chép Thành Công');
      setTimeout(() => setCopiedCitation(null), 2500);
    } catch {
      toast.error('Không thể sao chép trích dẫn vào bộ nhớ tạm.');
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

  const handlePrintSlip = () => {
    setShowCallSlip(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Dimmed backdrop with smooth fade */}
      <div
        onClick={handleDismiss}
        className={`fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity duration-300 ease-out cursor-pointer ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Slide-in Archival Card Drawer from right */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside
          className={`w-screen max-w-2xl lg:max-w-3xl h-full aged-paper border-l-2 border-[#b8ac95] shadow-2xl flex flex-col font-serif-data transform transition-transform duration-300 ease-out ${
            isVisible ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* 1. Drawer Header Masthead */}
          <div className="bg-[#f4eee2] px-5 py-3 border-b-2 border-[#b8ac95] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="card-catalog-rod-hole" title="Khe thanh định vị thẻ mục lục" />
              <div>
                <div className="flex items-center gap-2 text-[10px] text-[#92400e] font-serif uppercase tracking-widest font-bold">
                  <Library className="w-3.5 h-3.5" />
                  <span>Mục Lục Thẻ Athenaeum · Ngăn Kéo #{archivalMeta.dewey.slice(0, 3)}</span>
                </div>
                <h3 className="text-sm font-bold text-stone-900 font-serif-display leading-tight">
                  Hồ Sơ Lưu Trữ &amp; Phiếu Yêu Cầu Mượn Sách
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-[#eae3d2] rounded-md transition cursor-pointer flex items-center gap-1 text-xs font-serif"
                title="Đóng Thẻ Mục Lục (Esc)"
              >
                <span className="hidden sm:inline text-[11px] text-stone-600">Đóng</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Interactive Navigation Tabs */}
          <div className="flex border-b border-[#ded5c2] bg-[#f9f6ee] px-5 pt-2 text-xs overflow-x-auto gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`pb-2 font-serif font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'card'
                  ? 'border-[#92400e] text-[#92400e]'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Thẻ Mục Lục Thư Viện</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-2 font-serif font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-[#92400e] text-[#92400e]'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Lịch Sử Xuất Bản</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('availability')}
              className={`pb-2 font-serif font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'availability'
                  ? 'border-[#92400e] text-[#92400e]'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tình Trạng Kho Sách ({book.availableCopies}/{book.totalCopies})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('citation')}
              className={`pb-2 font-serif font-bold transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'citation'
                  ? 'border-[#92400e] text-[#92400e]'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Trích Dẫn Học Thuật</span>
            </button>
          </div>

          {/* 3. Main Scrollable Archival Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            {/* Quick Live Availability Banner */}
            <div
              className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs ${
                book.availableCopies > 0
                  ? 'bg-[#f0f8f2] border-emerald-300 text-emerald-950'
                  : 'bg-[#fef6ee] border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    book.availableCopies > 0 ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                  }`}
                />
                <div>
                  <span className="font-serif font-bold text-xs uppercase tracking-wide">
                    {book.availableCopies > 0
                      ? 'Có Sẵn Để Mượn Lưu Hành Ngay'
                      : 'Tất Cả Các Bản Sách Hiện Đang Được Mượn'}
                  </span>
                  <p className="text-[11px] opacity-80 font-serif-data">
                    {book.availableCopies > 0
                      ? `${book.availableCopies} trên ${book.totalCopies} bản sách sẵn sàng trên giá · ${archivalMeta.floor}`
                      : `${book.totalCopies} bản đăng ký trong hệ thống · Hàng đợi yêu cầu đặt trước đang hoạt động`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleReserve}
                  disabled={isReserving}
                  className="px-3 py-1.5 bg-[#92400e] hover:bg-[#78350f] text-white rounded text-xs font-serif font-bold transition shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{book.availableCopies > 0 ? 'Giữ Sách Tại Quầy' : 'Xếp Hàng Chờ Mượn'}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Classic Archival Catalog Index Card */}
            {activeTab === 'card' && (
              <div className="space-y-6">
                {/* Physical 3x5 Archival Card Simulation Box */}
                <div className="archival-card p-6 sm:p-8 rounded-lg relative overflow-hidden">
                  {/* Subtle red vintage stamp */}
                  <div className="absolute top-4 right-4 text-right pointer-events-none">
                    <span
                      className={`text-[10px] px-2 py-0.5 ${
                        book.availableCopies > 0 ? 'archival-stamp-green' : 'archival-stamp'
                      }`}
                    >
                      {book.availableCopies > 0 ? 'ĐÃ DUYỆT · LƯU HÀNH' : 'TẠM GIỮ LƯU HÀNH'}
                    </span>
                    <span className="block text-[9px] text-stone-500 font-mono mt-0.5">
                      MÃ ĐĂNG KÝ #{String(book.id).padStart(6, '0')}
                    </span>
                  </div>

                  {/* Card Call Number Block (Classic Top-Left Corner) */}
                  <div className="w-32 border-b-2 border-[#b8ac95] pb-2 mb-4 font-mono text-xs text-stone-900 leading-tight">
                    <div className="font-bold text-sm tracking-wide">{archivalMeta.dewey}</div>
                    <div className="text-[11px] text-stone-700">{archivalMeta.loc}</div>
                    <div className="text-[10px] text-stone-500">{archivalMeta.cutter}</div>
                  </div>

                  {/* Main Entry & Title Colophon */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                      {book.coverImageUrl && (
                        <div className="shrink-0 self-center sm:self-start">
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-28 h-40 object-cover rounded border-2 border-[#c5ba9e] shadow-md book-spine-shadow"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-1.5">
                        <div className="text-xs uppercase font-serif font-bold text-stone-900 tracking-wider">
                          {aacr2Author}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900 leading-snug">
                          {book.title}
                        </h2>
                        {book.subtitle && (
                          <p className="text-xs italic text-stone-700 font-serif">{book.subtitle}</p>
                        )}
                        <p className="text-xs text-stone-800 font-serif pt-1">
                          / bởi {authorsList} ; biên mục dưới sự bảo trợ của Ban Giám Tuyển Athenaeum.
                        </p>
                        <p className="text-xs text-stone-700 font-serif">
                          — {book.publisher?.name || 'Nhà xuất bản Athenaeum'}, {book.publicationYear || '2024'}.
                        </p>
                        <p className="text-xs text-stone-600 font-serif">
                          {book.pageCount || 320} trang : 23 cm. — ({book.category?.name || 'Kho Sách Chung'})
                        </p>
                      </div>
                    </div>

                    {/* Collation Ledger Table */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#ded5c2] text-xs">
                      <div className="aged-paper-card p-2 rounded border border-[#ded5c2]">
                        <span className="block text-[9px] uppercase font-bold text-stone-500 font-serif">
                          Mã Chuẩn ISBN
                        </span>
                        <span className="font-mono text-stone-900 font-semibold">{book.isbn}</span>
                      </div>
                      <div className="aged-paper-card p-2 rounded border border-[#ded5c2]">
                        <span className="block text-[9px] uppercase font-bold text-stone-500 font-serif">
                          Năm Xuất Bản
                        </span>
                        <span className="font-serif text-stone-900 font-bold">{book.publicationYear || '—'}</span>
                      </div>
                      <div className="aged-paper-card p-2 rounded border border-[#ded5c2]">
                        <span className="block text-[9px] uppercase font-bold text-stone-500 font-serif">
                          Ngôn Ngữ
                        </span>
                        <span className="font-serif text-stone-900 font-bold">{book.language || 'Tiếng Việt'}</span>
                      </div>
                      <div className="aged-paper-card p-2 rounded border border-[#ded5c2]">
                        <span className="block text-[9px] uppercase font-bold text-stone-500 font-serif">
                          Vị Trí Giá Sách
                        </span>
                        <span className="font-serif text-stone-900 font-bold text-[11px] truncate block">
                          {archivalMeta.floor.split('·')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Summary & Abstract */}
                    {book.description && (
                      <div className="pt-3">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-stone-600 font-serif block mb-1">
                          Tóm Tắt Thư Mục &amp; Phạm Vi Tác Phẩm:
                        </span>
                        <p className="text-xs text-stone-800 leading-relaxed font-serif-data bg-[#fbf9f4] p-3 rounded border border-[#ded5c2]">
                          {book.description}
                        </p>
                      </div>
                    )}

                    {/* Classic Subject Tracings (Card Catalog Bottom Rules) */}
                    <div className="pt-3 text-[11px] text-stone-600 font-serif border-t border-[#ded5c2] space-y-1">
                      <span className="font-bold text-stone-700 block text-[10px] uppercase tracking-wider">
                        Từ Khóa Tra Cứu Mục Lục:
                      </span>
                      <p className="italic">
                        1. {book.category?.name || 'Tổng quát'}. 2. {primaryAuthor} -- Thư mục học. 3.{' '}
                        {archivalMeta.subjectHeading}. I. Nhan đề. II. Tuyển tập: Kho Lưu Trữ Thư Viện Athenaeum.
                      </p>
                    </div>

                    {/* Card Guide Rod Punch Hole (Center Bottom of Archival Card) */}
                    <div className="pt-4 flex justify-center items-center">
                      <div className="card-catalog-rod-hole" title="Lỗ thanh định vị hộp thẻ mục lục" />
                    </div>
                  </div>
                </div>

                {/* Stacks Guidance & Quick Actions */}
                <div className="aged-paper-card p-4 rounded-lg border border-[#ded5c2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-serif text-xs text-stone-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#92400e]" />
                      <span>Định Vị Kho Sách Phòng Đọc</span>
                    </span>
                    <button
                      type="button"
                      onClick={handlePrintSlip}
                      className="text-xs text-[#92400e] hover:underline font-bold flex items-center gap-1 cursor-pointer font-serif"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>In Phiếu Yêu Cầu</span>
                    </button>
                  </div>
                  <p className="text-xs text-stone-700 font-serif">
                    Tác phẩm này được đặt tại{' '}
                    <strong className="text-stone-900">{archivalMeta.section}</strong>. Vui lòng gửi mã phân loại{' '}
                    <strong className="font-mono text-stone-900">{archivalMeta.dewey}</strong> cho thủ thư tại quầy tra cứu ở {archivalMeta.floor}.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: Publication History & Archival Provenance */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="aged-paper-card p-5 rounded-lg border border-[#ded5c2] space-y-4">
                  <div className="border-b-2 border-[#b8ac95] pb-2">
                    <h3 className="font-bold text-stone-900 text-base font-serif-display">
                      Thông Tin Xuất Bản &amp; Lịch Sử In Ấn
                    </h3>
                    <p className="text-xs text-stone-600 font-serif">
                      Dữ liệu lịch sử xuất bản, gia phả ấn bản và hồ sơ tiếp nhận lưu trữ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif-data">
                    <div className="space-y-1 p-3 bg-[#fcfbf7] rounded border border-[#e6decb]">
                      <span className="text-[10px] uppercase font-bold text-stone-500 font-serif block">
                        Nhà Xuất Bản &amp; Đơn Vị Phát Hành
                      </span>
                      <p className="font-bold text-stone-900 font-serif text-sm">
                        {book.publisher?.name || 'Nhà xuất bản Athenaeum'}
                      </p>
                      {book.publisher?.website && (
                        <a
                          href={book.publisher.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#92400e] hover:underline flex items-center gap-1 mt-1"
                        >
                          <span>Mục lục nhà xuất bản</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="space-y-1 p-3 bg-[#fcfbf7] rounded border border-[#e6decb]">
                      <span className="text-[10px] uppercase font-bold text-stone-500 font-serif block">
                        Phiên Bản &amp; Năm Phát Hành
                      </span>
                      <p className="font-bold text-stone-900 font-serif text-sm">
                        {book.edition || 'Ấn bản chuẩn đầu tiên Athenaeum'} ({book.publicationYear || '2024'})
                      </p>
                      <p className="text-[11px] text-stone-600">Đóng bìa cứng chuẩn quy cách thư viện</p>
                    </div>

                    <div className="space-y-1 p-3 bg-[#fcfbf7] rounded border border-[#e6decb]">
                      <span className="text-[10px] uppercase font-bold text-stone-500 font-serif block">
                        Ngôn Ngữ Hồ Sơ Chính
                      </span>
                      <p className="font-bold text-stone-900 font-serif text-sm">{book.language || 'Tiếng Việt'}</p>
                      <p className="text-[11px] text-stone-600">Nguyên bản chuyên khảo hoàn chỉnh</p>
                    </div>

                    <div className="space-y-1 p-3 bg-[#fcfbf7] rounded border border-[#e6decb]">
                      <span className="text-[10px] uppercase font-bold text-stone-500 font-serif block">
                        Quy Cách / Số Trang
                      </span>
                      <p className="font-bold text-stone-900 font-serif text-sm">
                        {book.pageCount || 320} trang in
                      </p>
                      <p className="text-[11px] text-stone-600">Bao gồm chỉ mục, thư mục tham khảo &amp; phụ bản</p>
                    </div>
                  </div>

                  {/* Archival Provenance Timeline */}
                  <div className="pt-3 border-t border-[#ded5c2] space-y-3">
                    <h4 className="font-bold text-stone-900 text-xs font-serif uppercase tracking-wider">
                      Dòng Thời Gian Tiếp Nhận &amp; Biên Mục
                    </h4>
                    <div className="space-y-2 text-xs font-serif-data pl-2 border-l-2 border-[#b8ac95]">
                      <div className="relative pl-3">
                        <span className="w-2 h-2 rounded-full bg-[#92400e] absolute -left-[17px] top-1" />
                        <p className="font-bold text-stone-900 font-serif">Xuất bản chuyên khảo gốc ({book.publicationYear || 2024})</p>
                        <p className="text-[11px] text-stone-600">
                          In ấn và đăng ký mã số tiêu chuẩn quốc tế ISBN {book.isbn}.
                        </p>
                      </div>
                      <div className="relative pl-3">
                        <span className="w-2 h-2 rounded-full bg-[#92400e] absolute -left-[17px] top-1" />
                        <p className="font-bold text-stone-900 font-serif">Tiếp nhận vào Kho Lưu Trữ Athenaeum</p>
                        <p className="text-[11px] text-stone-600">
                          Phân loại theo Thập phân Dewey #{archivalMeta.dewey} và xếp vào {archivalMeta.section}.
                        </p>
                      </div>
                      <div className="relative pl-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-700 absolute -left-[17px] top-1" />
                        <p className="font-bold text-stone-900 font-serif">Xác Thực Bản Quyền Lưu Hành</p>
                        <p className="text-[11px] text-stone-600">
                          {book.totalCopies} bản sách vật lý đã được kiểm tra và dán mã vạch phục vụ lưu hành.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Current Availability Status & Stacks Location */}
            {activeTab === 'availability' && (
              <div className="space-y-6">
                <div className="aged-paper-card p-5 rounded-lg border border-[#ded5c2] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#b8ac95] pb-3">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base font-serif-display">
                        Sổ Đăng Ký Bản Sách Vật Lý &amp; Tình Trạng Kho
                      </h3>
                      <p className="text-xs text-stone-600 font-serif">
                        Tình trạng thời gian thực của từng bản sách mã vạch thuộc tựa đề này
                      </p>
                    </div>
                    {isStaff && onOpenAddCopy && (
                      <button
                        type="button"
                        onClick={() => onOpenAddCopy(book)}
                        className="px-3 py-1.5 bg-[#92400e] hover:bg-[#78350f] text-white rounded text-xs font-serif font-bold transition shadow-xs flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm Bản Sách Vật Lý</span>
                      </button>
                    )}
                  </div>

                  {/* Summary metric pill cluster replacement: clean text */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-serif-data">
                    <div className="p-3 bg-[#fcfbf7] rounded border border-[#ded5c2]">
                      <span className="block text-[10px] uppercase font-bold text-stone-500 font-serif">
                        Tổng Số Bản Đã Biên Mục
                      </span>
                      <span className="font-serif-display text-lg font-bold text-stone-900">{book.totalCopies}</span>
                    </div>
                    <div className="p-3 bg-[#f0f8f2] rounded border border-emerald-300">
                      <span className="block text-[10px] uppercase font-bold text-emerald-800 font-serif">
                        Có Sẵn Trên Giá
                      </span>
                      <span className="font-serif-display text-lg font-bold text-emerald-900">
                        {book.availableCopies}
                      </span>
                    </div>
                    <div className="p-3 bg-[#fcfbf7] rounded border border-[#ded5c2]">
                      <span className="block text-[10px] uppercase font-bold text-stone-500 font-serif">
                        Đang Lưu Hành / Độc Giả Mượn
                      </span>
                      <span className="font-serif-display text-lg font-bold text-amber-900">
                        {book.totalCopies - book.availableCopies}
                      </span>
                    </div>
                  </div>

                  {/* Copies List */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-stone-900 font-serif uppercase tracking-wider">
                      Danh Sách Các Bản Sách Cụ Thể:
                    </h4>

                    {(!book.copies || book.copies.length === 0) ? (
                      <div className="p-4 text-center text-xs text-stone-500 font-serif bg-[#fcfbf7] rounded border border-[#ded5c2]">
                        Chưa có bản sách vật lý nào được biên mục.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#ded5c2] border border-[#ded5c2] rounded bg-[#fcfbf7] overflow-hidden">
                        {book.copies.map((copy, idx) => (
                          <div
                            key={copy.id}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ledger-row font-serif-data"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-stone-900 bg-[#f4eee2] px-2 py-0.5 rounded border border-[#ded5c2] text-xs">
                                  {copy.copyCode}
                                </span>
                                <span className="text-[11px] text-stone-500 font-serif">
                                  Bản #{idx + 1}
                                </span>
                              </div>
                              <p className="text-stone-700 font-serif text-[11px]">
                                Vị trí giá sách:{' '}
                                <strong className="text-stone-900">
                                  {copy.shelfLocation || archivalMeta.floor}
                                </strong>
                              </p>
                              {copy.acquisitionDate && (
                                <p className="text-[10px] text-stone-500">
                                  Ngày tiếp nhận: {copy.acquisitionDate}
                                </p>
                              )}
                            </div>

                            {/* Status and Action */}
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              {isStaff && onUpdateCopyStatus ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] uppercase font-mono text-stone-500">
                                    Trạng thái:
                                  </span>
                                  <select
                                    value={copy.status}
                                    onChange={(e) =>
                                      onUpdateCopyStatus(copy.id, e.target.value as CopyStatus)
                                    }
                                    className="bg-white border border-[#d5ccba] text-xs rounded px-2 py-1 text-stone-800 font-serif cursor-pointer focus:outline-none"
                                  >
                                    <option value="AVAILABLE">CÓ SẴN (Trên giá)</option>
                                    <option value="BORROWED">ĐANG MƯỢN (Độc giả đang giữ)</option>
                                    <option value="RESERVED">ĐÃ ĐẶT (Tại quầy giữ)</option>
                                    <option value="LOST">MẤT (Chưa thu hồi)</option>
                                    <option value="DAMAGED">HƯ HỎNG (Đang phục chế)</option>
                                    <option value="WITHDRAWN">RÚT KHỎI LƯU HÀNH</option>
                                  </select>
                                </div>
                              ) : (
                                <span
                                  className={`px-2.5 py-1 rounded text-[11px] font-bold font-serif border ${
                                    copy.status === 'AVAILABLE'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : copy.status === 'BORROWED'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : copy.status === 'RESERVED'
                                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                                      : 'bg-red-50 text-red-800 border-red-300'
                                  }`}
                                >
                                  {copy.status === 'AVAILABLE'
                                    ? 'CÓ SẴN'
                                    : copy.status === 'BORROWED'
                                    ? 'ĐANG MƯỢN'
                                    : copy.status === 'RESERVED'
                                    ? 'ĐÃ ĐẶT'
                                    : copy.status === 'LOST'
                                    ? 'MẤT'
                                    : copy.status === 'DAMAGED'
                                    ? 'HƯ HỎNG'
                                    : copy.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Scholarly Citations Generator */}
            {activeTab === 'citation' && (
              <div className="space-y-6">
                <div className="aged-paper-card p-5 rounded-lg border border-[#ded5c2] space-y-4">
                  <div className="border-b-2 border-[#b8ac95] pb-2">
                    <h3 className="font-bold text-stone-900 text-base font-serif-display">
                      Trích Dẫn Học Thuật Chuẩn Quốc Tế
                    </h3>
                    <p className="text-xs text-stone-600 font-serif">
                      Sao chép các định dạng trích dẫn thư mục chuẩn hóa phục vụ nghiên cứu và đề cương
                    </p>
                  </div>

                  {(['APA', 'MLA', 'CHICAGO'] as const).map((fmt) => (
                    <div
                      key={fmt}
                      className="p-3.5 bg-[#fcfbf7] rounded border border-[#ded5c2] space-y-2 text-xs font-serif-data"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-serif text-stone-900 text-xs">
                          {fmt === 'APA'
                            ? 'Chuẩn APA (Tái bản lần 7)'
                            : fmt === 'MLA'
                            ? 'Chuẩn MLA (Tái bản lần 9)'
                            : 'Chuẩn Chicago (Tái bản lần 17)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCitation(fmt)}
                          className="px-2.5 py-1 bg-white hover:bg-[#eae3d2] text-stone-800 border border-[#d5ccba] rounded text-[11px] font-serif font-bold transition flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCitation === fmt ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span className="text-emerald-700">Đã chép!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-stone-600" />
                              <span>Sao Chép Trích Dẫn</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-stone-800 font-serif text-xs bg-white p-2.5 rounded border border-[#e8e2d4] italic select-all">
                        {getCitation(fmt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Drawer Footer Actions */}
          <div className="bg-[#f4eee2] px-5 py-4 border-t-2 border-[#b8ac95] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              {isAdmin && onDeleteBook && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Bạn có chắc chắn muốn xóa "${book.title}" khỏi danh mục thư viện Athenaeum?`)) {
                      onDeleteBook(book.id);
                      handleDismiss();
                    }
                  }}
                  className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-100/70 border border-red-300 rounded font-serif transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Xóa Bản Ghi</span>
                </button>
              )}
              {isStaff && onOpenEditBook && (
                <button
                  type="button"
                  onClick={() => onOpenEditBook(book)}
                  className="px-3 py-1.5 text-xs text-[#92400e] hover:bg-[#eae3d2] border border-[#d5ccba] rounded font-serif transition flex items-center gap-1.5 cursor-pointer bg-white"
                  title="Chỉnh sửa thông tin ấn bản & tác giả"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-medium">Sửa Thông Tin &amp; Tác Giả</span>
                </button>
              )}
              {!isAdmin && !isStaff && (
                <div className="text-[11px] text-stone-600 font-serif">
                  Mã Dewey: <span className="font-mono text-stone-900 font-bold">{archivalMeta.dewey}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="px-3 py-2 bg-[#fcfbf7] hover:bg-[#eae3d2] text-stone-800 border border-[#d5ccba] rounded text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="In Phiếu Yêu Cầu Sách"
              >
                <Printer className="w-3.5 h-3.5 text-stone-600" />
                <span className="hidden sm:inline">In Phiếu Mượn</span>
              </button>

              <button
                type="button"
                onClick={handleReserve}
                disabled={isReserving}
                className="px-4 py-2 bg-[#92400e] hover:bg-[#78350f] text-white rounded text-xs font-serif font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{book.availableCopies > 0 ? 'Đặt Mượn / Giữ Sách' : 'Đăng Ký Chờ Mượn'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 bg-stone-200/80 hover:bg-stone-300 text-stone-800 rounded text-xs font-serif font-medium transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Hidden Printable Call Slip (Triggered by Print Button) */}
      {showCallSlip && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 font-serif text-black z-100">
          <div className="border-4 border-black p-6 max-w-md mx-auto space-y-4">
            <div className="text-center border-b-2 border-black pb-3">
              <h2 className="text-lg font-bold uppercase tracking-widest">THƯ VIỆN ATHENAEUM</h2>
              <p className="text-xs">Phiếu Yêu Cầu Lưu Hành Chính Thức</p>
            </div>
            <div className="space-y-2 text-xs">
              <p><strong>MÃ PHÂN LOẠI:</strong> {archivalMeta.dewey} / {archivalMeta.loc}</p>
              <p><strong>TỰA SÁCH:</strong> {book.title}</p>
              <p><strong>TÁC GIẢ:</strong> {authorsList}</p>
              <p><strong>MÃ ISBN:</strong> {book.isbn}</p>
              <p><strong>VỊ TRÍ KHO:</strong> {archivalMeta.floor}</p>
              <p><strong>ĐỘC GIẢ:</strong> {user ? `${user.fullName} (${user.email})` : 'Độc Giả Tự Do'}</p>
              <p><strong>NGÀY PHÁT HÀNH PHIẾU:</strong> {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
            <div className="pt-4 border-t border-black text-center text-[10px]">
              Vui lòng xuất trình phiếu này tại quầy thủ thư lưu hành.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
