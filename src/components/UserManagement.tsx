import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { User, UserRole, UserStatus } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DataTable, Column } from './common/DataTable.tsx';
import { Users, Trash2, Shield, UserCheck, ShieldAlert, Library } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({
        role: roleFilter || undefined,
        size: 100,
      });
      setUsers(res.content || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to retrieve user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await api.updateUserStatus(userId, newStatus);
      toast.success(`Đã cập nhật trạng thái người dùng thành ${newStatus}.`, 'Cập Nhật Thành Công');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (userId === currentUser?.id) {
      toast.error('Bạn không thể tự xóa tài khoản quản trị viên đang hoạt động của chính mình.');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản người dùng này?')) return;

    try {
      await api.deleteUser(userId);
      toast.success('Đã xóa tài khoản người dùng thành công.', 'Đã Xóa Tài Khoản');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa người dùng.');
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'fullName',
      header: 'Họ Tên & Tài Khoản',
      sortable: true,
      render: (u) => (
        <div>
          <div className="font-bold text-stone-900 font-serif text-sm">{u.fullName}</div>
          <div className="text-[11px] font-mono text-stone-600 font-sans">{u.email}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Số Điện Thoại',
      sortable: true,
      render: (u) => <span className="font-serif text-xs text-stone-700">{u.phone || '—'}</span>,
    },
    {
      key: 'role',
      header: 'Vai Trò / Quyền Hạn',
      sortable: true,
      render: (u) => (
        <span
          className={`text-xs font-serif font-bold uppercase tracking-wider ${
            u.role === 'ADMIN'
              ? 'text-[#92400e]'
              : u.role === 'LIBRARIAN'
              ? 'text-amber-900'
              : 'text-stone-700'
          }`}
        >
          {u.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : u.role === 'LIBRARIAN' ? 'THỦ THƯ' : 'ĐỘC GIẢ'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Quyền Mượn Sách',
      sortable: true,
      render: (u) => (
        <select
          value={u.status}
          onChange={(e) => handleStatusChange(u.id, e.target.value)}
          className={`text-xs px-2 py-1 rounded bg-[#fcfbf7] border font-serif font-semibold cursor-pointer ${
            u.status === 'ACTIVE'
              ? 'border-emerald-400 text-emerald-900'
              : u.status === 'SUSPENDED'
              ? 'border-red-400 text-red-800'
              : 'border-[#d5ccba] text-stone-700'
          }`}
        >
          <option value="ACTIVE">HOẠT ĐỘNG</option>
          <option value="SUSPENDED">TẠM KHÓA</option>
          <option value="INACTIVE">VÔ HIỆU HÓA</option>
        </select>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày Gia Nhập',
      sortable: true,
      render: (u) => (
        <span className="font-serif text-xs text-stone-800">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      align: 'right',
      render: (u) => {
        const isSelf = u.id === currentUser?.id;
        return (
          <button
            type="button"
            disabled={isSelf}
            onClick={() => handleDeleteUser(u.id)}
            className="px-2.5 py-1 text-xs text-stone-400 hover:text-red-700 hover:bg-red-50 rounded transition disabled:opacity-30 cursor-pointer"
            title={isSelf ? 'Không thể tự xóa chính mình' : 'Xóa tài khoản người dùng'}
          >
            <Trash2 className="w-3.5 h-3.5" />
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
            <Users className="w-4 h-4" />
            <span>Quản Trị Độc Giả &amp; Nhân Sự</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 font-serif-display tracking-tight">
            Danh Bạ Độc Giả &amp; Đội Ngũ Thủ Thư
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 font-serif-data">
            Giám sát danh sách thành viên, phân quyền nhân sự, cấp quyền mượn lưu hành và xử lý tạm đình chỉ
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-1 bg-[#fcfbf7] p-1 rounded border border-[#d5ccba] text-xs self-start sm:self-auto font-serif-data">
          {[
            { id: '', label: 'Tất Cả' },
            { id: 'MEMBER', label: 'Độc Giả' },
            { id: 'LIBRARIAN', label: 'Thủ Thư' },
            { id: 'ADMIN', label: 'Quản Trị Viên' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRoleFilter(item.id)}
              className={`px-3 py-1 rounded text-[11px] font-medium transition cursor-pointer font-serif ${
                roleFilter === item.id
                  ? 'bg-[#92400e] text-white font-bold shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-[#f2ece0]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle={roleFilter ? `Không tìm thấy tài khoản (${roleFilter}) nào` : 'Chưa có tài khoản nào'}
        emptyDescription="Hiện không có người dùng nào khớp với bộ lọc đã chọn."
        searchPlaceholder="Tìm kiếm danh bạ theo tên hoặc email..."
        searchFilter={(item, query) => {
          const q = query.toLowerCase();
          return (
            item.fullName.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            (item.phone || '').toLowerCase().includes(q)
          );
        }}
      />
    </div>
  );
};
