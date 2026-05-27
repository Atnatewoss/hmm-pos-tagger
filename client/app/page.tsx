import Link from "next/link";
import { Braces, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#141414] to-[#0a0a0b] flex flex-col relative overflow-hidden">

      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white">HMM POS Tagger</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center relative z-10 px-6">
        <div className="max-w-xl w-full space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Hidden Markov Model
              <br />
              <span className="text-white/70">Part-of-Speech Tagging</span>
            </h2>
            <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
              A from-scratch implementation of an HMM-based POS tagger,
              trained on the Universal Dependencies English Web Treebank.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/implementation"
              className="group relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 active:scale-[0.99]"
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300">
                <Braces className="w-4 h-4 text-white/60" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">POS Tagging</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Tag sentences with part-of-speech labels using the trained HMM model with Viterbi decoding.
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/50 group-hover:gap-2.5 transition-all">
                <span>Open tagger</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>

            <Link
              href="/review"
              className="group relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 active:scale-[0.99]"
            >
              <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                <FileText className="w-4 h-4 text-white/60" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Paper Review</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                A review of &ldquo;Hidden Markov Neural Networks&rdquo; by Rimella &amp; Whiteley (Entropy, 2025).
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-white/50 group-hover:gap-2.5 transition-all">
                <span>Read review</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          </div>

        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-center">
          <p className="text-[11px] text-white/15">HMM POS Tagger &middot; 2026</p>
        </div>
      </footer>
    </div>
  );
}
