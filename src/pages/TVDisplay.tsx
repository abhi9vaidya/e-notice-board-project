import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notice } from '@/integrations/firebase/types';
import { useActiveNotices } from '@/hooks/useFirebaseNotices';
import { Badge } from '@/components/ui/badge';
import {
  Wifi,
  WifiOff,
  Clock,
  User,
  Briefcase,
  BookOpen,
  FolderKanban,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreHorizontal,
  Flame,
  Calendar,
  Bell,
  GraduationCap,
  FileText,
  Trophy,
  Megaphone,
  Users,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInHours, differenceInMinutes, isTomorrow } from 'date-fns';
import rbuLogo from '@/assets/rbu-logo.png';

// categories with icons
const categoryConfig: Record<string, { icon: React.ElementType; label: string; gradient: string }> = {
  academic: { icon: GraduationCap, label: 'Academic', gradient: 'from-blue-500 to-cyan-600' },
  examinations: { icon: FileText, label: 'Examinations', gradient: 'from-red-500 to-rose-600' },
  placements: { icon: Briefcase, label: 'Placements', gradient: 'from-orange-500 to-amber-600' },
  events: { icon: Sparkles, label: 'Events', gradient: 'from-violet-500 to-purple-600' },
  announcements: { icon: Megaphone, label: 'Announcements', gradient: 'from-emerald-500 to-teal-600' },
  other: { icon: MoreHorizontal, label: 'Other', gradient: 'from-slate-500 to-gray-600' },
};

