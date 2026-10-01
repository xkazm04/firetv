"""Single data/IO contract for the offline art tools (no game dependencies)."""
from __future__ import annotations
import csv
import hashlib
import json
import os
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art'

def now():
    return datetime.now(timezone.utc).isoformat()

def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))

def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    os.replace(temp, path)

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()

def briefs(path):
    with Path(path).open(encoding='utf-8-sig', newline='') as f:
        rows = list(csv.DictReader(f))
    ids = set()
    for row in rows:
        if row['id'] in ids or not row['id'] or any(c not in 'abcdefghijklmnopqrstuvwxyz0123456789-_' for c in row['id']):
            raise ValueError('duplicate/unsafe asset id: ' + row['id'])
        ids.add(row['id'])
        if int(row['count']) != 1:
            raise ValueError('one image call per brief; use a sheet frame spec for multiple subjects')
        if row['kind'] == 'video':
            raise ValueError('video is outside this phase')
    return rows

def style_for(row, art=ART):
    """Explicit proof contracts; historical briefs keep their immutable v1 style."""
    name = row.get('style_file') or ('style-v1.json' if (art/'style-v1.json').exists() else 'style.json')
    path = (art/name).resolve()
    if path.parent != art.resolve() or not path.name.startswith('style'):
        raise ValueError('style file must be a direct art/style*.json child')
    return read_json(path)

@contextmanager
def file_lock(path, timeout=20):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    end = time.monotonic() + timeout
    while True:
        try:
            fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, str(os.getpid()).encode())
            os.close(fd)
            break
        except (FileExistsError, PermissionError):
            # Windows can report a delete-pending exclusive lock as EACCES.
            # The same bounded wait applies; this never steals another PID's lock.
            if time.monotonic() > end:
                raise RuntimeError(f'lock held: {path}; inspect its PID before manual recovery')
            time.sleep(.05)
    try:
        yield
    finally:
        path.unlink()

def append_json(path, record):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('a', encoding='utf-8') as f:
        f.write(json.dumps(record, ensure_ascii=False) + '\n')
        f.flush()
        os.fsync(f.fileno())

def compile_prompt(row, style, rejection=None):
    prompt = style['style_block'] + '\n\nACTION: ' + row['prompt_action']
    if row['kind'] == 'car':
        prompt += '\n' + style['camera']
        if row['class'] in style['accents']:
            prompt += '\nPainted panel accent: ' + style['accents'][row['class']] + '.'
    if row['background_key'] != 'none':
        prompt += '\nIsolate on a perfectly uniform solid ' + row['background_key'] + ' background, without gradient. Leave clear space all around.'
    prompt += '\n' + style['negative']
    if rejection:
        prompt += '\nCorrection from previous measured rejection: ' + rejection
    return prompt

def make_contact_sheet(items, output, title):
    from PIL import Image, ImageDraw, ImageFont
    import textwrap
    font_path = Path('C:/Windows/Fonts/consola.ttf')
    font = ImageFont.truetype(str(font_path), 14) if font_path.exists() else ImageFont.load_default()
    lines=[textwrap.wrap(', '.join(i.get('codes',[])),width=37) for i in items]
    cols, cw = 4, 310
    ch=265+14*max((max(0,len(v)-2) for v in lines),default=0)
    sheet = Image.new('RGB', (cols*cw, 55 + max(1, (len(items)+cols-1)//cols)*ch), '#20242B')
    d = ImageDraw.Draw(sheet)
    d.text((15, 15), title, fill='white', font=font)
    for i, item in enumerate(items):
        x, y = (i % cols)*cw, 55+(i//cols)*ch
        if item.get('path') and Path(item['path']).exists():
            im = Image.open(item['path']).convert('RGBA')
            im.thumbnail((cw-20, 195))
            sheet.paste(im, (x+(cw-im.width)//2, y+(195-im.height)//2), im)
        d.text((x+8, y+200), item['id'][:38], fill='white', font=font)
        d.text((x+8, y+218), item.get('verdict', 'ungraded')[:38], fill='#F0CB58', font=font)
        for j,line in enumerate(lines[i]):
            d.text((x+8, y+236+j*14), line, fill='#E99B91', font=font)
    Path(output).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output)
