export type UserRole = 'ADMIN' | 'LIBRARIAN' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: UserRole;
  status: UserStatus;
  membershipExpiryDate?: string | null;
  createdAt?: string;
}

export interface Author {
  id: number;
  name: string;
  biography?: string | null;
  birthDate?: string | null;
  nationality?: string | null;
}

export interface Category {
  id: number;
  name: string;
  description?: string | null;
  parentCategoryId?: number | null;
  parentCategory?: { id: number; name: string } | null;
}

export interface Publisher {
  id: number;
  name: string;
  address?: string | null;
  website?: string | null;
}

export type CopyStatus = 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'LOST' | 'DAMAGED' | 'WITHDRAWN';

export interface BookCopy {
  id: number;
  bookId?: number;
  copyCode: string;
  status: CopyStatus;
  shelfLocation?: string | null;
  acquisitionDate?: string | null;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  publicationYear?: number | null;
  language?: string | null;
  edition?: string | null;
  pageCount?: number | null;
  categoryId?: number | null;
  publisherId?: number | null;
  category?: { id: number; name: string; description?: string } | null;
  publisher?: { id: number; name: string; website?: string } | null;
  authors: Array<{ id: number; name: string; nationality?: string }>;
  totalCopies: number;
  availableCopies: number;
  copies?: BookCopy[];
}

export type LoanStatus = 'ONGOING' | 'RETURNED' | 'OVERDUE' | 'LOST';

export interface Loan {
  id: number;
  bookCopyId: number;
  memberId: number;
  librarianId: number;
  loanDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: LoanStatus;
  renewalCount: number;
  bookCopy: {
    id: number;
    copyCode: string;
    book: {
      id: number;
      title: string;
      isbn?: string;
    };
  };
  member: {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  librarian?: {
    id: number;
    fullName: string;
  };
}

export type ReservationStatus = 'PENDING' | 'READY' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export interface Reservation {
  id: number;
  bookId: number;
  memberId: number;
  reservationDate: string;
  status: ReservationStatus;
  queuePosition: number;
  expiryDate?: string | null;
  book: {
    id: number;
    title: string;
    isbn?: string;
    coverImageUrl?: string | null;
  };
  member?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export type FineStatus = 'UNPAID' | 'PAID' | 'WAIVED';
export type FineReason = 'LATE_RETURN' | 'LOST_BOOK' | 'DAMAGED_BOOK';

export interface Fine {
  id: number;
  loanId: number;
  memberId: number;
  amount: number;
  reason: FineReason;
  status: FineStatus;
  issuedDate: string;
  paidDate?: string | null;
  waivedBy?: number | null;
  waivedUser?: {
    id: number;
    fullName: string;
  } | null;
  member: {
    id: number;
    fullName: string;
    email: string;
    phone?: string | null;
  };
  loan?: {
    bookCopy?: {
      book?: {
        id: number;
        title: string;
        isbn?: string;
      };
    };
  };
}

export interface NotificationItem {
  id: number;
  userId: number;
  type: 'DUE_SOON' | 'OVERDUE' | 'RESERVATION_READY' | 'FINE_ISSUED';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  activeLoans: number;
  overdueLoans: number;
  pendingReservations: number;
  unpaidFinesCount: number;
  unpaidFinesTotal: number;
  totalBooks: number;
  totalMembers: number;
}
