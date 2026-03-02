import React, { useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading2,
    Minus,
    Eye,
    PenLine,
} from 'lucide-react';

// Shared markdown renderer used in both the preview pane and on the TV display.
// Uses inline styles throughout to be immune to Tailwind preflight resets.
const MdPreview: React.FC<{ children: string; muted?: boolean }> = ({ children, muted = false }) => {
    const color = muted ? 'rgba(148,163,184,1)' : 'inherit'; // slate-400 for preview
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p:      ({ children: c }) => <p style={{ display: 'block', marginBottom: '0.65em', color }}>{c}</p>,
                strong: ({ children: c }) => <strong style={{ fontWeight: 700, color: 'hsl(var(--foreground))' }}>{c}</strong>,
                em:     ({ children: c }) => <em style={{ fontStyle: 'italic', opacity: 0.85, color }}>{c}</em>,
                h1:     ({ children: c }) => <div style={{ display: 'block', fontWeight: 800, fontSize: '1.3em', color: 'hsl(var(--foreground))', marginBottom: '0.4em', marginTop: '0.7em' }}>{c}</div>,
                h2:     ({ children: c }) => <div style={{ display: 'block', fontWeight: 700, fontSize: '1.12em', color: 'hsl(var(--foreground))', marginBottom: '0.35em', marginTop: '0.6em' }}>{c}</div>,
                h3:     ({ children: c }) => <div style={{ display: 'block', fontWeight: 600, fontSize: '1.05em', color: 'hsl(var(--foreground))', marginBottom: '0.3em', marginTop: '0.5em' }}>{c}</div>,
                ul:     ({ children: c }) => <ul style={{ display: 'block', marginBottom: '0.65em', marginTop: '0.2em', paddingLeft: '1.4em', listStyleType: 'disc' }}>{c}</ul>,
                ol:     ({ children: c }) => <ol style={{ display: 'block', marginBottom: '0.65em', marginTop: '0.2em', paddingLeft: '1.6em', listStyleType: 'decimal' }}>{c}</ol>,
                li:     ({ children: c }) => <li style={{ display: 'list-item', marginBottom: '0.3em', color }}>{c}</li>,
                hr:     () => <hr style={{ display: 'block', border: 'none', borderTop: '1px solid rgba(255,255,255,0.12)', margin: '0.9em 0' }} />,
            }}
        >
            {children}
        </ReactMarkdown>
    );
};

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    id?: string;
    minRows?: number;
}

type ToolbarAction =
    | { type: 'wrap'; before: string; after: string; placeholder: string }
    | { type: 'line-prefix'; prefix: string }
    | { type: 'insert'; text: string };

