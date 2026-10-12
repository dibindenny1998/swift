-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_contact_key" ON "Subscriber"("contact");
