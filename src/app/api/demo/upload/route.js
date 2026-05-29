import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function isExcel(file, name) {
  return (
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-excel' ||
    name.toLowerCase().endsWith('.xlsx') ||
    name.toLowerCase().endsWith('.xls')
  );
}

async function extractExcel(buffer) {
  const XLSX = (await import('xlsx')).default;
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const lines = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim()) {
      lines.push(`[Sheet: ${sheetName}]\n${csv}`);
    }
  }

  return lines.join('\n\n');
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided.' }, { status: 400 });
    }

    const texts = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const name = file.name || 'document';
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfParse = (await import('pdf-parse')).default;
          const data = await pdfParse(buffer);
          texts.push(`[${name}]\n${data.text.slice(0, 8000)}`);
        } catch {
          texts.push(`[${name}] — PDF could not be parsed. Please try a text (.txt) version.`);
        }
      } else if (isExcel(file, name)) {
        try {
          const raw = await extractExcel(buffer);
          texts.push(`[${name}]\n${raw.slice(0, 8000)}`);
        } catch {
          texts.push(`[${name}] — Excel file could not be parsed.`);
        }
      } else {
        texts.push(`[${name}]\n${buffer.toString('utf-8').slice(0, 8000)}`);
      }
    }

    if (texts.length === 0) {
      return NextResponse.json({ error: 'No readable content found in uploaded files.' }, { status: 400 });
    }

    return NextResponse.json({ text: texts.join('\n\n---\n\n'), fileCount: texts.length });
  } catch (err) {
    console.error('[upload]', err.message);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