const TOOLBAR: { label: string; icon: React.FC<{ className?: string }>; action: ToolbarAction; title: string }[] = [
    {
        label: 'Bold', icon: Bold, title: 'Bold (Ctrl+B)',
        action: { type: 'wrap', before: '**', after: '**', placeholder: 'bold text' },
    },
    {
        label: 'Italic', icon: Italic, title: 'Italic (Ctrl+I)',
        action: { type: 'wrap', before: '_', after: '_', placeholder: 'italic text' },
    },
    {
        label: 'Heading', icon: Heading2, title: 'Heading',
        action: { type: 'line-prefix', prefix: '## ' },
    },
    {
        label: 'Bullet List', icon: List, title: 'Bullet List',
        action: { type: 'line-prefix', prefix: '- ' },
    },
    {
        label: 'Numbered List', icon: ListOrdered, title: 'Numbered List',
        action: { type: 'line-prefix', prefix: '1. ' },
    },
    {
        label: 'Divider', icon: Minus, title: 'Horizontal Divider',
        action: { type: 'insert', text: '\n---\n' },
    },
];

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
    value,
    onChange,
    placeholder = 'Enter description...',
    required = false,
    id,
    minRows = 8,
}) => {
    const [mode, setMode] = React.useState<'edit' | 'preview'>('edit');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea to fit content
    const resize = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        const lineH = parseInt(getComputedStyle(el).lineHeight) || 22;
        const minH = lineH * minRows;
        el.style.height = Math.max(minH, el.scrollHeight) + 'px';
    }, [minRows]);

    useEffect(() => { resize(); }, [value, resize]);

    // Apply a toolbar action to the textarea
    const applyAction = useCallback((action: ToolbarAction) => {
        const el = textareaRef.current;
        if (!el) return;
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const text = value;

        let newText = text;
        let newStart = start;
        let newEnd = end;

        if (action.type === 'wrap') {
            const selected = text.slice(start, end) || action.placeholder;
            newText = text.slice(0, start) + action.before + selected + action.after + text.slice(end);
            newStart = start + action.before.length;
            newEnd = newStart + selected.length;
        } else if (action.type === 'line-prefix') {
            // Find the beginning of the current line
            const lineStart = text.lastIndexOf('\n', start - 1) + 1;
            const line = text.slice(lineStart, end);
            // Check if prefix already applied — toggle off
            if (line.startsWith(action.prefix)) {
                newText = text.slice(0, lineStart) + line.slice(action.prefix.length) + text.slice(end);
                newStart = start - action.prefix.length;
                newEnd = end - action.prefix.length;
            } else {
                newText = text.slice(0, lineStart) + action.prefix + line + text.slice(end);
                newStart = start + action.prefix.length;
                newEnd = end + action.prefix.length;
            }
        } else if (action.type === 'insert') {
            newText = text.slice(0, start) + action.text + text.slice(end);
            newStart = newEnd = start + action.text.length;
        }

        onChange(newText);
        // Restore cursor after React re-render
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(newStart, newEnd);
        });
    }, [value, onChange]);

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            applyAction({ type: 'wrap', before: '**', after: '**', placeholder: 'bold text' });
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            applyAction({ type: 'wrap', before: '_', after: '_', placeholder: 'italic text' });
        }
        // Auto-continue list items on Enter
        if (e.key === 'Enter') {
            const el = e.currentTarget;
            const pos = el.selectionStart;
            const textBefore = value.slice(0, pos);
            const lastLine = textBefore.split('\n').at(-1) ?? '';

            const bulletMatch = lastLine.match(/^(\s*)([-*+]\s)/);
            const numberedMatch = lastLine.match(/^(\s*)(\d+)\.\s/);

            if (bulletMatch) {
                e.preventDefault();
                const insert = '\n' + bulletMatch[1] + bulletMatch[2];
                onChange(value.slice(0, pos) + insert + value.slice(el.selectionEnd));
                requestAnimationFrame(() => {
                    el.setSelectionRange(pos + insert.length, pos + insert.length);
                });
            } else if (numberedMatch) {
                e.preventDefault();
                const nextNum = parseInt(numberedMatch[2]) + 1;
                const insert = '\n' + numberedMatch[1] + nextNum + '. ';
                onChange(value.slice(0, pos) + insert + value.slice(el.selectionEnd));
                requestAnimationFrame(() => {
                    el.setSelectionRange(pos + insert.length, pos + insert.length);
                });
            }
        }
    }, [value, onChange, applyAction]);

    return (
        <div className="rounded-lg border border-border overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/40 flex-wrap">
                {TOOLBAR.map(({ label, icon: Icon, action, title }) => (
                    <button
                        key={label}
                        type="button"
                        title={title}
                        onMouseDown={(e) => {
                            e.preventDefault(); // keep focus in textarea
                            applyAction(action);
                        }}
                        className="p-1.5 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                ))}
                {/* Spacer */}
                <div className="flex-1" />
                {/* Edit / Preview toggle */}
                <button
                    type="button"
                    title="Edit"
                    onClick={() => setMode('edit')}
                    className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors',
                        mode === 'edit'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                >
                    <PenLine className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                    type="button"
                    title="Preview"
                    onClick={() => setMode('preview')}
                    className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors',
                        mode === 'preview'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                >
                    <Eye className="h-3.5 w-3.5" /> Preview
                </button>
            </div>

            {/* ── Editor / Preview pane ────────────────────────────────────── */}
            {mode === 'edit' ? (
                <textarea
                    ref={textareaRef}
                    id={id}
                    value={value}
                    onChange={(e) => { onChange(e.target.value); resize(); }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    required={required}
                    className={cn(
                        'w-full bg-transparent px-4 py-3 text-sm leading-[1.7]',
                        'resize-none outline-none font-sans',
                        'placeholder:text-muted-foreground',
                        'min-h-[12rem]',
                    )}
                    style={{ height: 'auto' }}
                    spellCheck
                />
            ) : (
                <div className="px-4 py-3 min-h-[12rem] text-sm leading-[1.7]">
                    {value.trim() ? (
                        <MdPreview muted>{value}</MdPreview>
                    ) : (
                        <p className="text-muted-foreground italic">Nothing to preview yet...</p>
                    )}
                </div>
            )}

            {/* Helper hint */}
            <div className="px-3 py-1.5 border-t border-border bg-muted/20 text-[0.68rem] text-muted-foreground flex gap-4">
                <span>**bold**</span>
                <span>_italic_</span>
                <span>- bullet</span>
                <span>1. numbered</span>
                <span>## heading</span>
                <span>---  divider</span>
                <span className="ml-auto">Ctrl+B / Ctrl+I</span>
            </div>
        </div>
    );
};
