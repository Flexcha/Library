import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Reservation } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DataTable, Column } from './common/DataTable.tsx';
import { Bookmark } from 'lucide-react';

export const ReservationsView: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const isStaff = user?.role === 'SUPERADMIN' || user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  const fetchReservations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getReservations({
        status: filterStatus || undefined,
        size: 100,
      });
      setReservations(res.content || []);
    } catch (err: any) {
      if (err.statusCode !== 403 && err.statusCode !== 401) {
        toast.error(err.message || 'Không thể lấy danh sách đặt trước.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filterStatus, user]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setCancellingId(id);
    try {
      await api.updateReservationStatus(id, newStatus);
      toast.success('Đã cập nhật trạng thái đặt trước thành công.', 'Thành công');
      fetchReservations();
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy yêu cầu đặt trước này?')) return;
    setCancellingId(id);
    try {
      await api.cancelReservation(id);
      toast.success('Đã hủy yêu cầu đặt trước.', 'Thành công');
      fetchReservations();
    } catch (err: any) {
      toast.error(err.message || 'Không thể hủy đặt trước.');
    } finally {
      setCancellingId(null);
    }
  };

  const columns: Column<Reservation>[] = [
    {
      key: 'bookTitle',
      header: 'Tựa Sách & ISBN',
      sortable: true,
      render: (r) => (
        <div>
          <div className="font-semibold text-white text-sm">
            {r.book.title}
          </div>
          <div className="text-[11px] font-mono text-indigo-300 mt-0.5">ISBN: {r.book.isbn}</div>
        </div>
      ),
    },
    ...(isStaff
      ? [
          {
            key: 'member',
            header: 'Độc Giả',
            sortable: true,
            render: (r: Reservation) => (
              <div>
                <div className="font-semibold text-white text-sm">{r.member?.fullName || '—'}</div>
                <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{r.member?.email || 'N/A'}</div>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'queuePosition',
      header: 'Vị Trí Hàng Đợi',
      sortable: true,
      align: 'center',
      render: (r) => (
        <span className={`badge ${
          r.status === 'READY' ? 'badge-green' : r.status === 'PENDING' ? 'badge-yellow' : 'badge-gray'
        }`}>
          {r.status === 'READY' ? 'Sẵn sàng nhận' : r.status === 'PENDING' ? `Hàng đợi #${r.queuePosition}` : '—'}
        </span>
      ),
    },
    {
      key: 'reservationDate',
      header: 'Ngày Đặt',
      sortable: true,
      render: (r) => <span className="text-slate-300 text-xs">{r.reservationDate ? new Date(r.reservationDate).toLocaleDateString('vi-VN') : '—'}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Hạn Nhận Sách',
      sortable: true,
      render: (r) => {
        if (!r.expiryDate) return <span className="text-slate-400 text-xs italic">Chờ sách khả dụng</span>;
        return <span className="font-semibold text-indigo-400 text-xs">{r.expiryDate}</span>;
      },
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      sortable: true,
      render: (r) => {
        if (!isStaff) {
          return (
            <span className={`badge ${
              r.status === 'READY' ? 'badge-green' : r.status === 'PENDING' ? 'badge-yellow' : r.status === 'FULFILLED' ? 'badge-blue' : 'badge-gray'
            }`}>
              {r.status === 'READY' ? 'SẴN SÀNG' : r.status === 'PENDING' ? 'ĐANG CHỜ' : r.status === 'FULFILLED' ? 'ĐÃ NHẬN' : 'ĐÃ HỦY'}
            </span>
          );
        }

        return (
          <select
            value={r.status}
            disabled={cancellingId === r.id}
            onChange={(e) => handleStatusChange(r.id, e.target.value)}
            className="ui-input py-1 px-2 text-xs font-semibold cursor-pointer min-w-[130px] bg-slate-900 border-slate-700 text-white rounded-lg"
          >
            <option value="PENDING" className="bg-slate-900 text-amber-400 font-bold">ĐANG CHỜ</option>
            <option value="READY" className="bg-slate-900 text-emerald-400 font-bold">SẮN SÀNG NHẬN</option>
            <option value="FULFILLED" className="bg-slate-900 text-blue-400 font-bold">ĐÃ NHẬN SÁCH</option>
            <option value="CANCELLED" className="bg-slate-900 text-rose-400 font-bold">ĐÃ HỦY</option>
          </select>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      align: 'right',
      render: (r) => {
        if (r.status !== 'PENDING' && r.status !== 'READY') {
          return <span className="text-[11px] text-slate-400">Đã lưu hồ sơ</span>;
        }

        const isCancelling = cancellingId === r.id;
        return (
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => handleCancel(r.id)}
            className="btn-ghost text-rose-400 hover:bg-rose-500/10 py-1 px-2.5 text-xs disabled:opacity-50 rounded-lg"
          >
            {isCancelling ? 'Đang hủy...' : 'Hủy đặt'}
          </button>
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
            <Bookmark className="w-4 h-4" />
            <span>Quản Lý Hàng Đợi</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Danh Sách Đặt Trước Sách
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isStaff
              ? 'Theo dõi vị trí hàng đợi đặt trước và tình trạng sách chuẩn bị cho độc giả.'
              : 'Theo dõi các đầu sách bạn đã đăng ký xếp hàng chờ mượn.'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10 text-xs self-start sm:self-auto overflow-x-auto">
          {[
            { id: '', label: 'Tất cả' },
            { id: 'READY', label: 'Sẵn sàng' },
            { id: 'PENDING', label: 'Hàng đợi' },
            { id: 'FULFILLED', label: 'Đã nhận' },
            { id: 'CANCELLED', label: 'Đã hủy' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterStatus(item.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                filterStatus === item.id
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reservations Table */}
      <DataTable
        columns={columns}
        data={reservations}
        loading={loading}
        emptyTitle={filterStatus ? `Không có bản ghi (${filterStatus})` : 'Không có yêu cầu đặt trước nào'}
        emptyDescription={
          isStaff
            ? 'Hiện chưa có lượt đặt trước nào phù hợp với tiêu chí lọc.'
            : 'Bạn chưa đăng ký đặt trước đầu sách nào.'
        }
        searchPlaceholder="Tìm theo tựa sách, ISBN, tên độc giả..."
        searchFilter={(item, query) => {
          const q = query.toLowerCase();
          return Boolean(
            (item.book?.title || '').toLowerCase().includes(q) ||
            (item.book?.isbn || '').toLowerCase().includes(q) ||
            (item.member?.fullName || '').toLowerCase().includes(q) ||
            (item.member?.email || '').toLowerCase().includes(q)
          );
        }}
      />
    </div>
  );
};

