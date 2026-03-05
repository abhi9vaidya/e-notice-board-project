import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AutoScrollTextProps {
    content: string;
    className?: string;
    speed?: number; // pixels per second
}

// Markdown prose wrapper — all spacing done via explicit inline styles on
// each element so Tailwind preflight resets can't strip them.
// Uses 'inherit' for text colors so the parent className controls the palette.
const MdContent: React.FC<{ children: string }> = ({ children }) => (
    <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
            p: ({ children: c }) => <p style={{ display: 'block', marginBottom: '0.6em' }}>{c}</p>,
            strong: ({ children: c }) => <strong style={{ fontWeight: 700, color: 'inherit' }}>{c}</strong>,
            em: ({ children: c }) => <em style={{ fontStyle: 'italic', opacity: 0.9 }}>{c}</em>,
            h1: ({ children: c }) => <div style={{ display: 'block', fontWeight: 900, fontSize: '1.35em', marginBottom: '0.4em', marginTop: '0.6em', color: 'inherit' }}>{c}</div>,
            h2: ({ children: c }) => <div style={{ display: 'block', fontWeight: 800, fontSize: '1.15em', marginBottom: '0.35em', marginTop: '0.5em', color: 'inherit' }}>{c}</div>,
            h3: ({ children: c }) => <div style={{ display: 'block', fontWeight: 700, fontSize: '1.05em', marginBottom: '0.3em', marginTop: '0.4em', color: 'inherit', opacity: 0.9 }}>{c}</div>,
            ul: ({ children: c }) => <ul style={{ display: 'block', marginBottom: '0.6em', marginTop: '0.2em', paddingLeft: '1.4em', listStyleType: 'disc' }}>{c}</ul>,
            ol: ({ children: c }) => <ol style={{ display: 'block', marginBottom: '0.6em', marginTop: '0.2em', paddingLeft: '1.6em', listStyleType: 'decimal' }}>{c}</ol>,
            li: ({ children: c }) => <li style={{ display: 'list-item', marginBottom: '0.3em' }}>{c}</li>,
            hr: () => <hr style={{ display: 'block', border: 'none', borderTop: '1px solid currentColor', opacity: 0.15, margin: '0.8em 0' }} />,
        }}
    >
        {children}
    </ReactMarkdown>
);

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
                    setScrollDistance(contentHeight - containerHeight + 60);
                } else {
                    setScrollDistance(0);
                }
            }
        };

        const timeoutId = setTimeout(checkScroll, 100);
        const observer = new ResizeObserver(checkScroll);
        if (containerRef.current) observer.observe(containerRef.current);
        if (contentRef.current) observer.observe(contentRef.current);
        return () => { clearTimeout(timeoutId); observer.disconnect(); };
    }, [content]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden w-full h-full ${className}`}
            style={scrollDistance > 0 ? {
                maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
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
                className={scrollDistance > 0 ? 'pb-16 will-change-transform' : ''}
            >
                <MdContent>{content}</MdContent>
            </motion.div>
        </div>
    );
};
