-- CreateTable
CREATE TABLE "gallery_event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_photo" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT,
    "className" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_photo_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gallery_photo" ADD CONSTRAINT "gallery_photo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "gallery_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
