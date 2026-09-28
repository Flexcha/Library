import React from 'react';
import {
  Clock,
  MapPin,
  BookOpen,
  Building2,
  Users,
  Compass,
  CheckCircle2,
  Bookmark,
  Library,
  FileText,
  Phone,
  Mail,
  Shield,
  Layers,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface LibraryServicesProps {
  openAuthModal: () => void;
  onExploreCatalog: () => void;
}

export const LibraryServices: React.FC<LibraryServicesProps> = ({
  openAuthModal,
  onExploreCatalog,
}) => {
  return (
    <div className="space-y-10 pb-8 font-serif-data">
      {/* Title */}
      <div className="bg-white border border-[#e6e0d4] rounded-lg p-6 sm:p-8 shadow-2xs">
        <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
          <Building2 className="w-4 h-4" />
          <span>Chỉ Dẫn Bạn Đọc &amp; Đặc Quyền Học Thuật</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif-display tracking-tight">
          Hướng Dẫn Thăm Quan &amp; Dịch Vụ Thư Viện Athenaeum
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed font-serif">
          Thư viện Athenaeum trân trọng chào đón mọi học giả, nghiên cứu sinh và bạn đọc. Khám phá các phòng đọc học thuật,
          không gian nghiên cứu chuyên sâu, tiện ích tra cứu và quy định lưu thông tài liệu.
        </p>
      </div>

      {/* Reading Halls & Scholarly Spaces */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif-display text-stone-900 flex items-center gap-2">
              <Library className="w-5 h-5 text-[#92400e]" />
              <span>Hệ Thống Phòng Đọc &amp; Không Gian Học Thuật</span>
            </h2>
            <p className="text-xs text-stone-600 font-serif mt-0.5">
              Hệ thống không gian nghiên cứu tiêu chuẩn với ánh sáng tự nhiên và môi trường học thuật thanh tịnh.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tầng 1 */}
          <div className="bg-white border border-[#e6e0d4] rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#f5efe2] text-stone-700 font-bold border border-[#ded5c2]">
                Tầng 1 · Sảnh Đón
              </span>
              <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Thảo luận &amp; Trao đổi nhẹ</span>
              </span>
            </div>
            <h3 className="text-base font-bold font-serif-display text-stone-900">
              Sảnh Đón Tiếp &amp; Quầy Lưu Thông Trung Tâm
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-serif">
              Quầy thủ thư tiếp nhận mượn trả tài liệu, đăng ký làm thẻ bạn đọc và các phòng học nhóm đa phương tiện phục vụ thảo luận chuyên đề.
            </p>
            <div className="pt-2 border-t border-[#f1ede4] flex items-center justify-between text-xs text-stone-600 font-mono">
              <span>Sức chứa: 20 bàn + 3 phòng nhóm</span>
              <span className="text-emerald-700 font-semibold">Mở cửa 8:00 – 21:00</span>
            </div>
          </div>

          {/* Tầng 2 */}
          <div className="bg-white border border-[#e6e0d4] rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#fef3c7] text-[#92400e] font-bold border border-[#fde68a]">
                Tầng 2 · Nghiên Cứu Tổng Hợp
              </span>
              <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>&lt; 20 dB (Yên tĩnh cao)</span>
              </span>
            </div>
            <h3 className="text-base font-bold font-serif-display text-stone-900">
              Đại Phòng Đọc &amp; Không Gian Tra Cứu Số
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-serif">
              Trang bị bàn đọc gỗ sồi tiêu chuẩn, đèn bàn chống lóa, cổng sạc điện nguồn và kết nối mạng nội bộ tốc độ cao phục vụ tra cứu dữ liệu.
            </p>
            <div className="pt-2 border-t border-[#f1ede4] flex items-center justify-between text-xs text-stone-600 font-mono">
              <span>Sức chứa: 36 bàn đọc</span>
              <span className="text-emerald-700 font-semibold">Mở cửa 8:00 – 21:00</span>
            </div>
          </div>

          {/* Tầng 3 */}
          <div className="bg-white border border-[#e6e0d4] rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#f1ede4] text-stone-700 font-bold border border-[#d6ccb8]">
                Tầng 3 · Chuyên Sâu
              </span>
              <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>&lt; 16 dB (Tuyệt đối tĩnh lặng)</span>
              </span>
            </div>
            <h3 className="text-base font-bold font-serif-display text-stone-900">
              Phòng Đọc Chuyên Đề &amp; Tạp Chí Học Thuật
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-serif">
              Khu vực dành riêng cho các nhà nghiên cứu, giảng viên và sinh viên thực hiện đồ án, luận văn với các buồng nghiên cứu độc lập.
            </p>
            <div className="pt-2 border-t border-[#f1ede4] flex items-center justify-between text-xs text-stone-600 font-mono">
              <span>Sức chứa: 26 buồng tự học</span>
              <span className="text-emerald-700 font-semibold">Mở cửa 8:00 – 21:00</span>
            </div>
          </div>

          {/* Tầng 4 */}
          <div className="bg-white border border-[#e6e0d4] rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#fef2f2] text-[#991b1b] font-bold border border-[#fecaca]">
                Tầng 4 · Phòng Đọc Riêng
              </span>
              <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nhiệt độ 18°C · 45% Độ ẩm</span>
              </span>
            </div>
            <h3 className="text-base font-bold font-serif-display text-stone-900">
              Phòng Nghiên Cứu Tư Liệu Đặc Biệt &amp; Bản Thảo Quý
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-serif">
              Khu lưu trữ và nghiên cứu chuyên sâu các văn bản Hán Nôm, bản thảo quý hiếm và tài liệu địa chí với sự hỗ trợ của thủ thư chuyên trách.
            </p>
            <div className="pt-2 border-t border-[#f1ede4] flex items-center justify-between text-xs text-stone-600 font-mono">
              <span>Sức chứa: 12 vị trí nghiên cứu</span>
              <span className="text-stone-700 font-semibold">10:00 – 16:00 (Cần hẹn trước)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hours & Locations */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#e6e0d4] rounded-lg p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#92400e]">
            <Clock className="w-5 h-5" />
            <h2 className="font-bold font-serif-display text-stone-900 text-base">Thời Gian Mở Cửa</h2>
          </div>
          <div className="space-y-2.5 text-xs text-stone-600">
            <div className="flex justify-between border-b border-[#f1ede4] pb-1.5">
              <span className="font-medium text-stone-800">Thứ Hai – Thứ Năm</span>
              <span className="tabular-nums">8:00 – 21:00</span>
            </div>
            <div className="flex justify-between border-b border-[#f1ede4] pb-1.5">
              <span className="font-medium text-stone-800">Thứ Sáu – Thứ Bảy</span>
              <span className="tabular-nums">8:00 – 19:00</span>
            </div>
            <div className="flex justify-between border-b border-[#f1ede4] pb-1.5">
              <span className="font-medium text-stone-800">Chủ Nhật</span>
              <span className="tabular-nums">10:00 – 18:00</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-medium text-stone-800">Kho Bản Thảo Quý Hiếm</span>
              <span className="tabular-nums">10:00 – 16:00</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e6e0d4] rounded-lg p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#92400e]">
            <MapPin className="w-5 h-5" />
            <h2 className="font-bold font-serif-display text-stone-900 text-base">Địa Điểm Trụ Sở</h2>
          </div>
          <div className="space-y-2 text-xs text-stone-600">
            <p className="font-semibold text-stone-900">Tòa Nhà Trung Tâm Thư Viện Athenaeum</p>
            <p>124 Đường Athenaeum, Khu Văn Hóa Quận 1</p>
            <p>Thành phố Hồ Chí Minh, Việt Nam</p>
            <div className="pt-2 text-[11px] text-stone-500 space-y-1">
              <p>• Trạm xe buýt gần nhất: Trạm Trung tâm (Cửa B)</p>
              <p>• Khu vực gửi xe đạp &amp; xe máy tại Cổng Bắc</p>
              <p>• Thiết kế tiếp cận cho xe lăn trên toàn bộ các tầng</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e6e0d4] rounded-lg p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 text-[#92400e]">
            <Phone className="w-5 h-5" />
            <h2 className="font-bold font-serif-display text-stone-900 text-base">Liên Hệ &amp; Tư Vấn</h2>
          </div>
          <div className="space-y-2 text-xs text-stone-600">
            <p className="flex items-center justify-between">
              <span className="font-medium text-stone-800">Bàn Lưu Thông:</span>
              <span className="font-mono text-stone-700">+84 901 234 567</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-stone-800">Thủ Thư Tư Vấn:</span>
              <span className="font-mono text-stone-700">+84 907 654 321</span>
            </p>
            <p className="flex items-center justify-between">
              <span className="font-medium text-stone-800">Email Hỗ Trợ:</span>
              <span className="text-stone-700">info@athenaeum.lib</span>
            </p>
            <div className="pt-2 text-[11px] text-[#92400e] font-medium">
              Bàn tư vấn mục lục và trích dẫn khoa học mở cửa hàng ngày không cần đặt lịch trước.
            </div>
          </div>
        </div>
      </section>

      {/* Reading Rooms Layout */}
      <section className="bg-white border border-[#e6e0d4] rounded-xl p-8 shadow-2xs space-y-6">
        <div className="border-b border-[#f1ede4] pb-4">
          <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>Sơ Đồ Phân Bổ Các Tầng &amp; Kho Sách</span>
          </div>
          <h2 className="text-2xl font-bold font-serif-display text-stone-900 tracking-tight">
            Danh Mục Không Gian &amp; Các Tầng Nghiên Cứu
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Lập kế hoạch nghiên cứu hiệu quả trên 4 tầng lưu trữ và không gian học thuật của chúng tôi:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-4 bg-[#fbf9f5] border border-[#e6e0d4] rounded-lg space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-bold">TẦNG 1 · SẢNH CHÍNH</span>
            <h3 className="font-bold text-stone-900 font-serif-display text-sm">
              Đại Sảnh Đọc &amp; Bàn Lưu Thông
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Bàn mượn trả chính, trạm tự phục vụ mượn sách, trưng bày sách mới nhập, văn học hư cấu và báo chí định kỳ.
            </p>
          </div>

          <div className="p-4 bg-[#fbf9f5] border border-[#e6e0d4] rounded-lg space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-bold">TẦNG 2 · TẦNG LỬNG</span>
            <h3 className="font-bold text-stone-900 font-serif-display text-sm">
              Buồng Đọc Nghiên Cứu Yên Tĩnh
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kho khoa học máy tính, toán học, khoa học tự nhiên, trang bị ổ cắm điện và đèn bàn đọc cá nhân.
            </p>
          </div>

          <div className="p-4 bg-[#fbf9f5] border border-[#e6e0d4] rounded-lg space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-bold">TẦNG 3 · HÀNH LANG</span>
            <h3 className="font-bold text-stone-900 font-serif-display text-sm">
              Triết Học &amp; Lịch Sử Thế Giới
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Chuyên khảo lịch sử, triết học, xã hội học, buồng đọc vi phim tư liệu và phòng tọa đàm nhóm nhỏ.
            </p>
          </div>

          <div className="p-4 bg-[#fbf9f5] border border-[#e6e0d4] rounded-lg space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#92400e] font-bold">TẦNG 4 · LƯU TRỮ</span>
            <h3 className="font-bold text-stone-900 font-serif-display text-sm">
              Sách Hiếm &amp; Bản Thảo Quý
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Hầm bảo quản tài liệu đặc biệt kiểm soát nhiệt độ, phòng phục chế sách cổ và bàn khảo sát có giám sát.
            </p>
          </div>
        </div>
      </section>

      {/* Circulation Guidelines & Fines Policy */}
      <section className="bg-white border border-[#e6e0d4] rounded-xl p-8 shadow-2xs space-y-6">
        <div className="border-b border-[#f1ede4] pb-4">
          <div className="flex items-center gap-2 text-[#92400e] text-xs font-semibold uppercase tracking-wider mb-1 font-mono">
            <FileText className="w-3.5 h-3.5" />
            <span>Quy Chuẩn Lưu Thông &amp; Mượn Trả</span>
          </div>
          <h2 className="text-2xl font-bold font-serif-display text-stone-900 tracking-tight">
            Chính Sách Mượn Sách &amp; Trách Nhiệm Độc Giả
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-600 leading-relaxed">
          <div className="space-y-3">
            <h3 className="font-bold font-serif-display text-stone-900 text-sm">
              Hạn Mức Mượn &amp; Gia Hạn
            </h3>
            <p>
              Bạn đọc có thẻ hoạt động tốt được mượn tối đa <strong>5 cuốn sách cùng lúc</strong> với thời hạn mượn
              tiêu chuẩn là <strong>14 ngày theo lịch</strong>.
            </p>
            <p>
              Sách có thể được gia hạn tối đa <strong>2 lần trực tuyến</strong> qua Cổng Thông Tin Bạn Đọc, miễn là tài liệu
              chưa bị độc giả khác đặt trước.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold font-serif-display text-stone-900 text-sm">
              Phí Trễ Hạn &amp; Bảo Quản Tài Liệu
            </h3>
            <p>
              Nhằm khuyến khích việc hoàn trả đúng hạn cho các bạn đọc khác tiếp cận, sách quá hạn sẽ tính phí tượng trưng{' '}
              <strong>5.000 VNĐ / ngày</strong>.
            </p>
            <p>
              Độc giả có khoản phạt chưa thanh toán vượt quá 50.000 VNĐ sẽ tạm hoãn quyền mượn sách mới cho đến khi
              thanh toán hoàn tất tại Bàn Lưu Thông hoặc thanh toán online.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
