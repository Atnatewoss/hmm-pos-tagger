"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Braces, Loader2, AlertCircle, Layers, Hash, Target, Tag, ExternalLink } from "lucide-react";
import { fetchModelInfo, tagSentence as apiTagSentence } from "@/app/lib/api";

const TAG_COLORS: Record<string, string> = {
  NOUN: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  VERB: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  ADJ: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  ADV: "text-violet-300 bg-violet-500/10 border-violet-500/20",
  DET: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
  ADP: "text-rose-300 bg-rose-500/10 border-rose-500/20",
  PRON: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
  CCONJ: "text-orange-300 bg-orange-500/10 border-orange-500/20",
  SCONJ: "text-orange-300 bg-orange-500/10 border-orange-500/20",
  PART: "text-pink-300 bg-pink-500/10 border-pink-500/20",
  AUX: "text-lime-300 bg-lime-500/10 border-lime-500/20",
  NUM: "text-teal-300 bg-teal-500/10 border-teal-500/20",
  PROPN: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/20",
  PUNCT: "text-white/40 bg-white/5 border-white/10",
  INTJ: "text-red-300 bg-red-500/10 border-red-500/20",
  SYM: "text-white/40 bg-white/5 border-white/10",
  X: "text-white/40 bg-white/5 border-white/10",
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
  return TAG_COLORS[tag] || "text-white/60 bg-white/5 border-white/10";
}

const INITIAL_TEXT = "The quick brown fox jumps over the lazy dog";

export default function Implementation() {
  const [text, setText] = useState(INITIAL_TEXT);
  const [result, setResult] = useState<TagResult[] | null>(null);
  const [tagging, setTagging] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pageReady, setPageReady] = useState(false);
  const [activeSample, setActiveSample] = useState<number>(0);

  useEffect(() => {
    fetchModelInfo().then(setModelInfo).catch(() => {});
  }, []);

  const tagSentence = useCallback(async (sentence: string) => {
    if (!sentence.trim()) return;
    setTagging(true);
    setError(null);
    try {
      const data = await apiTagSentence(sentence);
      setResult(data.result);
    } catch {
      setError("Could not connect to server. Make sure the backend is running.");
    } finally {
      setTagging(false);
    }
  }, []);

  useEffect(() => {
    tagSentence(INITIAL_TEXT);
  }, []);

  useEffect(() => {
    if (modelInfo && result) {
      const timer = setTimeout(() => setPageReady(true), 300);
      return () => clearTimeout(timer);
    }
  }, [modelInfo, result]);

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
            {modelInfo && (
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/30">
                <span>{modelInfo.vocab_size.toLocaleString()} words</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{modelInfo.num_tags} tags</span>
                {modelInfo.dev_accuracy !== null && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-blue-400 font-medium">{(modelInfo.dev_accuracy * 100).toFixed(1)}%</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        {!pageReady && (
          <div className="space-y-6 animate-pulse">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="px-5 py-3.5 border-b border-white/[0.06]">
                <div className="h-3 bg-white/[0.04] rounded w-24" />
              </div>
              <div className="p-5 space-y-3">
                <div className="h-20 bg-white/[0.03] rounded-lg" />
                <div className="h-9 bg-white/[0.04] rounded-lg w-28" />
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="px-5 py-3.5 border-b border-white/[0.06]">
                <div className="h-3 bg-white/[0.04] rounded w-28" />
              </div>
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[120, 160, 100, 140, 180].map((w, i) => (
                    <div key={i} className="h-7 bg-white/[0.04] rounded-lg" style={{ width: w, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.06]">
                  {[92, 76, 88, 64, 56, 80, 70, 94].map((w, i) => (
                    <div key={i} className="h-7 bg-white/[0.04] rounded-full" style={{ width: w, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {pageReady && <>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
              <Braces className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Tag a sentence</span>
          </div>
          <div className="p-5 space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); tagSentence(text); setActiveSample(-1); } }}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40 resize-none placeholder-white/20 transition-colors"
              rows={3}
              placeholder="Type a sentence..."
            />
            <div className="text-[11px] text-white/20">Try a sample:</div>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s, i) => (
                <button
                  key={s}
                  onClick={() => {
                    setText(s);
                    tagSentence(s);
                    setActiveSample(i);
                  }}
                  className={`text-xs border rounded-lg px-3 py-1.5 transition-all active:scale-[0.97] ${
                    activeSample === i
                      ? "text-blue-300 bg-blue-500/10 border-blue-500/30"
                      : "text-white/40 bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.06]"
                  }`}
                >
                  {s.length > 50 ? s.slice(0, 50) + "..." : s}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => { tagSentence(text); setActiveSample(-1); }}
                disabled={tagging}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-400 disabled:bg-blue-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all disabled:cursor-not-allowed active:scale-[0.97]"
              >
                {tagging ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Braces className="w-4 h-4" />
                )}
                {tagging ? "Tagging..." : "Tag sentence"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {result && result.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Tagged output</span>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-1.5">
                {result.map((item, i) => (
                  <div
                    key={i}
                    className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-xs ${getTagColor(item.tag)}`}
                    title={`confidence: ${(item.confidence * 100).toFixed(1)}%`}
                    style={{ animation: `fade-in 0.2s ease-out ${i * 30}ms backwards` }}
                  >
                    <span className="font-medium">{item.word}</span>
                    <span className="font-mono text-[10px] opacity-50">/{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {modelInfo && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="px-5 py-3.5 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Model details</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04] rounded-lg overflow-hidden">
                <div className="bg-[#070708] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">Vocabulary</span>
                  </div>
                  <div className="text-lg font-semibold text-white">{modelInfo.vocab_size.toLocaleString()}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">unique words</div>
                </div>
                <div className="bg-[#070708] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">Tag set</span>
                  </div>
                  <div className="text-lg font-semibold text-white">{modelInfo.num_tags}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">POS tags</div>
                </div>
                <div className="bg-[#070708] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">Dev accuracy</span>
                  </div>
                  <div className="text-lg font-semibold text-blue-400">
                    {modelInfo.dev_accuracy !== null ? `${(modelInfo.dev_accuracy * 100).toFixed(1)}%` : "N/A"}
                  </div>
                  <div className="text-[11px] text-white/30 mt-0.5">on en_ewt-ud-dev</div>
                </div>
                <div className="bg-[#070708] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">Tags</span>
                  </div>
                  <div className="text-xs font-medium text-white/60 leading-relaxed">
                    {modelInfo.tags.slice(0, 6).join(", ")}
                    {modelInfo.tags.length > 6 && <span className="text-white/20"> +{modelInfo.tags.length - 6}</span>}
                  </div>
                  <div className="text-[11px] text-white/30 mt-0.5">UPOS tagset</div>
                </div>
              </div>
              <a
                href="https://universaldependencies.org/treebanks/en_ewt/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-white/20 hover:text-white/50 transition-colors mt-4"
              >
                <ExternalLink className="w-3 h-3" />
                Trained on UD English EWT
              </a>
            </div>
          </div>
        )}
        </>}
      </main>

      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-center">
          <p className="text-[11px] text-white/20">HMM POS Tagger &middot; Python, FastAPI, Next.js, NumPy &amp; Pandas</p>
        </div>
      </footer>
    </div>
  );
}
