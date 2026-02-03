import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import rbuLogo from '@/assets/rbu-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, duration = 2500 }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    const timeout = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Logo Container */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full scale-150" />
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl p-2">
            <img 
              src={rbuLogo} 
              alt="RBU Logo" 
              className="w-28 h-28 md:w-36 md:h-36 object-contain animate-pulse"
            />
          </div>
        </div>
      </div>

      {/* University Name */}
      <div className="text-center mb-8 relative z-10">
        <h1 
          className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Ramdeobaba University
        </h1>
        <p className="text-lg md:text-xl text-primary font-medium">
          Smart E-Notice Board
        </p>
        <p className="text-sm md:text-base text-white/70 mt-1">
          Nagpur, Maharashtra
        </p>
      </div>

      {/* Loading Bar */}
      <div className="w-64 md:w-80 relative z-10">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-center mt-4 gap-2">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm text-white/60">Loading...</span>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-white/40">
          © 2024 Ramdeobaba University. All rights reserved.
        </p>
        <p className="text-xs text-white/30 mt-1">
          B.Tech Semester Project
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
