import {
  type ChorusComment,
  type DirectSource,
  type SourcePayload,
} from "./types";
import { cleanText, commentKey, isLowQuality, searchTerms } from "./text";

const TIMEOUT_MS = 10000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; Chorus/1.0; comment-aggregator; +https://grok.com)";

async function fetchJson<T>(url: string, init?: RequestInit, timeout = TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function uniq(comments: ChorusComment[]): ChorusComment[] {
  const seen = new Set<string>();
  const out: ChorusComment[] = [];
  for (const c of comments) {
    const key = commentKey(c.text);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function sortByScore(comments: ChorusComment[]): ChorusComment[] {
  return [...comments].sort((a, b) => b.score - a.score || b.createdAt - a.createdAt);
}

function pack(comment: ChorusComment): ChorusComment {
  const packed: ChorusComment = {
    id: String(comment.id),
    source: comment.source,
    author: String(comment.author || "anonymous"),
    text: String(comment.text),
    url: String(comment.url),
    score: Number.isFinite(comment.score) ? comment.score : 0,
    createdAt: Number.isFinite(comment.createdAt) ? comment.createdAt : 0,
  };
  if (comment.title) packed.title = String(comment.title);
  if (comment.community) packed.community = String(comment.community);
  return packed;
}

type RedditListing = {
  data?: {
    children?: Array<{
      kind?: string;
      data?: {
        id?: string;
        name?: string;
        body?: string;
        selftext?: string;
        author?: string;
        score?: number;
        created_utc?: number;
        permalink?: string;
        subreddit?: string;
        link_title?: string;
        title?: string;
      };
    }>;
  };
};

async function fetchReddit(query: string): Promise<ChorusComment[]> {
  const endpoints = [
    `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&type=comment&sort=relevance&t=year&limit=25&raw_json=1`,
    `https://old.reddit.com/search.json?q=${encodeURIComponent(query)}&type=comment&sort=comments&t=year&limit=25&raw_json=1`,
  ];
  let lastError: unknown;
  for (const url of endpoints) {
    try {
      const json = await fetchJson<RedditListing>(url, {
        headers: { "User-Agent": "web:chorus:v1.0 (by /u/chorus-reader)" },
      });
      const comments: ChorusComment[] = [];
      for (const child of json.data?.children ?? []) {
        const d = child.data;
        if (!d) continue;
        const text = cleanText(d.body || d.selftext || "");
        const author = d.author ?? "unknown";
        if (isLowQuality(text, author)) continue;
        const permalink = d.permalink
          ? `https://www.reddit.com${d.permalink}`
          : `https://www.reddit.com/comments/${d.id ?? ""}`;
        comments.push({
          id: `reddit:${d.name || d.id || permalink}`,
          source: "reddit",
          author,
          text,
          title: d.link_title || d.title,
          community: d.subreddit ? `r/${d.subreddit}` : undefined,
          url: permalink,
          score: Number(d.score ?? 0),
          createdAt: Math.round((d.created_utc ?? 0) * 1000),
        });
      }
      if (comments.length) return sortByScore(uniq(comments)).slice(0, 20);
    } catch (err) {
      lastError = err;
    }
  }
  if (lastError) throw lastError;
  return [];
}

type HnHit = {
  objectID?: string;
  author?: string;
  comment_text?: string;
  story_title?: string;
  created_at_i?: number;
  points?: number | null;
  story_id?: number;
};

type HnSearch = { hits?: HnHit[] };

async function fetchHn(query: string): Promise<ChorusComment[]> {
  const url =
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}` +
    `&tags=comment&hitsPerPage=30`;
  const json = await fetchJson<HnSearch>(url, undefined, 8000);
  const comments: ChorusComment[] = [];
  for (const hit of json.hits ?? []) {
    const text = cleanText(hit.comment_text || "");
    const author = hit.author ?? "unknown";
    if (isLowQuality(text, author)) continue;
    const id = hit.objectID ?? `${hit.story_id}-${author}`;
    comments.push({
      id: `hn:${id}`,
      source: "hn",
      author,
      text,
      title: hit.story_title || undefined,
      community: "Hacker News",
      url: `https://news.ycombinator.com/item?id=${id}`,
      score: Number(hit.points ?? 0),
      createdAt: (hit.created_at_i ?? 0) * 1000,
    });
  }
  return sortByScore(uniq(comments)).slice(0, 20);
}

type BskyPost = {
  uri?: string;
  indexedAt?: string;
  likeCount?: number;
  author?: { handle?: string; displayName?: string };
  record?: { text?: string };
};

type BskySearch = { posts?: BskyPost[] };

