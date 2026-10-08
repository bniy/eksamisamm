(function(root){
 'use strict';
 let dependencies;
 function script(src){return new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=()=>{el.remove();reject(Error('PDF-i eksportimise teeki ei saanud laadida.'));};document.head.append(el);});}
 async function libraries(){if(!dependencies)dependencies=Promise.all([script('vendor/pdf-lib.min.js'),script('vendor/fontkit.umd.min.js')]).catch(err=>{dependencies=null;throw err;});await dependencies;return{pdfLib:root.PDFLib,fontkit:root.fontkit};}
 // Coordinates are stored relative to the visible page, independent of zoom.
 function geometry(page){const c=page.getCropBox(),r=((page.getRotation().angle%360)+360)%360,w=r%180?c.height:c.width,h=r%180?c.width:c.height;return{width:w,height:h,rotation:r,point(x,y){if(r===90)return{x:c.x+y*c.width,y:c.y+x*c.height};if(r===180)return{x:c.x+(1-x)*c.width,y:c.y+y*c.height};if(r===270)return{x:c.x+(1-y)*c.width,y:c.y+(1-x)*c.height};return{x:c.x+x*c.width,y:c.y+(1-y)*c.height};}};}
 async function build({attempt,papers,fontBytes,pdfLib,fontkit,fetcher=fetch}){
  if(!pdfLib||!fontkit)({pdfLib,fontkit}=await libraries());
  const {PDFDocument,rgb,degrees}=pdfLib,out=await PDFDocument.create(),offsets=[],counts=[];
  for(const paper of papers){offsets.push(out.getPageCount());const response=await fetcher(paper.local||paper.url);if(!response.ok)throw Error('Eksamitöö faili ei saanud laadida.');const source=await PDFDocument.load(await response.arrayBuffer());counts.push(source.getPageCount());const pages=await out.copyPages(source,source.getPageIndices());pages.forEach(p=>out.addPage(p));}
  const annotatedPage=a=>a&&Number.isInteger(a.paper)&&Number.isInteger(a.page)&&a.page>=1&&a.page<=counts[a.paper]?out.getPage(offsets[a.paper]+a.page-1):null;
  out.registerFontkit(fontkit);
  if(!fontBytes){const res=await fetcher('fonts/space-grotesk-500.ttf');if(!res.ok)throw Error('PDF-i kirjastiili ei saanud laadida.');fontBytes=await res.arrayBuffer();}
  const font=await out.embedFont(fontBytes,{subset:true}),appendix=[],wrap=root.ExamAnnotations.wrap;
  for(const answer of attempt.answers){if(!answer.text.trim())continue;const a=answer.annotation,page=annotatedPage(a);if(!a||!page){appendix.push({label:answer.label,text:answer.text});continue;}
   const g=geometry(page),size=a.fontSize||14,lineHeight=size*1.2,width=Math.max(20,a.w*g.width-8),lines=wrap(answer.text,font,size,width),capacity=Math.max(1,Math.floor((Math.min(a.h,1-a.y)*g.height-8)/lineHeight));
   let visible=lines;if(lines.length>capacity){visible=[...lines.slice(0,Math.max(0,capacity-1)),'[Jätkub lisalehel]'];appendix.push({label:answer.label,text:answer.text});}
   visible.forEach((line,i)=>{if(!line)return;const p=g.point(a.x+4/g.width,a.y+(4+size+i*lineHeight)/g.height);page.drawText(line,{...p,font,size,lineHeight,rotate:degrees(g.rotation),color:rgb(0,0,0)});});
  }
  for(const stroke of attempt.ink||[]){const page=annotatedPage(stroke);if(!page)continue;const g=geometry(page);for(let i=1;i<stroke.points.length;i++){page.drawLine({start:g.point(...stroke.points[i-1]),end:g.point(...stroke.points[i]),thickness:stroke.width||2,color:rgb(0,0,0)});}}
  let extra,y;function newAppendix(){extra=out.addPage([595.28,841.89]);y=788;extra.drawText('Eksamisamm · vastuste lisaleht',{x:40,y,font,size:18});y-=36;}
  for(const answer of appendix){if(!extra||y<90)newAppendix();const lines=wrap(`Ülesanne ${answer.label}\n${answer.text}`,font,12,515);for(const line of lines){if(y<50)newAppendix();if(line)extra.drawText(line,{x:40,y,font,size:12});y-=17;}y-=20;}
  out.setTitle('Eksamisamm · vastustega eksamitöö');out.setSubject('Iseseisev harjutus ja enesehindamine');
  return out.save();
 }
 root.ExamPdfExport={build,geometry};if(typeof module!=='undefined'&&module.exports)module.exports=root.ExamPdfExport;
})(typeof window==='undefined'?globalThis:window);
