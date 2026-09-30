import request from 'supertest';
import { createApp } from '../app.ts';
import { prisma } from '../config/prisma.ts';
import { seedDatabase } from '../../prisma/seed.ts';
import { expireOverdueReservations } from '../modules/reservation/scheduledJobs.ts';
import { flagOverdueLoans } from '../modules/circulation/scheduledJobs.ts';

const app = createApp();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function run() {
  console.log('--- STARTING LIBRARY MANAGEMENT SYSTEM TEST SUITE ---');

  // Re-seed database fresh for tests
  await seedDatabase();

  // ==========================================
  // PHASE 1 TESTS: Authentication & RBAC
  // ==========================================
  console.log('\n[Phase 1] Auth & RBAC Tests:');

  // 1. Register with new email
  const testEmail = `test_${Date.now()}@example.com`;
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      fullName: 'Test User',
      email: testEmail,
      password: 'Password123!',
    });
  assert(regRes.status === 201 && regRes.body.data.email === testEmail, 'Register new member returns 201');

  // 2. Register duplicate email -> 409 DUPLICATE_EMAIL
  const dupRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      fullName: 'Test User 2',
      email: testEmail,
      password: 'Password123!',
    });
  assert(
    dupRes.status === 409 && dupRes.body.error?.code === 'DUPLICATE_EMAIL',
    'Registering duplicate email returns 409 DUPLICATE_EMAIL'
  );

  // 3. Login wrong password -> 401
  const wrongPassRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: testEmail, password: 'WrongPassword!' });
  assert(wrongPassRes.status === 401, 'Login with wrong password returns 401');

  // 4. Successful login
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: testEmail, password: 'Password123!' });
  assert(loginRes.status === 200 && Boolean(loginRes.body.data.accessToken), 'Login returns 200 with tokens');
  const memberToken = loginRes.body.data.accessToken;
  const refreshToken = loginRes.body.data.refreshToken;
  const memberId = loginRes.body.data.user.id;

  // 5. Admin Login
  const adminLoginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@library.com', password: 'Admin123!' });
  const adminToken = adminLoginRes.body.data.accessToken;
  assert(Boolean(adminToken), 'Admin login successful');

  // 6. Access /auth/me
  const meRes = await request(app)
    .get('/api/v1/auth/me')
    .set('Authorization', `Bearer ${memberToken}`);
  assert(meRes.status === 200 && meRes.body.data.email === testEmail, 'GET /auth/me returns profile');

  // 7. Request without token to protected route -> 401
  const noTokenRes = await request(app).get('/api/v1/auth/me');
  assert(noTokenRes.status === 401, 'Request with no token returns 401');

  // 8. Admin-only route with Member token -> 403
  const memberOnAdminRes = await request(app)
    .get('/api/v1/users')
    .set('Authorization', `Bearer ${memberToken}`);
  assert(memberOnAdminRes.status === 403, 'Member token accessing Admin route returns 403');

  // 9. Token refresh
  const refreshRes = await request(app)
    .post('/api/v1/auth/refresh')
    .send({ refreshToken });
  assert(refreshRes.status === 200 && Boolean(refreshRes.body.data.accessToken), 'POST /auth/refresh returns new tokens');

  // 10. Login suspended user -> 403
  await prisma.user.update({
    where: { id: memberId },
    data: { status: 'SUSPENDED' },
  });
  const suspendedLoginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: testEmail, password: 'Password123!' });
  assert(suspendedLoginRes.status === 403, 'Login with suspended user returns 403');
  // Restore user to active
  await prisma.user.update({
    where: { id: memberId },
    data: { status: 'ACTIVE' },
  });

  // ==========================================
  // PHASE 2 TESTS: Catalog Management
  // ==========================================
  console.log('\n[Phase 2] Catalog Management Tests:');

  // 1. Guest can browse books
  const publicBooksRes = await request(app).get('/api/v1/books');
  assert(publicBooksRes.status === 200 && Array.isArray(publicBooksRes.body.data.content), 'Guest can browse books');

  // 2. Guest POST to /books -> 401
  const guestPostBookRes = await request(app)
    .post('/api/v1/books')
    .send({ isbn: '9999999999999', title: 'Hacker Book' });
  assert(guestPostBookRes.status === 401, 'Guest POST /books blocked with 401');

  // 3. Duplicate ISBN returns 409 DUPLICATE_ISBN
  const dupIsbnRes = await request(app)
    .post('/api/v1/books')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      isbn: '9780132350884', // Existing Clean Code ISBN
      title: 'Clean Code Duplicate',
    });
  assert(dupIsbnRes.status === 409 && dupIsbnRes.body.error?.code === 'DUPLICATE_ISBN', 'Duplicate ISBN returns 409 DUPLICATE_ISBN');

  // 4. Search books by partial title
  const searchRes = await request(app).get('/api/v1/books?q=Clean');
  assert(
    searchRes.status === 200 &&
    searchRes.body.data.content.some((b: any) => b.title.includes('Clean')),
    'Search by partial title returns matching books'
  );

  // 5. Book detail includes availableCopies
  const bookDetailRes = await request(app).get('/api/v1/books/1');
  assert(
    bookDetailRes.status === 200 &&
    typeof bookDetailRes.body.data.availableCopies === 'number',
    'Book detail shows availableCopies'
  );

  // ==========================================
  // PHASE 3 TESTS: Circulation (Borrow/Return/Renew)
  // ==========================================
  console.log('\n[Phase 3] Circulation Tests:');

  // Librarian login
  const libLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'librarian@library.com', password: 'Librarian123!' });
  const librarianToken = libLogin.body.data.accessToken;

  // 1. Checkout an available copy
  const memberUser = await prisma.user.findUnique({ where: { email: 'member1@library.com' } });
  const cleanCodeCopy = await prisma.bookCopy.findFirst({
    where: { copyCode: 'ATH-2024-00101', status: 'AVAILABLE' },
  });

  const checkoutRes = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${librarianToken}`)
    .send({
      memberId: memberUser!.id,
      bookCopyId: cleanCodeCopy!.id,
    });
  assert(checkoutRes.status === 201 && checkoutRes.body.data.status === 'ONGOING', 'Checkout succeeds and returns 201');
  const loanId = checkoutRes.body.data.id;

  // 2. Checkout already-borrowed copy -> 409 COPY_NOT_AVAILABLE
  const doubleCheckoutRes = await request(app)
    .post('/api/v1/loans')
    .set('Authorization', `Bearer ${librarianToken}`)
    .send({
      memberId: memberUser!.id,
      bookCopyId: cleanCodeCopy!.id,
    });
  assert(
    doubleCheckoutRes.status === 409 && doubleCheckoutRes.body.error?.code === 'COPY_NOT_AVAILABLE',
    'Checking out borrowed copy returns 409 COPY_NOT_AVAILABLE'
  );

  // 3. Renew loan
  const renewRes = await request(app)
    .post(`/api/v1/loans/${loanId}/renew`)
    .set('Authorization', `Bearer ${librarianToken}`);
  assert(renewRes.status === 200 && renewRes.body.data.renewalCount === 1, 'Renew loan increments renewalCount');

  // 4. Return loan
  const returnRes = await request(app)
    .patch(`/api/v1/loans/${loanId}/return`)
    .set('Authorization', `Bearer ${librarianToken}`);
  assert(returnRes.status === 200 && returnRes.body.data.status === 'RETURNED', 'Return loan sets status to RETURNED');

  // 5. Copy is back to AVAILABLE
  const copyAfterReturn = await prisma.bookCopy.findUnique({ where: { id: cleanCodeCopy!.id } });
  assert(copyAfterReturn?.status === 'AVAILABLE', 'Copy status becomes AVAILABLE after return');

  // ==========================================
  // PHASE 4 TESTS: Reservations & Fines
  // ==========================================
  console.log('\n[Phase 4] Reservations & Fines Tests:');

  // 1. Place reservation for a member on a title they are not currently borrowing
  const member4User = await prisma.user.findUnique({ where: { email: 'member4@library.com' } });
  const member4Login = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'member4@library.com', password: 'Member123!' });
  const member4Token = member4Login.body.data.accessToken;

  // Pick a book member4 does not have an active loan on
  const targetBook = await prisma.book.findFirst({ where: { id: 10 } });

  const resvRes = await request(app)
    .post('/api/v1/reservations')
    .set('Authorization', `Bearer ${member4Token}`)
    .send({ bookId: targetBook!.id });
  assert(resvRes.status === 201 && resvRes.body.data.queuePosition >= 1, 'Place reservation returns 201 with queuePosition');
  const reservationId = resvRes.body.data.id;

  // 2. Cannot duplicate reservation for same title
  const dupResvRes = await request(app)
    .post('/api/v1/reservations')
    .set('Authorization', `Bearer ${member4Token}`)
    .send({ bookId: targetBook!.id });
  assert(dupResvRes.status === 409, 'Duplicate reservation on same title returns 409');

  // 3. Cancel reservation
  const cancelRes = await request(app)
    .patch(`/api/v1/reservations/${reservationId}/cancel`)
    .set('Authorization', `Bearer ${member4Token}`);
  assert(cancelRes.status === 200 && cancelRes.body.data.status === 'CANCELLED', 'Cancel reservation sets status to CANCELLED');

  // 4. Create fine & waive
  const sampleFine = await prisma.fine.create({
    data: {
      loanId,
      memberId: memberUser!.id,
      amount: 15000,
      reason: 'LATE_RETURN',
      status: 'UNPAID',
      issuedDate: '2026-09-01',
    },
  });

  const waiveRes = await request(app)
    .patch(`/api/v1/fines/${sampleFine.id}/waive`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ reason: 'Disputed grace period' });
  assert(waiveRes.status === 200 && waiveRes.body.data.status === 'WAIVED', 'Admin waiving fine marks status WAIVED');

  // ==========================================
  // PHASE 5 TESTS: Reports & Notifications
  // ==========================================
  console.log('\n[Phase 5] Reports & Notifications Tests:');

  const dashRes = await request(app)
    .get('/api/v1/reports/dashboard-summary')
    .set('Authorization', `Bearer ${librarianToken}`);
  assert(
    dashRes.status === 200 &&
    typeof dashRes.body.data.totalBooks === 'number',
    'Dashboard summary responds with metrics'
  );

  const notifRes = await request(app)
    .get('/api/v1/notifications')
    .set('Authorization', `Bearer ${member4Token}`);
  assert(notifRes.status === 200 && Array.isArray(notifRes.body.data), 'GET /notifications returns array of notifications');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log(`========================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error('Fatal Test Suite Error:', e);
  process.exit(1);
});
