import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Loan, User } from '../types/index.ts';
import { useToast } from '../context/ToastContext.tsx';
import { DataTable, Column } from './common/DataTable.tsx';
import {
  BookCopy,
  RotateCcw,
  Clock,
  Search,
  AlertTriangle,
  RotateCw,
  Check,
  X,
  CreditCard,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const CirculationDesk: React.FC = () => {
  const toast = useToast();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ONGOING');

  // Checkout inputs & validation
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [copyCodeInput, setCopyCodeInput] = useState<string>('');
  const [checkoutErrors, setCheckoutErrors] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Lost modal state
  const [lostLoanTarget, setLostLoanTarget] = useState<Loan | null>(null);
  const [lostType, setLostType] = useState<'LOST' | 'DAMAGED'>('LOST');
  const [lostFineAmount, setLostFineAmount] = useState<number>(200000);
  const [isSubmittingLost, setIsSubmittingLost] = useState(false);
  const [lostError, setLostError] = useState<string>('');

  const [inActionLoanId, setInActionLoanId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loansRes, membersRes] = await Promise.all([
        api.getLoans({ status: filterStatus || undefined, size: 100 }),
        api.getUsers({ role: 'MEMBER', size: 100 }),
      ]);
      setLoans(loansRes.content || []);
      setMembers(membersRes.content || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch circulation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const validateCheckout = () => {
    const errs: Record<string, string> = {};
    if (!selectedMemberId) {
      errs.memberId = 'Vui lòng chọn một độc giả thư viện đã đăng ký';
    }
    if (!copyCodeInput.trim()) {
      errs.copyCode = 'Vui lòng nhập mã vạch/mã đăng ký bản sách';
    }
    setCheckoutErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckout()) return;

    setIsCheckingOut(true);
    try {
      // Find copy by copyCode
      const booksRes = await api.getBooks({ q: copyCodeInput.trim() });
      let matchedCopyId: number | null = null;

      for (const b of booksRes.content || []) {
        const fullBook = await api.getBook(b.id);
        const match = fullBook.copies?.find(
          (c: any) => c.copyCode.toLowerCase() === copyCodeInput.trim().toLowerCase()
        );
        if (match) {
          matchedCopyId = match.id;
          break;
        }
      }

      if (!matchedCopyId) {
        const parsedId = parseInt(copyCodeInput.trim(), 10);
        if (!isNaN(parsedId)) {
          matchedCopyId = parsedId;
        } else {
          throw new Error(`Không tìm thấy bản sách có mã "${copyCodeInput.trim()}" trong hồ sơ thư viện.`);
        }
      }

      await api.checkout({
        memberId: parseInt(selectedMemberId, 10),
        bookCopyId: matchedCopyId,
      });

      toast.success('Đã ghi nhận cho mượn sách thành công cho độc giả!', 'Hoàn Tất Cho Mượn');
      setCopyCodeInput('');
      setCheckoutErrors({});
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Cho mượn sách thất bại.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleReturn = async (loanId: number) => {
    setInActionLoanId(loanId);
    try {
      const res = await api.returnLoan(loanId);
      if (res.fineGenerated) {
        toast.warning(
          `Ghi nhận trả sách quá hạn. Phát sinh phí phạt ${Number(
            res.fineGenerated.amount
          ).toLocaleString()} VND.`,
          'Trả Sách Quá Hạn'
        );
      } else {
        toast.success('Đã nhận trả sách trong tình trạng tốt. Bản sách đã có sẵn trên giá.', 'Xử Lý Trả Thành Công');
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Không thể thực hiện nhận trả sách.');
    } finally {
      setInActionLoanId(null);
    }
  };

  const handleRenew = async (loanId: number) => {
    setInActionLoanId(loanId);
    try {
      await api.renewLoan(loanId);
      toast.success('Hạn mượn sách đã được gia hạn thêm 14 ngày.', 'Đã Gia Hạn');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Yêu cầu gia hạn bị từ chối.');
    } finally {
      setInActionLoanId(null);
    }
  };

  const handleReportLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostLoanTarget) return;

    if (!lostFineAmount || lostFineAmount < 0) {
      setLostError('Vui lòng nhập số tiền phạt hợp lệ không âm');
      return;
    }

    setIsSubmittingLost(true);
    try {
      await api.reportLost(lostLoanTarget.id, {
        type: lostType,
        fineAmount: Number(lostFineAmount),
      });
      toast.success(
        `Đã cập nhật tình trạng thành ${lostType === 'LOST' ? 'MẤT SÁCH' : 'HƯ HỎNG'}. Phát sinh phí bồi hoàn ${Number(lostFineAmount).toLocaleString()} VND.`,
        'Đã Cập Nhật Tình Trạng'
      );
      setLostLoanTarget(null);
      setLostError('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái mất/hư hỏng.');
    } finally {
      setIsSubmittingLost(false);
    }
  };

  const columns: Column<Loan>[] = [
    {
      key: 'bookTitle',
      header: 'Tựa Sách & Mã Bản',
      sortable: true,
      render: (l) => (
        <div>
          <div className="font-bold text-stone-900 font-serif text-sm leading-snug line-clamp-1">
            {l.bookCopy.book.title}
          </div>
          <div className="text-[11px] font-mono text-stone-700 mt-0.5 flex items-center gap-1.5">
            <span className="bg-[#f4eee2] px-1.5 py-0.2 rounded border border-[#ded5c2] font-semibold">{l.bookCopy.copyCode}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'patron',
      header: 'Độc Giả',
      sortable: true,
      render: (l) => (
        <div>
          <div className="font-bold text-stone-900 font-serif text-sm">{l.member.fullName}</div>
          <div className="text-[11px] text-stone-600 truncate max-w-[150px] font-sans">{l.member.email}</div>
        </div>
      ),
    },
    {
      key: 'loanDate',
      header: 'Ngày Mượn',
      sortable: true,
      render: (l) => <span className="text-stone-800 font-serif font-medium text-xs">{l.loanDate}</span>,
    },
    {
      key: 'dueDate',
      header: 'Hạn Trả',
      sortable: true,
      render: (l) => {
        const isLate =
          l.status === 'OVERDUE' || (l.status === 'ONGOING' && new Date(l.dueDate) < new Date());
        return (
          <span
            className={`font-serif text-xs font-bold ${
              isLate ? 'text-red-700' : 'text-stone-900'
            }`}
          >
            {l.dueDate}
          </span>
        );
      },
    },
    {
      key: 'renewalCount',
      header: 'Gia Hạn',
      sortable: true,
      align: 'center',
      render: (l) => (
        <span className="text-stone-700 text-xs font-serif font-semibold">
          {l.renewalCount} / 2
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      sortable: true,
      render: (l) => {
        const isOverdue =
          l.status === 'OVERDUE' || (l.status === 'ONGOING' && new Date(l.dueDate) < new Date());
        return (
          <span
            className={`text-xs font-serif font-bold ${
              isOverdue
                ? 'text-red-700'
                : l.status === 'ONGOING'
                ? 'text-amber-900'
                : l.status === 'RETURNED'
                ? 'text-emerald-800'
                : 'text-stone-600'
            }`}
          >
            {isOverdue ? 'QUÁ HẠN' : l.status === 'ONGOING' ? 'ĐANG MƯỢN' : l.status === 'RETURNED' ? 'ĐÃ TRẢ' : l.status === 'LOST' ? 'MẤT' : l.status}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      align: 'right',
      render: (l) => {
        const isPending = inActionLoanId === l.id;
        if (l.status === 'RETURNED' || l.status === 'LOST') {
          return <span className="text-[11px] text-stone-400">Đã lưu trữ</span>;
        }

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleReturn(l.id)}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-semibold rounded transition disabled:opacity-40 cursor-pointer flex items-center gap-1"
              title="Nhận trả sách"
            >
              {isPending && <RotateCw className="w-3 h-3 animate-spin" />}
              <span>Nhận Trả</span>
            </button>
            <button
              type="button"
              disabled={isPending || l.renewalCount >= 2}
              onClick={() => handleRenew(l.id)}
              className="px-2.5 py-1 bg-[#fbf9f5] hover:bg-[#f1ede4] border border-[#dcd6c8] text-stone-800 text-[11px] rounded transition disabled:opacity-30 cursor-pointer font-medium"
              title={l.renewalCount >= 2 ? 'Đã hết lượt gia hạn' : 'Gia hạn thêm 14 ngày'}
            >
              Gia Hạn
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setLostLoanTarget(l);
                setLostError('');
              }}
              className="px-2 py-1 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded text-[11px] transition cursor-pointer"
              title="Ghi nhận mất hoặc hư hỏng"
            >
              Xử Phạt
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="aged-paper border border-[#ded5c2] rounded-lg p-6 shadow-2xs">
        <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
          <BookCopy className="w-4 h-4" />
          <span>Nghiệp Vụ Lưu Hành</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 font-serif-display tracking-tight">
          Quầy Lưu Hành &amp; Mượn Trả Sách
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 font-serif-data">
          Thực hiện cho độc giả mượn sách, xử lý nhận trả, gia hạn thời gian mượn và lập biên bản sách thất lạc/hư hại
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fast Checkout Form Panel */}
        <div className="lg:col-span-1 aged-paper-card border border-[#ded5c2] rounded-lg p-5 shadow-2xs space-y-4 h-fit">
          <div className="flex items-center space-x-2 border-b-2 border-[#b8ac95] pb-3">
            <BookCopy className="w-4 h-4 text-[#92400e]" />
            <h2 className="font-bold text-stone-900 text-base font-serif-display">
              Cho Mượn Sách (Xuất Kho)
            </h2>
          </div>

          <form onSubmit={handleCheckout} noValidate className="space-y-3.5 text-xs font-serif-data">
            <div>
              <label className="block text-stone-800 font-bold mb-1 font-serif">Độc Giả Thư Viện (Đang Hoạt Động) *</label>
              <select
                value={selectedMemberId}
                onChange={(e) => {
                  setSelectedMemberId(e.target.value);
                  if (checkoutErrors.memberId) setCheckoutErrors({ ...checkoutErrors, memberId: '' });
                }}
                className={`w-full px-3 py-2 bg-[#fcfbf7] border rounded text-stone-900 focus:outline-none cursor-pointer font-serif ${
                  checkoutErrors.memberId ? 'border-red-500' : 'border-[#d5ccba] focus:border-[#92400e]'
                }`}
              >
                <option value="">-- Chọn Độc Giả Đã Đăng Ký --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.email}) [{m.status === 'ACTIVE' ? 'Hoạt động' : m.status}]
                  </option>
                ))}
              </select>
              {checkoutErrors.memberId && (
                <p className="text-[11px] text-red-600 mt-1">{checkoutErrors.memberId}</p>
              )}
            </div>

            <div>
              <label className="block text-stone-800 font-serif font-semibold mb-1">Mã Vạch / Mã Bản Sách *</label>
              <input
                type="text"
                placeholder="Ví dụ: LIB-000101"
                value={copyCodeInput}
                onChange={(e) => {
                  setCopyCodeInput(e.target.value);
                  if (checkoutErrors.copyCode) setCheckoutErrors({ ...checkoutErrors, copyCode: '' });
                }}
                className={`w-full px-3 py-2 bg-[#fcfbf7] border rounded text-stone-900 font-mono focus:outline-none ${
                  checkoutErrors.copyCode ? 'border-red-500' : 'border-[#d5ccba] focus:border-[#92400e]'
                }`}
              />
              {checkoutErrors.copyCode ? (
                <p className="text-[11px] text-red-600 mt-1">{checkoutErrors.copyCode}</p>
              ) : (
                <span className="text-[10px] text-stone-500 mt-1 block font-serif-data">
                  Quét mã vạch trên gáy/phiếu sách hoặc nhập mã định danh bản sách
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isCheckingOut}
              className="w-full py-2.5 bg-[#92400e] hover:bg-[#78350f] disabled:opacity-50 text-white font-serif font-bold rounded transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {isCheckingOut ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Đang Ghi Nhận Cho Mượn...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Hoàn Tất Cho Mượn Sách</span>
                </>
              )}
            </button>
          </form>

          {/* Policy summary */}
          <div className="p-3.5 bg-[#fcfbf7] rounded border border-[#ded5c2] text-[11px] text-stone-700 space-y-1.5 font-serif-data shadow-2xs">
            <p className="font-bold text-stone-900 flex items-center gap-1.5 font-serif">
              <ShieldAlert className="w-3.5 h-3.5 text-[#92400e]" />
              <span>Quy Định Quầy Lưu Hành</span>
            </p>
            <p className="text-stone-600">• Thời hạn mượn tiêu chuẩn: 14 ngày</p>
            <p className="text-stone-600">• Tối đa 2 lần gia hạn cho mỗi bản sách</p>
            <p className="text-stone-600">• Tiền phạt quá hạn &gt; 50.000 VND sẽ tạm khóa quyền mượn</p>
            <p className="text-stone-600">• Bản sách được trả sẽ tự động chuyển cho độc giả đang đặt trước</p>
          </div>
        </div>

        {/* Loans Table Panel */}
        <div className="lg:col-span-2 space-y-3">
          <DataTable
            columns={columns}
            data={loans}
            loading={loading}
            emptyTitle={`Không có lượt mượn nào ở trạng thái ${filterStatus}`}
            emptyDescription="Hiện không có lượt mượn nào phù hợp với bộ lọc lưu hành đã chọn."
            searchPlaceholder="Tìm kiếm theo tựa sách, tên độc giả hoặc mã bản sách..."
            searchFilter={(item, query) => {
              const q = query.toLowerCase();
              return (
                item.bookCopy.book.title.toLowerCase().includes(q) ||
                item.bookCopy.copyCode.toLowerCase().includes(q) ||
                item.member.fullName.toLowerCase().includes(q) ||
                item.member.email.toLowerCase().includes(q)
              );
            }}
            actions={
              <div className="flex items-center gap-1 bg-[#fcfbf7] p-1 rounded border border-[#ded5c2] text-xs font-serif-data">
                {([
                  { key: 'ONGOING', label: 'Đang mượn' },
                  { key: 'OVERDUE', label: 'Quá hạn' },
                  { key: 'RETURNED', label: 'Đã trả' },
                  { key: 'LOST', label: 'Mất/Hư hỏng' },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilterStatus(key)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer font-serif ${
                      filterStatus === key
                        ? 'bg-[#92400e] text-white font-bold shadow-xs'
                        : 'text-stone-700 hover:text-stone-900 hover:bg-[#f2ece0]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          />
        </div>
      </div>

      {/* Assessment Modal (Lost / Damaged) */}
      {lostLoanTarget && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleReportLost}
            noValidate
            className="aged-paper border border-[#ded5c2] rounded-lg max-w-sm w-full p-5 shadow-2xl space-y-4 font-serif-data"
          >
            <div className="flex items-center justify-between border-b-2 border-[#b8ac95] pb-2">
              <h3 className="font-bold text-stone-900 text-sm font-serif-display">
                Đánh Giá Tình Trạng &amp; Lập Phí Bồi Thường
              </h3>
              <button
                type="button"
                onClick={() => setLostLoanTarget(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1">
              <p className="font-bold text-stone-900 font-serif">{lostLoanTarget.bookCopy.book.title}</p>
              <p className="text-stone-600 font-mono">
                Mã bản sách: {lostLoanTarget.bookCopy.copyCode}
              </p>
              <p className="text-stone-700 font-serif">Độc giả: {lostLoanTarget.member.fullName}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-800 font-serif font-semibold mb-1">Phân Loại Sự Cố *</label>
                <select
                  value={lostType}
                  onChange={(e) => setLostType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#fcfbf7] border border-[#d5ccba] rounded text-stone-900 cursor-pointer focus:outline-none focus:border-[#92400e] font-serif"
                >
                  <option value="LOST">Làm Mất Sách (Không thể thu hồi)</option>
                  <option value="DAMAGED">Hư Hỏng Nặng / Không Thể Sử Dụng Tiếp</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-800 font-serif font-semibold mb-1">Mức Phí Bồi Hoàn (VND) *</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={lostFineAmount}
                  onChange={(e) => {
                    setLostFineAmount(Number(e.target.value));
                    if (lostError) setLostError('');
                  }}
                  className={`w-full px-3 py-2 bg-[#fcfbf7] border rounded text-stone-900 focus:outline-none font-mono ${
                    lostError ? 'border-red-500' : 'border-[#d5ccba] focus:border-[#92400e]'
                  }`}
                />
                {lostError && <p className="text-[11px] text-red-600 mt-1">{lostError}</p>}
                <span className="text-[10px] text-stone-500 mt-1 block">
                  Mức phí bồi hoàn bản sách tiêu chuẩn: 200.000 VND
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t-2 border-[#b8ac95]">
              <button
                type="button"
                onClick={() => setLostLoanTarget(null)}
                className="px-3 py-1.5 bg-[#fcfbf7] hover:bg-[#f2ece0] text-stone-700 border border-[#d5ccba] rounded text-xs cursor-pointer font-serif"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmittingLost}
                className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-serif font-bold rounded text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                {isSubmittingLost && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác Nhận Xử Phạt</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
