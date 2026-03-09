import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "@/layout/DefaultLayout";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Button } from "@legacy-apartment/ui";
 
const API_BASE_URL = 'http://localhost:4000';

const bannerImages = [
  "url('/cover.webp')",
];


const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.5 }
    );
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={counterRef}>{count}{suffix}</span>;
};

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentResidentIndex, setCurrentResidentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(16);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/announcements`);
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };
    const fetchResidents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/residents`);
        if (response.ok) {
          const data = await response.json();
          setResidents(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching residents:', error);
      }
    };
    fetchAnnouncements();
    fetchResidents();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const newItemsPerSlide = window.innerWidth < 1024 ? 8 : 16;
      setItemsPerSlide(prev => {
        if (prev !== newItemsPerSlide) {
          setCurrentResidentIndex(0); // Reset slide on resize
          return newItemsPerSlide;
        }
        return prev;
      });
    };
    
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const residentChunks = [];
  for (let i = 0; i < residents.length; i += itemsPerSlide) {
    residentChunks.push(residents.slice(i, i + itemsPerSlide));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (residentChunks.length === 0) return;
    const residentInterval = setInterval(() => {
      setCurrentResidentIndex((prevIndex) => (prevIndex + 1) % residentChunks.length);
    }, 5000);
    return () => clearInterval(residentInterval);
  }, [residentChunks.length]);

  const handleNextResident = () => {
    setCurrentResidentIndex((prev) => (prev + 1) % residentChunks.length);
  };

  const handlePrevResident = () => {
    setCurrentResidentIndex((prev) => (prev - 1 + residentChunks.length) % residentChunks.length);
  };

  return (
    <DefaultLayout>
      {/* Banner section */}
      <div 
        className="sticky top-0 -z-10 h-[100vh] w-full bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden transition-all duration-1000 before:content-[''] before:absolute before:inset-0 before:bg-black/60 before:-z-10"
        style={{ backgroundImage: bannerImages[currentImageIndex] }}
      >
        {/* Vertical subtle column lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px)] bg-[size:12.5vw_100%]"></div>
        
        {/* Left side dots grid mask */}
        <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-[image:radial-gradient(#ffffff1a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_right,white,transparent)]"></div>

        <div className="relative z-10 container mx-auto px-6 flex flex-col items-center">
          <div className="flex justify-center mb-6">
            <span className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm md:text-base font-light backdrop-blur-md flex items-center gap-2">
              Welcome To
            </span>
          </div>
        

          <h1 className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#e2e4e9] uppercase tracking-tighter leading-none mb-10 w-full drop-shadow-2xl">
            The Legacy Housing Society
          </h1>
          
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
            <p className="text-gray-200 text-lg md:text-xl lg:text-2xl mb-3 font-light">
              We are a <span className="font-medium">Community</span>.
            </p>
            <p className="text-gray-300 text-base md:text-lg lg:text-xl font-light leading-relaxed text-center">
              Experience the best of community living with top-notch amenities, a vibrant neighborhood, and a secure environment for you and your family to thrive in.
            </p>
          </div>
        </div>
      </div>

      <div className="z-10 w-full relative">
        {/* About Us Section */}
        <div className="w-full flex flex-col md:flex-row gap-8 lg:gap-12 p-4 md:p-8">
          <div className="md:w-4/5 lg:w-4/5">
            <div className="bg-white/80 backdrop-blur-md rounded-[2rem] shadow-sm flex flex-col md:flex-row overflow-hidden border border-white/20">
              {/* Left Side: Image */}
              <div className="w-full md:w-2/5 flex-shrink-0 min-h-[300px]">
                <img src="cover.png" alt="Society Overview" className="w-full h-full object-cover" />
              </div>

              {/* Right Side: Content */}
              <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-14 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-gray-800 mb-4 tracking-tight leading-tight">
                  Who are we?
                </h2>
                
                <p className="text-gray-500 font-light leading-relaxed mb-5 text-sm md:text-base lg:text-lg">
                  Community living for us is not just about sharing spaces, but building a vibrant, connected neighborhood. Our goal is to create a safe, welcoming, and inclusive environment.
                </p>

                <p className="text-gray-500 font-light leading-relaxed mb-5 text-sm md:text-base lg:text-lg">
                  We approach every community project with an organized mindset, focusing on well-maintained facilities and delivering high-quality services to our residents.
                </p>

                <div className="grid grid-cols-2 gap-y-5 gap-x-6">
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm md:text-base mb-1 tracking-wide">Founded</span>
                    <span className="text-4xl md:text-5xl font-bold text-gray-800">
                      <AnimatedCounter end={2010} />
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm md:text-base mb-1 tracking-wide">Families</span>
                    <span className="text-4xl md:text-5xl font-bold text-gray-800">
                      <AnimatedCounter end={residents.length} />
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm md:text-base mb-1 tracking-wide">Events Hosted</span>
                    <span className="text-4xl md:text-5xl font-bold text-gray-800">
                      <AnimatedCounter end={150} suffix="+" />
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 text-sm md:text-base mb-1 tracking-wide">Amenities</span>
                    <span className="text-4xl md:text-5xl font-bold text-gray-800">
                      <AnimatedCounter end={20} suffix="+" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/3 lg:w-1/4 mt-8 md:mt-0">
            <div className="p-6 bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-sm h-full flex flex-col">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3 border-gray-100 flex justify-between items-center">
                <span>Latest Announcements</span>
                <span className="bg-orange-100 text-orange-600 text-xs py-1 px-2 rounded-full">New</span>
              </h2>
              <div className="space-y-5 overflow-y-auto flex-grow pr-2">
                {announcements.map((ann, idx) => (
                  <div key={idx} className="group cursor-pointer border-b border-gray-50 pb-4 last:border-none">
                    <span className="text-xs font-bold text-orange-500 mb-1 block uppercase tracking-wider">
                      {ann.date ? new Date(ann.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800 group-hover:text-orange-500 transition-colors mb-1 line-clamp-1">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {ann.description}
                    </p>
                  </div>
                ))}
                {announcements.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4 italic">No recent announcements</p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 text-center flex justify-center">
                <Link href="/committee" className="text-sm text-orange-500 hover:text-orange-600 font-semibold flex items-center justify-center group">
                  View All Decisions <ArrowForwardIcon className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities Banner exactly cloned from Services.tsx */}
      <section id="Amenities" className="sticky top-0 z-0 flex flex-col items-center justify-center h-[100vh] pb-[20vh] md:pb-0 w-full overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/60 to-transparent -z-10"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 w-full flex justify-center">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block py-1.5 px-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium tracking-[0.2em] uppercase mb-8 shadow-sm">
              Discover Quality Living
            </span>
            <h1 className="text-4xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white drop-shadow-2xl mb-6">
              Our Amenities
            </h1>

            <p className="text-lg leading-relaxed text-gray-200 sm:text-lg md:text-xl font-light mb-6">
              With top-tier facilities designed for all age groups, our society ensures a healthy, active, and balanced lifestyle for every resident.
            </p>

            <p className="text-lg leading-relaxed text-gray-200 sm:text-lg md:text-xl font-light mb-4">
              Here are some of the amenities we offer:
            </p>

            <ul className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 sm:gap-10 text-gray-200 text-lg md:text-xl font-light mb-10 w-full list-none">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Swimming Pool
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Gymnasium
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Club House
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-sm mx-auto">
              <Button 
                variant="primary" 
                href="/contact" 
                className="w-full sm:w-auto" 
                icon={{ right: <ArrowForwardIcon className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform duration-300" /> }}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Re-open the high z-index native scrolling layer so the content below gracefully overlaps the sticky banner behind it */}
      <div className="z-10 w-full relative bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center py-20 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-4 tracking-tight">
          Meet Our <span className="text-orange-500">Residents</span>
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl text-center mb-12">
          Say hello to some of the wonderful families and individuals who make up our vibrant community.
        </p>

        <div className="relative w-full max-w-7xl mx-auto">
          
          <div className="overflow-hidden w-full relative">
            <div className="flex transition-transform duration-700 ease-in-out w-full" style={{ transform: `translateX(-${currentResidentIndex * 100}%)` }}>
              {residentChunks.map((chunk, slideIdx) => (
                <div key={slideIdx} className="w-full flex-shrink-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 content-start gap-4 p-4 md:p-6 bg-white min-h-[400px]">
                  {chunk.map((resident, idx) => (
                    <div key={idx} className="group flex items-center p-3 md:p-4 bg-slate-50 rounded-2xl hover:bg-white transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100 hover:shadow-lg hover:-translate-y-1">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 mr-4 group-hover:border-blue-50 transition-colors bg-gray-100 flex items-center justify-center">
                        {resident.avatar || resident.image ? (
                           <img 
                            src={resident.avatar || resident.image} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt={resident.name} 
                           />
                        ) : (
                          <div className="text-gray-400 font-bold text-xl">{resident.name.charAt(0)}</div>
                        )}
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1 truncate">{resident?.name || 'Resident'}</h3>
                        <span className="inline-block border border-blue-200 bg-blue-50 text-blue-600 text-[10px] md:text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-sm w-max">
                          Flat {resident?.residence || resident?.flat || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
           
          {/* Controls for mobile / Dots */}
          <div className="flex justify-center items-center mt-8 space-x-6 md:space-x-4">
            <button onClick={handlePrevResident} className="lg:hidden p-2 text-gray-400 hover:text-orange-500 bg-white shadow-sm rounded-full border border-gray-100 transition-colors">
              <KeyboardArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex space-x-3">
              {residentChunks.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentResidentIndex(idx)} 
                  className={`h-2.5 md:h-3 rounded-full transition-all duration-300 ${currentResidentIndex === idx ? 'bg-orange-500 w-6 md:w-8' : 'w-2.5 md:w-3 bg-gray-300 hover:bg-gray-400'}`}
                ></button>
              ))}
            </div>
            <button onClick={handleNextResident} className="md:hidden p-2 text-gray-400 hover:text-orange-500 bg-white shadow-sm rounded-full border border-gray-100 transition-colors">
              <KeyboardArrowRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Home;
