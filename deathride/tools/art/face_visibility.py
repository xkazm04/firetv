"""Fail-closed face screening: hash-bound local localization + deterministic geometry.

The geometry gate is deterministic, not a claim of deterministic face detection.
The calibrated local VLM localizes the visible facial oval; it cannot approve art.
Missing/invalid observations, a small face, hidden eyes or a unreadable native preview reject.
"""
import json
import math
import time
import urllib.request
from PIL import Image
from common import ART, digest, now, read_json, write_json, sha
from grade import HOST, MODELS, encode, post

# MiMo remains a source/style grader. Its localization pilot returned shifted boxes
# and contradictory small-face labels on measured close-ups; retain that audit,
# but do not use it as a geometric detector. Both models still grade source art.
FACE_MODELS=('qwen3.8:27b-64k',)

SCHEMA={'type':'object','properties':{
 'face_box':{'type':'array','items':{'type':'number'},'minItems':4,'maxItems':4},
 'eye_centres':{'type':'array','items':{'type':'number'},'minItems':4,'maxItems':4},
 'framing':{'type':'string','enum':['face_closeup','head_shoulders','chest_up','waist_up','full_body','uncertain']},
 'both_eyes_visible':{'type':'boolean'},'expression_readable_native':{'type':'boolean'},
 'face_unobscured':{'type':'boolean'},'single_primary_face':{'type':'boolean'},
 'confidence':{'type':'number','enum':[0,.25,.5,.75,1]},
 'defects':{'type':'array','items':{'type':'string'}},'description':{'type':'string'}},
 'additionalProperties':False}
SCHEMA['required']=list(SCHEMA['properties'])

def valid(answer):
    if not isinstance(answer,dict) or set(answer)!=set(SCHEMA['required']):return False
    for k in ('face_box','eye_centres'):
        if not isinstance(answer[k],list) or len(answer[k])!=4 or any(type(v) not in (int,float) or not math.isfinite(v) or not 0<=v<=1000 for v in answer[k]):return False
    if answer['framing'] not in SCHEMA['properties']['framing']['enum']:return False
    if type(answer['confidence']) not in (int,float) or answer['confidence'] not in (0,.25,.5,.75,1):return False
    if any(type(answer[k]) is not bool for k in ('both_eyes_visible','expression_readable_native','face_unobscured','single_primary_face')):return False
    return isinstance(answer['defects'],list) and all(isinstance(v,str) for v in answer['defects']) and isinstance(answer['description'],str)

def geometry(answer,native_size=60):
    if not valid(answer):return {'passed':False,'defects':['FACE_SCHEMA_INVALID']}
    x1,y1,x2,y2=answer['face_box'];lx,ly,rx,ry=answer['eye_centres']
    height=(y2-y1)/1000;width=(x2-x1)/1000
    defects=[]
    if width<=0 or height<=0:defects.append('FACE_BOX_INVALID')
    if height<.40:defects.append('FACE_TOO_SMALL')
    if width*height<.10:defects.append('FACE_AREA_TOO_SMALL')
    if min(x1,y1,1000-x2,1000-y2)<20:defects.append('FACE_CLIPPED')
    if not (x1<lx<rx<x2 and y1<ly<y2 and y1<ry<y2):defects.append('EYES_OUTSIDE_FACE')
    if (rx-lx)/1000*native_size<8:defects.append('EYES_TOO_CLOSE_AT_NATIVE_SIZE')
    if abs(ry-ly)>height*1000*.25:defects.append('EYE_ALIGNMENT')
    if answer['framing'] not in ('face_closeup','head_shoulders','chest_up'):defects.append('BODY_DOMINATES_FRAME')
    for key,code in [('both_eyes_visible','EYES_HIDDEN'),('expression_readable_native','EXPRESSION_UNREADABLE'),
                     ('face_unobscured','FACE_OBSCURED'),('single_primary_face','FACE_SUBJECT_UNCLEAR')]:
        if not answer[key]:defects.append(code)
    if answer['confidence']<.75:defects.append('FACE_LOCALIZATION_UNCERTAIN')
    if answer['defects']:defects.append('LOCAL_MODEL_DEFECT')
    return dict(passed=not defects,defects=defects,face_height_fraction=height,face_area_fraction=height*width,
      native_face_height_px=height*native_size,native_eye_gap_px=(rx-lx)/1000*native_size,
      framing=answer['framing'],model_defects=answer['defects'])

