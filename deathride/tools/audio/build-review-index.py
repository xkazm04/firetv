"""Build the offline entry point; no generation, measurement or network work."""
from pathlib import Path

reports = [
    ('audition/index.html', 'X2 / Four philosophies', '32 samples: race music, engine, Rivet, mine blast, crunch, pickup, UI and announcer / mechanic voice candidates.'),
    ('x3/effects/index.html', 'X3 / Effects', '40 candidates, with original, edited and retained first-pass evidence. Choose by effect family; crunch remains an open comparison.'),
    ('x3/engines/index.html', 'X3 / Engines', 'Two short engine character variants for each of ten car classes. Choose a winner per car.'),
    ('x3/voices/index.html', 'X3 / Voices', 'Six announcer and eight mechanic lines. The held mechanic seizure line keeps its failure label.'),
    ('x3/music/index.html', 'X3 / 150 second music proof', 'One local composition: final master, first render and unmatched score evidence. No paid long-form take or installed race song.'),
]
links = ''.join(f'<li><a href="{path}">{title}</a><p>{description}</p></li>' for path, title, description in reports)
page = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Death Ride / Audio review reports</title><link rel="stylesheet" href="report.css"></head><body><main>
<header><p>DEATH RIDE / OWNER AUDIO REVIEW</p><h1>Listen. Choose. Keep the notes.</h1>
<p>Five offline reports with sample choices, category winners and Markdown export for <a href="OWNER-AUDIO-CHOICE.md">OWNER-AUDIO-CHOICE.md</a>.</p></header>
<ul class="report-links">{links}</ul>
<p>Each report saves its own review in this browser. Copy Markdown before moving folders or switching browsers. Keep is a listening preference; all signal failures, spend evidence and remaining acceptance gates stay visible.</p>
<p>This format update generated no audio, spent no credits and changed no existing owner decisions. All players and report resources are local.</p>
</main></body></html>'''
Path('audio/index.html').write_text(page, encoding='utf-8', newline='\n')
print(Path('audio/index.html').resolve().as_uri())
