import { useState, useEffect } from "react";

const Loader = ({ onComplete }: { onComplete?: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Keep it fast and linear to eliminate visual lag/delays
    const duration = 800;
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progressTime = timestamp - startTime;
      
      const linearProgress = Math.min(progressTime / duration, 1);
      setProgress(linearProgress * 100);

      if (linearProgress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [onComplete]);

  const radius = 80;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 w-full h-full flex justify-center items-center bg-white/95 backdrop-blur-sm z-[9999]">
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Subtle Background Glow effect */}
        <div className="absolute w-40 h-40 bg-blue-400/10 blur-3xl rounded-full"></div>

        <div className="relative flex justify-center items-center">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform -rotate-90 drop-shadow-sm"
          >
            {/* Background Track */}
            <circle
              stroke="#f1f5f9" // slate-100
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Animated Progress */}
            <circle
              stroke="url(#progress-gradient)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EA580C" /> {/* blue-500 */}
                <stop offset="100%" stopColor="#EA580C" /> {/* indigo-500 */}
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Metrics Content */}
          <div className="absolute flex flex-col items-center justify-center -mb-1">
            <div className="flex items-baseline">
              <span 
                className="text-4xl font-light text-slate-800 tracking-tighter" 
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {Math.round(progress)}
              </span>
              <span className="text-xl font-light text-slate-400 ml-1 opacity-70">
                %
              </span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mt-1 ml-1 opacity-80">
              Loading
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Loader;
