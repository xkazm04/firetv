"""Real Chrome/file:// review checks. Test decisions live in disposable contexts only."""
from datetime import datetime, timezone
from pathlib import Path
import json
import os
import sys
from urllib.parse import unquote, urlparse
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(os.environ.get('AUDIO_REVIEW_OUTPUT', ROOT / 'audio/review-evidence'))
REPORTS = {'x2': ('audition', 32, 9), 'effects': ('x3/effects', 40, 14),
           'engines': ('x3/engines', 20, 10), 'voices': ('x3/voices', 14, 16),
           'music': ('x3/music', 3, 1)}
NOTE = 'AUTOMATED TEST ONLY: Keep | Maybe \\| Reject\n<script> & notes'


def check(page, name, expected):
    folder, count, categories = expected
    uri = (ROOT / 'audio' / folder / 'index.html').as_uri()
    errors, network = [], []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('request', lambda request: network.append(request.url) if request.url.startswith(('http:', 'https:')) else None)
    page.goto(uri)
    sample = 'article.card[data-direction]:not([data-note-only])'
    assert page.locator(sample).count() == count
    assert page.locator('#winner-fields select').count() == categories
    assert page.locator('input[type=radio]:checked').count() == 0
    assert page.locator('input[type=radio]').count() == count * 3
    assert page.locator('#winner-fields select').evaluate_all('(xs)=>xs.every(x=>x.value === "")')
    assert page.locator('article.card[data-direction]').evaluate_all('(xs)=>new Set(xs.map(x=>x.dataset.direction)).size === xs.length')
    if name == 'x2':
        assert page.locator('.sample:visible').count() == 4
        page.select_option('#category', 'all')
        assert page.locator('.sample:visible').count() == 32
    elif name != 'music':
        options = page.locator('#filter option').all_text_contents()
        page.select_option('#filter', options[1])
        assert page.locator(sample + ':visible').count() < count
        page.select_option('#filter', 'all')
    result = {'page': uri, 'sampleCards': count, 'categories': categories, 'layouts': [], 'media': []}
    colors = []
    for theme in ['light', 'dark']:
        page.select_option('#theme', theme)
        colors.append(page.evaluate('getComputedStyle(document.body).backgroundColor'))
        for width in [320, 390, 768, 1440]:
            page.set_viewport_size({'width': width, 'height': 1000})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (name, theme, width)
            assert page.locator('audio:visible').evaluate_all('(xs)=>xs.every(x=>x.getBoundingClientRect().right <= innerWidth)')
            result['layouts'].append({'theme': theme, 'width': width, 'overflow': False})
            if width in [390, 1440]:
                page.screenshot(path=str(OUT / f'{name}-{theme}-{width}.png'))
    assert colors[0] != colors[1]
    page.select_option('#theme', 'system')
    page.emulate_media(color_scheme='light')
    assert page.evaluate('getComputedStyle(document.body).backgroundColor') == colors[0]
    page.emulate_media(color_scheme='dark')
    assert page.evaluate('getComputedStyle(document.body).backgroundColor') == colors[1]

    first = page.locator(sample).first
    page.set_viewport_size({'width': 390, 'height': 1000})
    first.screenshot(path=str(OUT / f'{name}-sample-controls.png'))
    page.set_viewport_size({'width': 1440, 'height': 1000})
    first.locator('input[value=Keep]').check()
    first.locator('textarea').fill(NOTE)
    # Test actual user input on every card, not just synthetic state assignment.
    for i in range(1, count):
        card = page.locator(sample).nth(i)
        card.locator(f'input[value={"Maybe" if i % 2 else "Reject"}]').check()
        card.locator('textarea').fill(f'AUTOMATED sample {i}; not an owner choice')
    ids = page.locator(sample).evaluate_all('(xs)=>xs.map(x=>x.dataset.samples)')
    for i in range(categories):
        select = page.locator('#winner-fields select').nth(i)
        value = select.locator('option').nth(3).get_attribute('value') if i % 3 == 0 else ('none' if i % 3 == 1 else 'mix')
        select.select_option(value)
        page.locator('#winner-fields textarea').nth(i).fill(f'AUTOMATED category {i} | note\nsecond line')
    page.select_option('#theme', 'light')
    before = page.locator('#winner-fields select').evaluate_all('(xs)=>xs.map(x=>x.value)')
    page.reload()
    if name == 'x2': page.select_option('#category', 'all')
    assert page.locator('input[type=radio]:checked').count() == count
    assert first.locator('input[value=Keep]').is_checked()
    assert first.locator('textarea').input_value() == NOTE
    assert page.locator('#winner-fields select').evaluate_all('(xs)=>xs.map(x=>x.value)') == before
    assert page.locator('#winner-fields textarea').nth(0).input_value() == 'AUTOMATED category 0 | note\nsecond line'
    assert page.input_value('#theme') == 'light'
    page.click('#copy')
    exported = page.input_value('#export')
    assert exported.startswith('## Death Ride — ')
    assert datetime.now(timezone.utc).date().isoformat() in exported.splitlines()[0]
    assert '| Category / direction | Pick | Samples | Owner note |' in exported
    assert '| Keep |' in exported and '| Maybe |' in exported and '| Reject |' in exported
    assert 'Winner:' in exported and 'Keep &#124; Maybe &#92;&#124; Reject<br>&lt;script&gt; &amp; notes' in exported
    assert '<script>' not in exported
    assert all(sample_id in exported for sample_id in ids)
    assert all(len(line.split('|')) == 6 for line in exported.splitlines() if line.startswith('|'))
    first.locator('.clear-pick').click()
    assert not first.locator('input:checked').count()
    page.reload()
    if name == 'x2': page.select_option('#category', 'all')
    assert not first.locator('input:checked').count()
    assert first.locator('textarea').input_value() == NOTE

    for mode in (['raw', 'matched', 'repeat'] if name == 'x2' else ['existing']):
        if name == 'x2': page.select_option('#mode', mode)
        assert page.locator('audio').evaluate_all('(xs)=>xs.every(a=>Math.abs(a.volume-Math.min(1,Math.pow(10,Number(a.dataset.gain)/20)))<1e-8)'), (name, mode, 'playback gain must follow the selected file')
        result['media'] += page.evaluate('''async mode => {
          const checks=[];
          for(const player of document.querySelectorAll('audio')) {
            if(mode==='repeat' && !player.src.endsWith('.ogg')) continue;
            player.muted=true;
            const duration=await new Promise((resolve,reject)=>{
              const timer=setTimeout(()=>reject(Error('Media timeout: '+player.src)),10000);
              player.onloadedmetadata=()=>{clearTimeout(timer);resolve(player.duration)};
              player.onerror=()=>{clearTimeout(timer);reject(Error('Media failed: '+player.src))};player.load();
            });
            if(!Number.isFinite(duration)||duration<=0) throw Error('Invalid duration');
            await player.play();player.pause();
            checks.push({file:player.getAttribute('src'),duration,mode,playStarted:true});
          } return checks;
        }''', mode)
    if name == 'x2': page.select_option('#mode', 'matched')
    assert page.evaluate('''async()=>{const[a,b]=document.querySelectorAll('audio');
      a.muted=b.muted=true;await a.play();await b.play();return a.paused&&!b.paused}''')
    page.click('#stop')
    assert page.locator('audio').evaluate_all('(xs)=>xs.every(x=>x.paused&&x.currentTime===0)')
    gains = page.locator('audio').evaluate_all('(xs)=>xs.map(x=>x.volume)')
    assert any(gain < 1 for gain in gains)
    page.uncheck('#matched')
    assert page.locator('audio').evaluate_all('(xs)=>xs.every(x=>x.volume===1)')
    page.check('#matched')
    assert page.locator('audio').evaluate_all('(xs)=>xs.map(x=>x.volume)') == gains
    repeat = page.locator('[data-loop-target]').first
    repeat.click()
    assert repeat.get_attribute('aria-pressed') == 'true'
    assert page.locator('audio').first.evaluate('(a)=>a.loop')
    # Seek close to the end and prove the player crosses into another pass.
    page.locator('audio').first.evaluate('async a=>{a.muted=true;a.currentTime=a.duration-0.12;await a.play()}')
    page.wait_for_function('()=>{const a=document.querySelector("audio");return !a.paused&&a.currentTime<0.8}')
    repeat.click()
    assert not page.locator('audio').first.evaluate('(a)=>a.loop')
    page.click('#stop')
    if name == 'music':
        for i, start in enumerate([0, 20, 60, 100, 120]):
            page.locator('#sections button').nth(i).click()
            page.wait_for_function('(start)=>{const a=document.querySelector("#main-player");return !a.paused&&a.currentTime>=start&&a.currentTime<start+2}', arg=start)
        page.click('#stop')
    for href in page.locator('a[href]').evaluate_all('(xs)=>xs.map(x=>x.getAttribute("href"))'):
        if href.startswith('#'): continue
        assert not urlparse(href).scheme, href
        assert (ROOT / 'audio' / folder / unquote(href.split('#')[0])).exists(), href
    assert not errors, errors
    assert not network, network
    result['checks'] = ['all card radios/notes and category winners persist', 'no default decisions', 'clear pick preserves notes',
                        'copy fills escaped dated Markdown table', 'all local media load and start muted', 'single playback and stop',
                        'repeat and matching', 'light/dark/system themes', '320/390/768/1440 widths', 'local links; zero network requests']
    return result


