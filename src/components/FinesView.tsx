import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Fine } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DataTable, Column } from './common/DataTable.tsx';
import { CreditCard, RotateCw, X, Receipt } from 'lucide-react';

export const FinesView: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Waive Modal
  const [waiveTargetId, setWaiveTargetId] = useState<number | null>(null);
  const [waiveReason, setWaiveReason] = useState('');
  const [waiveError, setWaiveError] = useState('');
  const [isWaiving, setIsWaiving] = useState(false);

  // Paying fine state
  const [payingFineId, setPayingFineId] = useState<number | null>(null);

  const isStaff = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN';

  const fetchFines = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getFines({
        status: statusFilter || undefined,
        size: 100,
      });
      setFines(res.content || []);
    } catch (err: any) {
      if (err.statusCode !== 403 && err.statusCode !== 401) {
        toast.error(err.message || 'Không thể lấy dữ liệu phí phạt.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [statusFilter]);

  const handlePay = async (id: number) => {
    setPayingFineId(id);
    try {
      await api.payFine(id);
      toast.success('Đã ghi nhận thanh toán phí phạt thành công.', 'Thành Công');
      fetchFines();
    } catch (err: any) {
      toast.error(err.message || 'Thanh toán thất bại.');
    } finally {
      setPayingFineId(null);
    }
  };

  const handleWaiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiveTargetId) return;

    if (!waiveReason.trim() || waiveReason.trim().length < 5) {
      setWaiveError('Vui lòng nêu rõ lý do miễn phạt (tối thiểu 5 ký tự)');
      return;
    }

    setIsWaiving(true);
    try {
      await api.waiveFine(waiveTargetId, waiveReason.trim());
      toast.success('Đã miễn phí phạt thành công.', 'Đã Miễn Phạt');
      setWaiveTargetId(null);
      setWaiveReason('');
      setWaiveError('');
      fetchFines();
    } catch (err: any) {
      toast.error(err.message || 'Không thể miễn phí phạt.');
    } finally {
      setIsWaiving(false);
    }
  };

  const totalUnpaid = fines
    .filter((f) => f.status === 'UNPAID')
    .reduce((sum, f) => sum + f.amount, 0);

  const columns: Column<Fine>[] = [
    ...(isStaff
      ? [
          {
            key: 'member',
            header: 'Độc Giả',
            sortable: true,
            render: (f: Fine) => (
              <div>
                <div className="font-semibold text-white text-sm">{f.member.fullName}</div>
                <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{f.member.email}</div>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'loanBook',
      header: 'Tựa Sách',
      sortable: true,
      render: (f) => (
        <div>
          <div className="font-semibold text-white text-sm">
            {f.loan?.bookCopy?.book?.title || `Mã phiếu mượn #${f.loanId}`}
          </div>
          <div className="text-[11px] font-mono text-indigo-300 mt-0.5">
            ISBN: {f.loan?.bookCopy?.book?.isbn || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Số Tiền Phạt',
      sortable: true,
      render: (f) => (
        <span className="font-semibold text-rose-400 text-sm">
          {Number(f.amount).toLocaleString()} VNĐ
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Lý Do',
      sortable: true,
      render: (f) => {
        const reasonText = f.reason === 'LATE_RETURN'
          ? 'Trả sách trễ hạn'
          : f.reason === 'DAMAGED_BOOK'
          ? 'Hư hỏng sách'
          : f.reason === 'LOST_BOOK'
          ? 'Mất sách'
          : String(f.reason).replace('_', ' ');
        return <span className="text-slate-300 text-xs">{reasonText}</span>;
      },
    },
    {
      key: 'issuedDate',
      header: 'Ngày Lập Phiếu',
      sortable: true,
      render: (f) => (
        <span className="text-slate-300 text-xs">
          {new Date(f.issuedDate).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      sortable: true,
      render: (f) => (
        <span className={`badge ${
          f.status === 'UNPAID' ? 'badge-red' : f.status === 'PAID' ? 'badge-green' : 'badge-gray'
        }`}>
          {f.status === 'UNPAID' ? 'CHƯA TRẢ' : f.status === 'PAID' ? 'ĐÃ TRẢ' : 'ĐÃ MIỄN'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      align: 'right',
      render: (f) => {
        if (f.status !== 'UNPAID') {
          return (
            <span className="text-[11px] text-slate-400">
              {f.status === 'PAID' && f.paidDate ? `Đã nộp ${new Date(f.paidDate).toLocaleDateString('vi-VN')}` : 'Đã miễn'}
            </span>
          );
        }

        const isPaying = payingFineId === f.id;

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              disabled={isPaying}
              onClick={() => handlePay(f.id)}
              className="btn-primary py-1 px-3 text-xs rounded-lg"
            >
              {isPaying && <RotateCw className="w-3 h-3 animate-spin" />}
              <span>{isStaff ? 'Thu phí' : 'Thanh toán'}</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setWaiveTargetId(f.id);
                  setWaiveReason('');
                  setWaiveError('');
                }}
                className="btn-secondary py-1 px-2.5 text-xs rounded-lg"
              >
                Miễn phạt
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="ui-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Quản Lý Phí Phạt</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Theo Dõi & Xử Lý Tiền Phạt
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isStaff
              ? 'Ghi nhận thanh toán khoản phạt quá hạn, hư hỏng sách và xử lý miễn phạt.'
              : 'Theo dõi và thanh toán các khoản phí phạt phát sinh.'}
          </p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-center shrink-0">
          <span className="text-[10px] text-rose-400 font-semibold block uppercase font-mono tracking-wider">
            {statusFilter === 'UNPAID' ? 'Cần Thanh Toán' : 'Tổng Đang Lọc'}
          </span>
          <span className="text-xl font-bold text-rose-400">
            {totalUnpaid.toLocaleString()} VNĐ
          </span>
        </div>
      </div>

      {/* Main Fines Table */}
      <DataTable
        columns={columns}
        data={fines}
        loading={loading}
        emptyTitle={statusFilter ? `Không có phí phạt (${statusFilter})` : 'Không có phí phạt'}
        emptyDescription="Hiện chưa có dữ liệu phí phạt nào phù hợp."
        searchPlaceholder="Tìm theo tựa sách, độc giả..."
        searchFilter={(item, query) => {
          const q = query.toLowerCase();
          return Boolean(
            (item.loan?.bookCopy?.book?.title || '').toLowerCase().includes(q) ||
            item.reason.toLowerCase().includes(q) ||
            (item.member?.fullName || '').toLowerCase().includes(q)
          );
        }}
        actions={
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10 text-xs">
            {[
              { id: 'UNPAID', label: 'Chưa thu' },
              { id: 'PAID', label: 'Đã thu' },
              { id: 'WAIVED', label: 'Đã miễn' },
              { id: '', label: 'Tất cả' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  statusFilter === item.id
                    ? 'bg-indigo-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Waive Fine Modal */}
      {waiveTargetId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleWaiveSubmit}
            noValidate
            className="bg-[#0d1322] border border-white/10 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-white text-sm">
                Miễn Giảm Phí Phạt
              </h3>
              <button
                type="button"
                onClick={() => setWaiveTargetId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Lý do miễn phạt *</label>
              <textarea
                rows={3}
                value={waiveReason}
                onChange={(e) => {
                  setWaiveReason(e.target.value);
                  if (waiveError) setWaiveError('');
                }}
                placeholder="Nhập lý do miễn giảm phí phạt..."
                className="ui-input bg-slate-900 border-slate-700 text-white rounded-lg"
              />
              {waiveError && <p className="text-xs text-rose-400 mt-1">{waiveError}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setWaiveTargetId(null)}
                className="btn-secondary rounded-lg"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isWaiving}
                className="btn-primary rounded-lg"
              >
                {isWaiving ? 'Đang miễn...' : 'Xác nhận miễn phạt'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

