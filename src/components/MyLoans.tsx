import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Loan } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { EmptyState } from './common/EmptyState.tsx';
import { Clock, CheckCircle2, RotateCw, BookOpen, ShieldCheck } from 'lucide-react';

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
      toast.error(err.message || 'Không thể tải danh sách phiếu mượn.');
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
        `Đã đạt giới hạn gia hạn (tối đa ${MAX_RENEWALS} lần).`,
        'Đã Đạt Giới Hạn'
      );
      return;
    }

    setRenewingLoanId(loanId);
    try {
      await api.renewLoan(loanId);
      toast.success(
        targetLoan
          ? `Sách "${targetLoan.bookCopy.book.title}" đã được gia hạn thêm 14 ngày!`
          : 'Đã gia hạn mượn sách thành công!',
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
      {/* Reader Card Banner */}
      {user && user.role === 'MEMBER' && (
        <div className="ui-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Thẻ Bạn Đọc Thư Viện</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Quản Lý Phiếu Mượn Cá Nhân
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
              <span>Bạn đọc: <strong className="text-white font-semibold">{user.fullName}</strong></span>
              <span>·</span>
              <span className="font-mono text-indigo-300">Mã ĐG: #PAT-{String(user.id).padStart(5, '0')}</span>
              <span>·</span>
              <span className="badge badge-green">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Tài khoản hợp lệ</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end justify-between bg-slate-900/90 border border-white/10 p-4 rounded-xl shrink-0">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              SÁCH ĐANG MƯỢN
            </span>
            <div className="text-2xl font-bold text-indigo-400 my-0.5">
              {activeLoans.length} <span className="text-xs font-normal text-slate-300">cuốn</span>
            </div>
          </div>
        </div>
      )}

      {/* Staff View Header */}
      {user && user.role !== 'MEMBER' && (
        <div className="ui-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              <span>Sổ Ghi Nhận Lưu Thông</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Danh Sách Phiếu Mượn Đang Hoạt Động
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Theo dõi hạn trả, số lần gia hạn và danh sách quá hạn toàn hệ thống.
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-500/15 border border-indigo-500/30 rounded-xl text-center">
            <span className="text-[10px] text-indigo-300 block uppercase font-mono tracking-wider font-semibold">
              Đang Lưu Hành
            </span>
            <span className="text-xl font-bold text-indigo-400">
              {activeLoans.length} Cuốn
            </span>
          </div>
        </div>
      )}

      {/* Active Loans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Sách Đang Mượn ({activeLoans.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Thời hạn mượn: 14 ngày · Gia hạn tối đa 2 lần
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-40 bg-slate-800/50 border border-slate-700/40 rounded-xl animate-pulse" />
            <div className="h-40 bg-slate-800/50 border border-slate-700/40 rounded-xl animate-pulse" />
          </div>
        ) : activeLoans.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Hiện không có sách nào đang mượn"
            description="Bạn hiện không có phiếu mượn nào đang hoạt động."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="ui-card p-5 space-y-4 flex flex-col justify-between border border-white/10"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                      <h3 className="font-semibold text-white text-base leading-snug">
                        {loan.bookCopy.book.title}
                      </h3>
                      <span className={`badge ${isOverdue ? 'badge-red' : daysLeft <= 2 ? 'badge-yellow' : 'badge-green'}`}>
                        {isOverdue ? `Quá hạn ${Math.abs(daysLeft)} ngày` : `Còn ${daysLeft} ngày`}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1.5">
                      <p>
                        Mã bản sao: <span className="font-mono text-indigo-300 font-medium bg-slate-900 px-1.5 py-0.5 rounded border border-white/10">{loan.bookCopy.copyCode}</span>
                      </p>
                      <p>
                        Ngày mượn: <strong className="text-white">{loan.loanDate}</strong> · Hạn trả: <strong className="text-indigo-400">{loan.dueDate}</strong>
                      </p>
                      <p>
                        Gia hạn: <strong className="text-white">{loan.renewalCount}</strong> / {MAX_RENEWALS} lần
                      </p>
                      {user?.role !== 'MEMBER' && (
                        <p className="text-[11px] text-slate-400">
                          Bạn đọc: {loan.member.fullName} ({loan.member.email})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {isWithinRenewalLimits
                        ? `Còn ${MAX_RENEWALS - loan.renewalCount} lần gia hạn`
                        : 'Đã hết lượt gia hạn'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRenew(loan.id)}
                      disabled={!isWithinRenewalLimits || isRenewing}
                      className="btn-primary py-1.5 px-3 text-xs disabled:opacity-50 rounded-lg"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRenewing ? 'animate-spin' : ''}`} />
                      <span>{isRenewing ? 'Đang gia hạn...' : 'Gia hạn sách'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Loan History */}
      {pastLoans.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Lịch Sử Trả Sách ({pastLoans.length})</span>
            </h2>
          </div>

          <div className="ui-card overflow-hidden border border-white/10">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Tựa sách</th>
                  <th>Mã bản sao</th>
                  <th>Ngày mượn</th>
                  <th>Ngày trả</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {pastLoans.map((l) => (
                  <tr key={l.id}>
                    <td className="font-medium text-white">
                      {l.bookCopy.book.title}
                    </td>
                    <td className="font-mono text-xs text-indigo-300">{l.bookCopy.copyCode}</td>
                    <td className="text-slate-300">{l.loanDate}</td>
                    <td className="text-slate-300">{l.returnDate || '—'}</td>
                    <td>
                      <span className={`badge ${l.status === 'RETURNED' ? 'badge-green' : 'badge-red'}`}>
                        {l.status === 'RETURNED' ? 'ĐÃ TRẢ' : 'MẤT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

