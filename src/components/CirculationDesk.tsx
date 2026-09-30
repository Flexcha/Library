import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Loan, User } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DataTable, Column } from './common/DataTable.tsx';
import {
  BookCopy,
  RotateCw,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';

export const CirculationDesk: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

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
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN' && user.role !== 'LIBRARIAN')) {
      return;
    }
    setLoading(true);
    try {
      const [loansRes, membersRes] = await Promise.all([
        api.getLoans({ status: filterStatus || undefined, size: 100 }),
        api.getUsers({ size: 100 }),
      ]);
      setLoans(loansRes.content || []);
      setMembers(membersRes.content || []);
    } catch (err: any) {
      if (err.statusCode !== 403 && err.statusCode !== 401) {
        toast.error(err.message || 'Không thể tải dữ liệu lưu thông.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus, user]);


  const validateCheckout = () => {
    const errs: Record<string, string> = {};
    if (!selectedMemberId) {
      errs.memberId = 'Vui lòng chọn độc giả';
    }
    if (!copyCodeInput.trim()) {
      errs.copyCode = 'Vui lòng nhập mã bản sao';
    }
    setCheckoutErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckout()) return;

    setIsCheckingOut(true);
    try {
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
          throw new Error(`Không tìm thấy bản sao có mã "${copyCodeInput.trim()}".`);
        }
      }

      await api.checkout({
        memberId: parseInt(selectedMemberId, 10),
        bookCopyId: matchedCopyId,
      });

      toast.success('Đã ghi nhận mượn sách thành công!', 'Thành công');
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
          `Trả sách quá hạn. Phạt: ${Number(res.fineGenerated.amount).toLocaleString()} VNĐ.`,
          'Quá hạn'
        );
      } else {
        toast.success('Đã nhận trả sách thành công!', 'Thành công');
      }
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Nhận trả sách thất bại.');
    } finally {
      setInActionLoanId(null);
    }
  };

  const handleRenew = async (loanId: number) => {
    setInActionLoanId(loanId);
    try {
      await api.renewLoan(loanId);
      toast.success('Đã gia hạn mượn sách thêm 14 ngày.');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Gia hạn thất bại.');
    } finally {
      setInActionLoanId(null);
    }
  };

  const handleReportLost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostLoanTarget) return;

    if (!lostFineAmount || lostFineAmount < 0) {
      setLostError('Số tiền phạt phải lớn hơn hoặc bằng 0');
      return;
    }

    setIsSubmittingLost(true);
    try {
      await api.reportLost(lostLoanTarget.id, {
        type: lostType,
        fineAmount: Number(lostFineAmount),
      });
      toast.success(
        `Đã ghi nhận ${lostType === 'LOST' ? 'MẤT SÁCH' : 'HƯ HỎNG'}. Phí bồi hoàn: ${Number(lostFineAmount).toLocaleString()} VNĐ.`
      );
      setLostLoanTarget(null);
      setLostError('');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Xử lý thất bại.');
    } finally {
      setIsSubmittingLost(false);
    }
  };

  const handleStatusChange = async (loanId: number, newStatus: string) => {
    setInActionLoanId(loanId);
    try {
      await api.updateLoanStatus(loanId, newStatus);
      toast.success('Đã cập nhật trạng thái phiếu mượn sách thành công!', 'Thành công');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Chuyển trạng thái thất bại.');
    } finally {
      setInActionLoanId(null);
    }
  };

  const columns: Column<Loan>[] = [
    {
      key: 'bookTitle',
      header: 'Tựa Sách & Mã Bản Sao',
      sortable: true,
      render: (l) => (
        <div>
          <div className="font-semibold text-white text-sm">
            {l.bookCopy?.book?.title || 'Tài liệu không xác định'}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            Mã: <span className="bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded border border-white/10">{l.bookCopy?.copyCode || 'N/A'}</span>
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
          <div className="font-semibold text-white text-sm">{l.member?.fullName || '—'}</div>
          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{l.member?.email || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'loanDate',
      header: 'Ngày Mượn',
      sortable: true,
      render: (l) => <span className="text-slate-300 text-xs">{l.loanDate}</span>,
    },
    {
      key: 'dueDate',
      header: 'Hạn Trả',
      sortable: true,
      render: (l) => {
        const isLate = l.status === 'OVERDUE' || (l.status === 'ONGOING' && new Date(l.dueDate) < new Date());
        return (
          <span className={`text-xs font-semibold ${isLate ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
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
      render: (l) => <span className="text-slate-300 text-xs font-mono">{l.renewalCount} / 2</span>,
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      sortable: true,
      render: (l) => {
        const isOverdue = l.status === 'OVERDUE' || (l.status === 'ONGOING' && new Date(l.dueDate) < new Date());
        const currentVal = isOverdue && l.status === 'ONGOING' ? 'OVERDUE' : l.status;
        return (
          <select
            value={currentVal}
            disabled={inActionLoanId === l.id}
            onChange={(e) => handleStatusChange(l.id, e.target.value)}
            className="ui-input py-1 px-2 text-xs font-semibold cursor-pointer min-w-[120px] bg-slate-900 border-slate-700 text-white rounded-lg"
          >
            <option value="ONGOING" className="bg-slate-900 text-blue-400 font-bold">ĐANG MƯỢN</option>
            <option value="RETURNED" className="bg-slate-900 text-emerald-400 font-bold">ĐÃ TRẢ</option>
            <option value="OVERDUE" className="bg-slate-900 text-rose-400 font-bold">QUÁ HẠN</option>
            <option value="LOST" className="bg-slate-900 text-amber-400 font-bold">BÁO MẤT</option>
          </select>
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
          return <span className="text-[11px] text-slate-400">Đã lưu hồ sơ</span>;
        }

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleReturn(l.id)}
              className="btn-primary py-1 px-2.5 text-xs rounded-lg"
            >
              {isPending && <RotateCw className="w-3 h-3 animate-spin" />}
              <span>Nhận trả</span>
            </button>
            <button
              type="button"
              disabled={isPending || l.renewalCount >= 2}
              onClick={() => handleRenew(l.id)}
              className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40 rounded-lg"
            >
              Gia hạn
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setLostLoanTarget(l);
                setLostError('');
              }}
              className="btn-ghost py-1 px-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg"
            >
              Xử phạt
            </button>
          </div>
        );
      },
    },
  ];


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="ui-card p-6 space-y-1 border border-white/10">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <BookCopy className="w-4 h-4" />
          <span>Nghiệp Vụ Thủ Thư</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Bàn Mượn & Trả Sách (Circulation Desk)
        </h1>
        <p className="text-sm text-slate-400">
          Ghi nhận cho mượn mới, xử lý nhận trả sách, gia hạn và lập phạt cho tài liệu hư hỏng/mất mát.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fast Checkout Form Panel */}
        <div className="lg:col-span-1 ui-card p-5 space-y-4 h-fit border border-white/10">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <BookCopy className="w-4.5 h-4.5 text-indigo-400" />
            <h2 className="font-bold text-white text-base">
              Lập Phiếu Mượn Sách
            </h2>
          </div>

          <form onSubmit={handleCheckout} noValidate className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Độc giả mượn sách *</label>
              <select
                value={selectedMemberId}
                onChange={(e) => {
                  setSelectedMemberId(e.target.value);
                  if (checkoutErrors.memberId) setCheckoutErrors({ ...checkoutErrors, memberId: '' });
                }}
                className="ui-input cursor-pointer bg-slate-900 border-slate-700 text-white rounded-lg"
              >
                <option value="" className="bg-slate-900">-- Chọn độc giả --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900">
                    {m.fullName} ({m.email})
                  </option>
                ))}
              </select>
              {checkoutErrors.memberId && (
                <p className="text-xs text-rose-400 mt-1">{checkoutErrors.memberId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mã bản sao / Mã vạch *</label>
              <input
                type="text"
                placeholder="Nhập mã bản sao (VD: CPY-1001)"
                value={copyCodeInput}
                onChange={(e) => {
                  setCopyCodeInput(e.target.value);
                  if (checkoutErrors.copyCode) setCheckoutErrors({ ...checkoutErrors, copyCode: '' });
                }}
                className="ui-input font-mono uppercase bg-slate-900 border-slate-700 text-white rounded-lg"
              />
              {checkoutErrors.copyCode && (
                <p className="text-xs text-rose-400 mt-1">{checkoutErrors.copyCode}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isCheckingOut}
              className="btn-primary w-full py-2.5 text-xs disabled:opacity-50 rounded-lg"
            >
              {isCheckingOut ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Đang ghi nhận...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xác nhận cho mượn</span>
                </>
              )}
            </button>
          </form>

          <div className="p-3 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span>Quy định cho mượn</span>
            </div>
            <p>• Hạn mượn: 14 ngày</p>
            <p>• Tối đa 2 lần gia hạn</p>
            <p>• Phí phạt trễ hạn: 5.000 VNĐ / ngày</p>
          </div>
        </div>

        {/* Loans Table Panel */}
        <div className="lg:col-span-2 space-y-3">
          <DataTable
            columns={columns}
            data={loans}
            loading={loading}
            emptyTitle={`Không có lượt mượn nào (${filterStatus})`}
            emptyDescription="Không tìm thấy phiếu mượn phù hợp."
            searchPlaceholder="Tìm theo tên độc giả, tựa sách, mã bản sao..."
            searchFilter={(item, query) => {
              const q = query.toLowerCase();
              return Boolean(
                (item.bookCopy?.book?.title || '').toLowerCase().includes(q) ||
                (item.bookCopy?.copyCode || '').toLowerCase().includes(q) ||
                (item.member?.fullName || '').toLowerCase().includes(q) ||
                (item.member?.email || '').toLowerCase().includes(q)
              );
            }}
            actions={
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10 text-xs">
                {([
                  { key: '', label: 'Tất cả' },
                  { key: 'ONGOING', label: 'Đang mượn' },
                  { key: 'OVERDUE', label: 'Quá hạn' },
                  { key: 'RETURNED', label: 'Đã trả' },
                  { key: 'LOST', label: 'Mất/Hư hỏng' },
                ] as const).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilterStatus(key)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                      filterStatus === key
                        ? 'bg-indigo-600 text-white font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
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

      {/* Lost / Damaged Assessment Modal */}
      {lostLoanTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleReportLost}
            noValidate
            className="bg-[#0d1322] border border-white/10 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-white text-sm">
                Xử Phạt Sách Thất Lạc / Hư Hỏng
              </h3>
              <button
                type="button"
                onClick={() => setLostLoanTarget(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="font-semibold text-white">{lostLoanTarget.bookCopy.book.title}</p>
              <p className="text-slate-400 font-mono">Mã bản sao: {lostLoanTarget.bookCopy.copyCode}</p>
              <p className="text-slate-400">Độc giả: {lostLoanTarget.member.fullName}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Loại sự cố *</label>
                <select
                  value={lostType}
                  onChange={(e) => setLostType(e.target.value as any)}
                  className="ui-input cursor-pointer bg-slate-900 border-slate-700 text-white rounded-lg"
                >
                  <option value="LOST" className="bg-slate-900">Làm mất sách</option>
                  <option value="DAMAGED" className="bg-slate-900">Hư hỏng nặng không thể dùng tiếp</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Mức phí bồi hoàn (VNĐ) *</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={lostFineAmount}
                  onChange={(e) => {
                    setLostFineAmount(Number(e.target.value));
                    if (lostError) setLostError('');
                  }}
                  className="ui-input font-mono bg-slate-900 border-slate-700 text-white rounded-lg"
                />
                {lostError && <p className="text-xs text-rose-400 mt-1">{lostError}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setLostLoanTarget(null)}
                className="btn-secondary rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmittingLost}
                className="btn-primary bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                {isSubmittingLost ? 'Đang lưu...' : 'Xác nhận xử phạt'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

