"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:8000";

const TAG_COLORS: Record<string, string> = {
  NOUN: "bg-blue-100 text-blue-800 border-blue-300",
  VERB: "bg-green-100 text-green-800 border-green-300",
  ADJ: "bg-orange-100 text-orange-800 border-orange-300",
  ADV: "bg-purple-100 text-purple-800 border-purple-300",
  DET: "bg-teal-100 text-teal-800 border-teal-300",
  ADP: "bg-pink-100 text-pink-800 border-pink-300",
  PRON: "bg-indigo-100 text-indigo-800 border-indigo-300",
  CCONJ: "bg-yellow-100 text-yellow-800 border-yellow-300",
  SCONJ: "bg-yellow-100 text-yellow-800 border-yellow-300",
  PART: "bg-rose-100 text-rose-800 border-rose-300",
  AUX: "bg-lime-100 text-lime-800 border-lime-300",
  NUM: "bg-cyan-100 text-cyan-800 border-cyan-300",
  PROPN: "bg-violet-100 text-violet-800 border-violet-300",
  PUNCT: "bg-gray-100 text-gray-600 border-gray-300",
  INTJ: "bg-red-100 text-red-800 border-red-300",
  SYM: "bg-stone-100 text-stone-600 border-stone-300",
  X: "bg-gray-100 text-gray-500 border-gray-300",
};

function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || "bg-gray-100 text-gray-700 border-gray-300";
}

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

export default function Home() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog");
  const [result, setResult] = useState<TagResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">HMM POS Tagger</h1>
            <p className="text-sm text-slate-500">
              Hidden Markov Model Part-of-Speech Tagging
            </p>
          </div>
          {modelInfo && (
            <div className="flex gap-4 text-xs text-slate-500">
              <span>Vocab: {modelInfo.vocab_size.toLocaleString()}</span>
              <span>Tags: {modelInfo.num_tags}</span>
              {modelInfo.dev_accuracy !== null && (
                <span className="font-medium text-emerald-600">
                  Accuracy: {(modelInfo.dev_accuracy * 100).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Enter a sentence to tag:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            placeholder="Type a sentence..."
          />
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => tagSentence(text)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? "Tagging..." : "Tag Sentence"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {result && result.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
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
                className="text-sm bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 transition-colors"
              >
                {s.length > 50 ? s.slice(0, 50) + "..." : s}
              </button>
            ))}
          </div>
        </div>

        {modelInfo && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
              Model Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-slate-800">
                  {modelInfo.vocab_size.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">Vocabulary Size</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-slate-800">
                  {modelInfo.num_tags}
                </div>
                <div className="text-xs text-slate-500">POS Tags</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-600">
                  {modelInfo.dev_accuracy !== null
                    ? `${(modelInfo.dev_accuracy * 100).toFixed(1)}%`
                    : "N/A"}
                </div>
                <div className="text-xs text-slate-500">Dev Accuracy</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-lg font-bold text-slate-800 font-mono text-xs flex flex-wrap gap-1">
                  {modelInfo.tags.slice(0, 8).join(", ")}
                  {modelInfo.tags.length > 8 && "..."}
                </div>
                <div className="text-xs text-slate-500">Tag Set</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-400">
        HMM POS Tagger &mdash; Built with Python, FastAPI, Next.js &amp; NumPy
      </footer>
    </div>
  );
}
