import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AutoScrollTextProps {
    content: string;
    className?: string;
    speed?: number; // pixels per second
    style?: React.CSSProperties;
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
            ul: ({ children: c }) => <ul style={{ display: 'inline-block', marginBottom: '0.6em', marginTop: '0.2em', paddingLeft: '1.4em', listStyleType: 'disc', textAlign: 'left' }}>{c}</ul>,
            ol: ({ children: c }) => <ol style={{ display: 'inline-block', marginBottom: '0.6em', marginTop: '0.2em', paddingLeft: '1.6em', listStyleType: 'decimal', textAlign: 'left' }}>{c}</ol>,
            li: ({ children: c }) => <li style={{ display: 'list-item', marginBottom: '0.3em' }}>{c}</li>,
            hr: () => <hr style={{ display: 'block', border: 'none', borderTop: '1px solid currentColor', opacity: 0.15, margin: '0.8em 0' }} />,
            table: ({ children: c }) => (
                <div style={{ overflowX: 'auto', marginBottom: '1em', marginTop: '0.5em', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid currentColor', fontSize: '0.9em' }}>
                        {c}
                    </table>
                </div>
            ),
            thead: ({ children: c }) => <thead style={{ backgroundColor: 'rgba(128, 128, 128, 0.15)', fontWeight: 800 }}>{c}</thead>,
            th: ({ children: c }) => <th style={{ border: '1px solid currentColor', padding: '0.6em 0.8em', textAlign: 'left', fontWeight: 800 }}>{c}</th>,
            td: ({ children: c }) => <td style={{ border: '1px solid currentColor', padding: '0.5em 0.8em' }}>{c}</td>,
            tr: ({ children: c }) => <tr style={{ borderBottom: '1px solid currentColor' }}>{c}</tr>,
        }}
    >
        {children}
    </ReactMarkdown>
);

export const AutoScrollText: React.FC<AutoScrollTextProps> = ({ content, className = '', speed = 30, style }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    // scrollDistance > 0 triggers the CSS scroll animation
    const [scrollDistance, setScrollDistance] = useState(0);
    const [duration, setDuration] = useState(0);
    const [animKey, setAnimKey] = useState(0); // force re-trigger when content changes
    const gap = 32;

    useEffect(() => {
        const checkScroll = () => {
            if (containerRef.current && contentRef.current) {
                const containerHeight = containerRef.current.clientHeight;
                const measuredContentHeight = contentRef.current.scrollHeight;
                if (measuredContentHeight > containerHeight + 10) {
                    const dist = measuredContentHeight + gap;
                    setScrollDistance(dist);
                    setDuration(dist / speed);
                } else {
                    setScrollDistance(0);
                    setDuration(0);
                }
            }
        };

        // Re-measure after a short delay to let layout settle, then restart animation
        const timeoutId = setTimeout(() => {
            checkScroll();
            setAnimKey(k => k + 1);
        }, 120);
        const observer = new ResizeObserver(checkScroll);
        if (containerRef.current) observer.observe(containerRef.current);
        if (contentRef.current) observer.observe(contentRef.current);
        return () => { clearTimeout(timeoutId); observer.disconnect(); };
    }, [content, speed]);

    // Build the CSS keyframe animation string dynamically.
    // We inject it via a <style> tag so we can parameterise the pixel distance,
    // avoiding the need for Framer Motion's JS timer loop entirely.
    const animName = `tvscroll-${animKey}-${Math.round(scrollDistance)}`;

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden w-full h-full ${className}`}
            style={{
                ...(style || {}),
                ...(scrollDistance > 0 ? {
                    maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                } : {}),
            }}
        >
            {/* Pure CSS keyframe animation — zero JS per frame, GPU-composited */}
            {scrollDistance > 0 && (
                <style>{`
                  @keyframes ${animName} {
                    0%   { transform: translateY(0); }
                    100% { transform: translateY(-${scrollDistance}px); }
                  }
                `}</style>
            )}
            <div
                key={animKey}
                style={scrollDistance > 0 ? {
                    animation: `${animName} ${duration.toFixed(2)}s ${speed > 0 ? 1 : 0}s linear infinite`,
                    willChange: 'transform',
                } : {}}
            >
                <div ref={contentRef}>
                    <MdContent>{content}</MdContent>
                </div>
                {scrollDistance > 0 && (
                    <div style={{ marginTop: `${gap}px` }}>
                        <MdContent>{content}</MdContent>
                    </div>
                )}
            </div>
        </div>
    );
};
