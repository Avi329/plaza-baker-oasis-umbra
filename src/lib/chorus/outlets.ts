export type OutletLean = "right" | "left" | "center";

export const NEWS_OUTLETS: { name: string; hosts: string[]; lean: OutletLean }[] = [
  { name: "Breitbart", hosts: ["breitbart.com"], lean: "right" },
  { name: "Fox News", hosts: ["foxnews.com"], lean: "right" },
  { name: "New York Post", hosts: ["nypost.com"], lean: "right" },
  { name: "Daily Mail", hosts: ["dailymail.co.uk", "dailymail.com"], lean: "right" },
  { name: "The Telegraph", hosts: ["telegraph.co.uk"], lean: "right" },
  { name: "Wall Street Journal", hosts: ["wsj.com"], lean: "right" },
  { name: "Zero Hedge", hosts: ["zerohedge.com"], lean: "right" },
  { name: "Epoch Times", hosts: ["theepochtimes.com", "epochnews.com"], lean: "right" },
  { name: "UnHerd", hosts: ["unherd.com"], lean: "right" },
  { name: "National Review", hosts: ["nationalreview.com"], lean: "right" },
  { name: "Daily Wire", hosts: ["dailywire.com"], lean: "right" },
  { name: "The Federalist", hosts: ["thefederalist.com"], lean: "right" },
  { name: "Washington Examiner", hosts: ["washingtonexaminer.com"], lean: "right" },
  { name: "Townhall", hosts: ["townhall.com"], lean: "right" },
  { name: "The Spectator", hosts: ["spectator.co.uk", "spectator.org"], lean: "right" },
  { name: "Newsmax", hosts: ["newsmax.com"], lean: "right" },
  { name: "The Blaze", hosts: ["theblaze.com"], lean: "right" },
  { name: "Daily Caller", hosts: ["dailycaller.com"], lean: "right" },
  { name: "Washington Times", hosts: ["washingtontimes.com"], lean: "right" },
  { name: "GB News", hosts: ["gbnews.com", "gbnews.uk"], lean: "right" },
  { name: "The Hill", hosts: ["thehill.com"], lean: "center" },
  { name: "Financial Times", hosts: ["ft.com"], lean: "center" },
  { name: "Substack", hosts: ["substack.com"], lean: "center" },
  { name: "Boston Globe", hosts: ["bostonglobe.com"], lean: "left" },
  { name: "Washington Post", hosts: ["washingtonpost.com", "wapo.st"], lean: "left" },
  { name: "New York Times", hosts: ["nytimes.com", "nyti.ms"], lean: "left" },
  { name: "The Guardian", hosts: ["theguardian.com", "theguardian.co.uk"], lean: "left" },
  { name: "The Atlantic", hosts: ["theatlantic.com"], lean: "left" },
  { name: "Mother Jones", hosts: ["motherjones.com"], lean: "left" },
];

export const NEWS_OUTLET_NAMES = NEWS_OUTLETS.map((o) => o.name);

export const CONSERVATIVE_DESKS = NEWS_OUTLETS.filter((o) => o.lean === "right").map((o) => o.name);

export const COMMENT_PLATFORMS = [
  "Disqus",
  "OpenWeb / Spot.IM",
  "Viafoura",
  "Coral",
  "Vuukle",
  "Livefyre",
  "IntenseDebate",
  "Facebook comments under articles",
  "YouTube comments",
  "Substack comments",
  "native site comment threads",
];

export function outletFromUrl(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host.endsWith(".substack.com") || host === "substack.com") return "Substack";
    if (host.includes("disqus.com")) return "Disqus";
    if (host.includes("spot.im") || host.includes("openweb.com")) return "OpenWeb";
    if (host.includes("viafoura")) return "Viafoura";
    if (host.includes("coralproject") || host.includes("coral.community")) return "Coral";
    for (const outlet of NEWS_OUTLETS) {
      if (outlet.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return outlet.name;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function outletLean(name?: string): OutletLean | undefined {
  if (!name) return undefined;
  const s = name.toLowerCase();
  if (s.includes("disqus") || s.includes("openweb") || s.includes("spot.im")) return "center";
  const hit = NEWS_OUTLETS.find(
    (o) => s.includes(o.name.toLowerCase()) || o.hosts.some((h) => s.includes(h)),
  );
  return hit?.lean;
}

/** Modest ranking bump so conservative desks take more of the floor. */
export function conservativeBoost(name?: string): number {
  const lean = outletLean(name);
  if (lean === "right") return 48;
  if (lean === "center") return 12;
  return 0;
}

export function isNewsOutletName(value: string): boolean {
  const s = value.toLowerCase();
  if (s.includes("disqus") || s.includes("openweb") || s.includes("viafoura") || s.includes("coral")) {
    return true;
  }
  return NEWS_OUTLETS.some(
    (o) => s.includes(o.name.toLowerCase()) || o.hosts.some((h) => s.includes(h)),
  );
}
