-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "membership_expiry_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publishers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publishers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_category_id" INTEGER,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authors" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "biography" TEXT,
    "birth_date" TEXT,
    "nationality" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" SERIAL NOT NULL,
    "isbn" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "publisher_id" INTEGER,
    "category_id" INTEGER,
    "language" TEXT DEFAULT 'Vietnamese',
    "edition" TEXT,
    "publication_year" INTEGER,
    "page_count" INTEGER,
    "description" TEXT,
    "cover_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_authors" (
    "book_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,

    CONSTRAINT "book_authors_pkey" PRIMARY KEY ("book_id","author_id")
);

-- CreateTable
CREATE TABLE "book_copies" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "copy_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "shelf_location" TEXT,
    "acquisition_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_copies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loans" (
    "id" SERIAL NOT NULL,
    "book_copy_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,
    "librarian_id" INTEGER NOT NULL,
    "loan_date" TEXT NOT NULL,
    "due_date" TEXT NOT NULL,
    "return_date" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ONGOING',
    "renewal_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,
    "reservation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "queue_position" INTEGER NOT NULL,
    "expiry_date" TEXT,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fines" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "issued_date" TEXT NOT NULL,
    "paid_date" TEXT,
    "waived_by" INTEGER,

    CONSTRAINT "fines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "book_id" INTEGER NOT NULL,
    "member_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");

-- CreateIndex
CREATE UNIQUE INDEX "book_copies_copy_code_key" ON "book_copies"("copy_code");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_book_id_member_id_key" ON "reviews"("book_id", "member_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "publishers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "books" ADD CONSTRAINT "books_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_authors" ADD CONSTRAINT "book_authors_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_copies" ADD CONSTRAINT "book_copies_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_book_copy_id_fkey" FOREIGN KEY ("book_copy_id") REFERENCES "book_copies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_librarian_id_fkey" FOREIGN KEY ("librarian_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fines" ADD CONSTRAINT "fines_waived_by_fkey" FOREIGN KEY ("waived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
