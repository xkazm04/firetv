"""One targeted correction per observed world defect; no transport or quota retry."""
import concurrent.futures
from common import ART,read_json,write_json,briefs,now,file_lock,make_contact_sheet
from gen import Budget,candidates,generate

NOTES={
 'p4-effects-explosion-v1':'FRAME_BOUNDARY / WRONG_SUBJECT: the sheet contains solid panels and machinery instead of isolated effects. ONLY six small floating explosion clouds on pure uniform magenta: white dot, orange burst, large orange round cloud, grey-orange cloud, small grey puff, tiny grey wisp. No debris, panels, objects, cars, weapons, ground or borders. Largest cloud is less than HALF its cell width and height. Keep clear empty magenta between all cells.',
 'p4-effects-smoke-v1':'KEY_FRINGE: the grey smoke has pink contaminated outlines. Smoke itself is ONLY neutral grey and charcoal, all outline edges dark charcoal, no pink or violet on any foreground puff. Surround all six separate puffs with perfectly flat pure magenta; no bloom, glow, transparency effect or gradient into the background. Six clear flat opaque cel shapes progressing from dense dark puff to a few tiny grey wisps.',
 'p4-effects-fire-v1':'NOT_TOP_DOWN: the previous fire has upright side-view candle/flame icons. Show a fire viewed DIRECTLY FROM ABOVE: six changing irregular circular radial flame patches, orange rim and yellow centre, no upward-pointing vertical flame silhouette. Each frame a different overhead circular flare, same centre and size range. No campfire, logs, object or scene.',
 'p4-props-tyres-scattered-v1':'WRONG_SUBJECT: previous rings are complete wheels with metal hubs and coloured rims. Show THREE PLAIN BLACK RUBBER TYRES ONLY, empty circular magenta holes, no wheel, hub, spokes, metal, coloured paint, lettering or decoration. A loose triangular cluster viewed directly overhead, complete tyre rings with charcoal tread.',
 'p4-pickups-turbo-v1':'EXTRA_EMBLEM: the bottle should have ONE large simple ivory lightning bolt and otherwise blank orange paint. No tiny secondary badge, outlined emblem, engine icon or lettering anywhere. Keep valve and silhouette simple, bold and readable at 64 pixels.',
 'p4-portraits-vex-v1':'FORBIDDEN_DETAILS: the jacket has a large number. Every part of the jacket must be plain orange with charcoal seams and cool-grey hardware. Absolutely no digits, letters, badges, emblems or printed marks on any panel. Keep the fictional adult face, orange racing suit and complete small bust with clear margin.',
 'p4-decals-skid-v1':'PALETTE: skid streaks are only charcoal and near-black rubber, no purple, violet, blue, yellow or coloured highlights. Flat ground marks, no raised edges or directional shine. Same two short parallel irregular streaks on plain magenta.',
 'p4-decals-cracks-v1':'WRONG_MATERIAL: previous crack has bright white and turquoise shards. This is a crack in DARK ASPHALT, only thin branching NEAR-BLACK lines with sparse small COOL-GREY edge chips. No blue, turquoise, white shards, glass, lightning or thick bright outlines. Flat overhead dark crack decal on pure magenta.'}

def run():
    rows=briefs(ART/'briefs/p4-world.csv');jobs=[];budget=Budget();style=read_json(ART/'style.json')
    asphalt=next(r for r in briefs(ART/'briefs/p1-current.csv') if r['class']=='asphalt');rows.append(asphalt)
    notes={**NOTES,'p1-tile-asphalt-v1':'TILE_REPETITION: previous material repeats motifs in quadrants. The entire square contains ONLY clean dark charcoal asphalt with unique random fine grain, NOT a repeated or mirrored demonstration. No car, wheel, vehicle, object, border or scene. ONE empty stochastic material swatch. Very low-contrast tiny aggregate distributed differently in every part of the square; no cracks, bright stones or distinctive motifs. Seamless across edges.'}
    with file_lock(ART/'.run.lock',timeout=1):
        for row in rows:
            if row['id'] not in notes:continue
            old=read_json(candidates(row)[-1]);expected=2 if row['id']==asphalt['id'] else 1
            if old['attempt']!=expected:raise ValueError('correction already attempted or unexpected history: '+row['id'])
            rejection={'asset':row['id'],'image_sha256':old['sha256'],'note':notes[row['id']],'attempt':old['attempt'],'at':now()}
            write_json(ART/'rejections'/(row['id']+'.json'),rejection);budget.record({'event':'content-rejection',**rejection});jobs.append(row)
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            results=list(pool.map(lambda row:generate(row,style,budget,True),jobs))
        make_contact_sheet([{'id':r['asset'],'path':r.get('image'),'verdict':r['status']} for r in results],ART/'contact-sheets/p4-repair-batch.png','P4 | targeted content corrections, not accepted')
        print(budget.summary())

if __name__=='__main__':run()
