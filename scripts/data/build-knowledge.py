#!/usr/bin/env python3
"""Validate the Star Talks interpretation library and regenerate the human-readable reports.

  python3 scripts/data/build-knowledge.py [--texts DIR]

Reads  knowledge/sources.json and knowledge/rules/*.json
Writes docs/source-register.md and docs/interpretation-rules-status.md

--texts DIR: directory of local plain-text copies of sources, named <source-id>.txt (never committed).
Every rule explanation is compared to its source text and the build fails if any run of
SIX consecutive words is copied verbatim. This is a safeguard against reproducing source wording.
"""
import json, re, sys, glob, os, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SYSTEMS = {'tarot', 'palmistry', 'vedic', 'lal-kitab', 'numerology', 'bazi', 'korean-saju', 'face-reading'}
READINESS = {'ready', 'needs-engine', 'needs-research', 'needs-rights', 'blocked', 'excluded'}
TESTING = {'untested', 'fixture-tested', 'question-bank-tested'}
REVIEW = {'not-reviewed', 'practitioner-reviewed'}
SRC_STATUS = {'ready', 'conditional', 'pending', 'blocked'}
SRC_REQUIRED = ['id', 'system', 'title', 'author', 'originalYear', 'edition', 'kind', 'url', 'accessed', 'copyright', 'permittedUse', 'locatorStyle', 'concerns', 'status']
RULE_REQUIRED = ['id', 'system', 'topic', 'concept', 'explanation', 'source', 'conditions', 'testing', 'review', 'readiness']
NGRAM = 6          # explanations: no run of 6 words may be copied from the source
NGRAM_LABEL = 9    # concept labels name traditional terms of art, so a looser limit applies

def norm_words(s):
    return re.findall(r"[a-z0-9']+", s.lower().replace('’', "'"))