const TVDisplay: React.FC = () => {
  const { notices: activeNotices, loading } = useActiveNotices();
  const [urgentSlideIndex, setUrgentSlideIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());

  // check if deadline is close
  const isDeadlineApproaching = useCallback((notice: Notice): boolean => {
    const hoursLeft = differenceInHours(new Date(notice.endTime), new Date());
    return hoursLeft >= 0 && hoursLeft <= 4;
  }, []);

  // get time left
  const getTimeRemaining = useCallback((notice: Notice): string | null => {
    const now = new Date();
    const endTime = new Date(notice.endTime);
    const hoursLeft = differenceInHours(endTime, now);
    const minutesLeft = differenceInMinutes(endTime, now) % 60;

    if (hoursLeft < 0) return null;
    if (hoursLeft === 0 && minutesLeft <= 0) return null;

    if (hoursLeft <= 4) {
      if (hoursLeft === 0) {
        return `${minutesLeft}m left`;
      }
      return `${hoursLeft}h ${minutesLeft}m left`;
    }
    return null;
  }, []);

  // filter and sort notices
  const displayNotices = useMemo(() => {
    if (!activeNotices) return [];

    return activeNotices
      .sort((a, b) => {
        const aApproaching = isDeadlineApproaching(a);
        const bApproaching = isDeadlineApproaching(b);
        if (aApproaching && !bApproaching) return -1;
        if (!aApproaching && bApproaching) return 1;

        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }

        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      });
  }, [activeNotices, isDeadlineApproaching]);

  // split urgent and normal
  const { urgentNotices, normalNotices, tomorrowNotices } = useMemo(() => {
    const urgent = displayNotices.filter(n =>
      n.priority === 'high' || isDeadlineApproaching(n)
    );
    const normal = displayNotices.filter(n =>
      n.priority !== 'high' && !isDeadlineApproaching(n)
    );
    const tomorrow = displayNotices.filter(n => {
      const startDate = new Date(n.startTime);
      return isTomorrow(startDate);
    });
    return { urgentNotices: urgent, normalNotices: normal, tomorrowNotices: tomorrow };
  }, [displayNotices, isDeadlineApproaching]);

  // check if new
  const isRecent = useCallback((notice: Notice): boolean => {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    return new Date(notice.updatedAt) > fiveHoursAgo;
  }, []);

  // auto slide
  useEffect(() => {
    if (urgentNotices.length <= 1) return;

    const slideInterval = setInterval(() => {
      setUrgentSlideIndex((prev) =>
        (prev + 1) % urgentNotices.length
      );
    }, 6000);

    return () => clearInterval(slideInterval);
  }, [urgentNotices.length]);

  // update time
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // get icons
  const getCategoryConfig = (category: string) => {
    return categoryConfig[category] || categoryConfig.other;
  };

  // render big card
  const renderUrgentCard = (notice: Notice) => {
    const config = getCategoryConfig(notice.category);
    const CategoryIcon = config.icon;
    const timeRemaining = getTimeRemaining(notice);

    return (
      <motion.div
        key={notice.id}
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative h-full rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)',
          boxShadow: '0 0 60px rgba(243, 111, 39, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* border effect */}
        <div className="absolute inset-0 rounded-2xl">
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(243, 111, 39, 0.4) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0%', '-200% 0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <div
            className="absolute inset-0 rounded-2xl"
            style={{ border: '1px solid rgba(243, 111, 39, 0.4)' }}
          />
        </div>

        {/* top highlight */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{
            background: 'linear-gradient(90deg, #F36F27, #FAA292, #F36F27)',
            boxShadow: '0 0 20px rgba(243, 111, 39, 0.6)'
          }}
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* time left badge */}
        {timeRemaining && (
          <motion.div
            className="absolute top-6 right-6 z-10"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-lg text-white"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #F36F27 100%)',
                boxShadow: '0 0 30px rgba(220, 38, 38, 0.5)'
              }}
            >
              <Flame className="h-5 w-5" />
              {timeRemaining}
            </div>
          </motion.div>
        )}

        <div className="relative p-8 h-full flex flex-col">
          {/* Header badges */}
          <div className="flex items-center gap-3 mb-6">
            <div className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r', config.gradient)}>
              <CategoryIcon className="h-5 w-5" />
              {notice.customCategory || config.label}
            </div>
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            >
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  boxShadow: '0 0 15px rgba(220, 38, 38, 0.4)'
                }}
              >
                <Zap className="h-5 w-5" />
                URGENT
              </div>
            </motion.div>
            {isRecent(notice) && (
              <div
                className="px-4 py-2 rounded-lg font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #F36F27 0%, #FAA292 100%)' }}
              >
                ✨ NEW
              </div>
            )}
          </div>

          {/* card content */}
          <div className="flex-1 flex items-center gap-8">
            {notice.imageUrl && (
              <motion.div
                className="w-80 h-52 rounded-xl overflow-hidden shrink-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}
              >
                <img
                  src={notice.imageUrl}
                  alt={notice.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
            <div className="flex-1 min-w-0">
              <h2
                className="text-5xl font-bold text-white mb-5 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
              >
                {notice.title}
              </h2>
              <p className="text-2xl text-slate-300 leading-relaxed line-clamp-3">
                {notice.description}
              </p>
            </div>
          </div>

          {/* card footer */}
          <div
            className="flex items-center justify-between mt-6 pt-5"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <div className="flex items-center gap-3 text-slate-400">
              <User className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium">{notice.facultyName}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-lg font-medium">Deadline: {format(new Date(notice.endTime), 'dd MMM, h:mm a')}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // render small card
  const renderNormalCard = (notice: Notice, index: number) => {
    const config = getCategoryConfig(notice.category);
    const CategoryIcon = config.icon;

    return (
      <motion.div
        key={notice.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="rounded-xl p-5 h-full"
        style={{
          background: 'linear-gradient(145deg, rgba(20, 30, 50, 0.9) 0%, rgba(15, 20, 35, 0.95) 100%)',
          border: '1px solid rgba(100, 116, 139, 0.2)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-white font-medium bg-gradient-to-r', config.gradient)}>
            <CategoryIcon className="h-4 w-4" />
            {notice.customCategory || config.label}
          </div>
          <div
            className="px-3 py-1.5 rounded-md text-sm font-medium"
            style={{
              background: notice.priority === 'medium' ? 'rgba(243, 111, 39, 0.2)' : 'rgba(100, 116, 139, 0.2)',
              color: notice.priority === 'medium' ? '#FAA292' : '#94a3b8'
            }}
          >
            {notice.priority === 'medium' ? 'IMPORTANT' : 'INFO'}
          </div>
        </div>

        <h3
          className="text-xl font-bold text-white mb-2 line-clamp-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {notice.title}
        </h3>
        <p className="text-slate-400 line-clamp-2 mb-4 text-base">
          {notice.description}
        </p>

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {notice.facultyName}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {format(new Date(notice.endTime), 'dd MMM')}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #050a14 50%, #0a1628 100%)'
      }}
    >
      {/* header bar */}
      <motion.header
        className="relative px-8 py-5 flex items-center justify-between shrink-0"
        style={{
          background: 'linear-gradient(90deg, rgba(10, 22, 40, 0.95) 0%, rgba(20, 35, 60, 0.9) 50%, rgba(10, 22, 40, 0.95) 100%)',
          borderBottom: '1px solid rgba(243, 111, 39, 0.25)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* logo and name */}
        <motion.div
          className="flex items-center gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* RBU Logo - Fixed Top Left */}
          <div
            className="h-16 w-16 rounded-xl flex items-center justify-center p-1.5"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(243, 111, 39, 0.4)',
              boxShadow: '0 0 20px rgba(243, 111, 39, 0.15)'
            }}
          >
            <img
              src={rbuLogo}
              alt="RBU Logo"
              className="h-13 w-13 object-contain"
            />
          </div>

          <div>
            <h1
              className="text-3xl font-bold text-white tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
            >
              Ramdeobaba University
            </h1>
            <p
              className="text-base font-semibold tracking-widest uppercase"
              style={{ color: '#F36F27' }}
            >
              Faculty E-Notice Board • Nagpur
            </p>
          </div>
        </motion.div>

        {/* status bar */}
        <motion.div
          className="flex items-center gap-5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* refresh icon */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
            style={{
              background: 'rgba(30, 40, 60, 0.8)',
              border: '1px solid rgba(100, 116, 139, 0.2)'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="h-4 w-4" style={{ color: '#F36F27' }} />
            </motion.div>
            <span className="text-slate-400 hidden lg:inline">Auto-refresh</span>
          </div>

          {/* live or offline */}
          <motion.div
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold',
            )}
            style={{
              background: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: isOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: isOnline ? '#10b981' : '#ef4444'
            }}
            animate={isOnline ? {} : { scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isOnline ? 'Live' : 'Offline'}
          </motion.div>

          {/* clock */}
          <div
            className="text-right rounded-xl px-6 py-3"
            style={{
              background: 'rgba(30, 40, 60, 0.8)',
              border: '1px solid rgba(243, 111, 39, 0.3)',
              boxShadow: '0 0 20px rgba(243, 111, 39, 0.1)'
            }}
          >
            <motion.div
              className="text-3xl font-bold tabular-nums tracking-wider"
              style={{ color: '#F36F27', textShadow: '0 0 15px rgba(243, 111, 39, 0.4)' }}
              key={format(currentTime, 'ss')}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
            >
              {format(currentTime, 'HH:mm:ss')}
            </motion.div>
            <div className="text-sm text-slate-400 tracking-wide">
              {format(currentTime, 'EEEE, dd MMM yyyy')}
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* main notices list */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
        {displayNotices.length === 0 ? (
          <motion.div
            className="h-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-8"
              >
                <div
                  className="h-44 w-44 mx-auto rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 40, 60, 0.9) 0%, rgba(20, 30, 50, 0.95) 100%)',
                    border: '1px solid rgba(243, 111, 39, 0.4)',
                    boxShadow: '0 0 40px rgba(243, 111, 39, 0.15)'
                  }}
                >
                  <img src={rbuLogo} alt="RBU" className="h-36 w-36 object-contain" />
                </div>
              </motion.div>
              <h2
                className="text-5xl font-bold text-white mb-4"
                style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
              >
                No Active Notices
              </h2>
              <p className="text-2xl text-slate-500">Check back later for updates</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* priority list */}
            {urgentNotices.length > 0 && (
              <motion.section
                className="shrink-0 h-[48%] min-h-[300px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Zap className="h-7 w-7" style={{ color: '#F36F27' }} />
                  </motion.div>
                  <h2
                    className="text-2xl font-bold text-white tracking-wide"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Priority Notices
                  </h2>
                  <div
                    className="px-4 py-1.5 rounded-full font-bold text-lg"
                    style={{
                      background: 'linear-gradient(135deg, #F36F27 0%, #FAA292 100%)',
                      color: 'white'
                    }}
                  >
                    {urgentNotices.length}
                  </div>
                  {urgentNotices.length > 1 && (
                    <span className="text-slate-500 text-base ml-2">
                      {urgentSlideIndex + 1} / {urgentNotices.length}
                    </span>
                  )}
                </div>

                <div className="relative h-[calc(100%-3.5rem)]">
                  <AnimatePresence mode="wait">
                    {urgentNotices[urgentSlideIndex] && renderUrgentCard(urgentNotices[urgentSlideIndex])}
                  </AnimatePresence>

                  {/* side buttons */}
                  {urgentNotices.length > 1 && (
                    <>
                      <button
                        onClick={() => setUrgentSlideIndex(prev => prev === 0 ? urgentNotices.length - 1 : prev - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                        style={{
                          background: 'rgba(30, 40, 60, 0.9)',
                          border: '1px solid rgba(243, 111, 39, 0.3)',
                          boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <ChevronLeft className="h-7 w-7" />
                      </button>
                      <button
                        onClick={() => setUrgentSlideIndex(prev => (prev + 1) % urgentNotices.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                        style={{
                          background: 'rgba(30, 40, 60, 0.9)',
                          border: '1px solid rgba(243, 111, 39, 0.3)',
                          boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <ChevronRight className="h-7 w-7" />
                      </button>
                    </>
                  )}

                  {/* dots at bottom */}
                  {urgentNotices.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                      {urgentNotices.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setUrgentSlideIndex(index)}
                          className="transition-all duration-300"
                          style={{
                            height: '10px',
                            width: index === urgentSlideIndex ? '40px' : '10px',
                            borderRadius: '5px',
                            background: index === urgentSlideIndex
                              ? 'linear-gradient(90deg, #F36F27, #FAA292)'
                              : 'rgba(100, 116, 139, 0.4)',
                            boxShadow: index === urgentSlideIndex ? '0 0 15px rgba(243, 111, 39, 0.5)' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* normal list */}
            {normalNotices.length > 0 && (
              <motion.section
                className="flex-1 min-h-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Bell className="h-6 w-6 text-slate-400" />
                  <h2
                    className="text-xl font-bold text-white tracking-wide"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Latest Notices
                  </h2>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ background: 'rgba(100, 116, 139, 0.3)', color: '#94a3b8' }}
                  >
                    {normalNotices.length}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 h-[calc(100%-3rem)] overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    {normalNotices.slice(0, 3).map((notice, index) => renderNormalCard(notice, index))}
                  </AnimatePresence>
                </div>
              </motion.section>
            )}
          </>
        )}
      </div>

      {/* bottom scroll */}
      <motion.div
        className="shrink-0 py-5 overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, rgba(10, 22, 40, 0.98) 0%, rgba(243, 111, 39, 0.08) 50%, rgba(10, 22, 40, 0.98) 100%)',
          borderTop: '1px solid rgba(243, 111, 39, 0.35)',
          boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.3)'
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center gap-4 px-8 mb-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Calendar className="h-6 w-6" style={{ color: '#F36F27' }} />
          </motion.div>
          <span
            className="text-base font-bold uppercase tracking-[0.2em]"
            style={{ color: '#F36F27' }}
          >
            Tomorrow's Notices
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(90deg, rgba(243, 111, 39, 0.5) 0%, transparent 100%)' }}
          />
        </div>

        <div className="relative overflow-hidden h-12">
          {tomorrowNotices.length > 0 ? (
            <motion.div
              className="flex items-center gap-20 whitespace-nowrap absolute"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                duration: Math.max(tomorrowNotices.length * 10, 20),
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              {/* Duplicate notices for seamless loop */}
              {[...tomorrowNotices, ...tomorrowNotices].map((notice, index) => {
                const config = getCategoryConfig(notice.category);
                return (
                  <div key={`${notice.id}-${index}`} className="flex items-center gap-4">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: '#F36F27', boxShadow: '0 0 10px rgba(243, 111, 39, 0.6)' }}
                    />
                    <span className="text-xl text-white font-semibold">{notice.title}</span>
                    <span
                      className={cn('px-3 py-1 rounded-md text-sm font-medium text-white bg-gradient-to-r', config.gradient)}
                    >
                      {notice.customCategory || config.label}
                    </span>
                    <span className="text-slate-400 text-lg">
                      {format(new Date(notice.startTime), 'h:mm a')}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-xl text-slate-500">No notices scheduled for tomorrow</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TVDisplay;
