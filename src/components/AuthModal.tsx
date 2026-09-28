import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { LogIn, UserPlus, RotateCw, X, Library } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const toast = useToast();
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Vui lòng nhập định dạng email hợp lệ';
    }

    if (!password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (isRegister) {
      if (!fullName.trim()) {
        errs.fullName = 'Vui lòng nhập họ và tên';
      }
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
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        });
        toast.success(`Chào mừng bạn đến với Thư viện Athenaeum, ${fullName.trim()}!`, 'Đăng Ký Thành Công');
      } else {
        await login(email.trim(), password);
        toast.success('Đăng nhập thành công!', 'Chào Mừng Trở Lại');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Xác thực không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsRegister(false);
    setFormErrors({});
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="aged-paper border border-[#ded5c2] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 relative font-serif-data">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Library seal */}
        <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-serif">
          <Library className="w-4 h-4" />
          <span>Thư Viện Athenaeum</span>
        </div>

        {/* Tab switch */}
        <div className="flex border-b-2 border-[#b8ac95] pb-2 space-x-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setFormErrors({});
            }}
            className={`font-serif-display font-bold text-lg pb-1 transition border-b-2 cursor-pointer ${
              !isRegister
                ? 'border-[#92400e] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Độc Giả Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setFormErrors({});
            }}
            className={`font-serif-display font-bold text-lg pb-1 transition border-b-2 cursor-pointer ${
              isRegister
                ? 'border-[#92400e] text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Đăng Ký Thẻ Độc Giả
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5 text-xs">
          {isRegister && (
            <div>
              <label className="block text-stone-800 font-serif font-semibold mb-1">Họ và Tên *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (formErrors.fullName) setFormErrors({ ...formErrors, fullName: '' });
                }}
                placeholder="Nguyễn Văn An"
                className={`w-full px-3 py-2 bg-[#fcfbf7] border rounded text-stone-900 focus:outline-none font-serif ${
                  formErrors.fullName ? 'border-red-500' : 'border-[#d5ccba] focus:border-[#92400e]'
                }`}
              />
              {formErrors.fullName && (
                <p className="text-[11px] text-red-600 mt-1">{formErrors.fullName}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-stone-800 font-serif font-semibold mb-1">Địa Chỉ Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
              }}
              placeholder="docgia@thuvien.edu.vn"
              className={`w-full px-3 py-2 bg-[#fcfbf7] border rounded text-stone-900 focus:outline-none font-serif ${
                formErrors.email ? 'border-red-500' : 'border-[#d5ccba] focus:border-[#92400e]'
              }`}
            />
            {formErrors.email && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-stone-800 font-serif font-semibold mb-1">Mật Khẩu *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
              }}
              placeholder="••••••••"
              className={`w-full px-3 py-2 bg-[#fcfbf7] border rounded text-stone-900 focus:outline-none ${
                formErrors.password ? 'border-red-500' : 'border-[#d5ccba] focus:border-[#92400e]'
              }`}
            />
            {formErrors.password && (
              <p className="text-[11px] text-red-600 mt-1">{formErrors.password}</p>
            )}
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-stone-800 font-serif font-semibold mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901 234 567"
                  className="w-full px-3 py-2 bg-[#fcfbf7] border border-[#d5ccba] rounded text-stone-900 focus:outline-none focus:border-[#92400e] font-serif"
                />
              </div>

              <div>
                <label className="block text-stone-800 font-serif font-semibold mb-1">Địa Chỉ Thường Trú</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số 124 Đường Thư Viện, Quận 1, TP. Hồ Chí Minh"
                  className="w-full px-3 py-2 bg-[#fcfbf7] border border-[#d5ccba] rounded text-stone-900 focus:outline-none focus:border-[#92400e] font-serif"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#92400e] hover:bg-[#78350f] disabled:opacity-50 text-white font-serif font-bold rounded transition shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer mt-4"
          >
            {submitting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>{isRegister ? 'Đang cấp thẻ độc giả...' : 'Đang xác thực...'}</span>
              </>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Cấp Thẻ Độc Giả &amp; Đăng Ký</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Vào Thư Viện</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Pill Bar */}
        <div className="pt-3 border-t-2 border-[#b8ac95]">
          <p className="text-[11px] text-stone-600 font-serif font-medium mb-2 text-center">
            Đăng nhập nhanh bằng tài khoản mẫu:
          </p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleFillDemo('admin@library.com', 'Admin123!')}
              className="p-1.5 bg-[#fcfbf7] hover:bg-[#f2ece0] border border-[#d5ccba] rounded text-[#92400e] font-serif font-bold text-center transition cursor-pointer shadow-2xs"
            >
              Quản Trị Viên
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('librarian@library.com', 'Librarian123!')}
              className="p-1.5 bg-[#fcfbf7] hover:bg-[#f2ece0] border border-[#d5ccba] rounded text-stone-800 font-serif font-bold text-center transition cursor-pointer shadow-2xs"
            >
              Thủ Thư
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('member1@library.com', 'Member123!')}
              className="p-1.5 bg-[#fcfbf7] hover:bg-[#f2ece0] border border-[#d5ccba] rounded text-stone-800 font-serif font-bold text-center transition cursor-pointer shadow-2xs"
            >
              Độc Giả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
