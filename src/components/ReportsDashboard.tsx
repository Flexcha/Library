import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { DashboardSummary } from '../types/index.ts';
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
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#16a34a',
  BORROWED: '#2563eb',
  RESERVED: '#d97706',
  LOST: '#dc2626',
  DAMAGED: '#ea580c',
  WITHDRAWN: '#71717a',
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
      if (err.statusCode !== 403 && err.statusCode !== 401) {
        console.error(err);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const barChartData = mostBorrowed.slice(0, 7).map((item) => ({
    name: item.title.length > 20 ? `${item.title.substring(0, 18)}...` : item.title,
    fullName: item.title,
    borrows: item.borrowCount,
    isbn: item.isbn,
  }));

  const pieChartData = inventory?.byStatus
    ? Object.entries(inventory.byStatus as Record<string, number>)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status,
          value: count,
          color: STATUS_COLORS[status] || '#71717a',
        }))
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="ui-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Báo Cáo & Thống Kê</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Bảng Điều Khiển Quản Lý Thư Viện
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tổng hợp dữ liệu lưu thông, danh mục mượn phổ biến và theo dõi tình trạng kho sách.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchReports}
          disabled={isRefreshing}
          className="btn-secondary self-start sm:self-auto text-xs rounded-lg"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-800/50 border border-slate-700/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="ui-card p-4 space-y-1 border border-white/10">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-medium text-slate-400">Đang mượn</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.activeLoans}
            </div>
          </div>

          <div className="ui-card p-4 space-y-1 border border-white/10">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-xs font-medium text-slate-400">Sách quá hạn</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-rose-400">
              {summary.overdueLoans}
            </div>
          </div>

          <div className="ui-card p-4 space-y-1 border border-white/10">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-medium text-slate-400">Hàng đợi</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.pendingReservations}
            </div>
          </div>

          <div className="ui-card p-4 space-y-1 border border-white/10">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-xs font-medium text-slate-400">Phần phạt chưa thu</span>
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-rose-400 truncate mt-1">
              {Number(summary.unpaidFinesTotal).toLocaleString()} VNĐ
            </div>
          </div>

          <div className="ui-card p-4 space-y-1 border border-white/10">
            <div className="flex items-center justify-between text-indigo-400">
              <span className="text-xs font-medium text-slate-400">Đầu sách</span>
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.totalBooks}
            </div>
          </div>

          <div className="ui-card p-4 space-y-1 border border-white/10">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-medium text-slate-400">Bạn đọc</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.totalMembers}
            </div>
          </div>
        </div>
      ) : null}

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Borrowed Chart */}
        <div className="ui-card p-5 space-y-4 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-white text-base">
                Sách Mượn Nhiều Nhất (30 Ngày)
              </h2>
            </div>
          </div>

          {barChartData.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Chưa có dữ liệu lượt mượn trong 30 ngày qua.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value} lượt mượn`, 'Lượt mượn']}
                  />
                  <Bar dataKey="borrows" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Inventory Status Donut */}
        <div className="ui-card p-5 space-y-4 border border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-white text-base">
                Trạng Thái Bản Sao Vật Lý
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Tổng: {inventory?.totalCopies || 0} bản
            </span>
          </div>

          {pieChartData.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Chưa có dữ liệu bản sao.
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
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
                      return <span className="text-xs text-slate-300">{label}</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Overdue Section */}
      <div className="ui-card p-5 space-y-4 border border-white/10">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h2 className="font-bold text-white text-base">
              Danh Sách Bạn Đọc Trả Sách Quá Hạn
            </h2>
          </div>
          <span className="text-xs font-semibold text-rose-400">
            {overdueList.length} trường hợp quá hạn
          </span>
        </div>

        <div className="divide-y divide-white/10 text-xs">
          {overdueList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Hiện không có khoản mượn nào quá hạn.
            </div>
          ) : (
            overdueList.map((item) => (
              <div key={item.loanId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    {item.bookTitle}
                  </h4>
                  <p className="text-slate-400 mt-0.5">
                    Mã bản sao: <span className="font-mono text-indigo-300">{item.copyCode}</span> · Hạn trả: <strong className="text-rose-400">{item.dueDate}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-300">
                  <span className="font-semibold text-white">{item.member.fullName}</span>
                  {item.member.phone && (
                    <span className="flex items-center gap-1 font-mono text-slate-400">
                      <Phone className="w-3 h-3" />
                      <span>{item.member.phone}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-slate-400">
                    <Mail className="w-3 h-3" />
                    <span>{item.member.email}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

