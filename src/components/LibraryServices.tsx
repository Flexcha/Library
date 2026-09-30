import React from 'react';
import {
  Clock,
  MapPin,
  Building2,
  Library,
  FileText,
  Phone,
  Compass,
} from 'lucide-react';

interface LibraryServicesProps {
  openAuthModal: () => void;
  onExploreCatalog: () => void;
}

export const LibraryServices: React.FC<LibraryServicesProps> = () => {
  return (
    <div className="space-y-8 pb-8">
      {/* Title Card */}
      <div className="ui-card p-6 sm:p-8 space-y-2 border border-white/10">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>Dịch Vụ Thư Viện LibraryOS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Hướng Dẫn & Dịch Vụ Phục Vụ Bạn Đọc
        </h1>
        <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
          Thư viện phục vụ nhu cầu tra cứu, nghiên cứu và học tập của độc giả với hệ thống phòng đọc hiện đại và dịch vụ hỗ trợ chuyên nghiệp.
        </p>
      </div>

      {/* Reading Rooms */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Library className="w-5 h-5 text-indigo-400" />
              <span>Hệ Thống Phòng Đọc & Không Gian Học Tập</span>
            </h2>
            <p className="text-xs text-slate-400">
              Các không gian học tập yên tĩnh, trang bị ổ cắm điện và wifi tốc độ cao.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tầng 1 */}
          <div className="ui-card p-5 space-y-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="badge badge-blue">Tầng 1 · Sảnh chính</span>
              <span className="text-xs text-slate-400">Trao đổi nhóm</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Bàn Lưu Thông & Phòng Học Nhóm
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Quầy thủ thư làm thủ tục mượn trả, đăng ký thẻ bạn đọc và 3 phòng thảo luận nhóm dành cho sinh viên, học giả.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Sức chứa: 20 bàn đọc</span>
              <span className="text-emerald-400 font-semibold">Phục vụ: 08:00 – 21:00</span>
            </div>
          </div>

          {/* Tầng 2 */}
          <div className="ui-card p-5 space-y-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="badge badge-green">Tầng 2 · Nghiên cứu</span>
              <span className="text-xs text-slate-400">Yên tĩnh cao</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Đại Phòng Đọc & Khu Tra Cứu Máy Tính
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Trang bị bàn đọc cá nhân, đèn chống lóa, cổng kết nối và 15 máy tính tra cứu danh mục trực tuyến.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Sức chứa: 36 bàn đọc</span>
              <span className="text-emerald-400 font-semibold">Phục vụ: 08:00 – 21:00</span>
            </div>
          </div>

          {/* Tầng 3 */}
          <div className="ui-card p-5 space-y-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="badge badge-yellow">Tầng 3 · Chuyên đề</span>
              <span className="text-xs text-slate-400">Tĩnh lặng</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Phòng Đọc Tạp Chí & Luận Văn Nghiên Cứu
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dành riêng cho giảng viên, nghiên cứu sinh chuẩn bị đề tài, luận văn với các cabin làm việc độc lập.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Sức chứa: 26 buồng tự học</span>
              <span className="text-emerald-400 font-semibold">Phục vụ: 08:00 – 21:00</span>
            </div>
          </div>

          {/* Tầng 4 */}
          <div className="ui-card p-5 space-y-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="badge badge-gray">Tầng 4 · Bảo quản</span>
              <span className="text-xs text-slate-400">Hạn chế</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Phòng Nghiên Cứu Tư Liệu Đặc Biệt
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Khu lưu trữ sách hiếm, tài liệu địa chí và bản thảo cổ được bảo quản trong điều kiện nhiệt độ tiêu chuẩn.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Sức chứa: 12 chỗ ngồi</span>
              <span className="text-indigo-400 font-semibold">Hẹn trước với thủ thư</span>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="ui-card p-6 space-y-4 border border-white/10">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <Clock className="w-5 h-5" />
            <h2 className="font-bold text-white text-base">Thời Gian Mở Cửa</h2>
          </div>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="font-medium text-white">Thứ Hai – Thứ Sáu</span>
              <span>08:00 – 21:00</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="font-medium text-white">Thứ Bảy</span>
              <span>08:00 – 19:00</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="font-medium text-white">Chủ Nhật</span>
              <span>10:00 – 18:00</span>
            </div>
          </div>
        </div>

        <div className="ui-card p-6 space-y-4 border border-white/10">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <MapPin className="w-5 h-5" />
            <h2 className="font-bold text-white text-base">Địa Điểm Thư Viện</h2>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <p className="font-semibold text-white">Tòa nhà Thư Viện Trung Tâm</p>
            <p>124 Athenaeum, Quận 1, TP. Hồ Chí Minh</p>
            <div className="pt-2 text-[11px] text-slate-400 space-y-1">
              <p>• Bãi giữ xe máy & ô tô tại Cổng Nam</p>
              <p>• Có thang máy và lối đi riêng cho người khuyết tật</p>
            </div>
          </div>
        </div>

        <div className="ui-card p-6 space-y-4 border border-white/10">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <Phone className="w-5 h-5" />
            <h2 className="font-bold text-white text-base">Liên Hệ Thư Viện</h2>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <p className="flex justify-between">
              <span className="font-medium text-white">Bàn Lưu Thông:</span>
              <span className="font-mono text-indigo-300">+84 28 3829 1000</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-white">Thủ Thư Tư Vấn:</span>
              <span className="font-mono text-indigo-300">+84 28 3829 1001</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium text-white">Email Hỗ Trợ:</span>
              <span className="text-indigo-300">support@libraryos.org</span>
            </p>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="ui-card p-6 space-y-4 border border-white/10">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider border-b border-white/10 pb-3">
          <FileText className="w-4 h-4" />
          <span>Quy Định & Hạn Mức Mượn Sách</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">Hạn Mức & Gia Hạn</h3>
            <p>
              • Mỗi bạn đọc được mượn tối đa <strong className="text-white">5 đầu sách</strong> cùng lúc.
            </p>
            <p>
              • Thời hạn mượn tiêu chuẩn là <strong className="text-white">14 ngày</strong>. Bạn đọc có thể gia hạn trực tuyến tối đa 2 lần nếu sách chưa có người xếp hàng đặt trước.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">Phí Quá Hạn</h3>
            <p>
              • Sách trả trễ hạn chịu mức phí trễ <strong className="text-rose-400">5.000 VNĐ / ngày / cuốn</strong>.
            </p>
            <p>
              • Bạn đọc có khoản tiền phạt quá 50.000 VNĐ cần hoàn tất thanh toán trước khi tiếp tục mượn sách mới.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

