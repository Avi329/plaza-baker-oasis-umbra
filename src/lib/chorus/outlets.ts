export const NEWS_OUTLETS: { name: string; hosts: string[] }[] = [
  { name: "Breitbart", hosts: ["breitbart.com"] },
  { name: "Fox News", hosts: ["foxnews.com"] },
  { name: "The Hill", hosts: ["thehill.com"] },
  { name: "Boston Globe", hosts: ["bostonglobe.com"] },
  { name: "Financial Times", hosts: ["ft.com"] },
  { name: "Washington Post", hosts: ["washingtonpost.com", "wapo.st"] },
  { name: "Wall Street Journal", hosts: ["wsj.com"] },
  { name: "The Telegraph", hosts: ["telegraph.co.uk"] },
  { name: "Zero Hedge", hosts: ["zerohedge.com"] },
  { name: "Epoch Times", hosts: ["theepochtimes.com", "epochnews.com"] },
  { name: "UnHerd", hosts: ["unherd.com"] },
  { name: "Mother Jones", hosts: ["motherjones.com"] },
  { name: "New York Times", hosts: ["nytimes.com", "nyti.ms"] },
  { name: "Substack", hosts: ["substack.com"] },
  { name: "The Guardian", hosts: ["theguardian.com", "theguardian.co.uk"] },
  { name: "The Atlantic", hosts: ["theatlantic.com"] },
  { name: "National Review", hosts: ["nationalreview.com"] },
];

export const NEWS_OUTLET_NAMES = NEWS_OUTLETS.map((o) => o.name);

export function outletFromUrl(url: string): string | undefined {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    if (host.endsWith(".substack.com") || host === "substack.com") return "Substack";
    for (const outlet of NEWS_OUTLETS) {
      if (outlet.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return outlet.name;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function isNewsOutletName(value: string): boolean {
  const s = value.toLowerCase();
  return NEWS_OUTLETS.some(
    (o) => s.includes(o.name.toLowerCase()) || o.hosts.some((h) => s.includes(h)),
  );
}
