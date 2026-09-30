import React, { useState, useEffect } from 'react';
import { api } from '../api/client.ts';
import { User } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { DataTable, Column } from './common/DataTable.tsx';
import {
  Users, UserPlus, Trash2, Edit3, Shield, X, Eye, EyeOff, Crown,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
const ROLE_META: Record<string, { label: string; badge: string; avatarBg: string; avatarText: string }> = {
  SUPERADMIN: { label: 'Siêu Quản Trị',  badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/40', avatarBg: 'bg-purple-500/20 border-purple-500/30', avatarText: 'text-purple-300' },
  ADMIN:      { label: 'Quản Trị Viên',  badge: 'bg-amber-500/20  text-amber-300  border border-amber-500/40',  avatarBg: 'bg-amber-500/20  border-amber-500/30',  avatarText: 'text-amber-300'  },
  LIBRARIAN:  { label: 'Thủ Thư',        badge: 'bg-blue-500/20   text-blue-300   border border-blue-500/40',   avatarBg: 'bg-blue-500/20   border-blue-500/30',   avatarText: 'text-blue-300'   },
  MEMBER:     { label: 'Bạn Đọc',        badge: 'bg-slate-700/60  text-slate-300  border border-white/10',      avatarBg: 'bg-slate-700     border-white/10',      avatarText: 'text-slate-300'  },
};

// ────────────────────────────────────────────────────────────
// Create / Edit User Modal
// ────────────────────────────────────────────────────────────
interface UserFormModalProps {
  editUser: User | null;
  callerRole: string;
  onClose: () => void;
  onSaved: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ editUser, callerRole, onClose, onSaved }) => {
  const toast = useToast();
  const isEdit = !!editUser;
  const isSuperAdmin = callerRole === 'SUPERADMIN';

  // Role options shown based on caller's permissions
  const availableRoles = isSuperAdmin
    ? [
        { value: 'MEMBER',    label: 'Bạn đọc' },
        { value: 'LIBRARIAN', label: 'Thủ thư' },
        { value: 'ADMIN',     label: 'Admin' },
      ]
    : [
        { value: 'MEMBER',    label: 'Bạn đọc' },
        { value: 'LIBRARIAN', label: 'Thủ thư' },
      ];

  const availableRoleValues = availableRoles.map(r => r.value);

  // Khi edit: nếu role của user nằm ngoài quyền của caller → giữ nguyên nhưng khóa dropdown
  const editUserRoleIsRestricted = isEdit && !availableRoleValues.includes(editUser!.role);

  const [form, setForm] = useState({
    fullName: editUser?.fullName ?? '',
    email:    editUser?.email    ?? '',
    password: '',
    phone:    editUser?.phone    ?? '',
    address:  editUser?.address  ?? '',
    // Giữ nguyên role hiện tại — sẽ không gọi updateRole nếu không thay đổi
    role: (editUser?.role ?? 'MEMBER') as string,
  });
  const [showPwd, setShowPwd]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [saving, setSaving]     = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) e.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email không hợp lệ';
    if (!isEdit && form.password.length < 8) e.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await api.updateUser(editUser!.id, {
          fullName: form.fullName.trim(),
          phone:    form.phone.trim()   || undefined,
          address:  form.address.trim() || undefined,
        });
        // Chỉ gọi updateRole khi:
        // 1. Role thực sự thay đổi
        // 2. Role mới nằm trong danh sách caller được phép
        // 3. Role cũ không bị restricted (không phải SUPERADMIN/ADMIN đối với ADMIN caller)
        const roleChanged = form.role !== editUser!.role;
        const newRoleAllowed = availableRoleValues.includes(form.role);
        if (roleChanged && newRoleAllowed && !editUserRoleIsRestricted) {
          await api.updateUserRole(editUser!.id, form.role);
        }
        toast.success('Đã cập nhật thông tin người dùng.', 'Thành công');
      } else {
        await api.createUser({
          fullName: form.fullName.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
          phone:    form.phone.trim()   || undefined,
          address:  form.address.trim() || undefined,
          role:     form.role,
        });
        toast.success('Đã tạo tài khoản mới thành công.', 'Thành công');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Không thể lưu thông tin người dùng.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field: string) =>
    `ui-input w-full text-sm ${errors[field] ? 'border-rose-500' : ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#0f172a] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              {isEdit ? <Edit3 className="w-4 h-4 text-indigo-400" /> : <UserPlus className="w-4 h-4 text-indigo-400" />}
            </div>
            <div>
              <h2 className="text-white font-bold text-base">
                {isEdit ? 'Chỉnh Sửa Tài Khoản' : 'Tạo Tài Khoản Mới'}
              </h2>
              <p className="text-slate-400 text-xs">
                {isEdit ? `Cập nhật: ${editUser!.fullName}` : 'Tạo tài khoản với vai trò tùy chọn'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Vai trò</label>

            {editUserRoleIsRestricted ? (
              // Khóa thay đổi role vì caller không có quyền
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5">
                {editUser!.role === 'SUPERADMIN'
                  ? <Crown className="w-4 h-4 text-purple-400" />
                  : <Shield className="w-4 h-4 text-amber-400" />}
                <span className={`text-xs font-bold ${ROLE_META[editUser!.role]?.avatarText ?? 'text-white'}`}>
                  {ROLE_META[editUser!.role]?.label ?? editUser!.role}
                </span>
                <span className="ml-auto text-[10px] text-slate-500 italic">Không có quyền thay đổi</span>
              </div>
            ) : (
              <div className={`grid gap-2 ${availableRoles.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {availableRoles.map(({ value, label }) => {
                  const meta = ROLE_META[value];
                  const isSelected = form.role === value;
                  return (
                    <button key={value} type="button"
                      onClick={() => setForm(f => ({ ...f, role: value }))}
                      className={`py-2 px-2 rounded-lg border text-xs font-semibold transition cursor-pointer text-center ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <Shield className={`w-3.5 h-3.5 mx-auto mb-0.5 ${isSelected ? 'text-indigo-400' : meta?.avatarText ?? 'text-slate-400'}`} />
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {form.role === 'ADMIN' && !editUserRoleIsRestricted && (
              <p className="mt-1.5 text-xs text-amber-400/80">
                ⚠️ Admin có quyền quản lý Thủ thư và Bạn đọc.
              </p>
            )}
          </div>

          {/* Full name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Họ và Tên <span className="text-rose-400">*</span>
            </label>
            <input type="text" placeholder="Nguyễn Văn A" value={form.fullName}
              onChange={e => { setForm(f => ({ ...f, fullName: e.target.value })); setErrors(x => ({ ...x, fullName: '' })); }}
              className={inputCls('fullName')} />
            {errors.fullName && <p className="text-rose-400 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email <span className="text-rose-400">*</span>
            </label>
            <input type="email" placeholder="example@email.com" value={form.email}
              onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(x => ({ ...x, email: '' })); }}
              disabled={isEdit}
              className={`${inputCls('email')} ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`} />
            {isEdit && <p className="text-slate-500 text-xs mt-1">Email không thể thay đổi sau khi tạo</p>}
            {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password (create only) */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mật khẩu <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Tối thiểu 8 ký tự" value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(x => ({ ...x, password: '' })); }}
                  className={`${inputCls('password')} pr-10`} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password}</p>}
            </div>
          )}

          {/* Phone & Address */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Điện thoại</label>
              <input type="text" placeholder="0912345678" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="ui-input w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Địa chỉ</label>
              <input type="text" placeholder="Số nhà, đường, quận..." value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="ui-input w-full text-sm" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-sm font-semibold transition cursor-pointer">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition cursor-pointer disabled:opacity-60">
              {saving ? 'Đang lưu...' : isEdit ? '💾 Lưu thay đổi' : '✨ Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────
export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';
  const isAdmin      = currentUser?.role === 'ADMIN';

  const [users, setUsers]       = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<User | null | 'NEW'>(null);

  const fetchUsers = async () => {
    if (!currentUser || (!isSuperAdmin && !isAdmin)) return;
    setLoading(true);
    try {
      const res = await api.getUsers({ role: roleFilter || undefined, size: 200 });
      setUsers(res.content || []);
    } catch (err: any) {
      if (err.statusCode !== 403 && err.statusCode !== 401) {
        toast.error(err.message || 'Không thể lấy danh sách tài khoản.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, currentUser]);

  // Can the caller edit this user?
  const canEdit = (u: User): boolean => {
    if (isSuperAdmin) return true;
    if (isAdmin) return u.role !== 'SUPERADMIN' && u.role !== 'ADMIN';
    return false;
  };

  const handleStatusChange = async (u: User, newStatus: string) => {
    if (!canEdit(u)) {
      toast.error('Bạn không có quyền điều chỉnh trạng thái tài khoản này.');
      return;
    }
    try {
      await api.updateUserStatus(u.id, newStatus);
      toast.success('Đã cập nhật trạng thái tài khoản.', 'Thành công');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật trạng thái.');
    }
  };

  const handleDeactivate = async (u: User) => {
    if (u.id === currentUser?.id) {
      toast.error('Bạn không thể vô hiệu hóa tài khoản của chính mình.');
      return;
    }
    if (!canEdit(u)) {
      toast.error('Bạn không có quyền vô hiệu hóa tài khoản này.');
      return;
    }
    if (!confirm('Tài khoản sẽ bị VÔ HIỆU HÓA (INACTIVE). Xác nhận?')) return;
    try {
      await api.deleteUser(u.id);
      toast.success('Đã vô hiệu hóa tài khoản.', 'Đã xử lý');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Không thể vô hiệu hóa người dùng.');
    }
  };

  const ROLE_FILTER_TABS = isSuperAdmin
    ? [
        { id: '', label: 'Tất cả' },
        { id: 'MEMBER',     label: 'Bạn đọc' },
        { id: 'LIBRARIAN',  label: 'Thủ thư' },
        { id: 'ADMIN',      label: 'Admin' },
        { id: 'SUPERADMIN', label: 'SuperAdmin' },
      ]
    : [
        { id: '', label: 'Tất cả' },
        { id: 'MEMBER',    label: 'Bạn đọc' },
        { id: 'LIBRARIAN', label: 'Thủ thư' },
      ];

  const STATS = isSuperAdmin
    ? [
        { label: 'Bạn đọc',     role: 'MEMBER',     color: 'text-slate-300', bg: 'bg-slate-700/30 border-white/10' },
        { label: 'Thủ thư',     role: 'LIBRARIAN',  color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20' },
        { label: 'Admin',       role: 'ADMIN',      color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        { label: 'SuperAdmin',  role: 'SUPERADMIN', color: 'text-purple-400',bg: 'bg-purple-500/10 border-purple-500/20' },
      ]
    : [
        { label: 'Bạn đọc', role: 'MEMBER',    color: 'text-slate-300', bg: 'bg-slate-700/30 border-white/10' },
        { label: 'Thủ thư', role: 'LIBRARIAN', color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20' },
      ];

  const columns: Column<User>[] = [
    {
      key: 'fullName',
      header: 'Họ Tên & Email',
      sortable: true,
      render: (u) => {
        const meta = ROLE_META[u.role] || ROLE_META.MEMBER;
        return (
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${meta.avatarBg} ${meta.avatarText}`}>
              {u.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                {u.fullName}
                {u.role === 'SUPERADMIN' && <Crown className="w-3 h-3 text-purple-400" />}
              </div>
              <div className="text-[11px] text-indigo-300 font-mono">{u.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Điện Thoại',
      sortable: true,
      render: (u) => <span className="text-xs text-slate-300 font-mono">{u.phone || '—'}</span>,
    },
    {
      key: 'role',
      header: 'Vai Trò',
      sortable: true,
      render: (u) => {
        const meta = ROLE_META[u.role] || ROLE_META.MEMBER;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${meta.badge}`}>
            {u.role === 'SUPERADMIN' && <Crown className="w-3 h-3" />}
            {meta.label.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      sortable: true,
      render: (u) => {
        const isSelf = u.id === currentUser?.id;
        const editable = canEdit(u) && !isSelf;
        return (
          <select
            value={u.status}
            disabled={!editable}
            onChange={(e) => handleStatusChange(u, e.target.value)}
            className={`ui-input py-1 text-xs cursor-pointer max-w-[130px] bg-slate-900 border-slate-700 text-white rounded-lg ${!editable ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={!editable ? (isSelf ? 'Không thể tự thay đổi' : 'Bạn không có quyền') : ''}
          >
            <option value="ACTIVE"    className="bg-slate-900">HOẠT ĐỘNG</option>
            <option value="SUSPENDED" className="bg-slate-900">TẠM KHÓA</option>
            <option value="INACTIVE"  className="bg-slate-900">VÔ HIỆU HÓA</option>
          </select>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Ngày Tạo',
      sortable: true,
      render: (u) => (
        <span className="text-xs text-slate-300">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      align: 'right',
      render: (u) => {
        const isSelf   = u.id === currentUser?.id;
        const editable = canEdit(u);
        return (
          <div className="flex items-center gap-1 justify-end">
            <button
              type="button"
              onClick={() => editable ? setModal(u) : toast.error('Bạn không có quyền chỉnh sửa tài khoản này.')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${editable ? 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10' : 'text-slate-700 cursor-not-allowed'}`}
              title={editable ? 'Chỉnh sửa' : 'Không có quyền'}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={isSelf || !editable}
              onClick={() => handleDeactivate(u)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-30 cursor-pointer"
              title={isSelf ? 'Không thể tự vô hiệu hóa' : !editable ? 'Không có quyền' : 'Vô hiệu hóa tài khoản'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
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
            <Users className="w-4 h-4" />
            <span>Quản Trị Hệ Thống</span>
            {isSuperAdmin && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px]">
                <Crown className="w-3 h-3" /> SUPERADMIN
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Người Dùng</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isSuperAdmin
              ? 'Toàn quyền: tạo tài khoản, phân quyền (kể cả Admin), điều chỉnh trạng thái tất cả tài khoản.'
              : 'Tạo và quản lý tài khoản Thủ thư và Bạn đọc. Không thể chỉnh sửa tài khoản Admin.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10 text-xs flex-wrap">
            {ROLE_FILTER_TABS.map((item) => (
              <button key={item.id} type="button"
                onClick={() => setRoleFilter(item.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                  roleFilter === item.id
                    ? 'bg-indigo-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}>
                {item.label}
              </button>
            ))}
          </div>

          {/* Create button */}
          <button type="button" onClick={() => setModal('NEW')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition cursor-pointer shadow-lg shadow-indigo-500/20 whitespace-nowrap">
            <UserPlus className="w-4 h-4" />
            Tạo tài khoản
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid gap-3 ${STATS.length === 4 ? 'grid-cols-4' : 'grid-cols-2'}`}>
        {STATS.map(({ label, role, color, bg }) => (
          <div key={role} className={`ui-card p-4 border ${bg} flex items-center gap-3`}>
            <div className={`text-2xl font-bold ${color}`}>
              {loading ? '—' : users.filter(u => u.role === role).length}
            </div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle={roleFilter ? `Không có tài khoản (${roleFilter})` : 'Không có tài khoản nào'}
        emptyDescription="Chưa có người dùng nào phù hợp với bộ lọc hiện tại."
        searchPlaceholder="Tìm theo tên, email, số điện thoại..."
        searchFilter={(item, query) => {
          const q = query.toLowerCase();
          return (
            item.fullName.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            (item.phone || '').toLowerCase().includes(q)
          );
        }}
      />

      {/* Modal */}
      {modal !== null && (
        <UserFormModal
          editUser={modal === 'NEW' ? null : modal}
          callerRole={currentUser?.role ?? 'ADMIN'}
          onClose={() => setModal(null)}
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
};
