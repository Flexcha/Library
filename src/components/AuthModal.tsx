import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { LogIn, UserPlus, RotateCw, X, BookOpen, Zap, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_FORM = {
  email: '',
  password: '',
  fullName: '',
  phone: '',
  address: '',
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const toast = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  // Reset toàn bộ form mỗi khi modal mở lại
  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setFormErrors({});
      setIsRegister(false);
      setShowPwd(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const setField = (field: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) {
      errs.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Định dạng email không hợp lệ';
    }
    if (!form.password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (form.password.length < 6) {
      errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (isRegister && !form.fullName.trim()) {
      errs.fullName = 'Vui lòng nhập họ và tên';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
        });
        toast.success(`Chào mừng ${form.fullName.trim()} đến với LibraryOS!`, 'Đăng ký thành công');
      } else {
        await login(form.email.trim(), form.password);
        toast.success('Đăng nhập thành công!', 'Chào mừng trở lại');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Xác thực không thành công. Kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setForm(f => ({ ...f, email: demoEmail, password: demoPass }));
    setIsRegister(false);
    setFormErrors({});
  };

  const switchTab = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowPwd(false);
  };

  const inputBase = 'ui-input bg-slate-900 border-slate-700 text-white rounded-lg w-full';
  const errCls = (field: string) => formErrors[field] ? 'border-rose-500' : '';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-w-md w-full bg-[#0d1322] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white font-bold text-base tracking-tight">LibraryOS</div>
            <div className="text-slate-400 text-xs">Hệ thống Quản lý Thư viện</div>
          </div>
        </div>

        {/* Switcher Tabs */}
        <div className="flex p-1 bg-slate-900/90 border border-white/10 rounded-xl gap-1">
          {[
            { label: 'Đăng nhập', value: false },
            { label: 'Đăng ký',   value: true  },
          ].map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => switchTab(value)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isRegister === value
                  ? 'text-white bg-indigo-600 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {/* Họ tên — chỉ khi đăng ký */}
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Họ và tên *</label>
              <input
                type="text"
                value={form.fullName}
                onChange={setField('fullName')}
                placeholder="Nguyễn Văn An"
                className={`${inputBase} ${errCls('fullName')}`}
                autoFocus={isRegister}
              />
              {formErrors.fullName && <p className="text-xs text-rose-400 mt-1">{formErrors.fullName}</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={setField('email')}
              placeholder="email@example.com"
              className={`${inputBase} ${errCls('email')}`}
              autoFocus={!isRegister}
              autoComplete="email"
            />
            {formErrors.email && <p className="text-xs text-rose-400 mt-1">{formErrors.email}</p>}
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu *</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={setField('password')}
                placeholder="••••••••"
                className={`${inputBase} ${errCls('password')} pr-10`}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formErrors.password && <p className="text-xs text-rose-400 mt-1">{formErrors.password}</p>}
          </div>

          {/* Phone & Address — chỉ khi đăng ký */}
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={setField('phone')}
                  placeholder="0901 234 567"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={setField('address')}
                  placeholder="Địa chỉ thường trú"
                  className={inputBase}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-2.5 text-sm mt-2 disabled:opacity-60 rounded-xl"
          >
            {submitting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>{isRegister ? 'Đang đăng ký...' : 'Đang đăng nhập...'}</span>
              </>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký tài khoản</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Selector */}
        {!isRegister && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-xs text-slate-400 font-medium">Đăng nhập tài khoản mẫu:</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '👑 SuperAdmin', email: 'superadmin@library.com', pass: 'SuperAdmin123!' },
                { label: '🛡 Admin',      email: 'admin@library.com',      pass: 'Admin123!'      },
                { label: '📚 Thủ thư',   email: 'librarian@library.com',  pass: 'Librarian123!'  },
                { label: '👤 Bạn đọc',   email: 'member1@library.com',    pass: 'Member123!'     },
              ].map(({ label, email: e, pass }) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => handleFillDemo(e, pass)}
                  className="btn-secondary py-1.5 text-xs px-2 rounded-lg text-left truncate"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
