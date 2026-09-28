import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Fine } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DataTable, Column } from './common/DataTable.tsx';
import { CreditCard, CheckCircle2, ShieldCheck, DollarSign, RotateCw, X, Receipt } from 'lucide-react';

export const FinesView: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('UNPAID');

  // Waive Modal
  const [waiveTargetId, setWaiveTargetId] = useState<number | null>(null);
  const [waiveReason, setWaiveReason] = useState('');
  const [waiveError, setWaiveError] = useState('');
  const [isWaiving, setIsWaiving] = useState(false);

  // Paying fine state
  const [payingFineId, setPayingFineId] = useState<number | null>(null);

  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isAdmin = user?.role === 'ADMIN';

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res = await api.getFines({
        status: statusFilter || undefined,
        size: 100,
      });
      setFines(res.content || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch fines.');
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
      toast.success('Đã ghi nhận thanh toán phí phạt thành công.', 'Thanh Toán Thành Công');
      fetchFines();
    } catch (err: any) {
      toast.error(err.message || 'Xử lý thanh toán thất bại.');
    } finally {
      setPayingFineId(null);
    }
  };

  const handleWaiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiveTargetId) return;

    if (!waiveReason.trim() || waiveReason.trim().length < 5) {
      setWaiveError('Vui lòng nêu rõ lý do chính thức để miễn phạt (ít nhất 5 ký tự)');
      return;
    }

    setIsWaiving(true);
    try {
      await api.waiveFine(waiveTargetId, waiveReason.trim());
      toast.success('Đã miễn phí phạt thành công theo thẩm quyền Quản trị viên.', 'Đã Miễn Phạt');
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
                <div className="font-bold text-stone-900 font-serif text-sm">{f.member.fullName}</div>
                <div className="text-[11px] text-stone-600 truncate max-w-[150px] font-sans">{f.member.email}</div>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'loanBook',
      header: 'Tựa Sách & Lượt Mượn',
      sortable: true,
      render: (f) => (
        <div>
          <div className="font-bold text-stone-900 font-serif text-sm leading-snug line-clamp-1">
            {f.loan?.bookCopy?.book?.title || `Lượt mượn #${f.loanId}`}
          </div>
          <div className="text-[11px] font-mono text-stone-600 mt-0.5">
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
        <span className="font-serif text-sm font-bold text-[#92400e]">
          {Number(f.amount).toLocaleString()} VND
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Lý Do Phạt',
      sortable: true,
      render: (f) => {
        const reasonText = f.reason === 'LATE_RETURN'
          ? 'Quá hạn trả sách'
          : f.reason === 'DAMAGED_BOOK'
          ? 'Làm hư hỏng sách'
          : f.reason === 'LOST_BOOK'
          ? 'Làm mất sách'
          : String(f.reason).replace('_', ' ');
        return (
          <span className="text-stone-800 text-xs font-serif font-medium">
            {reasonText}
          </span>
        );
      },
    },
    {
      key: 'issuedDate',
      header: 'Ngày Lập Phiếu',
      sortable: true,
      render: (f) => (
        <span className="text-stone-800 font-serif font-medium text-xs">
          {new Date(f.issuedDate).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      sortable: true,
      render: (f) => (
        <span
          className={`text-xs font-serif font-bold ${
            f.status === 'UNPAID'
              ? 'text-red-700'
              : f.status === 'PAID'
              ? 'text-emerald-800'
              : 'text-stone-600'
          }`}
        >
          {f.status === 'UNPAID' ? 'CHƯA TRẢ' : f.status === 'PAID' ? 'ĐÃ TRẢ' : f.status === 'WAIVED' ? 'ĐÃ MIỄN' : f.status}
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
            <span className="text-[11px] text-stone-500">
              {f.status === 'PAID' && f.paidDate ? `Đã nộp ${new Date(f.paidDate).toLocaleDateString('vi-VN')}` : 'Đã tất toán'}
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
              className="px-2.5 py-1 bg-[#92400e] hover:bg-[#78350f] text-white font-medium text-[11px] rounded transition disabled:opacity-50 cursor-pointer flex items-center gap-1 shadow-xs"
            >
              {isPaying && <RotateCw className="w-3 h-3 animate-spin" />}
              <span>{isStaff ? 'Lập Biên Lai Thu' : 'Thanh Toán'}</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setWaiveTargetId(f.id);
                  setWaiveReason('');
                  setWaiveError('');
                }}
                className="px-2 py-1 text-stone-600 hover:text-stone-900 hover:bg-[#f1ede4] border border-[#dcd6c8] rounded text-[11px] transition cursor-pointer"
                title="Quyền miễn phạt dành cho Quản trị viên"
              >
                Miễn Phạt
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Balance Card */}
      <div className="aged-paper border border-[#ded5c2] rounded-lg p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
            <Receipt className="w-4 h-4" />
            <span>Sổ Thu Chi Thư Viện</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-display tracking-tight">
            Sổ Theo Dõi Tiền Phạt &amp; Bồi Thường
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-serif-data">
            {isStaff
              ? 'Xử lý thu phí phạt trực tiếp tại quầy và ghi nhận các trường hợp miễn giảm của quản trị viên'
              : 'Kiểm tra các khoản phí phạt phát sinh và thanh toán nghĩa vụ quá hạn'}
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="px-5 py-3 aged-paper-card border border-[#ded5c2] rounded text-center shadow-2xs">
            <span className="text-[10px] text-stone-500 block uppercase font-mono tracking-wider">
              {statusFilter === 'UNPAID' ? 'Số Tiền Chưa Thu' : 'Tổng Tiền Đang Lọc'}
            </span>
            <span className="text-2xl font-bold text-[#92400e] font-serif">
              {totalUnpaid.toLocaleString()} VND
            </span>
          </div>
        </div>
      </div>

      {/* Main Fines Table */}
      <DataTable
        columns={columns}
        data={fines}
        loading={loading}
        emptyTitle={statusFilter ? `Không có khoản phạt nào (${statusFilter})` : 'Không có dữ liệu tiền phạt'}
        emptyDescription="Hiện không có bản ghi tiền phạt lưu hành nào phù hợp với bộ lọc đã chọn."
        searchPlaceholder="Tìm kiếm khoản phạt theo tựa sách hoặc độc giả..."
        searchFilter={(item, query) => {
          const q = query.toLowerCase();
          return Boolean(
            (item.loan?.bookCopy?.book?.title || '').toLowerCase().includes(q) ||
            item.reason.toLowerCase().includes(q) ||
            (item.member?.fullName || '').toLowerCase().includes(q)
          );
        }}
        actions={
          <div className="flex items-center space-x-1 bg-[#fbf9f5] p-1 rounded border border-[#e6e0d4] text-xs font-serif-data">
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
                className={`px-3 py-1 rounded text-[11px] font-medium transition cursor-pointer font-serif ${
                  statusFilter === item.id
                    ? 'bg-[#92400e] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#f1ede4]'
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
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleWaiveSubmit}
            noValidate
            className="bg-white border border-[#e6e0d4] rounded-lg max-w-sm w-full p-5 shadow-2xl space-y-4 font-serif-data"
          >
            <div className="flex items-center justify-between border-b border-[#e6e0d4] pb-2">
              <h3 className="font-bold text-stone-900 text-sm font-serif-display">
                Miễn Giảm Phí Phạt Lưu Hành
              </h3>
              <button
                type="button"
                onClick={() => setWaiveTargetId(null)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Quyết định miễn phạt theo thẩm quyền Quản trị viên yêu cầu ghi rõ lý do chính thức để lưu hồ sơ kiểm toán.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Lý Do Miễn Phạt Chính Thức *</label>
                <textarea
                  rows={3}
                  value={waiveReason}
                  onChange={(e) => {
                    setWaiveReason(e.target.value);
                    if (waiveError) setWaiveError('');
                  }}
                  placeholder="Ví dụ: Lỗi hệ thống vào ngày hạn trả, đã được Thủ thư trưởng xác nhận..."
                  className={`w-full px-3 py-2 bg-[#fbf9f5] border rounded text-stone-900 focus:outline-none ${
                    waiveError ? 'border-red-500' : 'border-[#dcd6c8] focus:border-[#92400e]'
                  }`}
                />
                {waiveError && <p className="text-[11px] text-red-600 mt-1">{waiveError}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#e6e0d4]">
              <button
                type="button"
                onClick={() => setWaiveTargetId(null)}
                className="px-3 py-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 rounded text-xs cursor-pointer font-serif"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isWaiving}
                className="px-3.5 py-1.5 bg-[#92400e] hover:bg-[#78350f] disabled:opacity-50 text-white font-medium rounded text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs font-serif"
              >
                {isWaiving && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Xác Nhận Miễn Phạt</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
