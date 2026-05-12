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
    'You are helping a college faculty member create an extremely clear, professional, and visually engaging notice board post from the attached document.\n' +
    'The output description MUST be easy to read at a glance from a distance on a TV display screen.\n\n' +
    'Respond in EXACTLY this format with no extra text before or after:\n\n' +
    'TITLE: <5-10 word descriptive, punchy title, no punctuation at the end>\n\n' +
    'DESCRIPTION:\n' +
    '<markdown description here>\n\n' +
    'Rules for the TITLE:\n' +
    '- Capitalize key words, keep it very punchy and clear (e.g., "Grand Campus Hackathon 2026 – Register Now!").\n' +
    '- Limit to 5-10 words maximum so it fits perfectly on screen headers.\n\n' +
    'Rules for the DESCRIPTION (raw Markdown):\n' +
    '1. Start with a short, highly engaging 1-2 sentence overview paragraph (no heading, no bullets) summarizing the entire notice.\n' +
    '2. Use "## " headings with professional emojis for grouping details logically. Only use the relevant sections below:\n' +
    '   ## Schedule & Timings\n' +
    '   ## Venue & Location\n' +
    '   ## Eligibility Criteria\n' +
    '   ## How to Apply / Register\n' +
    '   ## Registration Fees & Charges\n' +
    '   ## Prizes, Awards & Benefits\n' +
    '   ## Contact Details & Helpdesk\n' +
    '3. Under each heading, write concise, high-impact bullet points ("- "). Avoid long paragraphs.\n' +
    '4. Use **bolding** strategically on critical details like dates, times, deadlines, venues, fee amounts, and names.\n' +
    '5. Keep sentences short, active, and engaging for students.\n' +
    '6. Do NOT include any raw URLs or links in the description. Put them ONLY in the LINKS section below.\n' +
    '7. Do NOT wrap output in markdown code blocks (no ```).\n' +
    '8. Ensure all crucial academic or scheduling details are perfectly preserved.\n\n' +
    'After the DESCRIPTION section, if the document contains any URLs (registration links, forms, websites, etc.), add:\n' +
    'LINKS:\n' +
    '<one full URL per line, label on same line separated by | e.g.  https://example.com | Registration Form>\n' +
    'If there are no links, omit the LINKS section entirely.';

  const body = {
    model: 'llama-3.2-11b-vision-preview',
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
    temperature: 0.35,
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
