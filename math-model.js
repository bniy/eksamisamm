(function(root){
 'use strict';
 function prepare(attempt,paper){
  attempt.mathChoice=attempt.mathChoice===7?7:6;
  attempt.mathCurrent=Number.isInteger(attempt.mathCurrent)?Math.max(1,Math.min(7,attempt.mathCurrent)):1;
  for(const q of paper.questions){
   let a=attempt.answers.find(a=>a.mathQuestion===q.number);
   if(!a){a={id:'math-'+q.number,label:String(q.number),mathQuestion:q.number,text:'',flag:false,earned:'',max:q.points};attempt.answers.push(a);}
   const values=a.mathValues&&typeof a.mathValues==='object'?a.mathValues:{};
   a.mathValues=Object.fromEntries(q.fields.map(f=>[f.id,typeof values[f.id]==='string'?values[f.id].slice(0,20000):'']));
   a.mathWork=typeof a.mathWork==='string'?a.mathWork.slice(0,100000):'';
   a.mathDrawing=(Array.isArray(a.mathDrawing)?a.mathDrawing:[]).slice(0,1000).filter(s=>Array.isArray(s)&&s.length>0&&s.length<=10000&&s.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)));
   a.max=q.points;
  }
  attempt.mathExamVersion=1;
  return attempt;
 }
 function row(attempt,n){return attempt.answers.find(a=>a.mathQuestion===n);}
 function selected(attempt){return [1,2,3,4,5,attempt.mathChoice].map(n=>row(attempt,n)).filter(Boolean);}
 function started(a){return Object.values(a.mathValues||{}).some(v=>v.trim())||!!a.mathWork?.trim()||!!a.mathDrawing?.length;}
 function complete(a,q){return q.fields.every(f=>a.mathValues[f.id]?.trim())&&(!q.draw||a.mathDrawing.length>0||a.mathWork.trim());}
 function sync(a,q){a.text=q.fields.filter(f=>a.mathValues[f.id]?.trim()).map(f=>f.label+': '+a.mathValues[f.id]).join('\n');if(a.mathWork.trim())a.text+=(a.text?'\n\n':'')+'Lahenduskäik:\n'+a.mathWork;if(a.mathDrawing.length)a.text+=(a.text?'\n\n':'')+'Joonis on salvestatud selle ülesande juurde (varukoopias).';}
 function score(attempt){const answers=selected(attempt);let earned=0,graded=0,invalid=false;for(const a of answers){if(a.earned==='')continue;const n=Number(a.earned);if(!Number.isFinite(n)||n<0||n>Number(a.max)){invalid=true;continue;}earned+=n;graded++;}const complete=graded===6&&!invalid;return{earned,max:50,graded,total:6,invalid,complete,percent:complete?Math.round(earned*2):null};}
 root.MathAnswerModel={prepare,row,selected,started,complete,sync,score};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.MathAnswerModel;
})(typeof window==='undefined'?globalThis:window);
