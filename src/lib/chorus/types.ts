export const DIRECT_SOURCES = [
  "reddit",
  "hn",
  "bluesky",
  "lemmy",
  "stack",
  "news",
] as const;

export type DirectSource = (typeof DIRECT_SOURCES)[number];

export type CommentSource =
  | DirectSource
  | "x"
  | "quora"
  | "youtube"
  | "facebook"
  | "web";

export type SourceStatus = "idle" | "pending" | "ok" | "empty" | "error";

export type ChorusComment = {
  id: string;
  source: CommentSource;
  author: string;
  text: string;
  title?: string;
  community?: string;
  url: string;
  score: number;
  createdAt: number;
};

export type QueryIntent = {
  topic: string;
  searches: string[];
  related: string[];
};

export type SourcePayload = {
  source: DirectSource;
  comments: ChorusComment[];
  error?: string;
};


export type PulseCamp = {
  label: string;
  share: number;
  summary: string;
};

export type ChorusPulse = {
  headline: string;
  body: string;
  camps: PulseCamp[];
  quotes: ChorusComment[];
  available: boolean;
  error?: string;
};

export const SOURCE_META: Record<
  CommentSource,
  { label: string; short: string }
> = {
  reddit: { label: "Reddit", short: "Reddit" },
  hn: { label: "Hacker News", short: "HN" },
  bluesky: { label: "Bluesky", short: "Bluesky" },
  lemmy: { label: "Lemmy", short: "Lemmy" },
  stack: { label: "Stack Exchange", short: "Stack" },
  x: { label: "X", short: "X" },
  quora: { label: "Quora", short: "Quora" },
  news: { label: "Disqus / OpenWeb", short: "Disqus" },
  youtube: { label: "YouTube", short: "YouTube" },
  facebook: { label: "Facebook", short: "Facebook" },
  web: { label: "Open web", short: "Web" },
};

export const EXAMPLE_QUESTIONS = [
  "is wfh over?",
  "What do people think of the latest AI models?",
  "Is college still worth it?",
  "Should humans colonize Mars?",
  "Is Tesla still a good company?",
  "Do people want to live in cities anymore?",
];
