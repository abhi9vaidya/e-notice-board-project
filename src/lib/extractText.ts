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
export async function extractTextFromFile(base64Data: string, fileType: 'image' | 'pdf'): Promise<string> {
  if (fileType === 'pdf') {
    throw new Error(
      'PDF extraction is not supported with the Groq vision API. Please upload a JPG or PNG screenshot of the document instead.'
    );
  }

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
    'You are helping a college faculty member create a notice board post. ' +
    'Extract ALL key information from this document and format it as clean, well-structured raw Markdown. ' +
    'Follow these rules strictly:\n' +
    '1. Start with a short one-line summary paragraph (no heading).\n' +
    '2. Then use "## " headings to group related details (e.g. ## Details, ## Schedule, ## Venue, ## Important Dates, ## Eligibility, ## How to Apply — use only what is relevant).\n' +
    '3. Under each heading use bullet points ("- ") for individual facts. Keep each bullet concise.\n' +
    '4. Use **bold** for names, dates, deadlines, and important values.\n' +
    '5. Leave a blank line between every section.\n' +
    '6. Do NOT wrap output in a code block. Output raw Markdown only.\n' +
    '7. Do NOT omit any meaningful detail from the document.';

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
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned an empty response.');
  return text.trim();
}
