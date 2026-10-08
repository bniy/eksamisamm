(function(root){
 'use strict';
 const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,Number(n)||0));
 const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
 function prepare(attempt){attempt.ink=Array.isArray(attempt.ink)?attempt.ink:[];attempt.answers.forEach(a=>{if(!a.id)a.id=uid();});return attempt;}
 function box(x,y,pageWidth,pageHeight,fontSize=14){const w=Math.min(.42,220/pageWidth),h=Math.min(.22,80/pageHeight);return{x:clamp(x,0,1-w),y:clamp(y,0,1-h),w,h,fontSize};}
 function move(annotation,x,y){annotation.x=clamp(x,0,1-annotation.w);annotation.y=clamp(y,0,1-annotation.h);}
 function wrap(text,font,size,width){const lines=[];for(const paragraph of String(text).replace(/\r/g,'').split('\n')){if(!paragraph){lines.push('');continue;}let line='';for(const word of paragraph.split(/\s+/)){if(!word)continue;const candidate=line?line+' '+word:word;if(font.widthOfTextAtSize(candidate,size)<=width){line=candidate;continue;}if(line){lines.push(line);line='';}for(const char of word){if(line&&font.widthOfTextAtSize(line+char,size)>width){lines.push(line);line=char;}else line+=char;}}lines.push(line);}return lines;}
 root.ExamAnnotations={clamp,uid,prepare,box,move,wrap};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.ExamAnnotations;
})(typeof window==='undefined'?globalThis:window);
