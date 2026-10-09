require('./ts-load.cjs');
const path=require('path');const src=f=>path.join(__dirname,'../desk/src',f);
const C=require(src('lib/rules/calc.ts'));
for(const f of ['x/(x+1)','ln(x)/x','(1+1/x)^x','(x^2+1)/(2x^2)','2^x/x^3','x^(1/x)','(1/2)^x','cos(pi*x)','sin(pi x)+1','-x^2+3x','sin(x)^2/x','exp(-x)*x','sqrt(x+1)-sqrt(x)','2^(x+1)/3^x','(-1)^x','log_2(x)/x','x*sin(1/x)','tan(1/x)','pi*x/e^x']){
 const s={shape:'sequence-limit',f};
 const q=C.question(s);const w=C.wellFormed(s);
 const back=q&&C.specFromQuestion(q.plain);
 console.log(f.padEnd(20),w.ok?'ok ':'no '+w.why,'|',q&&q.plain,'|',back&&back.f, back&&C.question(back).plain===q.plain);
}
console.log(C.question({shape:'sequence-limit',f:'x/(x+1)'}));
for(const t of ['Find the limit of the sequence a_n = n/(n+1).','Determine whether the sequence a_n = ln(n)/n converges or diverges. If it converges, find the limit.','Find lim_(n->infinity) (1+1/n)^n','Find the limit as n approaches infinity of (n^2+1)/(2n^2).','Find the limit of the sequence a_n = sin(n)/n.','Find the limit of the sequence a_n = tan(1/n).','Find the limit of the sequence a_n = pin/(n+1).','Find the limit of the sequence a_n = en/(n+1).']) console.log(t, JSON.stringify(C.specFromQuestion(t)));
