"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const API_URL = "http://localhost:8000";

const TAG_COLORS: Record<string, string> = {
  NOUN: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
  VERB: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700",
  ADJ: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700",
  ADV: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700",
  DET: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700",
  ADP: "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/40 dark:text-pink-300 dark:border-pink-700",
  PRON: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700",
  CCONJ: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700",
  SCONJ: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-700",
  PART: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700",
  AUX: "bg-lime-100 text-lime-800 border-lime-300 dark:bg-lime-900/40 dark:text-lime-300 dark:border-lime-700",
  NUM: "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/40 dark:text-cyan-300 dark:border-cyan-700",
  PROPN: "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-700",
  PUNCT: "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600",
  INTJ: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700",
  SYM: "bg-stone-100 text-stone-600 border-stone-300 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-600",
  X: "bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600",
};

const SAMPLES = [
  "The quick brown fox jumps over the lazy dog",
  "I love natural language processing",
  "She sells seashells by the seashore",
  "The cat sat on the mat",
  "Natural language processing is a fascinating field of artificial intelligence",
];

interface TagResult {
  word: string;
  tag: string;
  confidence: number;
}

interface ModelInfo {
  vocab_size: number;
  num_tags: number;
  tags: string[];
  dev_accuracy: number | null;
}

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);
    const codeMatch = remaining.match(/`(.+?)`/);

    let earliest = remaining.length;
    let match: RegExpMatchArray | null = null;
    let type: "bold" | "link" | "code" = "bold";

    for (const [t, m] of [["bold", boldMatch], ["link", linkMatch], ["code", codeMatch]] as const) {
      if (m && m.index! < earliest) {
        earliest = m.index!;
        match = m;
        type = t;
      }
    }

    if (!match) {
      parts.push(remaining);
      break;
    }

    if (match.index! > 0) {
      parts.push(remaining.slice(0, match.index));
    }

    if (type === "bold") {
      parts.push(<strong key={key++}>{match[1]}</strong>);
    } else if (type === "link") {
      parts.push(<a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">{match[1]}</a>);
    } else if (type === "code") {
      parts.push(<code key={key++} className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm font-mono">{match[1]}</code>);
    }

    remaining = remaining.slice(earliest + match[0].length);
  }

  return parts;
}

