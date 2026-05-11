const fs = require('fs');
let content = fs.readFileSync('src/components/TVNoticePreview.tsx', 'utf8');

const startMarker = '// ── URL helpers';
const endMarker = '// ── Shared media panel renderer';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const prefix = content.substring(0, startIndex);
    const suffix = content.substring(endIndex);
    const newContent = prefix + "import { isPdfUrl, toDisplayImageUrl } from '@/lib/mediaUtils';\n\n" + suffix;
    fs.writeFileSync('src/components/TVNoticePreview.tsx', newContent);
    console.log('Successfully replaced lines in TVNoticePreview.tsx');
} else {
    console.error('Markers not found');
}
