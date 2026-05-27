const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export async function fetchModelInfo(): Promise<ModelInfo> {
  const res = await fetch(`${API_URL}/info`);
  if (!res.ok) throw new Error("Failed to fetch model info");
  return res.json();
}

export async function tagSentence(sentence: string): Promise<{ result: TagResult[] }> {
  const res = await fetch(`${API_URL}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: sentence }),
  });
  if (!res.ok) throw new Error("Server error");
  return res.json();
}

export async function fetchReview(): Promise<string> {
  const res = await fetch(`${API_URL}/review`);
  if (!res.ok) throw new Error("Failed to fetch review");
  const data = await res.json();
  return data.content;
}
