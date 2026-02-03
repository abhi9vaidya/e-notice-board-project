import React, { useState, useEffect, useCallback } from 'react';
import { Notice } from '@/types/notice';
import NoticeCard from './NoticeCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoticeSliderProps {
  notices: Notice[];
  isRecent: (notice: Notice) => boolean;
  onEdit?: (notice: Notice) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
  autoPlay?: boolean;
  interval?: number;
}

const NoticeSlider: React.FC<NoticeSliderProps> = ({
  notices,
  isRecent,
  onEdit,
  onDelete,
  readOnly = false,
  autoPlay = true,
  interval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % notices.length);
  }, [notices.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + notices.length) % notices.length);
  }, [notices.length]);

  useEffect(() => {
    if (!isPlaying || notices.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [isPlaying, interval, nextSlide, notices.length]);

  if (notices.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No notices to display</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main Slider */}
      <div className="relative overflow-hidden rounded-xl">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {notices.map((notice) => (
            <div key={notice.id} className="w-full flex-shrink-0 px-2">
              <NoticeCard
                notice={notice}
                isRecent={isRecent(notice)}
                onEdit={onEdit}
                onDelete={onDelete}
                readOnly={readOnly}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      {notices.length > 1 && (
        <>
          {/* Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm shadow-lg"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/90 backdrop-blur-sm shadow-lg"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots & Play/Pause */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              {notices.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full transition-all duration-300',
                    currentIndex === index
                      ? 'bg-primary w-6'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NoticeSlider;
