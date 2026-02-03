import { supabase } from '@/integrations/supabase/client';

export async function extractTextFromFile(base64Data: string, fileType: 'image' | 'pdf'): Promise<string> {
  // Remove the data URL prefix if present
  let cleanBase64 = base64Data;
  if (base64Data.includes(',')) {
    cleanBase64 = base64Data.split(',')[1];
  }

  const { data, error } = await supabase.functions.invoke('extract-text', {
    body: { base64Data: cleanBase64, fileType },
  });

  if (error) {
    console.error('Extract text error:', error);
    throw new Error(error.message || 'Failed to extract text');
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to extract text');
  }

  return data.text;
}
