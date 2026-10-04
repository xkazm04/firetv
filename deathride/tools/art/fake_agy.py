"""Subprocess fixture, never an image provider. Used only by test_agy.py."""
import json
import os
from pathlib import Path
import re
import sys
from PIL import Image

args=sys.argv[1:]
assert '--dangerously-skip-permissions' in args
prompt=args[args.index('-p')+1]
mode=os.environ.get('FAKE_AGY_MODE','success')
print(json.dumps(dict(type='init',conversation_id='fake-session')),flush=True)
if '--conversation' in args:
    assert args[args.index('--conversation')+1]=='fake-session'
    assert 'Do NOT call the image tool' in prompt
    print(json.dumps(dict(type='result',text='Verified existing file')),flush=True)
elif mode in ('quota','auth'):
    print(json.dumps(dict(type='error',message='HTTP 429 Too many requests' if mode=='quota' else 'HTTP 401 Unauthorized')),flush=True)
else:
    path=Path(re.search(r'Save the resulting PNG to (.+?)\. Use the IMAGE',prompt).group(1))
    if mode=='invalid':path.write_text('not an image')
    elif mode=='success':
        Image.new('RGB',(1024,1024),'magenta').save(path)
        print(json.dumps(dict(type='tool_call',name='image_gen',arguments=dict(prompt=prompt.split('IMAGE PROMPT:\n')[1]))),flush=True)
    print(json.dumps(dict(type='result',text='SUCCESS')),flush=True)
