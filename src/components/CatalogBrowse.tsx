import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Book, Category, Author, Publisher } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { BookCardSkeleton } from './common/LoadingSkeleton.tsx';
import { EmptyState } from './common/EmptyState.tsx';
import { ErrorState } from './common/ErrorState.tsx';
import { BookDetailModal } from './BookDetailModal.tsx';
import {
  Search,
  BookOpen,
  Plus,
  BookmarkPlus,
  Trash2,
  CopyPlus,
  RotateCw,
  Library,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Sparkles,
  CheckCircle2,
  Edit3,
  User,
} from 'lucide-react';

interface CatalogBrowseProps {
  onSelectBook?: (bookId: number) => void;
  openAuthModal: () => void;
  initialQuery?: string;
  initialCategoryId?: string;
  initialBookId?: number | null;
}

export const CatalogBrowse: React.FC<CatalogBrowseProps> = ({
  openAuthModal,
  initialQuery = '',
  initialCategoryId = '',
  initialBookId = null,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId);
  const [authorSearch, setAuthorSearch] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected book for details modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Edit Book state
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editBookErrors, setEditBookErrors] = useState<Record<string, string>>({});
  const [editBookForm, setEditBookForm] = useState({
    title: '',
    isbn: '',
    subtitle: '',
    publisherId: '',
    categoryId: '',
    authorInput: '',
    language: 'Tiếng Việt',
    publicationYear: 2024,
    pageCount: 300,
    description: '',
    coverImageUrl: '',
  });

  useEffect(() => {
    if (initialQuery !== undefined) setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialCategoryId !== undefined) setSelectedCategory(initialCategoryId);
  }, [initialCategoryId]);

  useEffect(() => {
    if (initialBookId) {
      handleOpenBookDetail(initialBookId);
    }
  }, [initialBookId]);

  // Form Modals
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddCopyModal, setShowAddCopyModal] = useState(false);
  const [copyBookTarget, setCopyBookTarget] = useState<Book | null>(null);

  // Form states & submission
  const [isSubmittingBook, setIsSubmittingBook] = useState(false);
  const [isSubmittingCopy, setIsSubmittingCopy] = useState(false);
  const [bookErrors, setBookErrors] = useState<Record<string, string>>({});
  const [copyErrors, setCopyErrors] = useState<Record<string, string>>({});

  const [bookForm, setBookForm] = useState({
    title: '',
    isbn: '',
    subtitle: '',
    publisherId: '',
    categoryId: '',
    authorInput: '',
    language: 'Tiếng Việt',
    publicationYear: 2024,
    pageCount: 300,
    description: '',
    coverImageUrl: '',
  });

  const [copyCodeInput, setCopyCodeInput] = useState('');
  const [shelfLocationInput, setShelfLocationInput] = useState('');

  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'ADMIN';

  const fetchFilters = async () => {
    try {
      const [catData, authData, pubData] = await Promise.all([
        api.getCategories(),
        api.getAuthors(),
        api.getPublishers(),
      ]);
      setCategories(catData || []);
      setAuthors(authData || []);
      setPublishers(pubData || []);
    } catch {
      // Non-fatal
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        size: 8,
      };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (authorSearch.trim()) params.authorName = authorSearch.trim();
      if (availableOnly) params.availableOnly = 'true';

      const res = await api.getBooks(params);
      setBooks(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load catalog titles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [searchQuery, selectedCategory, authorSearch, availableOnly, page]);

  const handleOpenBookDetail = async (bookId: number) => {
    try {
      const b = await api.getBook(bookId);
      setSelectedBook(b);
    } catch (err: any) {
      toast.error(err.message || 'Unable to load book details.');
    }
  };

  const handlePlaceReservation = async (bookId: number) => {
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const res = await api.createReservation(bookId);
      toast.success(
        `Reservation confirmed! You are at queue position #${res.queuePosition}.`,
        'Hold Placed'
      );
      if (selectedBook) {
        handleOpenBookDetail(bookId);
      }
      fetchBooks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to place reservation hold.');
    }
  };

  const validateBookForm = () => {
    const errs: Record<string, string> = {};
    if (!bookForm.title.trim()) {
      errs.title = 'Title is required';
    }
    const cleanIsbn = bookForm.isbn.replace(/[-\s]/g, '');
    if (!cleanIsbn) {
      errs.isbn = 'ISBN is required';
    } else if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) {
      errs.isbn = 'ISBN must be 10 or 13 digits';
    }
    if (!bookForm.categoryId) {
      errs.categoryId = 'Please select a category';
    }
    if (!bookForm.publisherId) {
      errs.publisherId = 'Please select a publisher';
    }
    if (!bookForm.authorInput.trim()) {
      errs.authorInput = 'Vui lòng nhập tên tác giả';
    }
    if (bookForm.publicationYear < 1000 || bookForm.publicationYear > 2100) {
      errs.publicationYear = 'Enter a valid 4-digit year';
    }
    setBookErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBookForm()) return;

    setIsSubmittingBook(true);
    try {
      const payload = {
        title: bookForm.title.trim(),
        isbn: bookForm.isbn.trim(),
        subtitle: bookForm.subtitle.trim() || undefined,
        publisherId: parseInt(bookForm.publisherId, 10),
        categoryId: parseInt(bookForm.categoryId, 10),
        authors: bookForm.authorInput.trim(),
        language: bookForm.language || 'Tiếng Việt',
        publicationYear: Number(bookForm.publicationYear),
        pageCount: Number(bookForm.pageCount) || undefined,
        description: bookForm.description.trim() || undefined,
        coverImageUrl: bookForm.coverImageUrl.trim() || undefined,
      };

      await api.createBook(payload);
      toast.success(`Đã thêm sách "${bookForm.title}" vào danh mục thư viện!`, 'Biên Mục Thành Công');
      setShowAddBookModal(false);
      setBookForm({
        title: '',
        isbn: '',
        subtitle: '',
        publisherId: '',
        categoryId: '',
        authorInput: '',
        language: 'Tiếng Việt',
        publicationYear: 2024,
        pageCount: 300,
        description: '',
        coverImageUrl: '',
      });
      setBookErrors({});
      fetchBooks();
      fetchFilters();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create book title.');
    } finally {
      setIsSubmittingBook(false);
    }
  };

  const validateCopyForm = () => {
    const errs: Record<string, string> = {};
    if (!copyCodeInput.trim()) {
      errs.copyCode = 'Accession/barcode code is required';
    } else if (copyCodeInput.trim().length < 3) {
      errs.copyCode = 'Code must be at least 3 characters';
    }
    setCopyErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyBookTarget) return;
    if (!validateCopyForm()) return;

    setIsSubmittingCopy(true);
    try {
      await api.addBookCopy(copyBookTarget.id, {
        copyCode: copyCodeInput.trim().toUpperCase(),
        shelfLocation: shelfLocationInput.trim() || undefined,
      });
      toast.success(
        `Copy ${copyCodeInput.trim().toUpperCase()} registered successfully!`,
        'Inventory Updated'
      );
      setShowAddCopyModal(false);
      setCopyCodeInput('');
      setShelfLocationInput('');
      setCopyErrors({});
      if (selectedBook) {
        handleOpenBookDetail(selectedBook.id);
      }
      fetchBooks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register physical copy.');
    } finally {
      setIsSubmittingCopy(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!confirm('Are you sure you want to delete this title? This cannot be undone.')) {
      return;
    }
    try {
      await api.deleteBook(bookId);
      toast.success('Title and records removed from catalog.', 'Deleted');
      setSelectedBook(null);
      fetchBooks();
    } catch (err: any) {
      toast.error(err.message || 'Cannot delete title.');
    }
  };

  const handleUpdateCopyStatus = async (copyId: number, status: string) => {
    try {
      await api.updateCopyStatus(copyId, status);
      toast.success(`Physical copy status set to ${status}.`);
      if (selectedBook) {
        handleOpenBookDetail(selectedBook.id);
      }
      fetchBooks();
    } catch (err: any) {
      toast.error(err.message || 'Status update failed.');
    }
  };

  const handleOpenEditBook = (b: Book) => {
    setEditingBook(b);
    const resolvedPublisherId = b.publisherId || b.publisher?.id;
    const resolvedCategoryId = b.categoryId || b.category?.id;

    setEditBookForm({
      title: b.title || '',
      isbn: b.isbn || '',
      subtitle: b.subtitle || '',
      publisherId: resolvedPublisherId ? String(resolvedPublisherId) : '',
      categoryId: resolvedCategoryId ? String(resolvedCategoryId) : '',
      authorInput: b.authors ? b.authors.map((a) => a.name).join(', ') : '',
      language: b.language || 'Tiếng Việt',
      publicationYear: b.publicationYear || 2024,
      pageCount: b.pageCount || 300,
      description: b.description || '',
      coverImageUrl: b.coverImageUrl || '',
    });
    setEditBookErrors({});
    setShowEditBookModal(true);
  };

  const validateEditBookForm = () => {
    const errs: Record<string, string> = {};
    if (!editBookForm.title.trim()) {
      errs.title = 'Tựa sách không được để trống';
    }
    const cleanIsbn = editBookForm.isbn.replace(/[-\s]/g, '');
    if (!cleanIsbn) {
      errs.isbn = 'Mã ISBN không được để trống';
    }
    if (!editBookForm.authorInput.trim()) {
      errs.authorInput = 'Vui lòng nhập tên tác giả (sẽ lưu trực tiếp vào CSDL)';
    }
    setEditBookErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    if (!validateEditBookForm()) return;

    setIsSubmittingEdit(true);
    try {
      const payload: any = {
        title: editBookForm.title.trim(),
        isbn: editBookForm.isbn.trim(),
        subtitle: editBookForm.subtitle.trim() || undefined,
        publisherId: editBookForm.publisherId ? parseInt(editBookForm.publisherId, 10) : undefined,
        categoryId: editBookForm.categoryId ? parseInt(editBookForm.categoryId, 10) : undefined,
        authors: editBookForm.authorInput.trim(),
        language: editBookForm.language || 'Tiếng Việt',
        publicationYear: Number(editBookForm.publicationYear) || undefined,
        pageCount: Number(editBookForm.pageCount) || undefined,
        description: editBookForm.description.trim() || undefined,
        coverImageUrl: editBookForm.coverImageUrl.trim() || undefined,
      };

      await api.updateBook(editingBook.id, payload);
      toast.success(
        `Đã cập nhật ấn bản "${editBookForm.title}" và lưu thông tin tác giả vào cơ sở dữ liệu!`,
        'Cập Nhật CSDL Thành Công'
      );
      setShowEditBookModal(false);
      setEditingBook(null);
      if (selectedBook && selectedBook.id === editingBook.id) {
        handleOpenBookDetail(editingBook.id);
      }
      fetchBooks();
      fetchFilters();
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật ấn bản thất bại.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setAuthorSearch('');
    setAvailableOnly(false);
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedCategory || authorSearch || availableOnly
  );

  return (
    <div className="space-y-6">
      {/* Library Catalog Header & Search Station */}
      <div className="aged-paper border border-[#ded5c2] rounded-lg p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#b8ac95] pb-5">
          <div>
            <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
              <Library className="w-4 h-4" />
              <span>Mục Lục Thẻ Thư Viện &amp; Các Kho Sách</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-display tracking-tight">
              Bộ Sưu Tập &amp; Danh Mục Tài Liệu
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed font-serif-data">
              Khám phá {totalElements} ấn bản đã biên mục thuộc các kho chuyên khảo, tài liệu nghiên cứu và sách cho mượn.
            </p>
          </div>
          {isStaff && (
            <button
              type="button"
              onClick={() => {
                setBookErrors({});
                setShowAddBookModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-[#92400e] hover:bg-[#78350f] text-white font-medium rounded text-xs shadow-xs transition self-start cursor-pointer font-serif-data"
            >
              <Plus className="w-4 h-4" />
              <span>Biên Mục Sách Mới</span>
            </button>
          )}
        </div>

        {/* Quick Category Filter Tabs (Interactive Segmented Control) */}
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex items-center gap-1 p-1 bg-[#ebe4d6] border border-[#d6ccb8] rounded-lg text-xs font-serif-data">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-white text-stone-900 font-bold shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Tất Cả Kho Sách
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(String(c.id));
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === String(c.id)
                    ? 'bg-white text-stone-900 font-bold shadow-2xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 font-serif-data">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Tìm theo tựa sách, tác giả hoặc ISBN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#fcfbf7] border border-[#d5ccba] rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#92400e] transition font-serif"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2 bg-[#fcfbf7] border border-[#d5ccba] rounded text-xs text-stone-800 focus:outline-none focus:border-[#92400e] transition cursor-pointer font-serif"
            >
              <option value="">Tất Cả Phân Loại Chuyên Ngành</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Author Input Filter (Replaced Select Dropdown) */}
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Nhập tên tác giả để lọc..."
              value={authorSearch}
              onChange={(e) => {
                setAuthorSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-9 pr-7 py-2 bg-[#fcfbf7] border border-[#d5ccba] rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#92400e] transition font-serif"
            />
            {authorSearch && (
              <button
                type="button"
                onClick={() => {
                  setAuthorSearch('');
                  setPage(0);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                title="Xóa lọc tác giả"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 px-3 py-2 bg-[#fcfbf7] border border-[#d5ccba] rounded">
            <label
              htmlFor="availOnly"
              className="text-xs text-stone-800 select-none cursor-pointer flex items-center gap-2 font-serif font-medium"
            >
              <input
                id="availOnly"
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => {
                  setAvailableOnly(e.target.checked);
                  setPage(0);
                }}
                className="w-4 h-4 rounded text-[#92400e] focus:ring-[#92400e] border-[#d5ccba] cursor-pointer"
              />
              <span>Đang Có Sẵn Trên Giá</span>
            </label>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] text-[#92400e] hover:underline font-bold cursor-pointer font-serif"
              >
                Đặt Lại Lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Catalog Book Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Thông Báo Dịch Vụ Mục Lục"
          message={error}
          onRetry={fetchBooks}
        />
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Không Tìm Thấy Tác Phẩm Nào"
          description={
            hasActiveFilters
              ? 'Không có cuốn sách nào khớp với bộ lọc hoặc từ khóa tìm kiếm đã chọn. Vui lòng thử nới lỏng tiêu chí tìm kiếm.'
              : 'Hiện chưa có tài liệu nào trong danh mục thư viện.'
          }
          actionLabel={hasActiveFilters ? 'Đặt Lại Bộ Lọc' : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((b) => {
            const hasCopies = b.availableCopies > 0;
            return (
              <div
                key={b.id}
                className="aged-paper-card border border-[#ded5c2] hover:border-[#b45309] rounded-lg overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col group relative"
              >
                {/* Book Spine Callout Bar */}
                <div className="bg-[#f2ece0] px-3 py-1.5 border-b border-[#ded5c2] flex items-center justify-between text-[10px] text-stone-700 font-mono">
                  <span className="font-semibold">MÃ #{b.isbn.slice(-4)}</span>
                  <span>{b.category?.name || 'Tổng quát'}</span>
                </div>

                {/* Book Cover with subtle book spine shadow */}
                <div className="h-52 w-full bg-[#faf6ee] relative overflow-hidden flex items-center justify-center border-b border-[#ded5c2] p-3">
                  {b.coverImageUrl ? (
                    <img
                      src={b.coverImageUrl}
                      alt={b.title}
                      className="h-full max-w-[85%] object-cover rounded shadow-sm book-spine-shadow group-hover:scale-102 transition duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                      <BookOpen className="w-10 h-10 mb-2 text-stone-400" />
                      <span className="text-[11px] font-serif-display text-stone-600 italic">
                        {b.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Book Details (Anti-AI Zero-Pill Unboxed Metadata) */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 font-serif-data">
                  <div className="space-y-1.5">
                    {/* Quiet Unboxed Metadata Line */}
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
                      {b.publicationYear && <span>{b.publicationYear}</span>}
                      {b.publicationYear && b.pageCount && <span aria-hidden="true">·</span>}
                      {b.pageCount && <span>{b.pageCount} trang</span>}
                      {b.language && <span aria-hidden="true">·</span>}
                      {b.language && <span>{b.language}</span>}
                    </div>

                    <h3 className="font-bold text-stone-900 text-base font-serif-display leading-snug line-clamp-2 group-hover:text-[#92400e] transition">
                      {b.title}
                    </h3>

                    <p className="text-xs text-stone-700 font-serif line-clamp-1">
                      {b.authors.map((a) => a.name).join(', ') || 'Nhiều tác giả'}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-stone-600 text-[10px]">ISBN {b.isbn}</span>
                      <span
                        className={`font-semibold flex items-center gap-1 font-serif ${
                          hasCopies ? 'text-emerald-800' : 'text-amber-900'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            hasCopies ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        />
                        {hasCopies
                          ? `Còn ${b.availableCopies}/${b.totalCopies} cuốn`
                          : 'Hàng đợi đang hoạt động'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#ded5c2] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenBookDetail(b.id)}
                      className="flex-1 py-1.5 px-3 bg-[#fcfbf7] hover:bg-[#f2ece0] text-stone-800 hover:text-stone-900 text-xs font-semibold rounded border border-[#d5ccba] transition text-center cursor-pointer font-serif"
                    >
                      Phiếu Yêu Cầu &amp; Chi Tiết
                    </button>

                    {b.availableCopies === 0 && (
                      <button
                        type="button"
                        onClick={() => handlePlaceReservation(b.id)}
                        className="py-1.5 px-3 bg-[#92400e] hover:bg-[#78350f] text-white text-xs font-medium rounded transition flex items-center space-x-1 cursor-pointer font-serif-data"
                        title="Đăng ký giữ sách trong hàng đợi"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Đặt Trước</span>
                      </button>
                    )}

                    {isStaff && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditBook(b)}
                          className="py-1.5 px-2 bg-[#fcfbf7] hover:bg-[#f2ece0] text-stone-700 hover:text-[#92400e] border border-[#d5ccba] rounded text-xs transition cursor-pointer"
                          title="Sửa ấn bản & tác giả"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCopyBookTarget(b);
                            setCopyErrors({});
                            setShowAddCopyModal(true);
                          }}
                          className="py-1.5 px-2.5 bg-[#fcfbf7] hover:bg-[#f2ece0] text-stone-700 hover:text-[#92400e] border border-[#d5ccba] rounded text-xs transition cursor-pointer"
                          title="Đăng ký mã bản sao vật lý"
                        >
                          <CopyPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between aged-paper border border-[#ded5c2] rounded-lg p-3.5 text-xs text-stone-700 shadow-2xs font-serif-data">
          <div>
            Đang hiển thị Trang <strong className="text-stone-900 font-bold font-serif">{page + 1}</strong> trên{' '}
            <strong className="text-stone-900 font-bold font-serif">{totalPages}</strong> ({totalElements} tài liệu lưu trữ)
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 bg-[#fcfbf7] hover:bg-[#f2ece0] border border-[#d5ccba] disabled:opacity-40 text-stone-700 rounded transition cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 bg-[#fcfbf7] hover:bg-[#f2ece0] border border-[#d5ccba] disabled:opacity-40 text-stone-700 rounded transition cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-In Archival Card Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onPlaceReservation={handlePlaceReservation}
        onUpdateCopyStatus={handleUpdateCopyStatus}
        onOpenAddCopy={(book) => {
          setCopyBookTarget(book);
          setCopyErrors({});
          setShowAddCopyModal(true);
        }}
        onOpenEditBook={handleOpenEditBook}
        onDeleteBook={handleDeleteBook}
        openAuthModal={openAuthModal}
      />

      {/* Add Book Modal with Inline Validation Feedback */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleCreateBook}
            noValidate
            className="aged-paper border border-[#ded5c2] rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 font-serif-data"
          >
            <div className="flex items-center justify-between border-b-2 border-[#b8ac95] pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-lg font-serif-display">Biên Mục Sách Mới</h3>
                <p className="text-xs text-stone-600 font-serif">Đăng ký thư mục ấn bản vào sổ lưu chiểu thư viện</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Tựa Sách *</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => {
                    setBookForm({ ...bookForm, title: e.target.value });
                    if (bookErrors.title) setBookErrors({ ...bookErrors, title: '' });
                  }}
                  placeholder="Ví dụ: Lược Sử Thời Gian"
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 focus:outline-none ${
                    bookErrors.title ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                />
                {bookErrors.title && (
                  <p className="text-[11px] text-red-600 mt-1">{bookErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Mã ISBN (10 hoặc 13 chữ số) *</label>
                <input
                  type="text"
                  value={bookForm.isbn}
                  onChange={(e) => {
                    setBookForm({ ...bookForm, isbn: e.target.value });
                    if (bookErrors.isbn) setBookErrors({ ...bookErrors, isbn: '' });
                  }}
                  placeholder="9780132350884"
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 font-mono focus:outline-none ${
                    bookErrors.isbn ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                />
                {bookErrors.isbn && (
                  <p className="text-[11px] text-red-600 mt-1">{bookErrors.isbn}</p>
                )}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Ngôn Ngữ</label>
                <input
                  type="text"
                  value={bookForm.language}
                  onChange={(e) => setBookForm({ ...bookForm, language: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Phân Loại Chuyên Ngành *</label>
                <select
                  value={bookForm.categoryId}
                  onChange={(e) => {
                    setBookForm({ ...bookForm, categoryId: e.target.value });
                    if (bookErrors.categoryId) setBookErrors({ ...bookErrors, categoryId: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 focus:outline-none cursor-pointer ${
                    bookErrors.categoryId ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                >
                  <option value="">Chọn ngành phân loại...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {bookErrors.categoryId && (
                  <p className="text-[11px] text-red-600 mt-1">{bookErrors.categoryId}</p>
                )}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Nhà Xuất Bản *</label>
                <select
                  value={bookForm.publisherId}
                  onChange={(e) => {
                    setBookForm({ ...bookForm, publisherId: e.target.value });
                    if (bookErrors.publisherId) setBookErrors({ ...bookErrors, publisherId: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 focus:outline-none cursor-pointer ${
                    bookErrors.publisherId ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                >
                  <option value="">Chọn nhà xuất bản...</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {bookErrors.publisherId && (
                  <p className="text-[11px] text-red-600 mt-1">{bookErrors.publisherId}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1 font-serif">Tác Giả *</label>
                <input
                  type="text"
                  placeholder="Nhập tên tác giả (ví dụ: Nguyễn Du, Nam Cao, Donald E. Knuth)..."
                  value={bookForm.authorInput}
                  onChange={(e) => {
                    setBookForm({ ...bookForm, authorInput: e.target.value });
                    if (bookErrors.authorInput) setBookErrors({ ...bookErrors, authorInput: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 focus:outline-none font-serif ${
                    bookErrors.authorInput ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                />
                {bookErrors.authorInput ? (
                  <p className="text-[11px] text-red-600 mt-1">{bookErrors.authorInput}</p>
                ) : (
                  <span className="text-[10px] text-stone-500 font-serif">
                    Nhập tên tác giả để tự động lưu vào cơ sở dữ liệu. Ngăn cách nhiều tác giả bằng dấu phẩy (,).
                  </span>
                )}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Năm Xuất Bản</label>
                <input
                  type="number"
                  value={bookForm.publicationYear}
                  onChange={(e) => setBookForm({ ...bookForm, publicationYear: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Số Trang</label>
                <input
                  type="number"
                  value={bookForm.pageCount}
                  onChange={(e) => setBookForm({ ...bookForm, pageCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Đường Dẫn Ảnh Bìa</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={bookForm.coverImageUrl}
                  onChange={(e) => setBookForm({ ...bookForm, coverImageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Tóm Tắt Nội Dung / Chú Giải</label>
                <textarea
                  rows={3}
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="Tóm tắt ngắn gọn phục vụ thẻ tra cứu mục lục..."
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#e6e0d4]">
              <button
                type="button"
                onClick={() => setShowAddBookModal(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmittingBook}
                className="px-4 py-2 bg-[#92400e] hover:bg-[#78350f] disabled:opacity-50 text-white font-medium rounded text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                {isSubmittingBook && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSubmittingBook ? 'Đang Lưu...' : 'Lưu Sách Vào Mục Lục'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Book Modal with Direct Author Input saved to DB */}
      {showEditBookModal && editingBook && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <form
            onSubmit={handleUpdateBook}
            noValidate
            className="aged-paper border border-[#ded5c2] rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 font-serif-data"
          >
            <div className="flex items-center justify-between border-b-2 border-[#b8ac95] pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-lg font-serif-display">Chỉnh Sửa Ấn Bản &amp; Tác Giả</h3>
                <p className="text-xs text-stone-600 font-serif">Cập nhật hồ sơ lưu trữ và lưu thông tin tác giả vào cơ sở dữ liệu</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditBookModal(false);
                  setEditingBook(null);
                }}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Tựa Sách *</label>
                <input
                  type="text"
                  value={editBookForm.title}
                  onChange={(e) => {
                    setEditBookForm({ ...editBookForm, title: e.target.value });
                    if (editBookErrors.title) setEditBookErrors({ ...editBookErrors, title: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 focus:outline-none ${
                    editBookErrors.title ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                />
                {editBookErrors.title && (
                  <p className="text-[11px] text-red-600 mt-1">{editBookErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Mã ISBN *</label>
                <input
                  type="text"
                  value={editBookForm.isbn}
                  onChange={(e) => {
                    setEditBookForm({ ...editBookForm, isbn: e.target.value });
                    if (editBookErrors.isbn) setEditBookErrors({ ...editBookErrors, isbn: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 font-mono focus:outline-none ${
                    editBookErrors.isbn ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                />
                {editBookErrors.isbn && (
                  <p className="text-[11px] text-red-600 mt-1">{editBookErrors.isbn}</p>
                )}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Ngôn Ngữ</label>
                <input
                  type="text"
                  value={editBookForm.language}
                  onChange={(e) => setEditBookForm({ ...editBookForm, language: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Phân Loại Chuyên Ngành</label>
                <select
                  value={editBookForm.categoryId}
                  onChange={(e) => setEditBookForm({ ...editBookForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none cursor-pointer"
                >
                  <option value="">Chọn ngành phân loại...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Nhà Xuất Bản</label>
                <select
                  value={editBookForm.publisherId}
                  onChange={(e) => setEditBookForm({ ...editBookForm, publisherId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none cursor-pointer"
                >
                  <option value="">Chọn nhà xuất bản...</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Input Field (Saved Directly to DB) */}
              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1 font-serif">
                  Tác Giả * (Ô Nhập Văn Bản Lưu Vào CSDL)
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên tác giả (ví dụ: Nguyễn Du, Nam Cao, Donald E. Knuth)..."
                  value={editBookForm.authorInput}
                  onChange={(e) => {
                    setEditBookForm({ ...editBookForm, authorInput: e.target.value });
                    if (editBookErrors.authorInput) setEditBookErrors({ ...editBookErrors, authorInput: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 focus:outline-none font-serif ${
                    editBookErrors.authorInput ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                />
                {editBookErrors.authorInput ? (
                  <p className="text-[11px] text-red-600 mt-1">{editBookErrors.authorInput}</p>
                ) : (
                  <span className="text-[10px] text-stone-500 font-serif">
                    Nhập tên tác giả bằng ô nhập này để tự động cập nhật bảng Tác giả và liên kết trong CSDL. Phân cách nhiều tác giả bằng dấu phẩy (,).
                  </span>
                )}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Năm Xuất Bản</label>
                <input
                  type="number"
                  value={editBookForm.publicationYear}
                  onChange={(e) => setEditBookForm({ ...editBookForm, publicationYear: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Số Trang</label>
                <input
                  type="number"
                  value={editBookForm.pageCount}
                  onChange={(e) => setEditBookForm({ ...editBookForm, pageCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Đường Dẫn Ảnh Bìa</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={editBookForm.coverImageUrl}
                  onChange={(e) => setEditBookForm({ ...editBookForm, coverImageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-stone-700 font-medium mb-1">Tóm Tắt Nội Dung</label>
                <textarea
                  rows={3}
                  value={editBookForm.description}
                  onChange={(e) => setEditBookForm({ ...editBookForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#ded5c2]">
              <button
                type="button"
                onClick={() => {
                  setShowEditBookModal(false);
                  setEditingBook(null);
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmittingEdit}
                className="px-4 py-2 bg-[#92400e] hover:bg-[#78350f] disabled:opacity-50 text-white font-medium rounded text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                {isSubmittingEdit && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSubmittingEdit ? 'Đang Lưu...' : 'Lưu Thay Đổi Vào CSDL'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Physical Copy Modal */}
      {showAddCopyModal && copyBookTarget && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleAddCopy}
            noValidate
            className="aged-paper border border-[#ded5c2] rounded-lg max-w-sm w-full p-5 shadow-2xl space-y-4 font-serif-data"
          >
            <div className="flex items-center justify-between border-b-2 border-[#b8ac95] pb-2">
              <h3 className="font-bold text-stone-900 text-sm font-serif-display">Thêm Bản Sao Vào Giá Sách</h3>
              <button
                type="button"
                onClick={() => setShowAddCopyModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-800 font-serif font-medium">Ấn phẩm: {copyBookTarget.title}</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Mã Vạch Lưu Chiểu *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: LIB-000456"
                  value={copyCodeInput}
                  onChange={(e) => {
                    setCopyCodeInput(e.target.value);
                    if (copyErrors.copyCode) setCopyErrors({ ...copyErrors, copyCode: '' });
                  }}
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 font-mono focus:outline-none ${
                    copyErrors.copyCode ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                />
                {copyErrors.copyCode && (
                  <p className="text-[11px] text-red-600 mt-1">{copyErrors.copyCode}</p>
                )}
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">Vị Trí Trên Giá Sách</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tầng 2, Dãy A3-12"
                  value={shelfLocationInput}
                  onChange={(e) => setShelfLocationInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fbf9f5] border border-[#dcd6c8] rounded text-stone-900 focus:outline-none focus:border-[#92400e]"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-3 border-t border-[#e6e0d4]">
              <button
                type="button"
                onClick={() => setShowAddCopyModal(false)}
                className="px-3 py-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmittingCopy}
                className="px-3.5 py-1.5 bg-[#92400e] hover:bg-[#78350f] disabled:opacity-50 text-white font-medium rounded text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                {isSubmittingCopy && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSubmittingCopy ? 'Đang Đăng Ký...' : 'Đăng Ký Bản Sao'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
