import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Seeding Athenaeum Library database with comprehensive, authentic library data...');

  // Standard demo passwords for quick login/testing
  const superadminPassword = await bcrypt.hash('SuperAdmin123!', 10);
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const librarianPassword = await bcrypt.hash('Librarian123!', 10);
  const memberPassword = await bcrypt.hash('Member123!', 10);

  // =========================================================================
  // 1. PATRONS & STAFF ACCOUNTS
  // =========================================================================
  // SUPERADMIN — toàn quyền hệ thống, có thể quản lý tất cả kể cả ADMIN
  await prisma.user.upsert({
    where: { email: 'superadmin@library.com' },
    update: { fullName: 'Hệ Thống Quản Trị Cấp Cao', passwordHash: superadminPassword },
    create: {
      fullName: 'Hệ Thống Quản Trị Cấp Cao',
      email: 'superadmin@library.com',
      passwordHash: superadminPassword,
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      phone: '+84 900 000 001',
      address: 'Phòng Điều Hành, Tòa Nhà Athenaeum, 124 Đường Thư Viện, Q.1, TP.HCM',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: { fullName: 'TS. Nguyễn Hoàng Anh', passwordHash: adminPassword },
    create: {
      fullName: 'TS. Nguyễn Hoàng Anh',
      email: 'admin@library.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      phone: '+84 901 234 567',
      address: 'Văn Phòng Ban Giám Đốc, Tòa Nhà Athenaeum, 124 Đường Thư Viện, Q.1, TP.HCM',
    },
  });

  const librarian = await prisma.user.upsert({
    where: { email: 'librarian@library.com' },
    update: { fullName: 'Sarah Vance', passwordHash: librarianPassword },
    create: {
      fullName: 'Sarah Vance',
      email: 'librarian@library.com',
      passwordHash: librarianPassword,
      role: 'LIBRARIAN',
      status: 'ACTIVE',
      phone: '+84 907 654 321',
      address: 'Quầy Thủ Thư Trung Tâm, Tầng 1 - Sảnh Quadrangle',
    },
  });

  const archivist = await prisma.user.upsert({
    where: { email: 'archivist@library.com' },
    update: { fullName: 'Trần Minh Trí', passwordHash: librarianPassword },
    create: {
      fullName: 'Trần Minh Trí',
      email: 'archivist@library.com',
      passwordHash: librarianPassword,
      role: 'LIBRARIAN',
      status: 'ACTIVE',
      phone: '+84 908 112 233',
      address: 'Phòng Bảo Tồn Văn Bản Cổ & Vi Khí Hậu, Tầng 4',
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'member1@library.com' },
    update: { fullName: 'Nguyễn Văn An', passwordHash: memberPassword },
    create: {
      fullName: 'Nguyễn Văn An',
      email: 'member1@library.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      phone: '+84 988 776 655',
      address: '123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
      membershipExpiryDate: '2028-12-31',
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: 'member2@library.com' },
    update: { fullName: 'Emily Watson', passwordHash: memberPassword },
    create: {
      fullName: 'Emily Watson',
      email: 'member2@library.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      phone: '+84 912 345 678',
      address: '45 Trần Hưng Đạo, Phường Cầu Ông Lãnh, Quận 1, TP.HCM',
      membershipExpiryDate: '2028-10-15',
    },
  });

  const member3 = await prisma.user.upsert({
    where: { email: 'member3@library.com' },
    update: { fullName: 'Marcus Aurelius Vance', passwordHash: memberPassword },
    create: {
      fullName: 'Marcus Aurelius Vance',
      email: 'member3@library.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      phone: '+84 933 221 100',
      address: '88 Nguyễn Huệ Boulevard, Quận 1, TP.HCM',
      membershipExpiryDate: '2028-06-30',
    },
  });

  const member4 = await prisma.user.upsert({
    where: { email: 'member4@library.com' },
    update: { fullName: 'Sofia Rodriguez', passwordHash: memberPassword },
    create: {
      fullName: 'Sofia Rodriguez',
      email: 'member4@library.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      phone: '+84 977 889 900',
      address: '12 Thảo Điền, TP. Thủ Đức, TP.HCM',
      membershipExpiryDate: '2028-09-01',
    },
  });

  const member5 = await prisma.user.upsert({
    where: { email: 'member5@library.com' },
    update: { fullName: 'Lê Hoàng Nam', passwordHash: memberPassword },
    create: {
      fullName: 'Lê Hoàng Nam',
      email: 'member5@library.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      phone: '+84 903 887 766',
      address: '72 Điện Biên Phủ, Phường Đa Kao, Quận 1, TP.HCM',
      membershipExpiryDate: '2029-01-20',
    },
  });

  const member6 = await prisma.user.upsert({
    where: { email: 'member6@library.com' },
    update: { fullName: 'Trần Mai Phương', passwordHash: memberPassword },
    create: {
      fullName: 'Trần Mai Phương',
      email: 'member6@library.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      phone: '+84 918 334 455',
      address: '15/3 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM',
      membershipExpiryDate: '2028-11-30',
    },
  });

  const member7 = await prisma.user.upsert({
    where: { email: 'member7@library.com' },
    update: { fullName: 'Đặng Quốc Hưng', passwordHash: memberPassword },
    create: {
      fullName: 'Đặng Quốc Hưng',
      email: 'member7@library.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
      phone: '+84 982 445 566',
      address: '227 Nguyễn Văn Cừ, Quận 5, TP.HCM',
      membershipExpiryDate: '2027-08-31',
    },
  });

  const memberSuspended = await prisma.user.upsert({
    where: { email: 'suspended@library.com' },
    update: { fullName: 'David Miller', passwordHash: memberPassword },
    create: {
      fullName: 'David Miller',
      email: 'suspended@library.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
      status: 'SUSPENDED',
      phone: '+84 944 556 677',
      address: '25 Phạm Ngọc Thạch, Quận 3, TP.HCM',
      membershipExpiryDate: '2026-05-20',
    },
  });

  // =========================================================================
  // 2. CATEGORIES (DEWEY & SCHOLARLY SUBJECTS)
  // =========================================================================
  const categoriesData = [
    {
      name: 'Khoa học Máy tính & Kỹ thuật Phần mềm',
      description: 'Ngôn ngữ lập trình, kiến trúc mã nguồn sạch, tái cấu trúc và phần mềm chuyên sâu.',
    },
    {
      name: 'Hệ thống Phân tán & Kiến trúc Dữ liệu',
      description: 'Hạ tầng phân tán, cơ sở dữ liệu lớn, điện toán đám mây và độ tin cậy hệ thống.',
    },
    {
      name: 'Văn học Kinh điển & Tiểu thuyết Thế giới',
      description: 'Kiệt tác văn chương tự sự, tiểu thuyết phản địa đàng và tác phẩm đoạt giải quốc tế.',
    },
    {
      name: 'Văn học & Sử liệu Việt Nam',
      description: 'Trước tác văn học kinh điển, chính sử Đại Việt và tiểu thuyết thời kỳ phục hưng tư tưởng.',
    },
    {
      name: 'Khoa học Tự nhiên & Vật lý Thiên văn',
      description: 'Vật lý lượng tử, vũ trụ học, thuyết tương đối và lịch sử tiến hóa sinh học.',
    },
    {
      name: 'Lịch sử, Nhân chủng & Văn minh Nhân loại',
      description: 'Tiến trình tiến hóa của loài người, các con đường tơ lụa và sự sụp đổ của đế chế.',
    },
    {
      name: 'Triết học, Đạo đức học & Tư tưởng',
      description: 'Triết học cổ điển Hy Lạp - La Mã, đạo đức học Khai sáng và hiện sinh.',
    },
    {
      name: 'Tâm lý học & Khoa học Hành vi',
      description: 'Tâm lý học nhận thức, hành vi đưa ra quyết định, thói quen và sự tập trung sâu.',
    },
    {
      name: 'Kinh tế học & Quản trị Chiến lược',
      description: 'Lý thuyết thị trường tự do, tư duy xác suất, kinh tế học hành vi và đổi mới sáng tạo.',
    },
    {
      name: 'Nghệ thuật, Kiến trúc & Thiết kế',
      description: 'Lý luận thiết kế lấy người dùng làm trung tâm, thị giác nghệ thuật và kiến trúc đô thị.',
    },
  ];

  const categoryMap = new Map<string, any>();
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: { name: cat.name, description: cat.description },
    });
    categoryMap.set(cat.name, c);
  }

  // =========================================================================
  // 3. PUBLISHERS (GLOBAL ACADEMIC PRESSES & RENOWNED HOUSES)
  // =========================================================================
  const publishersData = [
    { id: 1, name: 'Addison-Wesley Professional', address: 'Boston, Massachusetts, USA', website: 'https://www.informit.com/aw' },
    { id: 2, name: "O'Reilly Media", address: 'Sebastopol, California, USA', website: 'https://www.oreilly.com' },
    { id: 3, name: 'MIT Press', address: 'Cambridge, Massachusetts, USA', website: 'https://mitpress.mit.edu' },
    { id: 4, name: 'Penguin Random House', address: 'New York, NY, USA', website: 'https://www.penguinrandomhouse.com' },
    { id: 5, name: 'HarperCollins Publishers', address: 'New York, NY, USA', website: 'https://www.harpercollins.com' },
    { id: 6, name: 'Oxford University Press', address: 'Great Clarendon St, Oxford, UK', website: 'https://global.oup.com' },
    { id: 7, name: 'Cambridge University Press', address: 'Cambridge, UK', website: 'https://www.cambridge.org' },
    { id: 8, name: 'NXB Trẻ (Youth Publishing)', address: '161B Lý Chính Thắng, Q.3, TP.HCM', website: 'https://www.nxbtre.com.vn' },
    { id: 9, name: 'NXB Tri Thức (Knowledge Publishing)', address: '53 Nguyễn Du, Hai Bà Trưng, Hà Nội', website: 'https://nxbtrithuc.com.vn' },
    { id: 10, name: 'NXB Văn Học (Literature Publishing)', address: '18 Nguyễn Trường Tộ, Ba Đình, Hà Nội', website: 'https://nxbvanhoc.vn' },
    { id: 11, name: 'Harvard University Press', address: '79 Garden St, Cambridge, MA, USA', website: 'https://www.hup.harvard.edu' },
    { id: 12, name: 'Simon & Schuster', address: 'New York, NY, USA', website: 'https://www.simonandschuster.com' },
  ];

  const publisherMap = new Map<number, any>();
  for (const pub of publishersData) {
    const p = await prisma.publisher.upsert({
      where: { id: pub.id },
      update: { name: pub.name, address: pub.address, website: pub.website },
      create: { id: pub.id, name: pub.name, address: pub.address, website: pub.website },
    });
    publisherMap.set(pub.id, p);
  }

  // =========================================================================
  // 4. AUTHORS
  // =========================================================================
  const authorsData = [
    { id: 1, name: 'Robert C. Martin ("Uncle Bob")', nationality: 'American', biography: 'Huyền thoại kỹ nghệ phần mềm, đồng tác giả Tuyên ngôn Agile và bộ sách Clean Code.' },
    { id: 2, name: 'Martin Fowler', nationality: 'British', biography: 'Nhà khoa học trưởng tại Thoughtworks, nhà tiên phong về tái cấu trúc mã và kiến trúc phần mềm.' },
    { id: 3, name: 'Joshua Bloch', nationality: 'American', biography: 'Cựu Kiến trúc sư trưởng Java tại Google và Sun Microsystems, tác giả của Effective Java.' },
    { id: 4, name: 'Martin Kleppmann', nationality: 'German', biography: 'Nhà nghiên cứu hệ thống phân tán, bảo mật và đồng thuận tại Đại học Cambridge.' },
    { id: 5, name: 'Stephen Hawking', nationality: 'British', biography: 'Nhà vật lý lý thuyết và vũ trụ học kiệt xuất của thời đại chúng ta, tác giả Lược sử thời gian.' },
    { id: 6, name: 'Carl Sagan', nationality: 'American', biography: 'Nhà thiên văn học, tác giả cuốn Vũ trụ (Cosmos) và người tiên phong truyền cảm hứng khoa học.' },
    { id: 7, name: 'Yuval Noah Harari', nationality: 'Israeli', biography: 'Giáo sư sử học Đại học Hebrew tại Jerusalem, tác giả bộ ba Sapiens, Homo Deus và 21 bài học.' },
    { id: 8, name: 'James Clear', nationality: 'American', biography: 'Chuyên gia nghiên cứu hành vi thói quen, tác giả cuốn sách Atomic Habits bán hơn 15 triệu bản.' },
    { id: 9, name: 'George Orwell', nationality: 'British', biography: 'Nhà văn, nhà báo và nhà phê bình xã hội nổi tiếng với tác phẩm 1984 và Trại súc vật.' },
    { id: 10, name: 'Haruki Murakami', nationality: 'Japanese', biography: 'Nhà văn đương đại Nhật Bản với văn phong hòa quyện giữa hiện thực và chủ nghĩa siêu thực huyền bí.' },
    { id: 11, name: 'Daniel Kahneman', nationality: 'Israeli-American', biography: 'Giải Nobel Kinh tế học năm 2002, cha đẻ của ngành kinh tế học hành vi và cuốn Tư duy nhanh và chậm.' },
    { id: 12, name: 'Andrew Hunt & David Thomas', nationality: 'American', biography: 'Những người sáng lập phong trào lập trình viên thực dụng và ký tên vào Tuyên ngôn Agile.' },
    { id: 13, name: 'Harold Abelson & Gerald Jay Sussman', nationality: 'American', biography: 'Các giáo sư huyền thoại tại MIT, đồng tác giả kiệt tác điện toán SICP.' },
    { id: 14, name: 'Thomas H. Cormen & Charles E. Leiserson', nationality: 'American', biography: 'Đồng tác giả cuốn giáo trình thuật toán tiêu chuẩn thế giới Introduction to Algorithms (CLRS).' },
    { id: 15, name: 'Frederick P. Brooks Jr.', nationality: 'American', biography: 'Nhà tiên phong kiến trúc máy tính tại IBM, tác giả cuốn The Mythical Man-Month.' },
    { id: 16, name: 'Richard Feynman', nationality: 'American', biography: 'Nhà vật lý đạt giải Nobel, nhà sư phạm thiên tài với bộ Bài giảng Vật lý Feynman.' },
    { id: 17, name: 'Richard Dawkins', nationality: 'British', biography: 'Nhà sinh học tiến hóa Oxford, tác giả cuốn Gen vị kỷ (The Selfish Gene).' },
    { id: 18, name: 'Jared Diamond', nationality: 'American', biography: 'Nhà địa lý và nhân chủng học Đại học UCLA, đoạt giải Pulitzer với Súng, Vi trùng và Thép.' },
    { id: 19, name: 'Peter Frankopan', nationality: 'British', biography: 'Giáo sư Lịch sử Toàn cầu tại Đại học Oxford, tác giả Những con đường tơ lụa.' },
    { id: 20, name: 'Ngô Sĩ Liên & Sử Thần Nhà Hậu Lê', nationality: 'Vietnamese', biography: 'Nhà sử học lỗi lạc thế kỷ XV, chủ biên bộ chính sử vĩ đại Đại Việt Sử Ký Toàn Thư.' },
    { id: 21, name: 'Nguyễn Du', nationality: 'Vietnamese', biography: 'Đại thi hào dân tộc Việt Nam, Danh nhân văn hóa thế giới, tác giả kiệt tác Truyện Kiều.' },
    { id: 22, name: 'Vũ Trọng Phụng', nationality: 'Vietnamese', biography: 'Bậc thầy phóng sự và tiểu thuyết hiện thực phê phán Việt Nam thế kỷ XX, tác giả Số Đỏ.' },
    { id: 23, name: 'Bảo Ninh', nationality: 'Vietnamese', biography: 'Nhà văn quân đội Việt Nam, tác giả kiệt tác Nỗi buồn chiến tranh gây tiếng vang toàn cầu.' },
    { id: 24, name: 'F. Scott Fitzgerald', nationality: 'American', biography: 'Tiểu thuyết gia người Mỹ tiêu biểu cho Thế hệ Mất mát, tác giả The Great Gatsby.' },
    { id: 25, name: 'Harper Lee', nationality: 'American', biography: 'Nhà văn đoạt giải Pulitzer danh giá với kiệt tác Giết con chim nhại (To Kill a Mockingbird).' },
    { id: 26, name: 'Fyodor Dostoevsky', nationality: 'Russian', biography: 'Đại văn hào Nga, bậc thầy phân tích tâm lý con người trong Tội ác và Hình phạt.' },
    { id: 27, name: 'Gabriel García Márquez', nationality: 'Colombian', biography: 'Đại văn hào đoạt giải Nobel Văn học năm 1982, tác giả Trăm năm cô đơn.' },
    { id: 28, name: 'Marcus Aurelius', nationality: 'Roman', biography: 'Hoàng đế La Mã và triết gia Khắc kỷ, tác giả tập suy tưởng cá nhân Meditations.' },
    { id: 29, name: 'Aristotle', nationality: 'Ancient Greek', biography: 'Đại triết gia Hy Lạp cổ đại, người đặt nền móng cho logic học và Đạo đức học Nicomachean.' },
    { id: 30, name: 'Michael J. Sandel', nationality: 'American', biography: 'Giáo sư Triết học Chính trị tại Đại học Harvard, tác giả khóa học nổi tiếng Justice (Phải trái đúng sai).' },
    { id: 31, name: 'Cal Newport', nationality: 'American', biography: 'Phó Giáo sư Khoa học Máy tính tại Đại học Georgetown, tác giả cuốn Deep Work.' },
    { id: 32, name: 'Mihaly Csikszentmihalyi', nationality: 'Hungarian-American', biography: 'Nhà tâm lý học tiên phong nghiên cứu về Dòng chảy (Flow) và sự thăng hoa sáng tạo.' },
    { id: 33, name: 'Adam Smith', nationality: 'Scottish', biography: 'Nhà triết học và kinh tế học thế kỷ XVIII, cha đẻ kinh tế học hiện đại với Của cải của các dân tộc.' },
    { id: 34, name: 'Ray Dalio', nationality: 'American', biography: 'Nhà sáng lập quỹ đầu tư Bridgewater Associates, tác giả Principles: Life and Work.' },
    { id: 35, name: 'Don Norman', nationality: 'American', biography: 'Giáo sư khoa học nhận thức, người đồng sáng lập Nielsen Norman Group, tác giả The Design of Everyday Things.' },
  ];

  const authorMap = new Map<number, any>();
  for (const a of authorsData) {
    const auth = await prisma.author.upsert({
      where: { id: a.id },
      update: { name: a.name, nationality: a.nationality, biography: a.biography },
      create: { id: a.id, name: a.name, nationality: a.nationality, biography: a.biography },
    });
    authorMap.set(a.id, auth);
  }

  // =========================================================================
  // 5. MASTER CATALOG OF BOOKS (32 WORLD-CLASS EDITIONS)
  // =========================================================================
  const booksData = [
    // --- Computer Science & Craft ---
    {
      isbn: '9780132350884',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      subtitle: 'Cẩm Nang Về Kỹ Nghệ Viết Mã Nguồn Sạch',
      publisherId: 1,
      categoryName: 'Khoa học Máy tính & Kỹ thuật Phần mềm',
      language: 'English',
      edition: '1st Edition',
      publicationYear: 2008,
      pageCount: 464,
      description: 'Dù mã nguồn tệ vẫn có thể chạy được, nhưng theo thời gian nó sẽ kéo toàn bộ hệ thống sụp đổ. Uncle Bob Martin đưa ra triết lý thực hành cách viết mã rõ ràng, ngắn gọn và tự giải thích.',
      coverImageUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=400',
      authorId: 1,
    },
    {
      isbn: '9780134757599',
      title: 'Refactoring: Improving the Design of Existing Code',
      subtitle: 'Tái Cấu Trúc: Hoàn Thiện Bản Thiết Kế Mã Hiện Hữu',
      publisherId: 1,
      categoryName: 'Khoa học Máy tính & Kỹ thuật Phần mềm',
      language: 'English',
      edition: '2nd Edition',
      publicationYear: 2018,
      pageCount: 448,
      description: 'Trong hơn 20 năm qua, các lập trình viên chuyên nghiệp dựa vào Refactoring của Martin Fowler để cải thiện cấu trúc bên trong phần mềm mà không làm thay đổi hành vi bên ngoài.',
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      authorId: 2,
    },
    {
      isbn: '9780134685991',
      title: 'Effective Java',
      subtitle: 'Các Thực Hành Tốt Nhất Cho Nền Tảng Java',
      publisherId: 1,
      categoryName: 'Khoa học Máy tính & Kỹ thuật Phần mềm',
      language: 'English',
      edition: '3rd Edition',
      publicationYear: 2017,
      pageCount: 412,
      description: 'Cuốn cẩm nang kinh điển về các mẫu thiết kế hướng đối tượng, an toàn bộ nhớ, concurrency và các quy tắc bất biến cho nền tảng Java hiện đại do cựu Kiến trúc sư trưởng của Google biên soạn.',
      coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
      authorId: 3,
    },
    {
      isbn: '9781449373320',
      title: 'Designing Data-Intensive Applications',
      subtitle: 'Các Ý Tưởng Lớn Đằng Sau Hệ Thống Đáng Tin Cậy & Khả Mở',
      publisherId: 2,
      categoryName: 'Hệ thống Phân tán & Kiến trúc Dữ liệu',
      language: 'English',
      edition: '1st Edition',
      publicationYear: 2017,
      pageCount: 616,
      description: 'Dữ liệu là trọng tâm của mọi thách thức trong thiết kế hệ thống ngày nay. Martin Kleppmann giải mã toàn diện các mô hình lưu trữ, giải thuật đồng thuận Raft/Paxos và xử lý dòng dữ liệu lớn.',
      coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
      authorId: 4,
    },
    {
      isbn: '9780135957059',
      title: 'The Pragmatic Programmer: Your Journey To Mastery',
      subtitle: 'Hành Trình Chinh Phục Nghệ Thuật Lập Trình Thực Dụng',
      publisherId: 1,
      categoryName: 'Khoa học Máy tính & Kỹ thuật Phần mềm',
      language: 'English',
      edition: '20th Anniversary Edition',
      publicationYear: 2019,
      pageCount: 352,
      description: 'Một trong những cuốn sách định hình kỹ nghệ lập trình đương đại. Cuốn sách cung cấp tư duy giải quyết vấn đề, nguyên lý DRY, orthogonal design và thói quen nghề nghiệp bền bỉ.',
      coverImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400',
      authorId: 12,
    },
    {
      isbn: '9780262510875',
      title: 'Structure and Interpretation of Computer Programs (SICP)',
      subtitle: 'Cấu Trúc Và Giải Thích Chương Trình Máy Tính',
      publisherId: 3,
      categoryName: 'Khoa học Máy tính & Kỹ thuật Phần mềm',
      language: 'English',
      edition: '2nd MIT Edition',
      publicationYear: 1996,
      pageCount: 657,
      description: 'Cuốn sách biểu tượng của Học viện Công nghệ Massachusetts (MIT) dạy tư duy lập trình căn bản qua ngôn ngữ Scheme, sự trừu tượng hóa dữ liệu và xây dựng trình thông dịch.',
      coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400',
      authorId: 13,
    },
    {
      isbn: '9780262033848',
      title: 'Introduction to Algorithms (CLRS)',
      subtitle: 'Giáo Trình Thuật Toán Kinh Điển Quốc Tế',
      publisherId: 3,
      categoryName: 'Khoa học Máy tính & Kỹ thuật Phần mềm',
      language: 'English',
      edition: '3rd Edition',
      publicationYear: 2009,
      pageCount: 1312,
      description: 'Bộ sách đồ sộ được xem là thánh kinh thuật toán trên toàn cầu, phân tích sâu sắc từ sắp xếp, cấu trúc dữ liệu nâng cao, đồ thị cho tới các bài toán NP-đầy đủ.',
      coverImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400',
      authorId: 14,
    },
    {
      isbn: '9780201835953',
      title: 'The Mythical Man-Month: Essays on Software Engineering',
      subtitle: 'Tháng-Người Huyền Thoại: Tiểu Luận Quản Trị Phần Mềm',
      publisherId: 1,
      categoryName: 'Khoa học Máy tính & Kỹ thuật Phần mềm',
      language: 'English',
      edition: 'Anniversary Edition',
      publicationYear: 1995,
      pageCount: 336,
      description: 'Định luật Brooks nổi tiếng: Thêm người vào một dự án phần mềm đang trễ hạn chỉ làm nó trễ hơn. Tác phẩm kinh điển về quản trị con người và dự án phần mềm phức tạp.',
      coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400',
      authorId: 15,
    },

    // --- Science & Astrophysics ---
    {
      isbn: '9780553380163',
      title: 'A Brief History of Time',
      subtitle: 'Lược Sử Thời Gian: Từ Vụ Nổ Lớn Đến Lỗ Đen Vũ Trụ',
      publisherId: 4,
      categoryName: 'Khoa học Tự nhiên & Vật lý Thiên văn',
      language: 'English',
      edition: 'Updated Edition',
      publicationYear: 1998,
      pageCount: 224,
      description: 'Một cột mốc trong thể loại phổ biến khoa học của Stephen Hawking, khám phá những chân trời về không-thời gian, thuyết tương đối rộng và cơ học lượng tử.',
      coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
      authorId: 5,
    },
    {
      isbn: '9780345539434',
      title: 'Cosmos',
      subtitle: 'Vũ Trụ: Biên Niên Sử 15 Tỷ Năm Tiến Hóa',
      publisherId: 4,
      categoryName: 'Khoa học Tự nhiên & Vật lý Thiên văn',
      language: 'English',
      edition: 'Ballantine Edition',
      publicationYear: 2013,
      pageCount: 384,
      description: 'Carl Sagan lần theo dấu vết 15 tỷ năm tiến hóa vũ trụ và làm sáng tỏ mối liên hệ mật thiết giữa khoa học, các nền văn minh và khát vọng thám hiểm các vì sao.',
      coverImageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=400',
      authorId: 6,
    },
    {
      isbn: '9780465050734',
      title: 'Six Easy Pieces: Essentials of Physics',
      subtitle: 'Sáu Mảnh Ghép Dễ Dàng: Tinh Hoa Vật Lý Học',
      publisherId: 6,
      categoryName: 'Khoa học Tự nhiên & Vật lý Thiên văn',
      language: 'English',
      edition: 'Basic Books Edition',
      publicationYear: 2011,
      pageCount: 176,
      description: 'Trích từ bộ bài giảng Caltech huyền thoại của Richard Feynman, giải thích nguyên tử, năng lượng, trọng lực và hành vi lượng tử bằng lối tư duy hóm hỉnh đầy thấu suốt.',
      coverImageUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&q=80&w=400',
      authorId: 16,
    },
    {
      isbn: '9780199291151',
      title: 'The Selfish Gene',
      subtitle: 'Gen Vị Kỷ: Cách Nhìn Mới Về Thuyết Tiến Hóa',
      publisherId: 6,
      categoryName: 'Khoa học Tự nhiên & Vật lý Thiên văn',
      language: 'English',
      edition: '30th Anniversary Edition',
      publicationYear: 2006,
      pageCount: 360,
      description: 'Tác phẩm chấn động của Richard Dawkins đặt gen làm đơn vị chọn lọc tự nhiên trung tâm, đồng thời lần đầu tiên định nghĩa khái niệm meme trong văn hóa nhân loại.',
      coverImageUrl: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&q=80&w=400',
      authorId: 17,
    },

    // --- History & Anthropology ---
    {
      isbn: '9780062316097',
      title: 'Sapiens: A Brief History of Humankind',
      subtitle: 'Lược Sử Loài Người: Từ Vượn Người Đến Bá Chủ Hành Tinh',
      publisherId: 5,
      categoryName: 'Lịch sử, Nhân chủng & Văn minh Nhân loại',
      language: 'English',
      edition: '1st Harper Edition',
      publicationYear: 2015,
      pageCount: 464,
      description: 'Yuval Noah Harari thuật lại hành trình của giống loài Homo sapiens vượt qua ba cuộc cách mạng: Nhận thức, Nông nghiệp và Khoa học để thống trị địa cầu.',
      coverImageUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400',
      authorId: 7,
    },
    {
      isbn: '9780393354324',
      title: 'Guns, Germs, and Steel',
      subtitle: 'Súng, Vi Trùng Và Thép: Định Mệnh Của Các Xã Hội Loài Người',
      publisherId: 6,
      categoryName: 'Lịch sử, Nhân chủng & Văn minh Nhân loại',
      language: 'English',
      edition: '20th Anniversary Edition',
      publicationYear: 2017,
      pageCount: 528,
      description: 'Jared Diamond trả lời câu hỏi vì sao các dân tộc Á-Âu lại vượt lên thống trị thế giới bằng việc nghiên cứu sâu sắc yếu tố địa lý môi trường và thuần hóa cây trồng vật nuôi.',
      coverImageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=400',
      authorId: 18,
    },
    {
      isbn: '9781101912379',
      title: 'The Silk Roads: A New History of the World',
      subtitle: 'Những Con Đường Tơ Lụa: Lịch Sử Mới Về Thế Giới',
      publisherId: 6,
      categoryName: 'Lịch sử, Nhân chủng & Văn minh Nhân loại',
      language: 'English',
      edition: 'Vintage Edition',
      publicationYear: 2017,
      pageCount: 656,
      description: 'Peter Frankopan dịch chuyển trọng tâm lịch sử thế giới khỏi phương Tây để nhìn lại Trung Á và Trung Đông - nơi giao thoa của các đế chế, tôn giáo và mạng lưới thương mại cổ đại.',
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      authorId: 19,
    },

    // --- Vietnamese Classics & Literature ---
    {
      isbn: '9786047708912',
      title: 'Đại Việt Sử Ký Toàn Thư (Trọn Bộ Hiệu Đính)',
      subtitle: 'Chính Sử Nước Đại Việt Từ Thời Hồng Bàng Đến Triều Hậu Lê',
      publisherId: 10,
      categoryName: 'Văn học & Sử liệu Việt Nam',
      language: 'Tiếng Việt',
      edition: 'Bản In Khảo Cứu Hàn Lâm',
      publicationYear: 2018,
      pageCount: 1250,
      description: 'Bộ quốc sử đồ sộ bậc nhất của dân tộc Việt Nam ghi chép lại các triều đại hưng vong, các cuộc kháng chiến giữ nước và bản sắc phong hóa ngàn năm của non sông Đại Việt.',
      coverImageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=400',
      authorId: 20,
    },
    {
      isbn: '9786049876543',
      title: 'Truyện Kiều (Đoạn Trường Tân Thanh)',
      subtitle: 'Kiệt Tác Thơ Ca Nôm - Bản Chú Giải Khảo Dị Hàn Lâm',
      publisherId: 10,
      categoryName: 'Văn học & Sử liệu Việt Nam',
      language: 'Tiếng Việt',
      edition: 'Bản Hiệu Khảo Viện Văn Học',
      publicationYear: 2020,
      pageCount: 380,
      description: 'Đỉnh cao chói lọi của văn học cổ điển Việt Nam. Tấm lòng nhân đạo bao la của Nguyễn Du trước số phận con người tài hoa bạc mệnh được khắc họa qua thể thơ lục bát mẫu mực.',
      coverImageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400',
      authorId: 21,
    },
    {
      isbn: '9786045678901',
      title: 'Số Đỏ',
      subtitle: 'Tiểu Thuyết Hoạt Kê Trào Phúng Bậc Nhất Văn Học Hiện Thực',
      publisherId: 8,
      categoryName: 'Văn học & Sử liệu Việt Nam',
      language: 'Tiếng Việt',
      edition: 'Ấn Bản Di Sản NXB Trẻ',
      publicationYear: 2021,
      pageCount: 260,
      description: 'Bức tranh trào phúng sắc sảo của Vũ Trọng Phụng bóc trần sự lố lăng, đạo đức giả của tầng lớp tư sản thành thị Hà Nội thời kỳ phong trào Âu hóa nửa mùa những năm 1930.',
      coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
      authorId: 22,
    },
    {
      isbn: '9786049988776',
      title: 'Nỗi Buồn Chiến Tranh',
      subtitle: 'Bản Trường Ca Nhân Bản Về Số Phận Con Người Thời Hậu Chiến',
      publisherId: 8,
      categoryName: 'Văn học & Sử liệu Việt Nam',
      language: 'Tiếng Việt',
      edition: 'Ấn Bản Kỷ Niệm 30 Năm',
      publicationYear: 2021,
      pageCount: 310,
      description: 'Kiệt tác văn học thời hậu chiến của Bảo Ninh được dịch ra hơn 20 thứ tiếng trên thế giới, khắc họa nỗi đau thương, ký ức vụn vỡ và khát vọng sống của thế hệ thanh niên Việt Nam.',
      coverImageUrl: 'https://images.unsplash.com/photo-1507842229451-9f7a77d46682?auto=format&fit=crop&q=80&w=400',
      authorId: 23,
    },

    // --- World Literary Classics ---
    {
      isbn: '9780451524935',
      title: '1984',
      subtitle: 'Kiệt Tác Phản Địa Đàng Về Kiểm Soát Tư Tưởng',
      publisherId: 4,
      categoryName: 'Văn học Kinh điển & Tiểu thuyết Thế giới',
      language: 'English',
      edition: 'Signet Classic Edition',
      publicationYear: 1950,
      pageCount: 328,
      description: 'Bản cáo trạng tiên tri của George Orwell về một xã hội toàn trị viễn tưởng, nơi Đảng độc quyền kiểm soát tư tưởng, ngôn ngữ (Newspeak) và sự thật qua nhân vật Winston Smith.',
      coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
      authorId: 9,
    },
    {
      isbn: '9780375704024',
      title: 'Norwegian Wood (Rừng Na Uy)',
      subtitle: 'Nốt Trầm Về Tuổi Trẻ, Tình Yêu & Sự Mất Mát',
      publisherId: 4,
      categoryName: 'Văn học Kinh điển & Tiểu thuyết Thế giới',
      language: 'English',
      edition: 'Vintage International',
      publicationYear: 2000,
      pageCount: 304,
      description: 'Tác phẩm đưa tên tuổi Haruki Murakami ra toàn thế giới. Câu chuyện hoài niệm của Toru Watanabe về những năm tháng đại học Tokyo cuối thập niên 1960 với Naoko và Midori.',
      coverImageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=400',
      authorId: 10,
    },
    {
      isbn: '9780743273565',
      title: 'The Great Gatsby',
      subtitle: 'Đại Gia Gatsby: Giấc Mơ Mỹ Và Sự Ảo Vọng Phù Hoa',
      publisherId: 12,
      categoryName: 'Văn học Kinh điển & Tiểu thuyết Thế giới',
      language: 'English',
      edition: 'Scribner Classic Edition',
      publicationYear: 2004,
      pageCount: 180,
      description: 'Tác phẩm tiêu biểu của thời kỳ Nhạc Jazz những năm 1920. F. Scott Fitzgerald khắc họa nỗi ám ảnh lãng mạn và sự đổ vỡ cay đắng của nhân vật bí ẩn Jay Gatsby bên bờ vịnh Long Island.',
      coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
      authorId: 24,
    },
    {
      isbn: '9780060935467',
      title: 'To Kill a Mockingbird (Giết Con Chim Nhại)',
      subtitle: 'Biểu Tượng Của Công Lý Và Lòng Dũng Cảm Đạo Đức',
      publisherId: 5,
      categoryName: 'Văn học Kinh điển & Tiểu thuyết Thế giới',
      language: 'English',
      edition: 'Harper Perennial Modern Classics',
      publicationYear: 2006,
      pageCount: 336,
      description: 'Harper Lee đưa người đọc qua đôi mắt trẻ thơ của Scout Finch tại thị trấn Maycomb để chứng kiến luật sư Atticus Finch bảo vệ một người da đen vô tội trước định kiến phân biệt chủng tộc.',
      coverImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400',
      authorId: 25,
    },
    {
      isbn: '9780140449136',
      title: 'Crime and Punishment (Tội Ác Và Hình Phạt)',
      subtitle: 'Cuộc Đấu Tranh Lương Tâm Dữ Dội Của Raskolnikov',
      publisherId: 4,
      categoryName: 'Văn học Kinh điển & Tiểu thuyết Thế giới',
      language: 'English',
      edition: 'Penguin Classics Deluxe Edition',
      publicationYear: 2003,
      pageCount: 671,
      description: 'Dostoevsky bóc trần thế giới nội tâm giằng xé của cựu sinh viên nghèo Raskolnikov sau khi sát hại mụ cầm đồ để thử thách thuyết siêu nhân của chính mình.',
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      authorId: 26,
    },
    {
      isbn: '9780060883287',
      title: 'One Hundred Years of Solitude (Trăm Năm Cô Đơn)',
      subtitle: 'Đỉnh Cao Của Chủ Nghĩa Hiện Thực Huyền Ảo Mỹ Latinh',
      publisherId: 5,
      categoryName: 'Văn học Kinh điển & Tiểu thuyết Thế giới',
      language: 'English',
      edition: 'Harper Perennial Deluxe',
      publicationYear: 2006,
      pageCount: 417,
      description: 'Lịch sử bảy thế hệ dòng họ Buendía tại ngôi làng thần thoại Macondo. Tác phẩm đạt đỉnh cao của thể loại hiện thực huyền ảo của đại văn hào Gabriel García Márquez.',
      coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
      authorId: 27,
    },

    // --- Philosophy & Ethics ---
    {
      isbn: '9780140449334',
      title: 'Meditations (Suy Tưởng)',
      subtitle: 'Những Lời Tự Nhủ Khắc Kỷ Của Hoàng Đế La Mã',
      publisherId: 4,
      categoryName: 'Triết học, Đạo đức học & Tư tưởng',
      language: 'English',
      edition: 'Penguin Classics Edition',
      publicationYear: 2006,
      pageCount: 256,
      description: 'Tập nhật ký triết học riêng tư của Hoàng đế Marcus Aurelius ghi lại giữa những chiến dịch quân sự khắc nghiệt, đúc kết nghệ thuật làm chủ cảm xúc và kiên cường nội tâm.',
      coverImageUrl: 'https://images.unsplash.com/photo-1507842229451-9f7a77d46682?auto=format&fit=crop&q=80&w=400',
      authorId: 28,
    },
    {
      isbn: '9780199213610',
      title: 'Nicomachean Ethics (Đạo Đức Học Nicomachean)',
      subtitle: 'Nền Tảng Của Đạo Đức Đức Hạnh Và Hạnh Phúc Đích Thực',
      publisherId: 6,
      categoryName: 'Triết học, Đạo đức học & Tư tưởng',
      language: 'English',
      edition: 'Oxford World Classics',
      publicationYear: 2009,
      pageCount: 336,
      description: 'Khảo luận đạo đức nền tảng của Aristotle về mục đích tối hậu của đời người là Eudaimonia (Hạnh phúc thăng hoa) thông qua việc rèn luyện các đức hạnh trung dung.',
      coverImageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=400',
      authorId: 29,
    },
    {
      isbn: '9780374532505',
      title: 'Justice: What’s the Right Thing to Do?',
      subtitle: 'Phải Trái Đúng Sai: Đi Tìm Công Lý Trong Đời Sống Hiện Đại',
      publisherId: 11,
      categoryName: 'Triết học, Đạo đức học & Tư tưởng',
      language: 'English',
      edition: 'Farrar Straus Edition',
      publicationYear: 2010,
      pageCount: 320,
      description: 'Giáo sư Michael Sandel của Harvard đưa độc giả qua các thế lưỡng nan đạo đức nổi tiếng từ chủ nghĩa vị lợi của Bentham đến nghĩa vụ luận Kant và công lý cộng đồng.',
      coverImageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=400',
      authorId: 30,
    },

    // --- Psychology & Behavior ---
    {
      isbn: '9780735211292',
      title: 'Atomic Habits',
      subtitle: 'Thói Quen Nguyên Tử: Cách Dễ Dàng Xây Dựng Thói Quen Tốt',
      publisherId: 4,
      categoryName: 'Tâm lý học & Khoa học Hành vi',
      language: 'English',
      edition: 'Avery Hardcover Edition',
      publicationYear: 2018,
      pageCount: 320,
      description: 'James Clear chỉ ra sức mạnh kỳ diệu của quy luật lãi kép 1% mỗi ngày trong việc định hình danh tính, thiết kế môi trường và làm chủ hành vi con người.',
      coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
      authorId: 8,
    },
    {
      isbn: '9780374533557',
      title: 'Thinking, Fast and Slow (Tư Duy Nhanh Và Chậm)',
      subtitle: 'Hai Hệ Thống Tư Duy Định Hình Quyết Định Của Con Người',
      publisherId: 4,
      categoryName: 'Tâm lý học & Khoa học Hành vi',
      language: 'English',
      edition: 'Farrar Straus Giroux Edition',
      publicationYear: 2011,
      pageCount: 512,
      description: 'Nhà tâm lý học đoạt giải Nobel Daniel Kahneman dẫn dắt cuộc du hành khám phá Hệ thống 1 (trực giác nhanh) và Hệ thống 2 (suy luận logic chậm) cùng các thiên kiến nhận thức.',
      coverImageUrl: 'https://images.unsplash.com/photo-1507842229451-9f7a77d46682?auto=format&fit=crop&q=80&w=400',
      authorId: 11,
    },
    {
      isbn: '9781455586691',
      title: 'Deep Work: Rules for Focused Success in a Distracted World',
      subtitle: 'Làm Ra Làm Chơi Ra Chơi: Bí Quyết Tập Trung Sâu Trong Kỷ Nguyên Số',
      publisherId: 12,
      categoryName: 'Tâm lý học & Khoa học Hành vi',
      language: 'English',
      edition: 'Grand Central Publishing Edition',
      publicationYear: 2016,
      pageCount: 304,
      description: 'Cal Newport khẳng định khả năng tập trung cao độ mà không bị xao nhãng là một siêu năng lực quý hiếm giúp tạo ra các giá trị vượt trội trong nền kinh tế tri thức.',
      coverImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400',
      authorId: 31,
    },

    // --- Economics & Design ---
    {
      isbn: '9781501124020',
      title: 'Principles: Life and Work',
      subtitle: 'Những Nguyên Tắc Trong Cuộc Sống Và Công Việc',
      publisherId: 12,
      categoryName: 'Kinh tế học & Quản trị Chiến lược',
      language: 'English',
      edition: 'Simon & Schuster Edition',
      publicationYear: 2017,
      pageCount: 592,
      description: 'Ray Dalio chia sẻ các nguyên tắc thực tế khác biệt về sự minh bạch triệt để và chế độ nhân tài ý tưởng giúp Bridgewater Associates trở thành quỹ đầu cơ hàng đầu hành tinh.',
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
      authorId: 34,
    },
    {
      isbn: '9780465050659',
      title: 'The Design of Everyday Things',
      subtitle: 'Thiết Kế Của Những Vật Dụng Hàng Ngày',
      publisherId: 3,
      categoryName: 'Nghệ thuật, Kiến trúc & Thiết kế',
      language: 'English',
      edition: 'Revised & Expanded Edition',
      publicationYear: 2013,
      pageCount: 368,
      description: 'Don Norman giải thích tại sao một số sản phẩm làm người dùng thỏa mãn trong khi cái khác gây bực bội, đưa ra các nguyên tắc cơ bản về affordance, signifiers và feedback.',
      coverImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=400',
      authorId: 35,
    },
  ];

  const createdBooks: any[] = [];
  for (const b of booksData) {
    const category = categoryMap.get(b.categoryName);
    const publisher = publisherMap.get(b.publisherId);

    const book = await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {
        title: b.title,
        subtitle: b.subtitle,
        description: b.description,
        coverImageUrl: b.coverImageUrl,
        publicationYear: b.publicationYear,
        pageCount: b.pageCount,
        language: b.language,
        edition: b.edition,
        categoryId: category ? category.id : null,
        publisherId: publisher ? publisher.id : null,
      },
      create: {
        isbn: b.isbn,
        title: b.title,
        subtitle: b.subtitle,
        description: b.description,
        coverImageUrl: b.coverImageUrl,
        publicationYear: b.publicationYear,
        pageCount: b.pageCount,
        language: b.language,
        edition: b.edition,
        categoryId: category ? category.id : null,
        publisherId: publisher ? publisher.id : null,
      },
    });

    await prisma.bookAuthor.upsert({
      where: {
        bookId_authorId: {
          bookId: book.id,
          authorId: b.authorId,
        },
      },
      update: {},
      create: {
        bookId: book.id,
        authorId: b.authorId,
      },
    });

    createdBooks.push(book);
  }

  // =========================================================================
  // 6. PHYSICAL COPIES (REALISTIC BARCODES & SHELVING LOCATIONS)
  // =========================================================================
  const shelfPrefixes = [
    'Kho A - Tầng 2 - Kệ QA-01',
    'Kho A - Tầng 2 - Kệ QA-04',
    'Kho B - Tầng 2 - Kệ QA-12',
    'Kho B - Tầng 2 - Kệ TK-08',
    'Kho C - Tầng 3 - Kệ B4-02',
    'Kho C - Tầng 3 - Kệ DS-12',
    'Kho Văn Học - Tầng 1 - Kệ PR-04',
    'Kho Văn Học - Tầng 1 - Kệ PR-08',
    'Kho Sử Liệu - Tầng 1 - Kệ VN-02',
    'Hầm Bản Thảo Cổ - Tầng 4 - Kệ SPECIAL-01',
  ];

  const copiesPlan = [
    // Clean Code (3 copies)
    { bIdx: 0, code: 'ATH-2024-00101', status: 'AVAILABLE', loc: 'Kho A - Tầng 2 - Kệ QA-01' },
    { bIdx: 0, code: 'ATH-2024-00102', status: 'AVAILABLE', loc: 'Kho A - Tầng 2 - Kệ QA-01' },
    { bIdx: 0, code: 'ATH-2024-00103', status: 'BORROWED', loc: 'Kho A - Tầng 2 - Kệ QA-01' },
    // Refactoring (2 copies)
    { bIdx: 1, code: 'ATH-2024-00201', status: 'BORROWED', loc: 'Kho A - Tầng 2 - Kệ QA-04' },
    { bIdx: 1, code: 'ATH-2024-00202', status: 'AVAILABLE', loc: 'Kho A - Tầng 2 - Kệ QA-04' },
    // Effective Java (2 copies)
    { bIdx: 2, code: 'ATH-2024-00301', status: 'BORROWED', loc: 'Kho A - Tầng 2 - Kệ QA-04' },
    { bIdx: 2, code: 'ATH-2024-00302', status: 'AVAILABLE', loc: 'Kho A - Tầng 2 - Kệ QA-04' },
    // Designing Data-Intensive Applications (3 copies)
    { bIdx: 3, code: 'ATH-2024-00401', status: 'RESERVED', loc: 'Quầy Giữ Chỗ - Sảnh Tầng 1' },
    { bIdx: 3, code: 'ATH-2024-00402', status: 'AVAILABLE', loc: 'Kho B - Tầng 2 - Kệ TK-08' },
    { bIdx: 3, code: 'ATH-2024-00403', status: 'BORROWED', loc: 'Kho B - Tầng 2 - Kệ TK-08' },
    // The Pragmatic Programmer (2 copies)
    { bIdx: 4, code: 'ATH-2024-00501', status: 'AVAILABLE', loc: 'Kho A - Tầng 2 - Kệ QA-01' },
    { bIdx: 4, code: 'ATH-2024-00502', status: 'BORROWED', loc: 'Kho A - Tầng 2 - Kệ QA-01' },
    // SICP (2 copies)
    { bIdx: 5, code: 'ATH-2024-00601', status: 'AVAILABLE', loc: 'Kho B - Tầng 2 - Kệ QA-12' },
    { bIdx: 5, code: 'ATH-2024-00602', status: 'AVAILABLE', loc: 'Kho B - Tầng 2 - Kệ QA-12' },
    // CLRS Introduction to Algorithms (3 copies)
    { bIdx: 6, code: 'ATH-2024-00701', status: 'BORROWED', loc: 'Kho B - Tầng 2 - Kệ QA-12' },
    { bIdx: 6, code: 'ATH-2024-00702', status: 'AVAILABLE', loc: 'Kho B - Tầng 2 - Kệ QA-12' },
    { bIdx: 6, code: 'ATH-2024-00703', status: 'AVAILABLE', loc: 'Kho B - Tầng 2 - Kệ QA-12' },
    // Mythical Man-Month (2 copies)
    { bIdx: 7, code: 'ATH-2024-00801', status: 'AVAILABLE', loc: 'Kho A - Tầng 2 - Kệ QA-04' },
    { bIdx: 7, code: 'ATH-2024-00802', status: 'AVAILABLE', loc: 'Kho A - Tầng 2 - Kệ QA-04' },
    // A Brief History of Time (2 copies)
    { bIdx: 8, code: 'ATH-2024-00901', status: 'BORROWED', loc: 'Kho C - Tầng 3 - Kệ B4-02' },
    { bIdx: 8, code: 'ATH-2024-00902', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ B4-02' },
    // Cosmos (2 copies)
    { bIdx: 9, code: 'ATH-2024-01001', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ B4-02' },
    { bIdx: 9, code: 'ATH-2024-01002', status: 'DAMAGED', loc: 'Phòng Phục Chế Sách - Tầng 4' },
    // Six Easy Pieces (2 copies)
    { bIdx: 10, code: 'ATH-2024-01101', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ B4-02' },
    { bIdx: 10, code: 'ATH-2024-01102', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ B4-02' },
    // The Selfish Gene (2 copies)
    { bIdx: 11, code: 'ATH-2024-01201', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ B4-02' },
    { bIdx: 11, code: 'ATH-2024-01202', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ B4-02' },
    // Sapiens (3 copies)
    { bIdx: 12, code: 'ATH-2024-01301', status: 'BORROWED', loc: 'Kho C - Tầng 3 - Kệ DS-12' },
    { bIdx: 12, code: 'ATH-2024-01302', status: 'BORROWED', loc: 'Kho C - Tầng 3 - Kệ DS-12' },
    { bIdx: 12, code: 'ATH-2024-01303', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ DS-12' },
    // Guns, Germs, and Steel (2 copies)
    { bIdx: 13, code: 'ATH-2024-01401', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ DS-12' },
    { bIdx: 13, code: 'ATH-2024-01402', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ DS-12' },
    // The Silk Roads (2 copies)
    { bIdx: 14, code: 'ATH-2024-01501', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ DS-12' },
    { bIdx: 14, code: 'ATH-2024-01502', status: 'AVAILABLE', loc: 'Kho C - Tầng 3 - Kệ DS-12' },
    // Đại Việt Sử Ký Toàn Thư (2 copies - 1 Bảo quản đặc biệt)
    { bIdx: 15, code: 'ATH-2024-01601', status: 'AVAILABLE', loc: 'Kho Sử Liệu - Tầng 1 - Kệ VN-02' },
    { bIdx: 15, code: 'ATH-2024-01602', status: 'AVAILABLE', loc: 'Hầm Bản Thảo Cổ - Tầng 4 - Kệ SPECIAL-01' },
    // Truyện Kiều (3 copies)
    { bIdx: 16, code: 'ATH-2024-01701', status: 'AVAILABLE', loc: 'Kho Sử Liệu - Tầng 1 - Kệ VN-02' },
    { bIdx: 16, code: 'ATH-2024-01702', status: 'BORROWED', loc: 'Kho Sử Liệu - Tầng 1 - Kệ VN-02' },
    { bIdx: 16, code: 'ATH-2024-01703', status: 'AVAILABLE', loc: 'Hầm Bản Thảo Cổ - Tầng 4 - Kệ SPECIAL-01' },
    // Số Đỏ (2 copies)
    { bIdx: 17, code: 'ATH-2024-01801', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ VN-04' },
    { bIdx: 17, code: 'ATH-2024-01802', status: 'BORROWED', loc: 'Kho Văn Học - Tầng 1 - Kệ VN-04' },
    // Nỗi Buồn Chiến Tranh (2 copies)
    { bIdx: 18, code: 'ATH-2024-01901', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ VN-04' },
    { bIdx: 18, code: 'ATH-2024-01902', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ VN-04' },
    // 1984 (3 copies)
    { bIdx: 19, code: 'ATH-2024-02001', status: 'BORROWED', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-04' },
    { bIdx: 19, code: 'ATH-2024-02002', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-04' },
    { bIdx: 19, code: 'ATH-2024-02003', status: 'LOST', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-04' },
    // Norwegian Wood (2 copies)
    { bIdx: 20, code: 'ATH-2024-02101', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-04' },
    { bIdx: 20, code: 'ATH-2024-02102', status: 'BORROWED', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-04' },
    // The Great Gatsby (2 copies)
    { bIdx: 21, code: 'ATH-2024-02201', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-08' },
    { bIdx: 21, code: 'ATH-2024-02202', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-08' },
    // To Kill a Mockingbird (2 copies)
    { bIdx: 22, code: 'ATH-2024-02301', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-08' },
    { bIdx: 22, code: 'ATH-2024-02302', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-08' },
    // Crime and Punishment (2 copies)
    { bIdx: 23, code: 'ATH-2024-02401', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-08' },
    { bIdx: 23, code: 'ATH-2024-02402', status: 'BORROWED', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-08' },
    // One Hundred Years of Solitude (2 copies)
    { bIdx: 24, code: 'ATH-2024-02501', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-08' },
    { bIdx: 24, code: 'ATH-2024-02502', status: 'AVAILABLE', loc: 'Kho Văn Học - Tầng 1 - Kệ PR-08' },
    // Meditations (2 copies)
    { bIdx: 25, code: 'ATH-2024-02601', status: 'AVAILABLE', loc: 'Kho Triết Học - Tầng 3 - Kệ PH-01' },
    { bIdx: 25, code: 'ATH-2024-02602', status: 'BORROWED', loc: 'Kho Triết Học - Tầng 3 - Kệ PH-01' },
    // Nicomachean Ethics (2 copies)
    { bIdx: 26, code: 'ATH-2024-02701', status: 'AVAILABLE', loc: 'Kho Triết Học - Tầng 3 - Kệ PH-01' },
    { bIdx: 26, code: 'ATH-2024-02702', status: 'AVAILABLE', loc: 'Kho Triết Học - Tầng 3 - Kệ PH-01' },
    // Justice: What's the Right Thing to Do? (2 copies)
    { bIdx: 27, code: 'ATH-2024-02801', status: 'AVAILABLE', loc: 'Kho Triết Học - Tầng 3 - Kệ PH-04' },
    { bIdx: 27, code: 'ATH-2024-02802', status: 'BORROWED', loc: 'Kho Triết Học - Tầng 3 - Kệ PH-04' },
    // Atomic Habits (3 copies)
    { bIdx: 28, code: 'ATH-2024-02901', status: 'BORROWED', loc: 'Kho Tâm Lý - Tầng 2 - Kệ PS-02' },
    { bIdx: 28, code: 'ATH-2024-02902', status: 'BORROWED', loc: 'Kho Tâm Lý - Tầng 2 - Kệ PS-02' },
    { bIdx: 28, code: 'ATH-2024-02903', status: 'AVAILABLE', loc: 'Kho Tâm Lý - Tầng 2 - Kệ PS-02' },
    // Thinking, Fast and Slow (2 copies)
    { bIdx: 29, code: 'ATH-2024-03001', status: 'AVAILABLE', loc: 'Kho Tâm Lý - Tầng 2 - Kệ PS-02' },
    { bIdx: 29, code: 'ATH-2024-03002', status: 'AVAILABLE', loc: 'Kho Tâm Lý - Tầng 2 - Kệ PS-02' },
    // Deep Work (2 copies)
    { bIdx: 30, code: 'ATH-2024-03101', status: 'AVAILABLE', loc: 'Kho Tâm Lý - Tầng 2 - Kệ PS-04' },
    { bIdx: 30, code: 'ATH-2024-03102', status: 'BORROWED', loc: 'Kho Tâm Lý - Tầng 2 - Kệ PS-04' },
    // Principles (2 copies)
    { bIdx: 31, code: 'ATH-2024-03201', status: 'AVAILABLE', loc: 'Kho Kinh Tế - Tầng 2 - Kệ EC-01' },
    { bIdx: 31, code: 'ATH-2024-03202', status: 'AVAILABLE', loc: 'Kho Kinh Tế - Tầng 2 - Kệ EC-01' },
    // The Design of Everyday Things (2 copies)
    { bIdx: 32, code: 'ATH-2024-03301', status: 'AVAILABLE', loc: 'Kho Nghệ Thuật - Tầng 1 - Kệ AR-01' },
    { bIdx: 32, code: 'ATH-2024-03302', status: 'AVAILABLE', loc: 'Kho Nghệ Thuật - Tầng 1 - Kệ AR-01' },
  ];

  const createdCopies: any[] = [];
  for (const c of copiesPlan) {
    const book = createdBooks[c.bIdx];
    if (book) {
      const copy = await prisma.bookCopy.upsert({
        where: { copyCode: c.code },
        update: {
          bookId: book.id,
          status: c.status,
          shelfLocation: c.loc,
        },
        create: {
          bookId: book.id,
          copyCode: c.code,
          status: c.status,
          shelfLocation: c.loc,
          acquisitionDate: '2024-01-15',
        },
      });
      createdCopies.push({ ...copy, bIdx: c.bIdx });
    }
  }

  // =========================================================================
  // 7. CIRCULATION LOANS (ONGOING, DUE SOON, OVERDUE, RETURNED)
  // =========================================================================
  await prisma.fine.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.loan.deleteMany({});

  const today = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];
  const addDays = (num: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + num);
    return formatYMD(d);
  };

  const getCopyByCode = (code: string) => createdCopies.find((c) => c.copyCode === code);

  // Ongoing Loans
  // 1. Refactoring (Member 1) - due in 8 days
  const copyRefactoring = getCopyByCode('ATH-2024-00201');
  let loan1: any = null;
  if (copyRefactoring) {
    loan1 = await prisma.loan.create({
      data: {
        id: 1,
        bookCopyId: copyRefactoring.id,
        memberId: member1.id,
        librarianId: librarian.id,
        loanDate: addDays(-6),
        dueDate: addDays(8),
        status: 'ONGOING',
        renewalCount: 0,
      },
    });
  }

  // 2. Effective Java (Member 1) - renewed once, due in 2 days (Due soon reminder)
  const copyEffJava = getCopyByCode('ATH-2024-00301');
  let loan2: any = null;
  if (copyEffJava) {
    loan2 = await prisma.loan.create({
      data: {
        id: 2,
        bookCopyId: copyEffJava.id,
        memberId: member1.id,
        librarianId: librarian.id,
        loanDate: addDays(-16),
        dueDate: addDays(2),
        status: 'ONGOING',
        renewalCount: 1,
      },
    });
  }

  // 3. Atomic Habits (Member 2) - OVERDUE by 5 days
  const copyAtomicHabits1 = getCopyByCode('ATH-2024-02901');
  let loan3: any = null;
  if (copyAtomicHabits1) {
    loan3 = await prisma.loan.create({
      data: {
        id: 3,
        bookCopyId: copyAtomicHabits1.id,
        memberId: member2.id,
        librarianId: librarian.id,
        loanDate: addDays(-19),
        dueDate: addDays(-5),
        status: 'OVERDUE',
        renewalCount: 0,
      },
    });
  }

  // 4. Designing Data-Intensive Applications (Member 3) - due in 10 days
  const copyDDIA3 = getCopyByCode('ATH-2024-00403');
  let loan4: any = null;
  if (copyDDIA3) {
    loan4 = await prisma.loan.create({
      data: {
        id: 4,
        bookCopyId: copyDDIA3.id,
        memberId: member3.id,
        librarianId: librarian.id,
        loanDate: addDays(-4),
        dueDate: addDays(10),
        status: 'ONGOING',
        renewalCount: 0,
      },
    });
  }

  // 5. Clean Code (Member 5) - due in 12 days
  const copyCleanCode = getCopyByCode('ATH-2024-00103');
  let loan5: any = null;
  if (copyCleanCode) {
    loan5 = await prisma.loan.create({
      data: {
        id: 5,
        bookCopyId: copyCleanCode.id,
        memberId: member5.id,
        librarianId: librarian.id,
        loanDate: addDays(-2),
        dueDate: addDays(12),
        status: 'ONGOING',
        renewalCount: 0,
      },
    });
  }

  // 6. CLRS Algorithms (Member 5) - due in 9 days
  const copyCLRS = getCopyByCode('ATH-2024-00701');
  let loan6: any = null;
  if (copyCLRS) {
    loan6 = await prisma.loan.create({
      data: {
        id: 6,
        bookCopyId: copyCLRS.id,
        memberId: member5.id,
        librarianId: librarian.id,
        loanDate: addDays(-5),
        dueDate: addDays(9),
        status: 'ONGOING',
        renewalCount: 0,
      },
    });
  }

  // 7. Sapiens (Member 4) - due in 6 days
  const copySapiens1 = getCopyByCode('ATH-2024-01301');
  let loan7: any = null;
  if (copySapiens1) {
    loan7 = await prisma.loan.create({
      data: {
        id: 7,
        bookCopyId: copySapiens1.id,
        memberId: member4.id,
        librarianId: librarian.id,
        loanDate: addDays(-8),
        dueDate: addDays(6),
        status: 'ONGOING',
        renewalCount: 0,
      },
    });
  }

  // 8. 1984 (Member 6) - OVERDUE by 3 days
  const copy1984 = getCopyByCode('ATH-2024-02001');
  let loan8: any = null;
  if (copy1984) {
    loan8 = await prisma.loan.create({
      data: {
        id: 8,
        bookCopyId: copy1984.id,
        memberId: member6.id,
        librarianId: librarian.id,
        loanDate: addDays(-17),
        dueDate: addDays(-3),
        status: 'OVERDUE',
        renewalCount: 0,
      },
    });
  }

  // 9. Truyện Kiều (Member 7) - due in 11 days
  const copyKieu = getCopyByCode('ATH-2024-01702');
  let loan9: any = null;
  if (copyKieu) {
    loan9 = await prisma.loan.create({
      data: {
        id: 9,
        bookCopyId: copyKieu.id,
        memberId: member7.id,
        librarianId: librarian.id,
        loanDate: addDays(-3),
        dueDate: addDays(11),
        status: 'ONGOING',
        renewalCount: 0,
      },
    });
  }

  // 10. Meditations (Member 3) - due in 5 days
  const copyMeditations = getCopyByCode('ATH-2024-02602');
  let loan10: any = null;
  if (copyMeditations) {
    loan10 = await prisma.loan.create({
      data: {
        id: 10,
        bookCopyId: copyMeditations.id,
        memberId: member3.id,
        librarianId: librarian.id,
        loanDate: addDays(-9),
        dueDate: addDays(5),
        status: 'ONGOING',
        renewalCount: 0,
      },
    });
  }

  // 11. Deep Work (Member 1) - due in 13 days
  const copyDeepWork = getCopyByCode('ATH-2024-03102');
  let loan11: any = null;
  if (copyDeepWork) {
    loan11 = await prisma.loan.create({
      data: {
        id: 11,
        bookCopyId: copyDeepWork.id,
        memberId: member1.id,
        librarianId: librarian.id,
        loanDate: addDays(-1),
        dueDate: addDays(13),
        status: 'ONGOING',
        renewalCount: 0,
      },
    });
  }

  // Historical Returned Loans (feeds reports, rankings, borrowing analytics)
  const copyHawking = getCopyByCode('ATH-2024-00901');
  let loanReturned1: any = null;
  if (copyHawking) {
    loanReturned1 = await prisma.loan.create({
      data: {
        id: 12,
        bookCopyId: copyHawking.id,
        memberId: member1.id,
        librarianId: librarian.id,
        loanDate: addDays(-32),
        dueDate: addDays(-18),
        returnDate: addDays(-15),
        status: 'RETURNED',
        renewalCount: 0,
      },
    });
  }

  const copySapiens2 = getCopyByCode('ATH-2024-01302');
  let loanReturned2: any = null;
  if (copySapiens2) {
    loanReturned2 = await prisma.loan.create({
      data: {
        id: 13,
        bookCopyId: copySapiens2.id,
        memberId: member3.id,
        librarianId: librarian.id,
        loanDate: addDays(-28),
        dueDate: addDays(-14),
        returnDate: addDays(-12),
        status: 'RETURNED',
        renewalCount: 1,
      },
    });
  }

  const copyPragProg = getCopyByCode('ATH-2024-00502');
  let loanReturned3: any = null;
  if (copyPragProg) {
    loanReturned3 = await prisma.loan.create({
      data: {
        id: 14,
        bookCopyId: copyPragProg.id,
        memberId: member5.id,
        librarianId: librarian.id,
        loanDate: addDays(-20),
        dueDate: addDays(-6),
        returnDate: addDays(-7),
        status: 'RETURNED',
        renewalCount: 0,
      },
    });
  }

  // =========================================================================
  // 8. RESERVATIONS & HOLD QUEUE
  // =========================================================================
  // Res 1: READY for Member 1 (Designing Data-Intensive Applications)
  await prisma.reservation.create({
    data: {
      id: 1,
      bookId: createdBooks[3].id,
      memberId: member1.id,
      reservationDate: new Date(Date.now() - 2 * 86400000),
      status: 'READY',
      queuePosition: 1,
      expiryDate: addDays(2),
    },
  });

  // Res 2: PENDING for Member 1 (The Pragmatic Programmer)
  await prisma.reservation.create({
    data: {
      id: 2,
      bookId: createdBooks[4].id,
      memberId: member1.id,
      reservationDate: new Date(Date.now() - 1 * 86400000),
      status: 'PENDING',
      queuePosition: 1,
    },
  });

  // Res 3: PENDING for Member 2 (The Pragmatic Programmer - position 2 in line)
  await prisma.reservation.create({
    data: {
      id: 3,
      bookId: createdBooks[4].id,
      memberId: member2.id,
      reservationDate: new Date(Date.now() - 0.5 * 86400000),
      status: 'PENDING',
      queuePosition: 2,
    },
  });

  // Res 4: PENDING for Member 4 (Sapiens)
  await prisma.reservation.create({
    data: {
      id: 4,
      bookId: createdBooks[12].id,
      memberId: member4.id,
      reservationDate: new Date(Date.now() - 3 * 86400000),
      status: 'PENDING',
      queuePosition: 1,
    },
  });

  // Res 5: FULFILLED past reservation for Member 3 (Cosmos)
  await prisma.reservation.create({
    data: {
      id: 5,
      bookId: createdBooks[9].id,
      memberId: member3.id,
      reservationDate: new Date(Date.now() - 14 * 86400000),
      status: 'FULFILLED',
      queuePosition: 0,
    },
  });

  // =========================================================================
  // 9. CIRCULATION FINES & PENALTIES
  // =========================================================================
  // Fine 1: UNPAID late fee for Member 1 (late return fee on loan 12) - 15,000 VND
  if (loanReturned1) {
    await prisma.fine.create({
      data: {
        id: 1,
        loanId: loanReturned1.id,
        memberId: member1.id,
        amount: 15000,
        reason: 'LATE_RETURN',
        status: 'UNPAID',
        issuedDate: addDays(-15),
      },
    });
  }

  // Fine 2: UNPAID overdue fine for Member 2 (delinquent on loan 3 Atomic Habits) - 75,000 VND
  if (loan3) {
    await prisma.fine.create({
      data: {
        id: 2,
        loanId: loan3.id,
        memberId: member2.id,
        amount: 75000,
        reason: 'OVERDUE_PENALTY',
        status: 'UNPAID',
        issuedDate: addDays(-5),
      },
    });
  }

  // Fine 3: UNPAID overdue fine for Member 6 on loan 8 (1984) - 45,000 VND
  if (loan8) {
    await prisma.fine.create({
      data: {
        id: 3,
        loanId: loan8.id,
        memberId: member6.id,
        amount: 45000,
        reason: 'OVERDUE_PENALTY',
        status: 'UNPAID',
        issuedDate: addDays(-3),
      },
    });
  }

  // Fine 4: PAID fine for Member 3 on loan 4
  if (loan4) {
    await prisma.fine.create({
      data: {
        id: 4,
        loanId: loan4.id,
        memberId: member3.id,
        amount: 20000,
        reason: 'LATE_RETURN',
        status: 'PAID',
        issuedDate: addDays(-10),
        paidDate: addDays(-4),
      },
    });
  }

  // Fine 5: WAIVED fine for Member 4 with librarian exemption note
  if (loan1) {
    await prisma.fine.create({
      data: {
        id: 5,
        loanId: loan1.id,
        memberId: member4.id,
        amount: 50000,
        reason: 'ACADEMIC_CONFERENCE_EXEMPTION',
        status: 'WAIVED',
        issuedDate: addDays(-8),
        waivedBy: admin.id,
      },
    });
  }

  // =========================================================================
  // 10. PATRON NOTIFICATIONS
  // =========================================================================
  await prisma.notification.deleteMany({});

  await prisma.notification.createMany({
    data: [
      {
        userId: member1.id,
        type: 'RESERVATION_READY',
        message: 'Tài liệu bạn giữ chỗ "Designing Data-Intensive Applications" đã sẵn sàng tại Quầy Thủ Thư Sảnh Quadrangle. Hạn giữ chỗ đến hết 48 giờ.',
        isRead: false,
      },
      {
        userId: member1.id,
        type: 'DUE_SOON',
        message: 'Nhắc nhở hạn mượn: Sách "Effective Java (3rd Edition)" sẽ đến hạn trả trong 2 ngày tới. Bạn có thể gia hạn trực tuyến nếu cần.',
        isRead: false,
      },
      {
        userId: member1.id,
        type: 'FINE_ISSUED',
        message: 'Thông báo phí trễ hạn: Khoản phạt 15.000 VNĐ đã được ghi nhận vào thẻ thư viện do hoàn trả tài liệu trễ hạn 3 ngày.',
        isRead: true,
      },
      {
        userId: member1.id,
        type: 'CATALOG_ACQUISITION',
        message: 'Thư mục mới: Thư viện vừa nhập 15 đầu sách mới thuộc chuyên đề Kiến trúc Dữ liệu Phân tán và Triết học Khai sáng.',
        isRead: true,
      },
      {
        userId: member2.id,
        type: 'OVERDUE_ALERT',
        message: 'CẢNH BÁO QUÁ HẠN: Sách "Atomic Habits" đã quá hạn 5 ngày. Vui lòng hoàn trả ngay để khôi phục quyền mượn sách.',
        isRead: false,
      },
      {
        userId: member3.id,
        type: 'FINE_PAID',
        message: 'Biên lai điện tử: Bạn đã thanh toán thành công phí hoàn trả muộn số tiền 20.000 VNĐ tại quầy giao dịch.',
        isRead: true,
      },
      {
        userId: member5.id,
        type: 'LOAN_CONFIRMATION',
        message: 'Mượn sách thành công: 02 tài liệu "Clean Code" và "Introduction to Algorithms" đã được ghi nhận vào thẻ bạn đọc của bạn.',
        isRead: false,
      },
    ],
  });

  // =========================================================================
  // 11. SCHOLARLY REVIEWS & PATRON RATINGS
  // =========================================================================
  await prisma.review.deleteMany({});

  const reviewsData = [
    {
      bookId: createdBooks[0].id, // Clean Code
      memberId: member1.id,
      rating: 5,
      comment: 'Cuốn sách bắt buộc phải đọc đối với bất kỳ ai coi kỹ nghệ phần mềm là một nghề thủ công. Chương về cách đặt tên hàm và xử lý lỗi vô cùng thực tế.',
    },
    {
      bookId: createdBooks[0].id, // Clean Code
      memberId: member5.id,
      rating: 5,
      comment: 'Triết lý Clean Code đã thay đổi hoàn toàn văn hóa review mã nguồn tại nhóm kỹ thuật của tôi. Từng quy tắc nhỏ đều mang tính thực chiến cao.',
    },
    {
      bookId: createdBooks[3].id, // DDIA
      memberId: member1.id,
      rating: 5,
      comment: 'Kiệt tác tuyệt đối về hệ thống phân tán! Kleppmann giải thích các bài toán đồng thuận, replication lag và ACID transactions một cách khúc chiết phi thường.',
    },
    {
      bookId: createdBooks[3].id, // DDIA
      memberId: member5.id,
      rating: 5,
      comment: 'Một trong những cuốn sách kỹ thuật giá trị nhất tôi từng mượn tại Athenaeum. Sách còn mới, bản in đẹp, hình minh họa rõ ràng.',
    },
    {
      bookId: createdBooks[8].id, // A Brief History of Time
      memberId: member4.id,
      rating: 5,
      comment: 'Stephen Hawking đã làm cho những khái niệm vũ trụ học phức tạp nhất trở nên gần gũi và đầy chất thơ. Bản dịch và chú thích rất công phu.',
    },
    {
      bookId: createdBooks[12].id, // Sapiens
      memberId: member2.id,
      rating: 5,
      comment: 'Harari kết nối các sự kiện lịch sử sinh học và văn hóa bằng góc nhìn bao quát đột phá. Góc nhìn về trí tưởng tượng tập thể thật sự khai sáng.',
    },
    {
      bookId: createdBooks[12].id, // Sapiens
      memberId: member3.id,
      rating: 4,
      comment: 'Lối hành văn lôi cuốn, tư liệu dồi dào. Mặc dù có một vài suy diễn táo bạo nhưng tổng thể cuốn sách mở ra nhiều cuộc tranh luận triết học sâu sắc.',
    },
    {
      bookId: createdBooks[15].id, // Đại Việt Sử Ký Toàn Thư
      memberId: member7.id,
      rating: 5,
      comment: 'Ấn bản khảo cứu hàn lâm quý giá. Các chú giải địa danh và hiệu đính văn bản cổ của viện sử học giúp sinh viên chuyên ngành tra cứu rất thuận tiện.',
    },
    {
      bookId: createdBooks[16].id, // Truyện Kiều
      memberId: member2.id,
      rating: 5,
      comment: 'Vẻ đẹp ngôn từ tiếng Việt đạt tới đỉnh cao hoàn mỹ. Từng câu lục bát đều chứa đựng nỗi đau đáu về nhân phẩm và thân phận kiếp người.',
    },
    {
      bookId: createdBooks[19].id, // 1984
      memberId: member6.id,
      rating: 5,
      comment: 'Một tác phẩm cảnh tỉnh nhân loại không bao giờ lỗi thời. Đọc lại 1984 trong thời đại số càng thấy rõ sự sắc sảo trong nhãn quan của Orwell.',
    },
    {
      bookId: createdBooks[25].id, // Meditations
      memberId: member3.id,
      rating: 5,
      comment: 'Cuốn cẩm nang gối đầu giường về chủ nghĩa Khắc kỷ (Stoicism). Giúp giữ được sự an nhiên tĩnh tại giữa mọi giông bão của đời sống thế sự.',
    },
    {
      bookId: createdBooks[28].id, // Atomic Habits
      memberId: member1.id,
      rating: 5,
      comment: 'Phương pháp xây dựng thói quen khoa học, dễ ứng dụng ngay từ ngày mai. Đặc biệt hữu ích cho học sinh sinh viên trong việc quản lý thời gian học tập.',
    },
    {
      bookId: createdBooks[29].id, // Thinking, Fast and Slow
      memberId: member2.id,
      rating: 5,
      comment: 'Kahneman bóc tách cơ chế ra quyết định của bộ não con người với hàng loạt thực nghiệm tâm lý học kinh điển. Rất đáng suy ngẫm.',
    },
  ];

  for (const r of reviewsData) {
    await prisma.review.upsert({
      where: {
        bookId_memberId: {
          bookId: r.bookId,
          memberId: r.memberId,
        },
      },
      update: {
        rating: r.rating,
        comment: r.comment,
      },
      create: {
        bookId: r.bookId,
        memberId: r.memberId,
        rating: r.rating,
        comment: r.comment,
      },
    });
  }

  // Sync PostgreSQL auto-increment sequences to MAX(id)
  const tables = ['users', 'authors', 'publishers', 'categories', 'books', 'book_copies', 'loans', 'reservations', 'fines', 'notifications'];
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1));`
      );
    } catch {
      // Ignore if table doesn't use sequence
    }
  }

  console.log(`✅ Athenaeum Library successfully seeded with:
    - ${categoriesData.length} Subjects & Categories
    - ${publishersData.length} Academic Publishers
    - ${authorsData.length} Acclaimed Authors
    - ${booksData.length} Acclaimed Book Editions
    - ${copiesPlan.length} Physical Barcoded Copies
    - 11 Patrons & Professional Staff Accounts
    - 14 Active, Overdue, and Historical Loans
    - 5 Patron Holds & Reservation Queues
    - 5 Circulation Fines & Penalties
    - 7 Patron Notifications
    - ${reviewsData.length} Scholarly Reviews & Ratings`);
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .catch((e) => {
      console.error('Seed execution error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
