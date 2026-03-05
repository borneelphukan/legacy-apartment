import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

const CircularScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const scrollY = window.scrollY;
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Determine visibility
      setIsVisible(scrollY > 150);

      // Calculate percentage clamped between 0 and 100
      const percentage = totalScrollHeight > 0 
        ? Math.min(100, Math.max(0, (scrollY / totalScrollHeight) * 100))
        : 0;

      setProgress(percentage);
      ticking = false;
    };

    const handleScroll = () => {
      // Use requestAnimationFrame for high-performance scroll handling without layout thrashing
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    // Passive listener gives another performance boost
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initial check
    updateProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed z-50 bottom-6 right-6 md:bottom-10 md:right-10 flex items-center justify-center transition-all duration-300 ease-in-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      }`}
      onClick={handleScrollToTop}
      style={{ cursor: "pointer" }}
    >
      <div className="relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center group">
        <svg className="absolute inset-0 transform -rotate-90 w-full h-full drop-shadow-md">
          {/* Background track circle */}
          <circle
            cx="50%"
            cy="50%"
            r="44%"
            fill="transparent"
            stroke="#e5e7eb" // gray-200
            strokeWidth="8%"
          />
          {/* Active progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r="44%"
            fill="transparent"
            stroke="#EA580C" // blue-500
            strokeWidth="8%"
            strokeLinecap="round"
            pathLength="100" // Simplifies dashboard array math greatly!
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
          />
        </svg>
        <div className="w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur border border-gray-100 shadow-sm rounded-full flex items-center justify-center z-10 group-hover:bg-gray-100 transition-colors">
          <FaArrowUp className="text-gray-800 text-sm md:text-base group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default CircularScrollProgressBar;
