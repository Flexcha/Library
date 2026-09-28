import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { DashboardSummary } from '../types/index.ts';
import { EmptyState } from './common/EmptyState.tsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  AlertTriangle,
  BookOpen,
  Users,
  CreditCard,
  Layers,
  Phone,
  Mail,
  TrendingUp,
  PieChart as PieChartIcon,
  RefreshCw,
  Clock,
  Library,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#15803d', // forest green
  BORROWED: '#92400e', // amber brown
  RESERVED: '#b45309', // warm amber
  LOST: '#b91c1c', // red
  DAMAGED: '#c2410c', // rust orange
  WITHDRAWN: '#78716c', // archival stone
};

export const ReportsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [overdueList, setOverdueList] = useState<any[]>([]);
  const [mostBorrowed, setMostBorrowed] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReports = async () => {
    setIsRefreshing(true);
    try {
      const [sumData, overdueData, borrowedData, invData] = await Promise.all([
        api.getDashboardSummary(),
        api.getOverdueReport(),
        api.getMostBorrowedReport('30d'),
        api.getInventorySummary(),
      ]);
      setSummary(sumData);
      setOverdueList(overdueData || []);
      setMostBorrowed(borrowedData.ranking || []);
      setInventory(invData);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Format most-borrowed data for Recharts BarChart
  const barChartData = mostBorrowed.slice(0, 7).map((item) => ({
    name: item.title.length > 20 ? `${item.title.substring(0, 18)}...` : item.title,
    fullName: item.title,
    borrows: item.borrowCount,
    isbn: item.isbn,
  }));

  // Format inventory status data for Recharts PieChart
  const pieChartData = inventory?.byStatus
    ? Object.entries(inventory.byStatus as Record<string, number>)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status,
          value: count,
          color: STATUS_COLORS[status] || '#78716c',
        }))
    : [];

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="aged-paper border border-[#ded5c2] rounded-lg p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
            <Library className="w-4 h-4" />
            <span>Phân Tích Thư Viện &amp; Thống Kê Giám Tuyển</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-display tracking-tight">
            Bảng Điều Khiển Lưu Hành &amp; Vận Hành
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-serif-data">
            Chỉ số lưu hành thời gian thực, mức độ khai thác bộ sưu tập và theo dõi các khoản mượn quá hạn
          </p>
        </div>
        <button
          type="button"
          onClick={fetchReports}
          disabled={isRefreshing}
          className="px-4 py-2 bg-[#fcfbf7] hover:bg-[#f2ece0] disabled:opacity-50 text-stone-800 text-xs font-medium rounded transition border border-[#d5ccba] self-start sm:self-auto flex items-center space-x-1.5 cursor-pointer shadow-2xs font-serif-data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Đang tính toán...' : 'Làm Mới Thống Kê'}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aged-paper-card border border-[#ded5c2] p-4 rounded-lg h-24 animate-shimmer" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 font-serif-data">
          <div className="aged-paper-card border border-[#ded5c2] p-4 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-[#92400e] mb-1.5">
              <span className="text-[11px] font-semibold text-stone-700 font-serif">Sách Đang Mượn</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-stone-900 font-serif-display">
              {summary.activeLoans}
            </div>
          </div>

          <div className="aged-paper-card border border-[#ded5c2] p-4 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-red-700 mb-1.5">
              <span className="text-[11px] font-semibold text-stone-700 font-serif">Sách Quá Hạn</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-red-700 font-serif-display">
              {summary.overdueLoans}
            </div>
          </div>

          <div className="aged-paper-card border border-[#ded5c2] p-4 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-amber-900 mb-1.5">
              <span className="text-[11px] font-semibold text-stone-700 font-serif">Hàng Đợi Đặt</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-stone-900 font-serif-display">
              {summary.pendingReservations}
            </div>
          </div>

          <div className="aged-paper-card border border-[#ded5c2] p-4 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-red-700 mb-1.5">
              <span className="text-[11px] font-semibold text-stone-700 font-serif">Tiền Phạt Chưa Thu</span>
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-stone-900 font-serif truncate">
              {Number(summary.unpaidFinesTotal).toLocaleString()} VND
            </div>
          </div>

          <div className="aged-paper-card border border-[#ded5c2] p-4 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-stone-600 mb-1.5">
              <span className="text-[11px] font-semibold text-stone-700 font-serif">Tựa Sách Mục Lục</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-stone-900 font-serif-display">
              {summary.totalBooks}
            </div>
          </div>

          <div className="aged-paper-card border border-[#ded5c2] p-4 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-emerald-800 mb-1.5">
              <span className="text-[11px] font-semibold text-stone-700 font-serif">Độc Giả Đăng Ký</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-stone-900 font-serif-display">
              {summary.totalMembers}
            </div>
          </div>
        </div>
      ) : null}

      {/* Visual Analytics Section: Charts via Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Borrowed Books Bar Chart */}
        <div className="aged-paper-card border border-[#ded5c2] rounded-lg p-5 shadow-2xs space-y-4 font-serif-data">
          <div className="flex items-center justify-between border-b-2 border-[#b8ac95] pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#92400e]" />
              <h2 className="font-bold text-stone-900 text-base font-serif-display">
                Tựa Sách Được Mượn Nhiều Nhất (30 Ngày Qua)
              </h2>
            </div>
            <span className="text-[11px] text-stone-600 font-serif-data">Tần Suất Lưu Hành</span>
          </div>

          {barChartData.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 font-serif-data">
              Không có dữ liệu mượn sách nào được ghi nhận trong 30 ngày qua.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#78716c', fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#78716c', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fbf9f5',
                      borderColor: '#dcd6c8',
                      borderRadius: '0.375rem',
                      color: '#1c1917',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                    formatter={(value: any) => [`${value} lượt mượn`, 'Tổng số lượt']}
                    labelFormatter={(_label, payload) => {
                      if (payload && payload.length > 0) {
                        return payload[0].payload.fullName;
                      }
                      return _label;
                    }}
                  />
                  <Bar dataKey="borrows" fill="#92400e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Physical Inventory Distribution Donut / Pie Chart */}
        <div className="aged-paper-card border border-[#ded5c2] rounded-lg p-5 shadow-2xs space-y-4 font-serif-data">
          <div className="flex items-center justify-between border-b-2 border-[#b8ac95] pb-3">
            <div className="flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-[#92400e]" />
              <h2 className="font-bold text-stone-900 text-base font-serif-display">
                Phân Bố Trạng Thái Kho Sách
              </h2>
            </div>
            <span className="text-[11px] text-stone-600 font-serif-data">
              Tổng số: {inventory?.totalCopies || 0} cuốn
            </span>
          </div>

          {pieChartData.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 font-serif-data">
              Chưa có dữ liệu bản sách vật lý.
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#fbf9f5" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fbf9f5',
                      borderColor: '#dcd6c8',
                      borderRadius: '0.375rem',
                      color: '#1c1917',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                    formatter={(value: any, name: any) => [
                      `${value} cuốn`,
                      name === 'AVAILABLE'
                        ? 'Có sẵn trên giá'
                        : name === 'BORROWED'
                        ? 'Đang được mượn'
                        : name === 'RESERVED'
                        ? 'Đang giữ cho bạn đọc'
                        : name === 'LOST'
                        ? 'Thất lạc'
                        : name === 'DAMAGED'
                        ? 'Hư hỏng'
                        : name === 'WITHDRAWN'
                        ? 'Rút khỏi lưu hành'
                        : name,
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(val) => {
                      const label = val === 'AVAILABLE'
                        ? 'Có sẵn'
                        : val === 'BORROWED'
                        ? 'Đang mượn'
                        : val === 'RESERVED'
                        ? 'Đã đặt'
                        : val === 'LOST'
                        ? 'Mất'
                        : val === 'DAMAGED'
                        ? 'Hư hỏng'
                        : val;
                      return <span className="text-xs text-stone-700 font-serif font-medium">{label}</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Overdue Loans Follow-up Desk */}
      <div className="aged-paper border border-[#ded5c2] rounded-lg p-5 shadow-2xs space-y-4 font-serif-data">
        <div className="flex items-center justify-between border-b-2 border-[#b8ac95] pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-700" />
            <h2 className="font-bold text-stone-900 text-base font-serif-display">
              Bàn Theo Dõi &amp; Nhắc Trả Sách Quá Hạn
            </h2>
          </div>
          <span className="text-xs font-serif text-red-700 font-bold">
            {overdueList.length} tài khoản quá hạn
          </span>
        </div>

        <div className="divide-y divide-[#e7dfcf] text-xs font-serif-data">
          {overdueList.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500 font-serif-data">
              Tất cả các lượt mượn đang trong thời hạn cho phép. Không có sách quá hạn.
            </div>
          ) : (
            overdueList.map((item) => (
              <div key={item.loanId} className="py-3 space-y-1.5 ledger-row">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-stone-900 font-serif text-sm">
                      {item.bookTitle}
                    </h4>
                    <p className="font-mono text-[11px] text-stone-700 mt-0.5">
                      Mã bản: <span className="bg-[#f4eee2] px-1 rounded border border-[#ded5c2]">{item.copyCode}</span> · Hạn trả: <strong className="text-red-700 font-bold font-serif">{item.dueDate}</strong>
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 shrink-0 font-mono">
                    QUÁ HẠN
                  </span>
                </div>

                <div className="bg-[#fcfbf7] p-2.5 rounded border border-[#ded5c2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-stone-700 shadow-2xs">
                  <span className="font-bold text-stone-900 font-serif">{item.member.fullName}</span>
                  <div className="flex items-center space-x-3 text-stone-600 text-[11px] font-sans">
                    {item.member.phone && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-[#92400e]" />
                        <span className="font-mono">{item.member.phone}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-stone-500" />
                      <span>{item.member.email}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
