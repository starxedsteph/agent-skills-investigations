---
name: investigation-seo-spam
description: Investigates suspected SEO spam by searching the public web for pages, domains, and accounts matching a given example. Identifies templated content, link farms, and coordinated SEO abuse campaigns. No internal database access required.
---

# Investigation: SEO Spam (Internet-Based)

## Purpose

Given one or more example URLs, domains, or content snippets suspected of SEO spam,
search the public web to find related content — other pages in the same campaign,
other domains operated by the same actor, or other accounts amplifying the same links.

This skill works entirely on publicly available data. It requires web search access
but no internal database connection.

---

## What counts as SEO spam

SEO spam is content or behavior designed to manipulate search engine rankings —
typically by creating large volumes of low-quality pages, building artificial
link networks, or injecting content into legitimate sites.

Common forms:
- **Thin affiliate pages**: hundreds of near-identical pages with different keyword
  targets, minimal original content, and affiliate or ad links
- **Templated doorway pages**: fill-in-the-blank page structure ("Best [keyword] in [city]")
  pointing to the same destination
- **Link farms**: sites that exist primarily to link to other sites, often linking
  to each other in a ring or hub-and-spoke pattern
- **Hacked site injection**: legitimate sites with injected spam pages, often in
  subdirectories not linked from the main site
- **Profile and comment spam**: fake profiles or comment sections filled with
  outbound links to target sites
- **Private blog networks (PBNs)**: networks of sites that appear independent
  but share ownership, hosting, or content patterns
- **Parasite SEO on legitimate platforms**: doorway content published on
  high-authority hosts (forums, blogs, code hosts, groups, other UGC sites) to
  borrow their ranking authority, rather than on the actor's own domain
- **Metadata-only spam**: the payload lives entirely in a page/repo/profile's
  title, description, or username — often with an otherwise empty or trivial
  body — common on code hosts and other user-generated-content platforms

---

## Step 1 — Characterize the example

Before searching for similar content, extract the defining characteristics
of the example you've been given:

**If given a URL or domain:**
- What is the site's apparent topic or niche?
- What does the URL structure look like? (e.g., `/best-[keyword]-[city]/`)
- What does the page content look like? Is it templated?
- Who is the registrant (WHOIS)? When was it registered?
- Where is it hosted (IP, ASN, hosting provider)?
- What links does it point to? What links to it (if tools available)?

**If given a content snippet:**
- What is the template structure? Identify fill-in-the-blank slots.
- Are there phrases unusual enough to search for directly?
- Are there shared destination URLs in the content?

Write down the 2–3 most distinctive characteristics before searching.
These become your search fingerprints.

---

## Step 2 — Search for similar content

Use web search to find pages matching the characteristics identified in Step 1.
Any public search engine works. If you are driving searches programmatically (via
a fetch tool rather than a browser), a plain HTML search endpoint such as
`https://lite.duckduckgo.com/lite/?q=<url-encoded query>` returns parseable
results without JavaScript. If the platform you are investigating has its own
search index or API (a code host, forum, or marketplace), use it in addition to
`site:` operators — it will surface content the general web index misses.

### Content fingerprinting

If the content is templated, search for a distinctive phrase from the template
with the variable parts replaced by wildcards or omitted. Put the phrase in quotes.

Example: if pages say "Find the best [keyword] services in [city] — compare
top-rated providers" → search `"Find the best" "services in" "compare top-rated providers"`

Look for:
- Pages with the same phrase across different keywords/cities
- Pages with the same destination links
- Pages with the same author name, byline, or contact info

### Domain fingerprinting

- Search for the site's registrar, hosting provider, and nameservers in combination
  with other signals (this works best if the infrastructure is distinctive)
- Use `site:` operator to inventory a domain's indexed pages:
  `site:example.com` — see all indexed pages
  `site:example.com/blog/` — inventory a specific subdirectory
- If the domain has a distinctive URL pattern, search for that pattern across other domains:
  `inurl:/best-[keyword]-services/` to find other sites using the same URL structure

### Link destination fingerprinting

If the spam pages all link to the same destination URL:
- Search for that destination URL in quotes to find all pages linking to it
- Look at the full list of linking domains for patterns

### WHOIS and registration signals

For clusters of domains:
- Check WHOIS records for shared registrant email, name, organization, or nameserver
- Look for bulk registration patterns: many domains registered on the same date,
  with the same registrar, using similar naming patterns
- Tools: WHOIS lookup services, DomainTools (if available), SecurityTrails (if available)

---

## Step 3 — Expand the cluster

For each new domain or URL found, repeat the characterization step:
- Does it share infrastructure (IP, nameserver, hosting) with others in the cluster?
- Does it share content patterns?
- Does it link to the same destinations?

Track which signals connect each entity to the cluster.

**Stopping criteria:**
- New searches return results already in the cluster (saturation)
- New finds share only one weak signal with the cluster — stop and reassess
- The cluster has grown large enough to demonstrate the campaign; additional
  examples add noise rather than clarity

---

## Step 4 — Check for platform presence

If your investigation is in the context of a specific platform (social media,
review sites, forums), search for the campaign's presence there:

- The destination URLs in the spam: are they being shared on your platform?
- The domain names: are they referenced in user-generated content?
- The content templates: does the same fill-in-the-blank pattern appear
  in comments, profiles, or posts?

Search operators that help:
- `site:[your-platform.com] "[destination-url]"` — find posts linking to the target
- `site:[your-platform.com] "[distinctive phrase]"` — find posts using the same text

---

## Step 5 — Build the finding

**Summary**
- What type of SEO spam is this? (thin affiliate, link farm, PBN, injected content, etc.)
- Estimated scope: how many domains/pages found?
- How long has the campaign been running? (check earliest registration dates, Wayback Machine)

**Evidence**
- Example URLs (2–5 representative samples, not the full list)
- The signals connecting them (what do they share?)
- Destination URLs being promoted
- Infrastructure signals (shared hosting, registrar, nameservers) if found

**Search reproduction**
- The exact search queries that found the cluster, so anyone reviewing the finding
  can reproduce it independently

**Confidence**
- High: ≥ 2 independent signals confirmed across multiple entities
- Medium: 1 strong signal or 2 weak signals
- Low: pattern is present but attribution is uncertain

---

## Useful tools and sources

**Search operators**
- `"exact phrase"` — find pages with this exact text
- `site:domain.com` — inventory a domain's indexed pages
- `inurl:pattern` — find URLs matching a pattern
- `-site:domain.com` — exclude a domain from results

**Infrastructure and registration**
- WHOIS (whois.domaintools.com or command-line `whois`)
- Wayback Machine (web.archive.org) — earliest known versions of pages/domains
- Shodan (shodan.io) — if investigating server infrastructure
- SecurityTrails or DomainTools — historical WHOIS and DNS (if your organization
  has access)
- Certificate Transparency logs (crt.sh) — find all certificates issued for
  a domain and its subdomains. Request JSON explicitly
  (`crt.sh/?q=<domain>&output=json`); a generic web-page fetcher may fail to
  parse the default HTML table.

**Link analysis**
- Ahrefs, Majestic, or Moz (if your organization has access) — backlink analysis
- Google Search Console data (if you have access to your own platform's data)

**Content analysis**
- Copyscape or similar duplicate content detection tools
- Wayback Machine for historical content comparison

See `references/search-patterns.md` for ready-to-use search pattern templates.
