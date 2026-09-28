import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { Reservation } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DataTable, Column } from './common/DataTable.tsx';
import { Bookmark, Clock, CheckCircle2, ShieldCheck, Library } from 'lucide-react';

export const ReservationsView: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const isStaff = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.getReservations({
        status: filterStatus || undefined,
        size: 100,
      });
      setReservations(res.content || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to retrieve reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [filterStatus]);

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy yêu cầu đặt trước này?')) return;
    setCancellingId(id);
    try {
      await api.cancelReservation(id);
      toast.success('Đã hủy yêu cầu đặt trước thành công.', 'Đã Hủy Đặt Trước');
      fetchReservations();
    } catch (err: any) {
      toast.error(err.message || 'Không thể hủy yêu cầu đặt trước.');
    } finally {
      setCancellingId(null);
    }
  };

  const columns: Column<Reservation>[] = [
    {
      key: 'bookTitle',
      header: 'Tựa Sách & Mã Mục Lục',
      sortable: true,
      render: (r) => (
        <div>
          <div className="font-bold text-stone-900 font-serif text-sm leading-snug line-clamp-1">
            {r.book.title}
          </div>
          <div className="text-[11px] font-mono text-stone-600 mt-0.5">ISBN {r.book.isbn}</div>
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
                <div className="font-bold text-stone-900 font-serif text-sm">{r.member?.fullName || 'Độc giả tự do'}</div>
                <div className="text-[11px] text-stone-600 truncate max-w-[150px] font-sans">{r.member?.email || 'N/A'}</div>
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
        <span
          className={`font-serif text-xs font-bold ${
            r.status === 'READY'
              ? 'text-emerald-800 bg-[#edf7ed] px-2.5 py-0.5 rounded border border-emerald-300'
              : r.status === 'PENDING'
              ? 'text-amber-900 bg-[#fffbeb] px-2.5 py-0.5 rounded border border-amber-300'
              : 'text-stone-500'
          }`}
        >
          {r.status === 'READY' ? 'Sẵn Sàng Nhận' : r.status === 'PENDING' ? `Hàng Đợi #${r.queuePosition}` : '—'}
        </span>
      ),
    },
    {
      key: 'reservationDate',
      header: 'Ngày Đặt Trước',
      sortable: true,
      render: (r) => <span className="text-stone-800 font-serif font-medium text-xs">{r.reservationDate}</span>,
    },
    {
      key: 'expiryDate',
      header: 'Hạn Chót Nhận Sách',
      sortable: true,
      render: (r) => {
        if (!r.expiryDate) return <span className="text-stone-500 text-xs font-serif italic">Đang chờ trả</span>;
        return (
          <span className="font-serif text-xs font-bold text-emerald-900">
            {r.expiryDate}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      sortable: true,
      render: (r) => (
        <span
          className={`text-xs font-serif font-bold ${
            r.status === 'READY'
              ? 'text-emerald-800'
              : r.status === 'PENDING'
              ? 'text-amber-900'
              : r.status === 'FULFILLED'
              ? 'text-stone-700'
              : 'text-stone-400'
          }`}
        >
          {r.status === 'READY'
            ? 'SẴN SÀNG'
            : r.status === 'PENDING'
            ? 'ĐANG CHỜ'
            : r.status === 'FULFILLED'
            ? 'ĐÃ NHẬN'
            : r.status === 'CANCELLED'
            ? 'ĐÃ HỦY'
            : r.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      align: 'right',
      render: (r) => {
        if (r.status !== 'PENDING' && r.status !== 'READY') {
          return <span className="text-[11px] text-stone-400">Đã lưu trữ</span>;
        }

        const isCancelling = cancellingId === r.id;
        return (
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => handleCancel(r.id)}
            className="px-2.5 py-1 bg-[#fcfbf7] hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-stone-700 rounded text-[11px] transition border border-[#d5ccba] cursor-pointer disabled:opacity-50 font-serif font-semibold shadow-2xs"
            title="Hủy đặt trước sách"
          >
            {isCancelling ? 'Đang hủy...' : 'Hủy Đặt'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="aged-paper border border-[#ded5c2] rounded-lg p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
            <Bookmark className="w-4 h-4" />
            <span>Đặt Trước &amp; Giữ Sách</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-display tracking-tight">
            Yêu Cầu Đặt Trước &amp; Kệ Sách Đặt
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-serif-data">
            {isStaff
              ? 'Theo dõi hàng đợi đặt trước, quản lý sách sẵn sàng nhận tại quầy và giám sát hạn chót'
              : 'Theo dõi vị trí hàng đợi và nhận các cuốn sách đã đặt khi được chuyển đến kệ giữ sách'}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-1 bg-[#fcfbf7] p-1 rounded border border-[#d5ccba] text-xs self-start sm:self-auto overflow-x-auto max-w-full font-serif-data">
          {[
            { id: '', label: 'Tất Cả' },
            { id: 'READY', label: 'Sẵn Sàng Nhận' },
            { id: 'PENDING', label: 'Đang Trong Hàng Đợi' },
            { id: 'FULFILLED', label: 'Đã Nhận' },
            { id: 'CANCELLED', label: 'Đã Hủy' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilterStatus(item.id)}
              className={`px-3 py-1 rounded text-[11px] font-medium transition cursor-pointer font-serif ${
                filterStatus === item.id
                  ? 'bg-[#92400e] text-white font-bold shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f2ece0]'
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
        emptyTitle={filterStatus ? `Không có yêu cầu đặt trước nào (${filterStatus})` : 'Không có yêu cầu đặt trước nào trong hàng đợi'}
        emptyDescription={
          isStaff
            ? 'Hiện không có bản ghi đặt trước nào của độc giả phù hợp với bộ lọc này.'
            : 'Bạn chưa đặt trước cuốn sách nào. Hãy ghé thăm mục lục để đặt trước những cuốn sách đang được mượn.'
        }
        searchPlaceholder="Tìm kiếm theo tựa sách, tác giả hoặc độc giả..."
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
