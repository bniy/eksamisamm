(function(root){
 'use strict';
 function prepare(d,paper){
  if(!Array.isArray(d.answers))d.answers=[];
  d.subjectCurrent=Number.isInteger(d.subjectCurrent)?Math.max(1,Math.min(paper.pages.length,d.subjectCurrent)):1;
  for(const p of paper.pages){
   let a=row(d,p.number);
   if(!a){a={id:'page-'+p.number,label:String(p.number),subjectPage:p.number,text:'',flag:false,earned:'',max:''};d.answers.push(a);}
   const old=a.pageValues&&typeof a.pageValues==='object'?a.pageValues:{};
   a.pageValues=Object.fromEntries(p.fields.map(f=>[f.id,f.kind==='check'?old[f.id]===true:typeof old[f.id]==='string'?old[f.id].slice(0,100000):'']));
   a.pageWork=typeof a.pageWork==='string'?a.pageWork.slice(0,100000):'';
   a.pageDrawing=(Array.isArray(a.pageDrawing)?a.pageDrawing:[]).slice(0,1000).filter(s=>Array.isArray(s)&&s.length>0&&s.length<=10000&&s.every(v=>Array.isArray(v)&&v.length===2&&v.every(n=>Number.isFinite(n)&&n>=0&&n<=1)));
   a.pageDone=!!a.pageDone;a.earned=a.earned??'';a.max=a.max??'';
  }
  d.subjectExamVersion=1;return d;
 }
 function row(d,n){return d.answers.find(a=>a.subjectPage===n);}
 function selected(d){return d.answers.filter(a=>a.subjectPage);}
 function started(a){return Object.values(a.pageValues||{}).some(v=>v===true||typeof v==='string'&&v.trim())||!!a.pageWork?.trim()||!!a.pageDrawing?.length;}
 function sync(a,p){a.text=p.fields.filter(f=>a.pageValues[f.id]===true||typeof a.pageValues[f.id]==='string'&&a.pageValues[f.id].trim()).map(f=>f.label+': '+(f.kind==='check'?'X':a.pageValues[f.id])).join('\n');if(a.pageWork.trim())a.text+=(a.text?'\n\n':'')+'Mõttekäik ja lisavastused:\n'+a.pageWork;if(a.pageDrawing.length)a.text+=(a.text?'\n\n':'')+'Joonis on salvestatud leheküljele (varukoopias).';}
 function score(d){let earned=0,max=0,graded=0,invalid=false;const rows=selected(d).filter(a=>started(a)||a.pageDone||a.earned!==''||a.max!=='');for(const a of rows){if(a.earned===''&&a.max==='')continue;const e=Number(a.earned),m=Number(a.max);if(a.earned===''||a.max===''||!Number.isFinite(e)||!Number.isFinite(m)||m<0||e<0||e>m){invalid=true;continue;}earned+=e;max+=m;graded++;}const complete=rows.length>0&&graded===rows.length&&!invalid&&max>0;return{earned,max,graded,total:rows.length,invalid,complete,percent:complete?Math.round(earned/max*100):null};}
 root.SubjectAnswerModel={prepare,row,selected,started,sync,score};if(typeof module!=='undefined'&&module.exports)module.exports=root.SubjectAnswerModel;
})(typeof window==='undefined'?globalThis:window);
