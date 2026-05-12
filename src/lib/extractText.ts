/**
 * Extract and summarise text from an image using Groq's free vision API
 * (meta-llama/llama-4-scout-17b-16e-instruct).
 *
 * Setup (one-time, free — no credit card needed):
 *  1. Go to https://console.groq.com/keys
 *  2. Sign in with Google and click "Create API key".
 *  3. Add to your .env:  VITE_GROQ_API_KEY=your_key_here
 *
 * Limitations:
 *  - Images only (JPEG, PNG, WebP, GIF). PDFs are not supported by Groq vision.
 *  - Free tier: 30 req/min, 6 000 req/day — plenty for a college project.
 *
 * Note: The API key is exposed in the browser bundle. Acceptable for a college
 * project; for production, proxy through a backend function.
 */
export interface ExtractedNotice {
  title: string;
  description: string;
  links: string[];
}

interface PDFJSGlobal {
  getDocument: (args: { data: Uint8Array }) => {
    promise: Promise<{
      numPages: number;
      getPage: (pageNo: number) => Promise<{
        getViewport: (args: { scale: number }) => { width: number; height: number };
        render: (args: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> };
      }>;
    }>;
  };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
}

interface WindowWithPDFJS extends Window {
  pdfjsLib?: PDFJSGlobal;
}

/**
 * Loads the PDF.js library dynamically from CDN to avoid bundler/worker issues in React/Vite.
 */
const loadPdfJs = (): Promise<PDFJSGlobal> => {
  return new Promise((resolve, reject) => {
    const customWindow = window as unknown as WindowWithPDFJS;
    if (customWindow.pdfjsLib) {
      resolve(customWindow.pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = customWindow.pdfjsLib;
      if (!pdfjsLib) {
        reject(new Error('PDF.js loaded but pdfjsLib global object was not found.'));
        return;
      }
      // Configure CDN worker path
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js library from CDN. Check your connection.'));
    document.head.appendChild(script);
  });
};

/**
 * Converts the first page of a PDF file to a high-quality Base64 JPEG data URL.
 */
export async function convertPdfToImage(pdfFile: File): Promise<string> {
  const pdfjsLib = await loadPdfJs();
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async function() {
      try {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        // Load document
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        
        if (pdf.numPages === 0) {
          throw new Error('This PDF has no pages.');
        }

        // Get the first page
        const page = await pdf.getPage(1);

        // Render at a high resolution (scale 2.0) for optimal Groq Vision text extraction/OCR accuracy
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Failed to create canvas 2D context.');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        
        // Export to a compressed JPEG data URL for optimal upload performance with Groq
        const base64Image = canvas.toDataURL('image/jpeg', 0.85);
        resolve(base64Image);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error processing PDF document. Please try again.';
        reject(new Error(message));
      }
    };
    fileReader.onerror = () => reject(new Error('Failed to read PDF file from disk.'));
    fileReader.readAsArrayBuffer(pdfFile);
  });
}

export async function extractTextFromFile(base64Data: string, fileType: 'image' | 'pdf'): Promise<ExtractedNotice> {

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GROQ_API_KEY is not set. Add it to your .env file (get a free key at console.groq.com/keys).');
  }

  // Normalise to a proper data URL
  let imageUrl = base64Data;
  if (!base64Data.startsWith('data:')) {
    imageUrl = `data:image/jpeg;base64,${base64Data}`;
  } else if (base64Data.startsWith('data:;base64,')) {
    imageUrl = base64Data.replace('data:;base64,', 'data:image/jpeg;base64,');
  }

  const prompt =
    'You are helping a college faculty member create a notice board post from the attached document.\n' +
    'Respond in EXACTLY this format with no extra text before or after:\n\n' +
    'TITLE: <5-10 word descriptive title, no punctuation at the end>\n\n' +
    'DESCRIPTION:\n' +
    '<markdown description here>\n\n' +
    'Rules for the TITLE:\n' +
    '- Short (5–10 words), descriptive, easy to understand at a glance.\n' +
    '- Captures the main purpose/event (e.g. "Machine Learning Internship – Uptricks Services").\n\n' +
    'Rules for the DESCRIPTION (raw Markdown):\n' +
    '1. Start with a short one-line summary paragraph (no heading).\n' +
    '2. Then use "## " headings to group related details (## Details, ## Schedule, ## Venue, ## Important Dates, ## Eligibility, ## How to Apply — use only what is relevant).\n' +
    '3. Under each heading use bullet points ("- ") for individual facts. Keep each bullet concise.\n' +
    '4. Use **bold** for names, dates, deadlines, and key values.\n' +
    '5. Leave a blank line between every section.\n' +
    '6. Do NOT include any URLs or hyperlinks inside the description. If there is a registration link or any URL, put it ONLY in the LINKS section below.\n' +
    '7. Do NOT wrap output in a code block.\n' +
    '8. Do NOT omit any meaningful detail from the document.\n\n' +
    'After the DESCRIPTION section, if the document contains any URLs (registration links, form links, website links, etc.), add:\n' +
    'LINKS:\n' +
    '<one full URL per line, label on same line separated by | e.g.  https://example.com | Registration Form>\n' +
    'If there are no links, omit the LINKS section entirely.';

  const body = {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 1024,
    temperature: 0.3,
  };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API error (${res.status})`);
  }

  const data = await res.json();
  const raw: string | undefined = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Groq returned an empty response.');

  // Parse the TITLE: / DESCRIPTION: / LINKS: delimiter format
  const titleMatch = raw.match(/^TITLE:\s*(.+)/m);

  // Description: everything between DESCRIPTION: and either LINKS: or end of string
  const descMatch = raw.match(/DESCRIPTION:\s*\n([\s\S]+?)(?=\nLINKS:|$)/);

  // Links section: each line after LINKS:
  const linksMatch = raw.match(/LINKS:\s*\n([\s\S]+)$/);
  const links: string[] = linksMatch
    ? linksMatch[1]
        .split('\n')
        .map(line => line.split('|')[0].trim())   // take URL part before optional label
        .filter(line => /^https?:\/\//i.test(line)) // only valid http(s) URLs
    : [];

  const title = titleMatch ? titleMatch[1].trim() : '';
  let description = descMatch ? descMatch[1].trim() : raw.trim();

  // Extra safety: strip any leftover URLs from description text
  description = description.replace(/https?:\/\/\S+/gi, '').replace(/[ \t]+$/gm, '').trim();

  return { title, description, links };
}
