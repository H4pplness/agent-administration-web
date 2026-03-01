import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Lightweight Markdown → HTML pipe.
 * Handles: headings, bold, italic, inline code, code blocks, tables, lists, HR, paragraphs.
 */
@Pipe({ name: 'markdown', standalone: true })
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | null | undefined): SafeHtml {
    const html = this.parse(value ?? '');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ── Main parser ────────────────────────────────────────────────────────────

  private parse(md: string): string {
    const lines = md.split('\n');
    const out: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Fenced code block
      if (line.startsWith('```')) {
        const lang = line.slice(3).trim();
        const code: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          code.push(lines[i]);
          i++;
        }
        out.push(
          `<pre class="bg-gray-900 text-green-300 rounded-xl p-4 text-xs font-mono overflow-x-auto my-3 leading-relaxed">`
          + `<code>${this.esc(code.join('\n'))}</code></pre>`
        );
        i++; // skip closing ```
        continue;
      }

      // Horizontal rule
      if (/^(---|\*\*\*|___)\s*$/.test(line)) {
        out.push('<hr class="border-gray-200 my-5">');
        i++;
        continue;
      }

      // Headings
      const h1 = line.match(/^# (.+)/);
      if (h1) {
        out.push(`<h1 class="text-2xl font-bold text-gray-900 mt-6 mb-3">${this.inline(h1[1])}</h1>`);
        i++; continue;
      }
      const h2 = line.match(/^## (.+)/);
      if (h2) {
        out.push(`<h2 class="text-base font-bold text-gray-800 mt-6 mb-2 border-b border-gray-200 pb-1">${this.inline(h2[1])}</h2>`);
        i++; continue;
      }
      const h3 = line.match(/^### (.+)/);
      if (h3) {
        out.push(`<h3 class="text-sm font-semibold text-gray-700 mt-4 mb-1.5">${this.inline(h3[1])}</h3>`);
        i++; continue;
      }

      // Table (line starts with |)
      if (line.startsWith('|')) {
        const tableLines: string[] = [line];
        i++;
        while (i < lines.length && lines[i].trimStart().startsWith('|')) {
          tableLines.push(lines[i]);
          i++;
        }
        out.push(this.parseTable(tableLines));
        continue;
      }

      // Unordered list
      if (/^[-*] /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^[-*] /.test(lines[i])) {
          items.push(`<li class="flex items-start gap-1.5"><span class="text-indigo-400 mt-0.5">•</span><span>${this.inline(lines[i].slice(2))}</span></li>`);
          i++;
        }
        out.push(`<ul class="space-y-1 my-2 text-gray-700 text-sm">${items.join('')}</ul>`);
        continue;
      }

      // Ordered list
      if (/^\d+\. /.test(line)) {
        const items: string[] = [];
        let n = 1;
        while (i < lines.length && /^\d+\. /.test(lines[i])) {
          const text = lines[i].replace(/^\d+\. /, '');
          items.push(`<li class="flex items-start gap-2"><span class="text-indigo-500 font-mono text-xs mt-0.5 min-w-[1.2rem]">${n++}.</span><span>${this.inline(text)}</span></li>`);
          i++;
        }
        out.push(`<ol class="space-y-1 my-2 text-gray-700 text-sm">${items.join('')}</ol>`);
        continue;
      }

      // Blank line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Paragraph
      out.push(`<p class="text-sm text-gray-700 leading-relaxed my-2">${this.inline(line)}</p>`);
      i++;
    }

    return out.join('\n');
  }

  // ── Table parser ───────────────────────────────────────────────────────────

  private parseTable(lines: string[]): string {
    // Remove separator rows (e.g. |---|---|)
    const dataLines = lines.filter(l => !/^\|[\s\-:|]+\|$/.test(l.trim()));
    if (dataLines.length === 0) return '';

    const parseRow = (line: string): string[] =>
      line.split('|').slice(1, -1).map(c => c.trim());

    const [headerLine, ...bodyLines] = dataLines;
    const headers = parseRow(headerLine);

    const thead = `<thead class="bg-gray-50"><tr>${
      headers.map(h => `<th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 border-b border-gray-200">${this.inline(h)}</th>`).join('')
    }</tr></thead>`;

    const tbody = bodyLines.map(row => {
      const cells = parseRow(row);
      return `<tr class="border-b border-gray-100 hover:bg-gray-50/50">${
        cells.map(c => `<td class="px-3 py-2 text-sm text-gray-700">${this.inline(c)}</td>`).join('')
      }</tr>`;
    }).join('');

    return `<div class="overflow-x-auto my-4 rounded-xl border border-gray-200">
      <table class="w-full text-sm">${thead}<tbody>${tbody}</tbody></table>
    </div>`;
  }

  // ── Inline formatting ──────────────────────────────────────────────────────

  private inline(text: string): string {
    // Escape HTML first
    let s = this.esc(text);
    // Bold
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    // Italic
    s = s.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    // Inline code
    s = s.replace(/`([^`]+)`/g, '<code class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
    // Links [text](url)
    s = s.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-indigo-600 hover:underline" target="_blank" rel="noopener">$1</a>');
    return s;
  }

  private esc(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