function MarkdownContent({ content }: { content: string }) {
  const elements = useMemo(() => {
    const lines = content.split("\n");
    const result: React.ReactNode[] = [];
    let key = 0;
    let i = 0;

    const addParagraph = (text: string) => {
      if (text.trim()) {
        result.push(<p key={key++} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3">{renderInline(text.trim())}</p>);
      }
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === "") {
        i++;
        continue;
      }

      if (/^#{1,6}\s/.test(trimmed)) {
        const level = trimmed.match(/^#+/)![0].length;
        const text = trimmed.replace(/^#+\s+/, "");
        const Tag = `h${Math.min(level, 3)}` as keyof JSX.IntrinsicElements;
        const size = level === 1 ? "text-xl font-bold" : level === 2 ? "text-lg font-semibold" : "text-base font-semibold";
        result.push(<Tag key={key++} className={`${size} text-gray-900 dark:text-gray-100 mt-5 mb-2`}>{renderInline(text)}</Tag>);
        i++;
        continue;
      }

      if (/^---+$/.test(trimmed)) {
        result.push(<hr key={key++} className="my-4 border-gray-300 dark:border-gray-600" />);
        i++;
        continue;
      }

      if (trimmed.startsWith("> ")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("> ")) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
          i++;
        }
        result.push(
          <blockquote key={key++} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 mb-3">
            {quoteLines.map((q, qi) => <p key={qi} className="text-sm">{renderInline(q)}</p>)}
          </blockquote>
        );
        continue;
      }

      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
          items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i++;
        }
        result.push(
          <ul key={key++} className="list-disc pl-6 mb-3 space-y-1">
            {items.map((item, ii) => <li key={ii} className="text-sm text-gray-700 dark:text-gray-300">{renderInline(item)}</li>)}
          </ul>
        );
        continue;
      }

      if (/^\d+\.\s/.test(trimmed)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
          i++;
        }
        result.push(
          <ol key={key++} className="list-decimal pl-6 mb-3 space-y-1">
            {items.map((item, ii) => <li key={ii} className="text-sm text-gray-700 dark:text-gray-300">{renderInline(item)}</li>)}
          </ol>
        );
        continue;
      }

      if (trimmed.includes("|") && trimmed.startsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }
        if (tableLines.length >= 2) {
          const headerCells = tableLines[0].split("|").filter(c => c.trim()).map(c => c.trim());
          const bodyRows = tableLines.slice(2);
          result.push(
            <div key={key++} className="overflow-x-auto mb-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    {headerCells.map((cell, ci) => <th key={ci} className="px-3 py-2 text-left font-semibold text-gray-800 dark:text-gray-200">{renderInline(cell)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, ri) => (
                    <tr key={ri} className="border-b border-gray-200 dark:border-gray-700">
                      {row.split("|").filter(c => c.trim()).map((cell, ci) => <td key={ci} className="px-3 py-2 text-gray-700 dark:text-gray-300">{renderInline(cell.trim())}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      if (trimmed.startsWith("|")) {
        i++;
        continue;
      }

      addParagraph(trimmed);
      i++;
    }

    return result;
  }, [content]);

  return <div>{elements}</div>;
}

export default function Home() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const [result, setResult] = useState<TagResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [reviewContent, setReviewContent] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    fetch(`${API_URL}/info`)
      .then((r) => r.json())
      .then(setModelInfo)
      .catch(() => {});
  }, []);

  const tagSentence = useCallback(async (sentence: string) => {
    if (!sentence.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sentence }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResult(data.result);
    } catch {
      setError("Could not connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    tagSentence(text);
  }, []);

  const loadReview = async () => {
    if (reviewContent) {
      setShowReview(!showReview);
      return;
    }
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_URL}/review`);
      const data = await res.json();
      setReviewContent(data.content || "No review available.");
      setShowReview(true);
    } catch {
      setReviewContent("Failed to load the paper review. Make sure the backend is running.");
      setShowReview(true);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 transition-colors">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-gray-800 px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">HMM POS Tagger</h1>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Hidden Markov Model Part-of-Speech Tagging
            </p>
          </div>
          <div className="flex items-center gap-4">
            {modelInfo && (
              <div className="hidden sm:flex gap-4 text-xs text-slate-500 dark:text-gray-400">
                <span>Vocab: {modelInfo.vocab_size.toLocaleString()}</span>
                <span>Tags: {modelInfo.num_tags}</span>
                {modelInfo.dev_accuracy !== null && (
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {(modelInfo.dev_accuracy * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            )}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-slate-200 dark:border-gray-800 p-6 mb-6 transition-colors">
          <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
            Enter a sentence to tag:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-slate-300 dark:border-gray-700 rounded-lg px-4 py-3 text-slate-800 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
            rows={3}
            placeholder="Type a sentence..."
          />
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => tagSentence(text)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-blue-400 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? "Tagging..." : "Tag Sentence"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {result && result.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-slate-200 dark:border-gray-800 p-6 mb-6 transition-colors">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
              Tagged Output
            </h2>
            <div className="flex flex-wrap gap-2">
              {result.map((item, i) => (
                <div
                  key={i}
                  className={`border rounded-lg px-3 py-2 text-sm ${getTagColor(item.tag)}`}
                  title={`confidence: ${(item.confidence * 100).toFixed(1)}%`}
                >
                  <span className="font-medium">{item.word}</span>
                  <span className="ml-1.5 font-mono text-xs opacity-70">
                    /{item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-slate-200 dark:border-gray-800 p-6 mb-6 transition-colors">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
            Try a sample
          </h2>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setText(s);
                  tagSentence(s);
                }}
                className="text-sm bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 rounded-lg px-3 py-2 text-slate-600 dark:text-gray-400 transition-colors"
              >
                {s.length > 50 ? s.slice(0, 50) + "..." : s}
              </button>
            ))}
          </div>
        </div>

        {modelInfo && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-slate-200 dark:border-gray-800 p-6 mb-6 transition-colors">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
              Model Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {modelInfo.vocab_size.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 dark:text-gray-400">Vocabulary Size</div>
              </div>
              <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {modelInfo.num_tags}
                </div>
                <div className="text-xs text-slate-500 dark:text-gray-400">POS Tags</div>
              </div>
              <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {modelInfo.dev_accuracy !== null
                    ? `${(modelInfo.dev_accuracy * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
                <div className="text-xs text-slate-500 dark:text-gray-400">Dev Accuracy</div>
              </div>
              <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="text-lg font-bold text-slate-800 dark:text-white font-mono text-xs flex flex-wrap gap-1">
                  {modelInfo.tags.slice(0, 8).join(", ")}
                  {modelInfo.tags.length > 8 && "..."}
                </div>
                <div className="text-xs text-slate-500 dark:text-gray-400">Tag Set</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-slate-200 dark:border-gray-800 transition-colors">
          <button
            onClick={loadReview}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <h2 className="text-sm font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wide">
              Paper Review
            </h2>
            <svg
              className={`w-4 h-4 text-slate-400 dark:text-gray-500 transition-transform ${showReview ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {reviewLoading && (
            <div className="px-6 pb-4 text-sm text-slate-500 dark:text-gray-400">
              Loading review...
            </div>
          )}
          {showReview && !reviewLoading && reviewContent && (
            <div className="px-6 pb-6 border-t border-slate-200 dark:border-gray-800 pt-4 max-h-96 overflow-y-auto">
              <MarkdownContent content={reviewContent} />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-gray-800 px-6 py-4 text-center text-xs text-slate-400 dark:text-gray-600">
        HMM POS Tagger &mdash; Built with Python, FastAPI, Next.js &amp; NumPy
      </footer>
    </div>
  );
}
