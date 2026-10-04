"""Owner-authored choice gate. Merely having a Markdown file is not approval."""
import re
from common import ART, read_json, sha

def require_choice(row, art=ART):
    path=art/'OWNER-CHOICE.md'
    if not path.is_file(): raise ValueError('OWNER_CHOICE_REQUIRED: OWNER-CHOICE.md absent')
    text=path.read_text(encoding='utf-8')
    fields=dict(re.findall(r'^([a-z_][a-z0-9_]*):[ \t]*(\S.*?)[ \t]*$',text,re.M))
    if row.get('style_file') == 'style-fusion.json':
        # Owner chose families in prose before a fusion file existed. The host
        # compilation binds that unchanged decision to exact executable bytes.
        binding_path=art/'owner-choice-binding.json'
        if not binding_path.is_file(): raise ValueError('OWNER_CHOICE_REQUIRED: fusion binding absent')
        binding=read_json(binding_path)
        if binding.get('owner_choice_sha256')!=sha(path):
            raise ValueError('OWNER_CHOICE_REQUIRED: owner evidence changed')
        expected=('Soot Pulp - portrait, barrier','Rust and Ink - cars, ground and surfaces','Hot Ink - icon, effect')
        if any(value not in text for value in expected):
            raise ValueError('OWNER_CHOICE_REQUIRED: fusion decision not present')
        fields=binding
    if fields.get('owner_choice')!='approved' or not fields.get('owner_evidence'):
        raise ValueError('OWNER_CHOICE_REQUIRED: explicit approved choice and owner evidence required')
    style_path=art/row.get('style_file','')
    if fields.get('style_file')!=row.get('style_file') or not style_path.is_file() or fields.get('style_sha256')!=sha(style_path):
        raise ValueError('OWNER_CHOICE_REQUIRED: chosen style/hash does not match brief')
    if row.get('wave')=='V4' or row.get('id','').startswith('v4-'):
        if not fields.get('surface_stack') or fields.get('surface_stack')!=row.get('surface_stack'):
            raise ValueError('OWNER_SURFACE_STACK_REQUIRED')
    return fields
