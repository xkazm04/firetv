"""Shared offline review shell. Builders only read existing audio evidence."""
import html


def toolbar(root):
    return f'''<nav class="report-toolbar" aria-label="Review controls">
<a href="{root}index.html">All audio reports</a>
<label>Theme <select id="theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
<label><input id="matched" type="checkbox" checked> Matched playback level</label>
<a href="#category-choices">Choose category winners</a><a href="#review-export">Copy decisions</a></nav>
<p class="muted">Matching targets −26 LUFS with playback attenuation only and a −3 dBTP ceiling; quieter or peak-limited clips can remain below target. Short-cue matching is approximate. Files and acceptance results stay unchanged. Compare within a category at one listening volume. One player at a time; repeat controls support seam listening.</p>
<p id="status" class="status" role="status" aria-live="polite"></p>'''


def decisions(root):
    return f'''<section id="category-choices" class="review-section"><h2>Choose category winners</h2>
<p>Pick a winner, no winner, or a mix with sample IDs in the note. These choices are separate from each sample’s Keep / Maybe / Reject judgement. Families can contain different cues or lines; a family winner is a preferred reference, not a replacement for every cue.</p>
<div id="winner-fields" class="winner-grid"></div></section>
<section id="review-export" class="review-section export"><h2>Take your choices with you</h2>
<p>Paste the Markdown below into <a href="{root}OWNER-AUDIO-CHOICE.md">deathride/audio/OWNER-AUDIO-CHOICE.md</a>. This page never edits that file or grants production acceptance. Export before moving folders or changing browsers.</p>
<div class="report-toolbar"><button id="copy" type="button">Copy Markdown</button><button id="refresh-export" type="button">Preview Markdown</button></div>
<label for="export">Markdown export — also available for manual copy</label><textarea id="export" readonly></textarea></section>'''


def decorate(page, round_key, title, root, legacy_key):
    """Insert shared resources after local layout rules and after local data rendering."""
    page = page.replace('</head>', f'<link rel="stylesheet" href="{root}report.css"></head>')
    page = page.replace('<body>', f'<body data-round="{html.escape(round_key)}" data-page-title="{html.escape(title)}" data-legacy-key="{html.escape(legacy_key)}">')
    page = page.replace('__REVIEW_TOOLBAR__', toolbar(root)).replace('__REVIEW_DECISIONS__', decisions(root))
    return page.replace('</body>', f'<script src="{root}report.js"></script></body>')