def fallbacks(browser, name, expected):
    folder = expected[0]
    uri = (ROOT / 'audio' / folder / 'index.html').as_uri()
    with browser.new_context() as context:
        context.add_init_script('''Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked')}});
          Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new Error('denied')}}});
          document.execCommand=()=>false;''')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(uri)
        first = page.locator('article.card[data-direction]').first
        first.locator('input[value=Keep]').check()
        first.locator('textarea').fill('AUTOMATED fallback note')
        assert 'storage unavailable' in page.locator('#status').inner_text()
        page.click('#copy')
        assert 'AUTOMATED fallback note' in page.input_value('#export')
        assert 'Ctrl+C' in page.locator('#status').inner_text()
        assert page.locator('#export').evaluate('(x)=>x.selectionEnd-x.selectionStart') == len(page.input_value('#export'))
        assert not errors, errors
    with browser.new_context() as context:
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(uri)
        key = page.locator('body').get_attribute('data-round')
        for invalid in ['{', 'null', '[]', '{"choices":[],"winners":null,"theme":"bad"}']:
            page.evaluate('([key,value])=>localStorage.setItem(key,value)', [key, invalid])
            page.reload()
            assert page.locator('input[type=radio]:checked').count() == 0
            page.click('#refresh-export')
            assert '| Not reviewed |' in page.input_value('#export')
        legacy_key = page.locator('body').get_attribute('data-legacy-key')
        legacy = {'notes': 'AUTOMATED legacy note', 'decision': 'Useful structure, refine sound'} if name == 'music' else {
            'music' if name == 'x2' else page.locator('article.card[data-direction]').first.get_attribute('data-direction'): 'AUTOMATED legacy note'}
        page.evaluate('([key,legacyKey,value])=>{localStorage.removeItem(key);localStorage.setItem(legacyKey,JSON.stringify(value))}', [key, legacy_key, legacy])
        page.reload()
        page.click('#refresh-export')
        assert 'AUTOMATED legacy note' in page.input_value('#export')
        assert page.locator('input[type=radio]:checked').count() == 0
        assert not errors, errors
    return ['storage denied: controls remain usable', 'clipboard denied: selected export fallback', 'malformed storage fallback', 'legacy notes retained without inferred picks']


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    names = sys.argv[1:] or list(REPORTS)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel='chrome', headless=True)
        for name in names:
            with browser.new_context(viewport={'width': 1440, 'height': 1000}) as context:
                result = check(context.new_page(), name, REPORTS[name])
            result['checks'] += fallbacks(browser, name, REPORTS[name])
            result.update(result='pass', at=datetime.now(timezone.utc).isoformat(), browser=browser.version,
                          notMeasured=['human listening', 'physical mobile browser', 'Fire TV / in-game acceptance'])
            (OUT / f'{name}.json').write_text(json.dumps(result, indent=2)+'\n', encoding='utf-8')
            print(json.dumps({'report': name, 'result': 'pass', 'media': len(result['media']), 'layouts': len(result['layouts'])}), flush=True)
        with browser.new_context() as context:
            page = context.new_page()
            page.goto((ROOT / 'audio/index.html').as_uri())
            assert page.locator('.report-links a').count() == 5
            for width in [320, 390, 768, 1440]:
                page.set_viewport_size({'width': width, 'height': 1000})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert all((ROOT / 'audio' / path / 'index.html').exists() for path, _, _ in REPORTS.values())
        browser.close()


if __name__ == '__main__':
    main()
