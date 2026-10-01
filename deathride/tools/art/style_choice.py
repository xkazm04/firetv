"""Owner-authored choice gate. Merely having a Markdown file is not approval."""
import re
from common import ART, read_json, sha

def require_choice(row, art=ART):
    path=art/'OWNER-CHOICE.md'
    if not path.is_file(): raise ValueError('OWNER_CHOICE_REQUIRED: OWNER-CHOICE.md absent')
    text=path.read_text(encoding='utf-8')
    fields=dict(re.findall(r'^([a-z_][a-z0-9_]*):[ \t]*(\S.*?)[ \t]*$',text,re.M))
    if fields.get('owner_choice')!='approved' or not fields.get('owner_evidence'):
        raise ValueError('OWNER_CHOICE_REQUIRED: explicit approved choice and owner evidence required')
    style_path=art/row.get('style_file','')
    if fields.get('style_file')!=row.get('style_file') or not style_path.is_file() or fields.get('style_sha256')!=sha(style_path):
        raise ValueError('OWNER_CHOICE_REQUIRED: chosen style/hash does not match brief')
    if row.get('wave')=='V4' or row.get('id','').startswith('v4-'):
        if not fields.get('surface_stack') or fields.get('surface_stack')!=row.get('surface_stack'):
            raise ValueError('OWNER_SURFACE_STACK_REQUIRED')
    return fields