def main():
    texts_dir = None
    if '--texts' in sys.argv: texts_dir = sys.argv[sys.argv.index('--texts') + 1]
    errors, warns = [], []
    src = json.load(open(f'{ROOT}/knowledge/sources.json'))['sources']
    sources = {}
    for s in src:
        for k in SRC_REQUIRED:
            if k not in s or s[k] in (None,): errors.append(f"source {s.get('id')}: missing {k}")
        if s['id'] in sources: errors.append(f"duplicate source id {s['id']}")
        if s['status'] not in SRC_STATUS: errors.append(f"source {s['id']}: bad status {s['status']}")
        for sy in s['system']:
            if sy not in SYSTEMS: errors.append(f"source {s['id']}: unknown system {sy}")
        sources[s['id']] = s
    rules, ids = [], set()
    for f in sorted(glob.glob(f'{ROOT}/knowledge/rules/*.json')):
        for r in json.load(open(f))['rules']:
            rules.append(r)
            for k in RULE_REQUIRED:
                if not r.get(k): errors.append(f"rule {r.get('id')}: missing {k}")
            if r['id'] in ids: errors.append(f"duplicate rule id {r['id']}")
            ids.add(r['id'])
            if r['system'] not in SYSTEMS: errors.append(f"rule {r['id']}: unknown system")
            if r['readiness'] not in READINESS: errors.append(f"rule {r['id']}: bad readiness")
            if r['testing'] not in TESTING: errors.append(f"rule {r['id']}: bad testing status")
            if r['review'] not in REVIEW: errors.append(f"rule {r['id']}: bad review status")
            if r['review'] == 'practitioner-reviewed' and not r.get('reviewer'): errors.append(f"rule {r['id']}: reviewed without reviewer name")
            s = sources.get(r['source']['id'])
            if not s: errors.append(f"rule {r['id']}: unknown source {r['source']['id']}"); continue
            if not r['source'].get('locator'): errors.append(f"rule {r['id']}: no locator")
            if r['system'] not in s['system'] and not (r['system'] == 'bazi' and 'korean-saju' in s['system']): errors.append(f"rule {r['id']}: source {s['id']} is not for system {r['system']}")
            if r['readiness'] == 'ready' and s['status'] in ('pending', 'blocked'): errors.append(f"rule {r['id']}: marked ready but source {s['id']} is {s['status']}")
            if r['system'] == 'tarot' and r['readiness'] != 'excluded' and r['id'].startswith('tarot.card.'):
                dm = r.get('domains') or {}
                for dom in ('love', 'career', 'money', 'growth', 'reflection'):
                    if dom not in dm or len(dm[dom]) != 2 or not all(dm[dom]): errors.append(f"rule {r['id']}: domain {dom} needs [upright, reversed]")
            if len(r['explanation']) < 40 and r['readiness'] != 'excluded': warns.append(f"rule {r['id']}: very short explanation")
    # Verbatim-overlap check against local source texts
    if texts_dir:
        cache = {}
        for r in rules:
            p = os.path.join(texts_dir, r['source']['id'] + '.txt')
            if not os.path.exists(p): warns.append(f"no local text for {r['source']['id']}; overlap not checked for {r['id']}"); continue
            def runs(text, n):
                ew = norm_words(text)
                return [' '.join(ew[i:i + n]) for i in range(len(ew) - n + 1)]
            if p + ':%d' % NGRAM not in cache:
                w = norm_words(open(p, errors='ignore').read())
                cache[p + ':%d' % NGRAM] = {' '.join(w[i:i + NGRAM]) for i in range(len(w) - NGRAM + 1)}
                cache[p + ':%d' % NGRAM_LABEL] = {' '.join(w[i:i + NGRAM_LABEL]) for i in range(len(w) - NGRAM_LABEL + 1)}
            extra = ' '.join(x for pair in (r.get('domains') or {}).values() for x in pair)
            hits = [h for h in runs(r['explanation'] + ' ' + extra, NGRAM) if h in cache[p + ':%d' % NGRAM]] + [h for h in runs(r['concept'], NGRAM_LABEL) if h in cache[p + ':%d' % NGRAM_LABEL]]
            if hits: errors.append(f"rule {r['id']}: copies source wording: {hits[:2]}")
    for w in warns: print('warning:', w)
    if errors:
        for e in errors: print('ERROR:', e)
        sys.exit(1)
    # ---- reports
    out = ['# Source register', '', 'Generated by `scripts/data/build-knowledge.py` from `knowledge/sources.json`. Do not edit by hand.', '',
           'Copyright conclusions are our own reading, not legal advice. Status: **ready** = usable for research now; **conditional** = usable with the stated open question; **pending** = not yet read or verified; **blocked** = must not be used.', '']
    for s in src:
        out += [f"## {s['title']}", '', f"- **ID:** `{s['id']}`  |  **Systems:** {', '.join(s['system'])}  |  **Status:** {s['status']}",
                f"- **Author:** {s['author']}", f"- **Original year:** {s['originalYear']}", f"- **Edition used:** {s['edition']}", f"- **Kind:** {s['kind']}",
                f"- **URL:** {s['url'] or 'n/a'}  |  **Accessed:** {s['accessed']}",
                f"- **Copyright:** {s['copyright']['status']}. {s['copyright']['basis']}", f"- **Permitted use:** {s['permittedUse']}", f"- **Locator style:** {s['locatorStyle']}"]
        if s['concerns']:
            out.append('- **Unresolved concerns:**')
            out += [f'  - {c}' for c in s['concerns']]
        out.append('')
    open(f'{ROOT}/docs/source-register.md', 'w').write('\n'.join(out))
    by = collections.defaultdict(list)
    for r in rules: by[r['system']].append(r)
    st = ['# Interpretation rules: status by system', '', 'Generated by `scripts/data/build-knowledge.py`. Every rule is untested and not practitioner-reviewed unless stated. Tests of any kind do not prove a divination system is accurate.', '',
          '| System | Rules | Ready | Needs engine | Needs research | Needs rights check | Blocked | Excluded | Reviewed by practitioner |', '|---|---:|---:|---:|---:|---:|---:|---:|---:|']
    for sy in sorted(SYSTEMS):
        rs = by.get(sy, []); c = collections.Counter(r['readiness'] for r in rs)
        st.append(f"| {sy} | {len(rs)} | {c['ready']} | {c['needs-engine']} | {c['needs-research']} | {c['needs-rights']} | {c['blocked']} | {c['excluded']} | {sum(r['review']=='practitioner-reviewed' for r in rs)} |")
    st += ['', '## Rules', '']
    for sy in sorted(by):
        st += [f'### {sy}', '']
        for r in by[sy]:
            st += [f"- `{r['id']}` ({r['readiness']}): {r['concept']}  \n  Source: `{r['source']['id']}`, {r['source']['locator']}" + (f"  \n  Omitted on purpose: {r['omitted']}" if r.get('omitted') else '')]
        st.append('')
    open(f'{ROOT}/docs/interpretation-rules-status.md', 'w').write('\n'.join(st))
    # ---- full readable rule documents, one per system, for reviewers
    os.makedirs(f'{ROOT}/docs/interpretation-rules', exist_ok=True)
    for sy, rs in sorted(by.items()):
        d = [f'# Interpretation rules: {sy}', '', 'Generated by `scripts/data/build-knowledge.py` from `knowledge/rules/`. Every rule is our own wording. **Untested and not practitioner-reviewed unless stated.** Tests and reviews do not prove a divination system is accurate.', '', f'{len(rs)} rules. Source details are in `docs/source-register.md`.', '']
        for r in rs:
            d += [f"## `{r['id']}`", '', f"- **Topic:** {r['topic']}  |  **Readiness:** {r['readiness']}  |  **Testing:** {r['testing']}  |  **Practitioner review:** {r['review']}",
                  f"- **Traditional concept:** {r['concept']}", f"- **Source:** `{r['source']['id']}`, {r['source']['locator']}", f"- **Conditions:** {r['conditions']}", '', r['explanation'], '']
            if r.get('domains'):
                for dom, (u, v) in r['domains'].items(): d += [f"- *{dom}* (upright): {u}", f"- *{dom}* (reversed): {v}"]
                d.append('')
            if r.get('omitted'): d += [f"*Left out on purpose:* {r['omitted']}", '']
            if r.get('notes'): d += [f"*Note:* {r['notes']}", '']
        open(f'{ROOT}/docs/interpretation-rules/{sy}.md', 'w').write('\n'.join(d))
    print(f'ok: {len(src)} sources, {len(rules)} rules, no verbatim copying' + (' (checked against local texts)' if texts_dir else ' (overlap check NOT run)'))

main()
