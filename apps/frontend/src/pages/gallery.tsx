"use client";
import React, { useState, useMemo, useEffect } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Head from "next/head";
import { Banner, Breadcrumb } from "@legacy-apartment/ui";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import EventIcon from "@mui/icons-material/Event";
import HistoryIcon from "@mui/icons-material/History";
import api from "@/lib/api";

interface Photo {
  id: number;
  eventId: number;
  src: string;
  alt: string | null;
  className: string | null;
}

interface GalleryEvent {
  id: number;
  name: string;
  year: number;
  date: string;
  photos: Photo[];
}

const Gallery = () => {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | "all">("all");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await api.get('/gallery/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const allPhotos = useMemo(() => {
    return events.flatMap(event => event.photos);
  }, [events]);

  const filteredPhotos = useMemo(() => {
    if (selectedEventId === "all") return allPhotos;
    const event = events.find(e => e.id === selectedEventId);
    return event ? event.photos : [];
  }, [selectedEventId, events, allPhotos]);

  const years = useMemo(() => {
    return Array.from(new Set(events.map(e => e.year))).sort((a, b) => b - a);
  }, [events]);

  const handleOpenPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setSelectedPhotoIndex(null);
    document.body.style.overflow = "auto";
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev! + 1) % filteredPhotos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((prev) => (prev! - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <DefaultLayout>
      <Head>
        <title>Gallery | Legacy Apartment</title>
      </Head>
      
      <div className="relative min-h-screen w-full bg-slate-50/50 overflow-hidden">
        {/* Radiant blurred background elements */}
        <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-blue-300/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute top-[40%] right-[10%] w-[700px] h-[700px] bg-purple-300/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[0%] w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <Banner title="Gallery" subtitle="Legacy Moments" bgClass="gallery-cover" theme="light" />
        <Breadcrumb items={[{ label: "Events", href: "/" }, { label: "Gallery" }]} />

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Main Gallery Section */}
            <div className="flex-1 order-2 lg:order-1">
              <div className="mb-10">
                <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4 tracking-tighter">
                  {selectedEventId === "all" ? (
                    <>Our <span className="text-orange-500">Gallery</span></>
                  ) : (
                    <>{selectedEvent?.name} <span className="text-orange-500">{selectedEvent?.year}</span></>
                  )}
                </h2>
                <p className="text-gray-600 md:text-lg max-w-2xl">
                  {selectedEventId === "all" 
                    ? "Explore the visual record of our society's most memorable moments and celebrations over the years."
                    : `Relive the highlights of the ${selectedEvent?.name} held on ${new Date(selectedEvent?.date || '').toLocaleDateString()}.`}
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-24">
                  <div className="animate-pulse text-gray-100 font-medium">Loading memories...</div>
                </div>
              ) : filteredPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
                  {filteredPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 ${photo.className || 'col-span-1 row-span-1'}`}
                      onClick={() => handleOpenPhoto(index)}
                    >
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500 z-10"></div>
                      <img
                        src={photo.src}
                        alt={photo.alt || 'Gallery image'}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 blur-[1px] group-hover:blur-0"
                        loading="lazy"
                      />
                      {photo.alt && (
                        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                          <p className="text-white text-xs md:text-sm font-medium truncate">{photo.alt}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24">
                  <EventIcon className="size-16 text-gray-300 mb-4" />
                  <p className="text-gray-100 font-medium">No photos captured for this event yet.</p>
                </div>
              )}
            </div>

            {/* Event Manager Sidebar */}
            <aside className="w-full lg:w-80 order-1 lg:order-2">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
                    <HistoryIcon className="text-orange-500" />
                    Event Manager
                  </h3>
                  
                  <div className="space-y-8">
                    {/* All Photos Toggle */}
                    <button
                      onClick={() => setSelectedEventId("all")}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                        selectedEventId === "all"
                          ? "bg-orange-500 border-orange-500 text-white"
                          : "bg-white border-gray-400 text-gray-600 hover:border-orange-500 hover:text-orange-500"
                      }`}
                    >
                      <span className="font-bold tracking-tight text-sm">View All Photos</span>
                      <span className="text-[10px] font-black uppercase opacity-60">Archive</span>
                    </button>

                    {years.map(year => (
                      <div key={year} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-gray-100 uppercase tracking-widest leading-none">{year}</span>
                          <div className="h-px flex-1 bg-gray-200"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {events.filter(e => e.year === year).map(event => (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEventId(event.id)}
                              className={`group flex flex-col items-start p-4 rounded-2xl transition-all duration-300 text-left border ${
                                selectedEventId === event.id
                                  ? "bg-white border-orange-500"
                                  : "bg-white border-transparent hover:border-gray-400"
                              }`}
                            >
                              <span className={`text-sm font-bold tracking-tight mb-1 transition-colors ${
                                selectedEventId === event.id ? "text-orange-500" : "text-gray-900 group-hover:text-orange-500"
                              }`}>
                                {event.name}
                              </span>
                              <span className="text-xs">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Info Card */}
                <div className="p-6 bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl text-white">
                  <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-2">Memory Lane</p>
                  <h4 className="text-lg font-bold mb-3 leading-tight">Capturing Life together.</h4>
                  <p className="text-sm text-gray-300 leading-relaxed opacity-80">
                    Our gallery is updated after every major event. If you have any photos to contribute, please contact the Cultural Secretary.
                  </p>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </div>

      {/* Lightbox / Modal */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10"
          onClick={handleCloseModal}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-50 backdrop-blur-md"
            onClick={handleCloseModal}
          >
            <CloseIcon className="w-8 h-8" />
          </button>

          <button
            className="absolute left-4 md:left-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 md:p-4 rounded-full transition-all z-50 backdrop-blur-md transform hover:-translate-x-1"
            onClick={handlePrevPhoto}
          >
            <KeyboardArrowLeftIcon className="w-8 h-8 md:w-10 md:h-10" />
          </button>

          <div className="relative max-w-6xl max-h-full w-full h-full flex flex-col items-center justify-center p-4">
            <img
              src={filteredPhotos[selectedPhotoIndex].src}
              alt={filteredPhotos[selectedPhotoIndex].alt || 'Gallery image'}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm animate-zoomIn"
              onClick={(e) => e.stopPropagation()}
            />
            {filteredPhotos[selectedPhotoIndex].alt && (
              <div className="absolute bottom-4 md:bottom-10 left-0 w-full text-center pointer-events-none">
                <p className="text-white text-lg md:text-2xl font-light tracking-wide bg-black/40 inline-block px-6 py-2 rounded-full backdrop-blur-md">
                  {filteredPhotos[selectedPhotoIndex].alt}
                </p>
              </div>
            )}
          </div>

          <button
            className="absolute right-4 md:right-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 md:p-4 rounded-full transition-all z-50 backdrop-blur-md transform hover:translate-x-1"
            onClick={handleNextPhoto}
          >
            <KeyboardArrowRightIcon className="w-8 h-8 md:w-10 md:h-10" />
          </button>
        </div>
      )}

      <style>{`
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
