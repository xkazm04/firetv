"""Resumable measurement/registration for the four approved ART STATES families.

Paid dispatch and proof approval remain in gen.py. This module never spends.
"""
import argparse
from pathlib import Path
from PIL import Image
import numpy as np
from common import ART, ROOT, briefs, read_json, write_json, sha, now, make_contact_sheet
from gen import candidates, reference_gate
from process import process_one
from part3_register import translate

PREFIX = 'art-states'


def measure():
    records = []
    generation = []
    reuse_path=ART/'audits/art-states-baselines.json'
    baselines=read_json(reuse_path) if reuse_path.exists() else {}
    for row in briefs(ART/'briefs/v2-part4-derived.csv'):
        reference_gate(row)
        for path in candidates(row):
            sidecar = read_json(path)
            if sidecar['status'] != 'generated':
                continue
            assert sha(sidecar['image']) == sidecar['sha256']
            assert sidecar['reference_sha256'] == sha(ROOT/row['reference'])
            assert sidecar['prompt_verbatim_verified']
            generation.append({k:sidecar[k] for k in ('asset','attempt','timestamp','status','session_id','input_hash','sha256','reference_sha256','prompt','prompt_verbatim_verified','image_tool_calls')})
            item = process_one(row, sidecar['image'], ART/'processed'/PREFIX/f"attempt-{sidecar['attempt']:02}")
            item['attempt'] = sidecar['attempt']
            item['generation_sidecar'] = str(path.relative_to(ROOT))
            if sidecar['attempt'] > 1:
                item['id'] += '-a'+str(sidecar['attempt'])
            records.append(item)
        if row['id'] in baselines:
            recipe=baselines[row['id']]
            assert row['requires_approval']==recipe['reference_id'] and '-state-intact-' in row['id']
            item=process_one(row,ROOT/row['reference'],ART/'processed/art-states-reference-baseline')
            item.update(id=recipe['id'],attempt=0,derivation=recipe)
            records.append(item)
    write_json(ART/'reports/art-states-attempts-deterministic.json', records)
    write_json(ART/'audits/art-states-generation.json', generation)
    latest = {}
    for r in records:
        latest[r['brief']['id']] = r
    write_json(ART/'reports/art-states-current-deterministic.json', list(latest.values()))
    make_contact_sheet(records, ART/'contact-sheets/art-states-attempts.png', 'ART STATES: unchanged source/export gates')
    print('Measured',len(records),'candidates;',len(latest),'current frames; failures:',[(r['id'],r['codes']) for r in records if r['codes']],flush=True)
    return records


def register():
    path = ART/'reports/art-states-current-deterministic.json'
    records = read_json(path)
    refs = {r['id']:r for r in read_json(ART/'review/fusion/review.json')['records']}
    ledger = read_json(ART/'reference-approvals.json')['references']
    audit = []
    for r in records:
        if r.get('registration'):
            continue
        key = r['brief']['requires_approval']; ref = refs[key]
        reference_gate(r['brief'])
        assert ref['source_sha256'] == ledger[key]['source_sha256']
        p, a = r['placement'], ref['placement']
        delta = [a['pivot_px'][i]-p['pivot_px'][i] for i in range(2)]
        original = Image.open(r['path']).convert('RGBA')
        out = translate(original, a['cell_px'], delta)
        box = original.getbbox(); alpha = np.asarray(out)[:,:,3]
        if (alpha[0].any() or alpha[-1].any() or alpha[:,0].any() or alpha[:,-1].any()
            or box and (box[0]+delta[0]<1 or box[1]+delta[1]<1 or box[2]+delta[0]>a['cell_px'][0]-1 or box[3]+delta[1]>a['cell_px'][1]-1)):
            raise ValueError('REFERENCE_REGISTRATION_CLIPS: '+r['id'])
        record = {'at':now(), 'reference_id':key, 'reference_source_sha256':ref['source_sha256'],
                  'reference_export_sha256':ref['export_sha256'], 'unregistered_path':r['path'],
                  'unregistered_export_sha256':r['sha256'], 'unregistered_placement':p,
                  'translation_px':delta, 'scale':1, 'recipe':'part3_register.translate: alpha-aware translation only; no stretching or source gate changes', 'new_paid_calls':0}
        if any(delta) or p['cell_px'] != a['cell_px']:
            target = ART/'processed/art-states-registered'/(r['id']+'.png')
            target.parent.mkdir(parents=True, exist_ok=True); out.save(target)
            r['path'] = str(target); r['sha256'] = sha(target)
        r['placement'] = {**p, 'pivot_px':a['pivot_px'], 'cell_px':a['cell_px'], 'pivot_reference_id':key}
        r['registration'] = {**record, 'export_sha256':r['sha256']}
        audit.append({'id':r['id'], **r['registration']})
    write_json(path, records)
    write_json(ART/'audits/art-states-registration.json', audit)
    print('Registered', len(records), 'frames')


if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('mode', choices=['measure','register'])
    {'measure':measure, 'register':register}[p.parse_args().mode]()
