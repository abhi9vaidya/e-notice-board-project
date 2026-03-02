/**
 * Extract and summarise text from an image or PDF using Google Gemini 1.5 Flash.
 *
 * Setup (one-time, free):
 *  1. Go to https://aistudio.google.com/app/apikey
 *  2. Click "Create API key" — no billing needed.
 *  3. Add to your .env:  VITE_GEMINI_API_KEY=your_key_here
 *
 * Note: The API key is exposed in the browser bundle. This is acceptable for
 * a college project; for production, proxy through a backend function.
 */
export async function extractTextFromFile(base64Data: string, fileType: 'image' | 'pdf'): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not set. Add it to your .env file (get a free key at aistudio.google.com).');
  }

  // Strip data-URL prefix if present
  let cleanBase64 = base64Data;
  let mimeType = 'image/jpeg';
  if (base64Data.includes(',')) {
    const header = base64Data.split(',')[0]; // e.g. "data:application/pdf;base64"
    const match = header.match(/data:([^;]+);/);
    if (match) mimeType = match[1];
    cleanBase64 = base64Data.split(',')[1];
  } else if (fileType === 'pdf') {
    mimeType = 'application/pdf';
  }

  const prompt =
    'You are helping a college faculty member create a notice board post. ' +
    'Extract the key information from this document and write a clear, concise summary ' +
    'suitable for a notice board (2–5 sentences). Focus on: what, when, where, who it is for, ' +
    'and any deadlines or important details. Do not include headings or bullet points — plain paragraph text only.';

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: cleanBase64 } },
        ],
      },
    ],
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error (${res.status})`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response.');
  return text.trim();
}
