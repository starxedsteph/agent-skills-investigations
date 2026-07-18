# Search Pattern Templates

Ready-to-use search patterns for SEO spam investigation.
Replace bracketed placeholders with values from your investigation.

---

## Content fingerprinting

Find pages with exact matching phrases:
```
"[distinctive phrase from target page]"
```

Find templated content with variable slots:
```
"[static part 1]" "[static part 2]" -site:[original domain]
```
*Omit the variable parts; search only the static text that's identical across pages.*

Find pages with the same destination link:
```
"[destination URL]" -site:[destination domain]
```
*Finds other sites linking to the same place.*

Find pages with the same byline or author attribution:
```
"[author name]" "[site name or niche keyword]"
```

---

## URL structure fingerprinting

Find other domains using the same URL pattern:
```
inurl:[pattern] "[keyword shared across pages]"
```
Example: `inurl:/best-services-in/ "compare top-rated"`

Inventory all indexed pages on a suspicious domain:
```
site:[domain.com]
```

Inventory a suspicious subdirectory:
```
site:[domain.com]/[subdirectory]/
```

Find domains with similar naming conventions:
```
"[shared word or prefix]" site:[registrar or hosting provider domain]
```

---

## Infrastructure fingerprinting

Find sites on the same IP address:
```
[IP address]
```
*(Use a reverse IP lookup tool — standard search engines don't support this directly.)*

Find sites sharing the same nameserver:
```
"[nameserver hostname]" site:securitytrails.com
```
*Or use SecurityTrails / DomainTools reverse NS lookup directly.*

Find related domains via certificate transparency:
```
*.example.com
```
*Search at crt.sh to find all certificates issued for subdomains.*

---

## Platform presence

Find your platform's users sharing a suspicious link:
```
site:[your-platform.com] "[suspicious destination URL]"
```

Find accounts using templated content on your platform:
```
site:[your-platform.com] "[static phrase from content template]"
```

---

## Historical research

Find earliest known version of a suspicious page:
- Go to web.archive.org
- Enter the URL
- Look at the earliest snapshot — when did this page first appear?
- Compare early and recent versions — has the content changed significantly?

Find other domains registered at the same time with similar patterns:
- Check WHOIS registration date for the target domain
- Search for bulk domain registrations near that date via DomainTools or similar

---

## Notes

- Always run searches with quotes around distinctive phrases to avoid
  false positives from keyword matching
- Exclude the original site with `-site:[domain]` to find other instances
- Search engines vary — run the same pattern in multiple search engines
  if initial results are thin
- Some SEO spam is intentionally de-indexed from search engines; if you
  get no results on content you can see, try Wayback Machine or check
  whether the page uses `noindex` directives
- When driving searches with a fetch tool instead of a browser, use a
  no-JavaScript HTML search endpoint (e.g. `https://lite.duckduckgo.com/lite/?q=`)
  so results are parseable
- crt.sh returns an HTML table by default; append `&output=json` when fetching
  it programmatically