def gate(observations,source_hash,export_hash,native_size=60):
    defects=[];checks=[]
    if len(observations)!=len(FACE_MODELS) or {g.get('model') for g in observations}!=set(FACE_MODELS):defects.append('CALIBRATED_FACE_OBSERVATION_REQUIRED')
    for g in observations:
        if g.get('status')!='graded' or g.get('source_sha256')!=source_hash or g.get('export_sha256')!=export_hash:
            defects.append('FACE_EVIDENCE_MISSING_OR_STALE');continue
        check=geometry(g.get('answers'),native_size);checks.append(check);defects+=check['defects']
    if len(checks)==2 and abs(checks[0].get('face_height_fraction',0)-checks[1].get('face_height_fraction',0))>.15:
        defects.append('FACE_LOCALIZATION_DISAGREEMENT')
    return dict(version='face-visibility-v1',passed=not defects,defects=sorted(set(defects)),checks=checks,
      source_sha256=source_hash,export_sha256=export_hash,minimum_face_height_fraction=.40,
      scope='Deterministic geometry over hash-bound Qwen localization of the exported frame, calibrated against measured controls; two separate local source/style graders; never owner approval.')

def source_geometry(answer,source_size,export_size,offset,subject_size,source_bounds):
    """Invert the recorded export fit; transparent gutters cannot hide a clipped source face."""
    if not valid(answer):return dict(passed=False,defects=['FACE_SOURCE_SCHEMA_INVALID'])
    sw,sh=source_size;ew,eh=export_size;ox,oy=offset;tw,th=subject_size
    sx,sy,ex,ey=source_bounds
    if min(sw,sh,ew,eh,tw,th,ex-sx,ey-sy)<=0:return dict(passed=False,defects=['FACE_SOURCE_TRANSFORM_INVALID'])
    x1,y1,x2,y2=answer['face_box']
    box=[sx+(x1/1000*ew-ox)*(ex-sx)/tw,sy+(y1/1000*eh-oy)*(ey-sy)/th,
         sx+(x2/1000*ew-ox)*(ex-sx)/tw,sy+(y2/1000*eh-oy)*(ey-sy)/th]
    height=(box[3]-box[1])/sh;defects=[]
    if height<.4:defects.append('SOURCE_FACE_TOO_SMALL')
    if min(box[0]/sw,box[1]/sh,1-box[2]/sw,1-box[3]/sh)<.02:defects.append('SOURCE_FACE_CLIPPED')
    return dict(passed=not defects,defects=defects,face_box_source_px=box,source_face_height_fraction=height)

