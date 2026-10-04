(() => {
  'use strict';
  const data=window.TRACK_SHAPES, $=id=>document.getElementById(id), el=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e};
  $('truth').textContent=data.truth;
  const flags=c=>c.shape.gates.filter(g=>g.status!=='pass');
  $('summary').textContent=`${data.courses.length} measured courses; ${data.courses.filter(c=>flags(c).length).length} fail shape gates; ${data.proof.filter(p=>p.fired).length}/${data.proof.length} planted witnesses fire; ${data.pairs.filter(p=>p.similar).length} similar pairs.`;
  $('proof').textContent=data.proof.map(p=>`${p.fired?'PASS':'FAIL'} — ${p.name}`).join('\n');
  for(const p of data.pairs.filter(p=>p.similar)) {const tr=el('tr','');for(const v of [p.a,p.b,p.metrics.outlineDistance.toFixed(4),p.metrics.turningDistance.toFixed(4)])tr.append(el('td',v));$('pairs').append(tr)}
  function outline(ctx,points,x,y,w,h,color='#186c80') {
    const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=Math.min((w-24)/(maxX-minX),(h-24)/(maxY-minY));
    ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();points.forEach((p,i)=>{const px=x+w/2+(p[0]-(minX+maxX)/2)*scale,py=y+h/2-(p[1]-(minY+maxY)/2)*scale;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.closePath();ctx.stroke();
  }
  const sheet=$('sheet');sheet.width=1500;sheet.height=Math.ceil(data.courses.length/5)*240;const ctx=sheet.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,sheet.width,sheet.height);
  data.courses.forEach((c,i)=>{const x=i%5*300,y=Math.floor(i/5)*240;outline(ctx,c.shape.outline,x,y+24,300,200);ctx.fillStyle=c.acceptedException?'#206b37':'#a52c2c';ctx.font='16px sans-serif';ctx.textAlign='center';ctx.fillText(c.id+(c.acceptedException?' · KEEP':''),x+150,y+22)});
  for(const c of data.courses) {
    const card=el('article','');card.className='card';card.dataset.direction=c.id;card.dataset.label=c.name;card.dataset.samples=`${c.id}; R1 geometry only`;card.append(el('h2',c.name));
    if(c.acceptedException)card.append(el('p','Owner Keep — Runoff preserved; named shape exception.'));
    const canvas=el('canvas','');canvas.className='shape-map';canvas.width=600;canvas.height=360;const cx=canvas.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,600,360);outline(cx,c.shape.outline,0,0,600,360);card.append(canvas);
    const sig=el('canvas','');sig.className='shape-signature';sig.width=600;sig.height=90;const sx=sig.getContext('2d');sx.fillStyle='#fff';sx.fillRect(0,0,600,90);sx.strokeStyle='#aaa';sx.beginPath();sx.moveTo(0,45);sx.lineTo(600,45);sx.stroke();sx.strokeStyle='#b14b18';sx.beginPath();c.shape.turningSignature.forEach((v,i)=>{const x=i/255*600,y=45-v*160;i?sx.lineTo(x,y):sx.moveTo(x,y)});sx.stroke();card.append(el('p','Signed turn along lap (equal arc samples)'),sig);
    card.append(el('p',Object.entries(c.shape.histogram).map(([k,v])=>`${k}: ${v}`).join(' · ')));
    const table=el('table','');for(const [k,v] of Object.entries(c.shape.metrics)){const tr=el('tr','');tr.append(el('th',k),el('td',Number(v).toFixed(3)));table.append(tr)}card.append(table);
    const fail=el('p','Flags: '+flags(c).map(g=>g.metric).join(', '));fail.className='shape-flags';card.append(fail);
    const details=el('details','');details.append(el('summary','Ordered corner breakdown'),el('pre',c.shape.corners.map(k=>`${(k.start*100).toFixed(1)}%: ${k.type}, ${k.degrees.toFixed(1)}°, R ${k.radiusL.toFixed(2)} L`).join('\n')));card.append(details);$('courses').append(card);
  }
  window.shapeReady=true;
})();
