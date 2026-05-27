"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, ChevronDown, AlertCircle, Check, ExternalLink, BookOpen } from "lucide-react";
import { jsPDF } from "jspdf";
import { MarkdownContent } from "@/app/lib/markdown";
import { fetchReview } from "@/app/lib/api";

const RESOURCES = [
  {
    title: "Hidden Markov Neural Networks",
    authors: "Rimella & Whiteley",
    venue: "Entropy, 2025, 27(2), 168",
    doi: "10.3390/e27020168",
    url: "https://doi.org/10.3390/e27020168",
  },
  {
    title: "Speech and Language Processing",
    authors: "Jurafsky & Martin",
    venue: "SLP3, Appendix A — HMM Formalism",
    url: "https://web.stanford.edu/~jurafsky/slp3/",
  },
  {
    title: "Pattern Recognition and Machine Learning",
    authors: "Bishop",
    venue: "Springer, 2006 — Ch. 10 (Variational Inference), Ch. 13 (HMMs)",
    url: "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/",
  },
  {
    title: "Viterbi Algorithm",
    authors: "Viterbi, A.",
    venue: "IEEE Trans. Info. Theory, 1967",
    url: "https://ieeexplore.ieee.org/document/1054010",
  },
];

function stripMarkdown(md: string): string {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s*/gm, "")
    .replace(/\|/g, "")
    .replace(/^---+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function mdToHtml(md: string): string {
  const lines = md.split("\n");
  let html = "";
  let inList = false;

  for (const line of lines) {
    const t = line.trim();

    if (t.startsWith("# ")) {
      html += `<h1>${t.slice(2)}</h1>\n`;
    } else if (t.startsWith("## ")) {
      html += `<h2>${t.slice(3)}</h2>\n`;
    } else if (t.startsWith("### ")) {
      html += `<h3>${t.slice(4)}</h3>\n`;
    } else if (t.startsWith("> ")) {
      html += `<blockquote>${t.slice(2)}</blockquote>\n`;
    } else if (t.startsWith("- ") || t.startsWith("* ")) {
      if (!inList) { html += "<ul>\n"; inList = true; }
      html += `  <li>${t.slice(2)}</li>\n`;
    } else if (t === "" && inList) {
      html += "</ul>\n";
      inList = false;
    } else if (t.startsWith("|")) {
      const cells = t.split("|").filter(c => c.trim());
      if (!t.includes("---")) {
        html += `<tr>${cells.map(c => `<td>${c.trim()}</td>`).join("")}</tr>\n`;
      }
    } else if (/^---+$/.test(t)) {
      html += "<hr />\n";
    } else if (t) {
      html += `<p>${t}</p>\n`;
    }
  }
  if (inList) html += "</ul>\n";

  const title = md.match(/^#\s+(.+)/m)?.[1] || "Paper Review";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6;font-size:14px}
h1{font-size:1.4em;margin-top:1.5em}h2{font-size:1.15em;margin-top:1.5em}h3{font-size:1em;margin-top:1.2em}
p{margin:0.6em 0}ul{margin:0.6em 0;padding-left:1.5em}li{margin:0.2em 0}
hr{border:none;border-top:1px solid #ddd;margin:1.5em 0}
blockquote{border-left:3px solid #ddd;margin:0.6em 0;padding-left:1em;color:#666}
table{border-collapse:collapse;width:100%;margin:0.6em 0}
td,th{border:1px solid #ddd;padding:6px 10px;text-align:left;font-size:13px}
code{background:#f4f4f4;padding:1px 4px;border-radius:3px;font-size:13px}
a{color:#2563eb;text-decoration:underline}
</style></head><body>\n${html}\n</body></html>`;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Review() {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchReview()
      .then((content) => {
        setContent(content);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not connect to server. Make sure the backend is running.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const downloadMd = useCallback(() => {
    if (!content) return;
    downloadBlob(content, "hmm-paper-review.md", "text/markdown");
    setMenuOpen(false);
  }, [content]);

  const downloadTxt = useCallback(() => {
    if (!content) return;
    downloadBlob(stripMarkdown(content), "hmm-paper-review.txt", "text/plain");
    setMenuOpen(false);
  }, [content]);

  const downloadDoc = useCallback(() => {
    if (!content) return;
    downloadBlob(mdToHtml(content), "hmm-paper-review.doc", "application/msword");
    setMenuOpen(false);
  }, [content]);

  const downloadPdf = useCallback(() => {
    if (!content) return;
    const text = stripMarkdown(content);
    const doc = new jsPDF("p", "pt", "a4");
    const margin = 50;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    let y = margin;
    const lines = text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        y += 12;
        continue;
      }
      const wrapped = doc.splitTextToSize(trimmed, maxWidth);
      for (const w of wrapped) {
        if (y + 14 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(w, margin, y);
        y += 14;
      }
    }
    doc.save("hmm-paper-review.pdf");
    setMenuOpen(false);
  }, [content]);

  const copyContent = useCallback(() => {
    if (!content) return;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
    setMenuOpen(false);
  }, [content]);

  return (
    <div className="min-h-screen bg-[#070708] transition-colors">
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#070708]/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex items-center gap-4">
            {content && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-1.5 text-xs bg-white/[0.03] hover:bg-white/[0.06] border rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${menuOpen ? "text-white/70 bg-white/[0.06] border-blue-400/30" : "text-white/40 border-white/[0.06]"}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                  <ChevronDown className={`w-3 h-3 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#0c0c0d] border border-white/[0.08] rounded-lg shadow-lg shadow-black/40 overflow-hidden animate-fade-in">
                    <button onClick={downloadPdf} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors text-left">
                      <span className="text-red-400 font-semibold w-5">PDF</span>
                      PDF Document
                    </button>
                    <button onClick={downloadMd} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors text-left border-t border-white/[0.04]">
                      <span className="text-blue-400 font-semibold w-5">.md</span>
                      Markdown
                    </button>
                    <button onClick={downloadTxt} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors text-left border-t border-white/[0.04]">
                      <span className="text-white/40 font-semibold w-5">.txt</span>
                      Plain Text
                    </button>
                    <button onClick={downloadDoc} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors text-left border-t border-white/[0.04]">
                      <span className="text-blue-500 font-semibold w-5">.doc</span>
                      Word Document
                    </button>
                    <div className="border-t border-white/[0.04]" />
                    <button onClick={copyContent} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.04] transition-colors text-left">
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      )}
                      {copied ? "Copied!" : "Copy to clipboard"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        {loading && (
          <div className="space-y-5 animate-pulse">
            <div className="h-6 bg-white/[0.04] rounded w-3/4" />
            <div className="h-4 bg-white/[0.04] rounded w-1/2" />
            <div className="h-4 bg-white/[0.04] rounded w-2/3" />
            <div className="h-px bg-white/[0.06]" />
            <div className="h-5 bg-white/[0.04] rounded w-1/4" />
            <div className="space-y-2.5">
              <div className="h-3.5 bg-white/[0.04] rounded w-full" />
              <div className="h-3.5 bg-white/[0.04] rounded w-11/12" />
              <div className="h-3.5 bg-white/[0.04] rounded w-4/5" />
              <div className="h-3.5 bg-white/[0.04] rounded w-full" />
              <div className="h-3.5 bg-white/[0.04] rounded w-3/4" />
            </div>
            <div className="h-5 bg-white/[0.04] rounded w-1/3" />
            <div className="space-y-2.5">
              <div className="h-3.5 bg-white/[0.04] rounded w-full" />
              <div className="h-3.5 bg-white/[0.04] rounded w-5/6" />
              <div className="h-3.5 bg-white/[0.04] rounded w-9/12" />
              <div className="h-3.5 bg-white/[0.04] rounded w-full" />
            </div>
            <div className="h-px bg-white/[0.06]" />
            <div className="h-5 bg-white/[0.04] rounded w-2/5" />
            <div className="grid grid-cols-4 gap-3">
              <div className="h-16 bg-white/[0.04] rounded" />
              <div className="h-16 bg-white/[0.04] rounded" />
              <div className="h-16 bg-white/[0.04] rounded" />
              <div className="h-16 bg-white/[0.04] rounded" />
            </div>
            <div className="h-3.5 bg-white/[0.04] rounded w-7/12" />
            <div className="h-3.5 bg-white/[0.04] rounded w-2/3" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {content && (
          <>
            <MarkdownContent content={content} />

            <div className="border-t border-white/[0.06]" />

            <section className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-white/50" />
                </div>
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Resources &amp; References</span>
              </div>
              <div className="grid gap-2">
                {RESOURCES.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{r.title}</span>
                        <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{r.authors}</p>
                      <p className="text-[11px] text-white/30 mt-0.5">{r.venue}{r.doi ? ` · ${r.doi}` : ""}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section className="flex items-center gap-2 text-xs text-white/20 border-t border-white/[0.06] pt-4">
              <FileText className="w-3.5 h-3.5" />
              <span>Source:</span>
              <span className="font-mono text-white/30">server/reviews/paper-review.md</span>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-center">
          <p className="text-[11px] text-white/20">HMM POS Tagger &middot; Python, FastAPI, Next.js, NumPy &amp; Pandas</p>
        </div>
      </footer>
    </div>
  );
}