function bskyUrl(uri: string, handle: string): string {
  const rkey = uri.split("/").pop() ?? "";
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

async function fetchBluesky(query: string): Promise<ChorusComment[]> {
  const url =
    `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts` +
    `?q=${encodeURIComponent(query)}&limit=25&sort=top`;
  const json = await fetchJson<BskySearch>(url);
  const comments: ChorusComment[] = [];
  for (const post of json.posts ?? []) {
    const text = cleanText(post.record?.text || "");
    const handle = post.author?.handle ?? "unknown";
    if (isLowQuality(text, handle)) continue;
    const uri = post.uri ?? `${handle}:${text.slice(0, 20)}`;
    comments.push({
      id: `bsky:${uri}`,
      source: "bluesky",
      author: post.author?.displayName || handle,
      text,
      community: `@${handle}`,
      url: bskyUrl(uri, handle),
      score: Number(post.likeCount ?? 0),
      createdAt: post.indexedAt ? Date.parse(post.indexedAt) : 0,
    });
  }
  return sortByScore(uniq(comments)).slice(0, 18);
}

type LemmyCommentView = {
  comment?: {
    id?: number;
    content?: string;
    published?: string;
    ap_id?: string;
  };
  creator?: { name?: string; actor_id?: string };
  post?: { name?: string };
  community?: { name?: string; actor_id?: string };
  counts?: { score?: number };
};

type LemmySearch = { comments?: LemmyCommentView[] };

async function fetchLemmyInstance(host: string, query: string): Promise<ChorusComment[]> {
  const url =
    `https://${host}/api/v3/search?q=${encodeURIComponent(query)}` +
    `&type_=Comments&sort=TopAll&listing_type=All&limit=20`;
  const json = await fetchJson<LemmySearch>(url, undefined, 12000);
  const comments: ChorusComment[] = [];
  for (const row of json.comments ?? []) {
    const text = cleanText(row.comment?.content || "");
    const author = row.creator?.name ?? "unknown";
    if (isLowQuality(text, author)) continue;
    const id = row.comment?.id ?? comments.length;
    comments.push({
      id: `lemmy:${host}:${id}`,
      source: "lemmy",
      author,
      text,
      title: row.post?.name,
      community: row.community?.name ? `${row.community.name}@${host}` : host,
      url: row.comment?.ap_id || `https://${host}/comment/${id}`,
      score: Number(row.counts?.score ?? 0),
      createdAt: row.comment?.published ? Date.parse(row.comment.published) : 0,
    });
  }
  return comments;
}

async function fetchLemmy(query: string): Promise<ChorusComment[]> {
  const instances = ["lemmy.world", "lemmy.ml"];
  const batches = await Promise.allSettled(
    instances.map((host) => fetchLemmyInstance(host, query)),
  );
  const comments: ChorusComment[] = [];
  let lastError: unknown;
  for (const result of batches) {
    if (result.status === "fulfilled") comments.push(...result.value);
    else lastError = result.reason;
  }
  const unique = sortByScore(uniq(comments)).slice(0, 20);
  if (!unique.length && lastError) throw lastError;
  return unique;
}

type SeExcerpt = {
  item_type?: string;
  question_id?: number;
  answer_id?: number;
  score?: number;
  creation_date?: number;
  title?: string;
  excerpt?: string;
  body?: string;
  owner?: { display_name?: string };
};

type SeSearch = { items?: SeExcerpt[]; error_message?: string };

const SE_SITES = [
  { site: "workplace", host: "workplace.stackexchange.com" },
  { site: "politics", host: "politics.stackexchange.com" },
  { site: "skeptics", host: "skeptics.stackexchange.com" },
  { site: "academia", host: "academia.stackexchange.com" },
] as const;

async function fetchStackSite(
  site: (typeof SE_SITES)[number],
  query: string,
): Promise<ChorusComment[]> {
  const url =
    `https://api.stackexchange.com/2.3/search/excerpts?order=desc&sort=relevance` +
    `&q=${encodeURIComponent(query)}&site=${site.site}&pagesize=8`;
  const json = await fetchJson<SeSearch>(url);
  const comments: ChorusComment[] = [];
  for (const item of json.items ?? []) {
    const text = cleanText(item.body || item.excerpt || "");
    const author = item.owner?.display_name || "member";
    if (isLowQuality(text, author)) continue;
    const qid = item.question_id;
    if (!qid) continue;
    const hash = item.answer_id ? `#${item.answer_id}` : "";
    comments.push({
      id: `stack:${site.site}:${item.answer_id || qid}`,
      source: "stack",
      author,
      text,
      title: item.title,
      community: site.site,
      url: `https://${site.host}/questions/${qid}${hash}`,
      score: Number(item.score ?? 0),
      createdAt: (item.creation_date ?? 0) * 1000,
    });
  }
  return comments;
}

async function fetchStack(query: string): Promise<ChorusComment[]> {
  const batches = await Promise.allSettled(SE_SITES.map((site) => fetchStackSite(site, query)));
  const comments: ChorusComment[] = [];
  let lastError: unknown;
  for (const result of batches) {
    if (result.status === "fulfilled") comments.push(...result.value);
    else lastError = result.reason;
  }
  const unique = sortByScore(uniq(comments)).slice(0, 18);
  if (!unique.length && lastError) throw lastError;
  return unique;
}

const FETCHERS: Record<DirectSource, (q: string) => Promise<ChorusComment[]>> = {
  reddit: fetchReddit,
  hn: fetchHn,
  bluesky: fetchBluesky,
  lemmy: fetchLemmy,
  stack: fetchStack,
};

export async function fetchSource(source: DirectSource, query: string): Promise<SourcePayload> {
  const terms = searchTerms(query);
  try {
    const comments = (await FETCHERS[source](terms)).map(pack);
    return {
      source,
      comments,
      error: comments.length ? undefined : "No matching comments",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    return { source, comments: [], error: message };
  }
}
