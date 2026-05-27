import { useMemo } from "react";

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
      parts.push(
        <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer"
          className="text-blue-400 underline underline-offset-2 decoration-blue-400/30 hover:decoration-blue-400 transition">
          {match[1]}
        </a>
      );
    } else if (type === "code") {
      parts.push(
        <code key={key++} className="bg-white/[0.06] px-1.5 py-0.5 rounded text-sm font-mono text-emerald-300">
          {match[1]}
        </code>
      );
    }

    remaining = remaining.slice(earliest + match[0].length);
  }

  return parts;
}

export function MarkdownContent({ content }: { content: string }) {
  const elements = useMemo(() => {
    const lines = content.split("\n");
    const result: React.ReactNode[] = [];
    let key = 0;
    let i = 0;

    const addParagraph = (text: string) => {
      if (text.trim()) {
        result.push(
          <p key={key++} className="text-sm leading-relaxed text-white/60 mb-4">
            {renderInline(text.trim())}
          </p>
        );
      }
    };

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed === "") { i++; continue; }

      if (/^#{1,6}\s/.test(trimmed)) {
        const level = trimmed.match(/^#+/)![0].length;
        const text = trimmed.replace(/^#+\s+/, "");
        const size = level === 1 ? "text-base font-semibold" : level === 2 ? "text-sm font-semibold" : "text-[13px] font-semibold";
        const cls = `${size} text-white mt-6 mb-3`;
        const h = Math.min(level, 3);
        if (h === 1) result.push(<h1 key={key++} className={cls}>{renderInline(text)}</h1>);
        else if (h === 2) result.push(<h2 key={key++} className={cls}>{renderInline(text)}</h2>);
        else result.push(<h3 key={key++} className={cls}>{renderInline(text)}</h3>);
        i++; continue;
      }

      if (/^---+$/.test(trimmed)) {
        result.push(<hr key={key++} className="my-6 border-white/[0.06]" />);
        i++; continue;
      }

      if (trimmed.startsWith("> ")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("> ")) {
          quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
          i++;
        }
        result.push(
          <blockquote key={key++} className="border-l-2 border-white/10 pl-4 italic text-white/40 mb-4">
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
          <ul key={key++} className="list-disc pl-5 mb-4 space-y-1">
            {items.map((item, ii) => <li key={ii} className="text-sm text-white/60">{renderInline(item)}</li>)}
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
          <ol key={key++} className="list-decimal pl-5 mb-4 space-y-1">
            {items.map((item, ii) => <li key={ii} className="text-sm text-white/60">{renderInline(item)}</li>)}
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
            <div key={key++} className="overflow-x-auto mb-4 -mx-2">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {headerCells.map((cell, ci) => <th key={ci} className="px-3 py-2 text-left font-medium text-white/40">{renderInline(cell)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, ri) => (
                    <tr key={ri} className="border-b border-white/[0.04]">
                      {row.split("|").filter(c => c.trim()).map((cell, ci) => <td key={ci} className="px-3 py-2 text-white/60">{renderInline(cell.trim())}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      addParagraph(trimmed);
      i++;
    }

    return result;
  }, [content]);

  return <div>{elements}</div>;
}
