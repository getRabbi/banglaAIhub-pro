export const SITE = {
  name: "BanglaAIHub",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com",
  description: "বাংলায় সেরা AI টুলস ডিরেক্টরি — অনলাইন আয়, AI টুলস রিভিউ, টেক গাইড",
  fb: "https://facebook.com/BanglaAIHub",
};

export const BLOG_CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  "money-making": { label: "অনলাইন আয়", emoji: "💰", color: "emerald" },
  "ai-tools": { label: "AI টুলস", emoji: "🤖", color: "violet" },
  "tech-news": { label: "টেক নিউজ", emoji: "📡", color: "blue" },
  "product-review": { label: "প্রোডাক্ট রিভিউ", emoji: "🚀", color: "amber" },
};

export const PRICING_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "ফ্রি", color: "emerald" },
  freemium: { label: "ফ্রিমিয়াম", color: "blue" },
  paid: { label: "পেইড", color: "orange" },
  enterprise: { label: "এন্টারপ্রাইজ", color: "purple" },
};

export const BADGE_LABELS: Record<string, { label: string; emoji: string; icon: string }> = {
  editors_choice: { label: "সম্পাদকের পছন্দ", emoji: "⭐", icon: "⭐" },
  "editors-choice": { label: "সম্পাদকের পছন্দ", emoji: "⭐", icon: "⭐" },
  trending: { label: "ট্রেন্ডিং", emoji: "🔥", icon: "🔥" },
  new: { label: "নতুন", emoji: "✨", icon: "✨" },
  popular: { label: "জনপ্রিয়", emoji: "❤️", icon: "❤️" },
  best_value: { label: "সেরা মূল্য", emoji: "💎", icon: "💎" },
  "best-value": { label: "সেরা মূল্য", emoji: "💎", icon: "💎" },
};

export const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit", x: "X/Twitter", hackernews: "Hacker News", producthunt: "Product Hunt", manual: "BanglaAIHub",
};

export const SOURCE_MAP = SOURCE_LABELS;

export function formatBnDate(date: string) {
  return new Date(date).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export function formatBnDateShort(date: string) {
  return new Date(date).toLocaleDateString("bn-BD", { month: "short", day: "numeric" });
}

export const formatBanglaDate = formatBnDate;
export const formatBanglaDateShort = formatBnDateShort;

export function estimateReadTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 180));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function stripMarkdown(value: string): string {
  return value
    .replace(/[`*_~>#-]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function headingId(text: string): string {
  const base = stripMarkdown(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return base || `section-${Math.abs(text.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0))}`;
}

function renderInline(value: string): string {
  let html = escapeHtml(value);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g, (_match, label, href) => {
    const safeHref = String(href).replace(/&amp;/g, "&");
    return `<a href="${escapeAttr(safeHref)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  return html;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

export function extractMarkdownHeadings(md: string): { id: string; text: string; level: number }[] {
  return (md || "")
    .split(/\r?\n/)
    .map((line) => line.match(/^(#{2,3})\s+(.+)$/))
    .filter(Boolean)
    .map((match) => {
      const [, marks, text] = match as RegExpMatchArray;
      const cleanText = stripMarkdown(text);
      return { id: headingId(cleanText), text: cleanText, level: marks.length };
    });
}

export function mdToHtml(md: string): string {
  const lines = (md || "").replace(/\r\n/g, "\n").trim().split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${renderInline(paragraph.join(" ").replace(/\s+/g, " ").trim())}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) return;
    html.push(`<${listType}>${listItems.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${listType}>`);
    listType = null;
    listItems = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(3, heading[1].length);
      const text = stripMarkdown(heading[2]);
      html.push(`<h${level} id="${escapeAttr(headingId(text))}">${renderInline(text)}</h${level}>`);
      continue;
    }

    if (line.includes("|") && lines[i + 1] && isTableDivider(lines[i + 1])) {
      flushParagraph();
      flushList();
      const headers = splitTableRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      i -= 1;
      html.push(
        `<div class="table-scroll"><table><thead><tr>${headers.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead><tbody>${rows
          .map((row) => `<tr>${headers.map((_, index) => `<td>${renderInline(row[index] || "")}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (listType !== "ul") flushList();
      listType = "ul";
      listItems.push(bullet[1]);
      continue;
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      flushParagraph();
      if (listType !== "ol") flushList();
      listType = "ol";
      listItems.push(numbered[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}

export const formatMarkdown = mdToHtml;
