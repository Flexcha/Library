import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Loan } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { EmptyState } from './common/EmptyState.tsx';
import { Clock, CheckCircle2, RotateCw, BookOpen, CreditCard, ShieldCheck, Library } from 'lucide-react';

const MAX_RENEWALS = 2;

export const MyLoans: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingLoanId, setRenewingLoanId] = useState<number | null>(null);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await api.getLoans({ size: 100 });
      setLoans(res.content || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to retrieve loans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleRenew = async (loanId: number) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (targetLoan && targetLoan.renewalCount >= MAX_RENEWALS) {
      toast.warning(
        `Đã đạt giới hạn gia hạn (tối đa ${MAX_RENEWALS} lần). Tác phẩm này không thể gia hạn thêm.`,
        'Đã Đạt Giới Hạn'
      );
      return;
    }

    setRenewingLoanId(loanId);
    try {
      await api.renewLoan(loanId);
      toast.success(
        targetLoan
          ? `Tác phẩm "${targetLoan.bookCopy.book.title}" đã được gia hạn thêm 14 ngày!`
          : 'Đã gia hạn mượn sách thành công! Hạn trả lùi thêm 14 ngày.',
        'Gia Hạn Thành Công'
      );
      await fetchLoans();
    } catch (err: any) {
      toast.error(err.message || 'Không thể gia hạn sách.');
    } finally {
      setRenewingLoanId(null);
    }
  };

  const activeLoans = loans.filter((l) => l.status === 'ONGOING' || l.status === 'OVERDUE');
  const pastLoans = loans.filter((l) => l.status === 'RETURNED' || l.status === 'LOST');

  const getDaysRemaining = (dueDateStr: string) => {
    const today = new Date();
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Authentic Virtual Library Patron Card */}
      {user && user.role === 'MEMBER' && (
        <div className="aged-paper-warm border border-[#d6ccb8] rounded-xl p-6 shadow-xs relative overflow-hidden library-card-emboss">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider font-serif">
                <Library className="w-4 h-4" />
                <span>Thư Viện Nghiên Cứu &amp; Lưu Hành Athenaeum</span>
              </div>
              <h2 className="text-2xl font-bold font-serif-display text-stone-900 tracking-tight">
                Thẻ Độc Giả Chính Thức &amp; Sổ Mượn Sách
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-700 pt-1 font-serif-data">
                <span>Chủ thẻ: <strong className="text-stone-900 font-bold font-serif text-sm">{user.fullName}</strong></span>
                <span>·</span>
                <span className="font-mono text-stone-800">Mã ĐG: #PAT-{String(user.id).padStart(5, '0')}</span>
                <span>·</span>
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tài Khoản Tốt · Quyền Mượn Lưu Hành Đang Hoạt Động</span>
                </span>
              </div>
            </div>

            {/* Decorative Barcode & Ledger Balance */}
            <div className="flex flex-col items-start md:items-end justify-between bg-[#fbf9f4] border border-[#d6ccb8] p-4 rounded-lg self-start md:self-auto shrink-0 min-w-[200px] shadow-2xs">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 font-mono">
                MÃ VẠCH ĐỘC GIẢ
              </span>
              <div className="font-mono text-xl tracking-widest text-stone-800 my-1 select-none">
                ||| | |||| | || ||||
              </div>
              <div className="text-[11px] text-stone-700 font-serif-data">
                Sách đang mượn trên thẻ: <strong className="text-stone-900 font-bold font-serif text-sm">{activeLoans.length}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff View Header (for Admin & Librarian) */}
      {user && user.role !== 'MEMBER' && (
        <div className="aged-paper border border-[#ded5c2] rounded-lg p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
              <Clock className="w-4 h-4" />
              <span>Sổ Đăng Ký Lưu Hành Tại Quầy</span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 font-serif-display tracking-tight">
              Tất Cả Lượt Mượn Đang Hoạt Động &amp; Lịch Sử
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-serif-data">
              Nhật ký lưu hành toàn thư viện, theo dõi gia hạn và cảnh báo quá hạn
            </p>
          </div>
          <div className="px-4 py-2 bg-[#fcfbf7] border border-[#d5ccba] rounded text-center self-start sm:self-auto shadow-2xs">
            <span className="text-[10px] text-stone-500 block uppercase font-mono tracking-wider">
              Sách Đang Mượn
            </span>
            <span className="text-xl font-bold text-[#92400e] font-serif-display">
              {activeLoans.length} Cuốn
            </span>
          </div>
        </div>
      )}

      {/* Active Loans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-[#b8ac95] pb-2">
          <h2 className="text-base font-bold text-stone-900 font-serif-display flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#92400e]" />
            <span>Sách Đang Mượn ({activeLoans.length})</span>
          </h2>
          <span className="text-xs text-stone-600 font-serif-data">
            Thời hạn mượn tiêu chuẩn: 14 Ngày · Tối đa 2 lần gia hạn
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-lg border border-[#e6e0d4] bg-white h-44 animate-shimmer" />
            <div className="p-5 rounded-lg border border-[#e6e0d4] bg-white h-44 animate-shimmer" />
          </div>
        ) : activeLoans.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Không Có Lượt Mượn Nào Đang Hoạt Động"
            description="Hiện bạn chưa mượn cuốn sách nào. Hãy khám phá các tác phẩm có sẵn để mượn ngay trong danh mục thẻ thư viện."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeLoans.map((loan) => {
              const daysLeft = getDaysRemaining(loan.dueDate);
              const isOverdue = daysLeft < 0 || loan.status === 'OVERDUE';
              const isWithinRenewalLimits =
                (loan.status === 'ONGOING' || loan.status === 'OVERDUE') &&
                loan.renewalCount < MAX_RENEWALS;
              const isRenewing = renewingLoanId === loan.id;

              return (
                <div
                  key={loan.id}
                  className={`p-5 rounded-lg border shadow-2xs flex flex-col justify-between space-y-4 transition ${
                    isOverdue
                      ? 'bg-[#fef2f2] border-red-300'
                      : daysLeft <= 2
                      ? 'bg-[#fffbeb] border-amber-300'
                      : 'aged-paper-card border-[#ded5c2]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 border-b border-[#e7dfcf] pb-2">
                      <h3 className="font-bold text-stone-900 text-base font-serif-display leading-snug">
                        {loan.bookCopy.book.title}
                      </h3>
                      <span
                        className={`text-[11px] font-mono shrink-0 font-medium px-2 py-0.5 rounded border ${
                          isOverdue
                            ? 'text-red-700 bg-red-50 border-red-200 font-bold'
                            : daysLeft <= 2
                            ? 'text-amber-800 bg-amber-50 border-amber-200 font-bold'
                            : 'text-stone-700 bg-[#f4eee2] border-[#ded5c2]'
                        }`}
                      >
                        {isOverdue
                          ? `QUÁ HẠN (${Math.abs(daysLeft)} ngày)`
                          : `Còn ${daysLeft} ngày`}
                      </span>
                    </div>

                    <div className="text-xs text-stone-700 space-y-1.5 font-serif-data">
                      <p>
                        Mã vạch bản sách:{' '}
                        <span className="font-mono font-semibold text-stone-900 bg-[#f4eee2] px-1.5 py-0.5 rounded border border-[#ded5c2]">
                          {loan.bookCopy.copyCode}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5 text-stone-700">
                        <span>Ngày mượn: <span className="font-semibold text-stone-800 font-serif">{loan.loanDate}</span></span>
                        <span aria-hidden="true">·</span>
                        <span>Hạn trả: <strong className="text-stone-900 font-bold font-serif text-sm">{loan.dueDate}</strong></span>
                      </p>
                      <p>
                        Đã gia hạn: <strong className="text-stone-900 font-bold font-serif">{loan.renewalCount}</strong> / {MAX_RENEWALS}
                        {loan.renewalCount >= MAX_RENEWALS && (
                          <span className="text-[#92400e] font-semibold ml-1.5">(Hết lượt gia hạn)</span>
                        )}
                      </p>
                      {user?.role !== 'MEMBER' && (
                        <p className="text-[11px] text-stone-600 pt-0.5 font-sans">
                          Độc giả: {loan.member.fullName} ({loan.member.email})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Renew Button */}
                  <div className="pt-3 border-t-2 border-[#e7dfcf] flex items-center justify-between">
                    <span className="text-[11px] text-stone-600 font-serif-data">
                      {isWithinRenewalLimits
                        ? `Còn ${MAX_RENEWALS - loan.renewalCount} lần gia hạn`
                        : 'Đã hết lượt gia hạn (2/2)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRenew(loan.id)}
                      disabled={!isWithinRenewalLimits || isRenewing}
                      aria-label={`Gia hạn ${loan.bookCopy.book.title}`}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded transition shadow-2xs flex items-center space-x-1.5 font-serif-data ${
                        isWithinRenewalLimits && !isRenewing
                          ? 'bg-[#92400e] hover:bg-[#78350f] text-white cursor-pointer'
                          : 'bg-stone-200 text-stone-500 border border-[#d5ccba] cursor-not-allowed opacity-60'
                      }`}
                      title={
                        !isWithinRenewalLimits
                          ? `Đã hết lượt gia hạn (${loan.renewalCount}/${MAX_RENEWALS})`
                          : 'Gia hạn mượn sách (+14 ngày)'
                      }
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRenewing ? 'animate-spin' : ''}`} />
                      <span>{isRenewing ? 'Đang xử lý...' : 'Gia Hạn Sách'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loan History Section with Classic Library Ledger Table */}
      {pastLoans.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between border-b-2 border-[#b8ac95] pb-2">
            <h2 className="text-base font-bold text-stone-900 font-serif-display flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-800" />
              <span>Lịch Sử Mượn &amp; Kho Lưu Trữ Trả Sách ({pastLoans.length})</span>
            </h2>
            <span className="text-xs text-stone-600 font-serif-data">Sổ Đăng Ký Lưu Hành Quá Khứ</span>
          </div>

          <div className="aged-paper border border-[#ded5c2] rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="ledger-header bg-[#f2ece0] text-stone-900 uppercase tracking-wider text-[11px] font-serif-display font-bold">
                  <tr>
                    <th className="px-4 py-3">Tựa Sách</th>
                    <th className="px-4 py-3">Mã Vạch</th>
                    <th className="px-4 py-3">Ngày Mượn</th>
                    <th className="px-4 py-3">Ngày Trả</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7dfcf] text-stone-900 font-serif-data">
                  {pastLoans.map((l) => (
                    <tr key={l.id} className="ledger-row transition">
                      <td className="px-4 py-3 font-semibold text-stone-900 font-serif text-sm">
                        {l.bookCopy.book.title}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-stone-700">{l.bookCopy.copyCode}</td>
                      <td className="px-4 py-3 font-serif font-medium text-stone-800">{l.loanDate}</td>
                      <td className="px-4 py-3 font-serif font-medium text-stone-800">{l.returnDate || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold font-serif ${
                            l.status === 'RETURNED' ? 'text-emerald-800' : 'text-red-700'
                          }`}
                        >
                          {l.status === 'RETURNED' ? 'ĐÃ TRẢ' : l.status === 'LOST' ? 'MẤT' : l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ledger-summary-double px-4 py-2 bg-[#f6f0e2] text-[11px] text-stone-600 font-serif-data">
              Tổng số lượt mượn trong lịch sử: <strong className="text-stone-900 font-bold font-serif">{pastLoans.length}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
