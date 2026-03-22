CREATE TABLE "document_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_category_name_key" ON "document_category"("name");