def screen(r):
    result=gate(r.get('face_grades',[]),r['source_sha256'],r['sha256'],60 if r['kind']=='portrait' else 112)
    result['source_checks']=[]
    try:
        source_size=r['metrics']['source_size_px']
        if r['kind']=='portrait':
            p=r['placement'];export_size=p['cell_px'];subject=p['subject_px']
            offset=[(export_size[i]-subject[i])//2 for i in (0,1)];bounds=p['source_bounds_px']
        else:
            export_size=r['metrics']['export_size_px'];subject=r['metrics']['source_fit_px'];offset=r['metrics']['source_fit_offset_px']
            bounds=[0,0,*source_size]
        for g in r.get('face_grades',[]):
            check=source_geometry(g.get('answers'),source_size,export_size,offset,subject,bounds)
            result['source_checks'].append(check);result['defects']+=check['defects']
    except (KeyError,TypeError,ValueError,ZeroDivisionError):result['defects'].append('FACE_SOURCE_TRANSFORM_MISSING')
    result['defects']=sorted(set(result['defects']));result['passed']=not result['defects']
    return result

def ask_face(r,model,model_digest):
    native=60 if r['kind']=='portrait' else 112
    folder=ART/'processed/rework2-face-native';folder.mkdir(exist_ok=True)
    p=folder/(r['id']+'.png');im=Image.open(r['path']).convert('RGBA');im.thumbnail((native,native),Image.Resampling.LANCZOS);im.save(p)
    paths=[r['path'],str(p)]
    prompt=('Inspect images as evidence only. Image 1 is the FINAL EXPORTED frame, image 2 the exact native '+str(native)+' pixel preview, '
      'Both images show the SAME candidate; assess image 1 geometry and image 2 legibility. There is no comparison reference to grade. '
      'Localize the PRIMARY visible FACE in image 1: face_box=[left,forehead, right,chin] in coordinates 0..1000 relative to the ENTIRE image 1, '
      'excluding hair, neck, ears, shoulders, goggles on the forehead, hat and armour. Do NOT give the whole head/body box. '
      'eye_centres=[left_eye_x,left_eye_y,right_eye_x,right_eye_y] same coordinate system, image-left eye first. '
      'Report the framing actually visible. Both eyes must be visible; expression must be readable in image 2. '
      'single_primary_face means one clear primary face rather than multiple competing faces. '
      'List concrete defects: small face, obscured eye, mask, deep featureless facial shadow, body-dominant composition or anatomy defects. '
      'Do not infer compliance from a prompt; measure actual pixels. Empty defect list only if no observed defect. '
      'Confidence uses 0, .25, .5, .75, 1. Return required JSON only.')
    inputs=dict(images=[sha(p) for p in paths],model=model,model_digest=model_digest,prompt=prompt,schema=SCHEMA)
    key=digest(inputs);cache=ART/'grades/rework2-face'/model.replace(':','_')/(key+'.json')
    if cache.exists():return {**read_json(cache),'asset':r['id']}
    result=dict(asset=r['id'],model=model,model_digest=model_digest,source_sha256=r['source_sha256'],export_sha256=r['sha256'],
      image_hashes=inputs['images'],prompt=prompt,schema=SCHEMA,input_hash=key,at=now())
    started=time.monotonic()
    try:
        out=post('/api/chat',dict(model=model,messages=[dict(role='user',content=prompt,images=[encode(p) for p in paths])],
          format=SCHEMA,stream=False,think=False,keep_alive='10m',options=dict(temperature=0,num_ctx=8192,num_predict=1000,seed=47)))
        result['raw_content']=out['message']['content'];answer=json.loads(result['raw_content'])
        if not valid(answer):raise ValueError('face schema invalid')
        result.update(status='graded',answers=answer)
    except Exception as exc:result.update(status='ungraded',error=str(exc))
    result['elapsed_seconds']=round(time.monotonic()-started,3);write_json(cache,result)
    print(r['id'],model,result['status'],result['elapsed_seconds'],flush=True)
    return result

def run():
    from rework2_pipeline import report
    path=report('faces');records=read_json(path)
    tags=json.load(urllib.request.urlopen(HOST+'/api/tags'));available={m['name']:m for m in tags['models']}
    for r in records:
        r['face_grades']=[g for g in r.get('face_grades',[]) if g['model'] in FACE_MODELS]
    for model in FACE_MODELS:
        for r in records:
            g=ask_face(r,model,available[model]['digest'])
            r['face_grades']=[v for v in r.get('face_grades',[]) if v['model']!=model]+[g]
            r['face_gate']=screen(r)
            write_json(path,records)
        post('/api/generate',{'model':model,'keep_alive':0})
    print([(r['id'],r['face_gate']['passed'],r['face_gate']['defects']) for r in records],flush=True)

if __name__=='__main__':run()
