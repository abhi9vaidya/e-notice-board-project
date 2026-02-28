import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AutoScrollTextProps {
    content: string;
    className?: string;
    speed?: number; // pixels per second
}

export const AutoScrollText: React.FC<AutoScrollTextProps> = ({ content, className = '', speed = 30 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [scrollDistance, setScrollDistance] = useState(0);

    useEffect(() => {
        const checkScroll = () => {
            if (containerRef.current && contentRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const contentHeight = contentRef.current.scrollHeight;

                if (contentHeight > containerHeight + 10) {
                    setScrollDistance(contentHeight - containerHeight + 60); // Padding at the bottom
                } else {
                    setScrollDistance(0);
                }
            }
        };

        const timeoutId = setTimeout(checkScroll, 100);

        const observer = new ResizeObserver(checkScroll);
        if (containerRef.current) observer.observe(containerRef.current);
        if (contentRef.current) observer.observe(contentRef.current);

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, [content]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden w-full h-full ${className}`}
            style={scrollDistance > 0 ? {
                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
            } : {}}
        >
            <motion.div
                ref={contentRef}
                initial={{ y: 0 }}
                animate={{ y: scrollDistance > 0 ? -scrollDistance : 0 }}
                transition={scrollDistance > 0 ? {
                    duration: scrollDistance / speed,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatType: 'reverse',
                    repeatDelay: 2,
                    delay: 2,
                } : {}}
                className={scrollDistance > 0 ? "pb-16 will-change-transform" : ""}
            >
                {content}
            </motion.div>
        </div>
    );
};
