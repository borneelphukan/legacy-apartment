"use client";
import React, { useState } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import Banner from "@/components/banner";
import Breadcrumb from "@/components/breadcrumb";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

const photos = [
  { id: 0, src: "https://picsum.photos/1200/1200?random=1", alt: "Society Event 1", className: "col-span-1 md:col-span-2 md:row-span-2" },
  { id: 1, src: "https://picsum.photos/800/800?random=2", alt: "Society Gatherings 2", className: "col-span-1 row-span-1" },
  { id: 2, src: "https://picsum.photos/800/800?random=3", alt: "Resident Meetup 3", className: "col-span-1 row-span-1" },
  { id: 3, src: "https://picsum.photos/800/1200?random=4", alt: "Beautiful Architecture 4", className: "col-span-1 row-span-2" },
  { id: 4, src: "https://picsum.photos/1200/800?random=5", alt: "Lush Greenery 5", className: "col-span-1 md:col-span-2" },
  { id: 5, src: "https://picsum.photos/800/800?random=6", alt: "Clubhouse 6", className: "col-span-1 row-span-1" },
  { id: 6, src: "https://picsum.photos/1200/800?random=7", alt: "Swimming Pool 7", className: "col-span-1 md:col-span-2 md:row-span-2" },
  { id: 7, src: "https://picsum.photos/800/800?random=8", alt: "Tennis Court 8", className: "col-span-1 row-span-1" },
  { id: 8, src: "https://picsum.photos/800/800?random=9", alt: "Kids Play Area 9", className: "col-span-1 row-span-1" },
];

const Gallery = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleOpenPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
    document.body.style.overflow = "auto";
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev! + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev! - 1 + photos.length) % photos.length);
    }
  };

  return (
    <DefaultLayout>
      <Head>
        <title>Gallery | Our Society</title>
      </Head>
      
      <div className="relative min-h-screen w-full bg-slate-50/50 overflow-hidden">
        {/* Radiant blurred background elements (Consistency with Contact Page) */}
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-[40%] right-[10%] w-[700px] h-[700px] bg-purple-300/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[0%] w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="relative z-10 pb-20">
          <Banner title="Our Gallery" subtitle="Gallery" bgClass="gallery-cover" theme="light" />
          <Breadcrumb items={[{ label: "Events", href: "/" }, { label: "Gallery" }]} />
          
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 mt-10">

          {/* Header Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4 tracking-tight">
              Our <span className="text-orange-500">Gallery</span>
            </h2>
            <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
              A visual journey through the vibrant celebrations, tranquil spaces, and cherished moments that define the unique spirit and architectural elegance of our community.
            </p>
          </div>

          {/* Masonry/Bento Grid for Photos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 ${photo.className}`}
                onClick={() => handleOpenPhoto(index)}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10"></div>
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 blur-[2px] group-hover:blur-0"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <p className="text-white font-medium truncate">{photo.alt}</p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10"
          onClick={handleCloseModal}
        >
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-50 backdrop-blur-md"
            onClick={handleCloseModal}
          >
            <CloseIcon className="w-8 h-8" />
          </button>

          {/* Previous Button */}
          <button
            className="absolute left-4 md:left-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 md:p-4 rounded-full transition-all z-50 backdrop-blur-md transform hover:-translate-x-1"
            onClick={handlePrevPhoto}
          >
            <KeyboardArrowLeftIcon className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          {/* Current Image */}
          <div className="relative max-w-6xl max-h-full w-full h-full flex flex-col items-center justify-center p-4">
            <img
              src={photos[selectedPhotoIndex].src}
              alt={photos[selectedPhotoIndex].alt}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm animate-zoomIn"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
            />
            <div className="absolute bottom-4 md:bottom-10 left-0 w-full text-center pointer-events-none">
              <p className="text-white text-lg md:text-2xl font-light tracking-wide bg-black/40 inline-block px-6 py-2 rounded-full backdrop-blur-md">
                {photos[selectedPhotoIndex].alt}
              </p>
            </div>
          </div>

          {/* Next Button */}
          <button
            className="absolute right-4 md:right-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 md:p-4 rounded-full transition-all z-50 backdrop-blur-md transform hover:translate-x-1"
            onClick={handleNextPhoto}
          >
            <KeyboardArrowRightIcon className="w-8 h-8 md:w-10 md:h-10" />
          </button>
        </div>
      )}

      {/* Tailwind Zoom-in animation for modal image */}
      <style jsx global>{`
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-zoomIn {
          animation: zoomIn 0.3s ease-out forwards;
        }
      `}</style>
    </DefaultLayout>
  );
};

export default Gallery;
