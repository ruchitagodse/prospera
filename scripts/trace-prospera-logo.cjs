// Trace the supplied brand artwork into font-independent SVG outlines.
const sharp = require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

function simplify(points, tolerance = 0.45) {
  if (points.length < 3) return points;
  const first = points[0], last = points[points.length - 1];
  const dx = last[0] - first[0], dy = last[1] - first[1];
  const length = dx * dx + dy * dy;
  let distance = 0, split = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const t = length ? Math.max(0, Math.min(1, ((points[i][0]-first[0])*dx+(points[i][1]-first[1])*dy)/length)) : 0;
    const d = Math.hypot(points[i][0]-first[0]-t*dx, points[i][1]-first[1]-t*dy);
    if (d > distance) { distance = d; split = i; }
  }
  if (distance <= tolerance) return [first,last];
  return [...simplify(points.slice(0,split+1),tolerance).slice(0,-1),...simplify(points.slice(split),tolerance)];
}

function trace(mask, width, height) {
  const edges = new Map();
  const key = (x,y) => y*(width+1)+x;
  const add = (x,y,tx,ty) => { const k=key(x,y); if (!edges.has(k)) edges.set(k,[]); edges.get(k).push(key(tx,ty)); };
  const has = (x,y) => x>=0 && y>=0 && x<width && y<height && mask[y*width+x];
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) if(has(x,y)) {
    if(!has(x,y-1)) add(x,y,x+1,y);
    if(!has(x+1,y)) add(x+1,y,x+1,y+1);
    if(!has(x,y+1)) add(x+1,y+1,x,y+1);
    if(!has(x-1,y)) add(x,y+1,x,y);
  }
  const paths=[];
  while(edges.size) {
    const start=edges.keys().next().value; let current=start; const points=[];
    do {
      points.push([current%(width+1), Math.floor(current/(width+1))]);
      const options=edges.get(current); if(!options) break;
      const next=options.pop(); if(!options.length) edges.delete(current); current=next;
    } while(current!==start);
    points.push(points[0]);
    const area=Math.abs(points.reduce((sum,p,i)=> i ? sum+points[i-1][0]*p[1]-p[0]*points[i-1][1] : sum,0)/2);
    if(area<1.5) continue;
    const ring=points.slice(0,-1);
    const weights=[1,2,3,4,3,2,1];
    const smoothed=ring.map((p,i)=>{
      if(area<30) return p;
      const sum=[0,0];
      weights.forEach((w,j)=>{const q=ring[(i+j-3+ring.length)%ring.length];sum[0]+=q[0]*w;sum[1]+=q[1]*w;});
      return sum.map(v=>Math.round(v/16*100)/100);
    });
    smoothed.push(smoothed[0]);
    const reduced=simplify(smoothed,.22).slice(0,-1);
    const midpoint=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
    const startPoint=midpoint(reduced[reduced.length-1],reduced[0]);
    let path='M'+startPoint.join(' ');
    reduced.forEach((p,i)=>{
      const prev=reduced[(i+reduced.length-1)%reduced.length],next=reduced[(i+1)%reduced.length];
      const a=[p[0]-prev[0],p[1]-prev[1]],b=[next[0]-p[0],next[1]-p[1]];
      const cosine=(a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a)*Math.hypot(...b));
      const end=midpoint(p,next);
      path+=cosine>.65 ? 'Q'+p.join(' ')+' '+end.join(' ') : 'L'+p.join(' ')+'L'+end.join(' ');
    });
    paths.push(path+'Z');
  }
  return paths.join('');
}

(async()=>{
  const source=process.argv[2];
  const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const ink=new Uint8Array(info.width*info.height), gold=new Uint8Array(ink.length);
  for(let i=0;i<ink.length;i++) {
    const r=data[i*3],g=data[i*3+1],b=data[i*3+2];
    gold[i]=r>g+5 && g>b+5 && (r+g+b)/3<240 ? 1:0;
    ink[i]=!gold[i] && (r+g+b)/3<165 ? 1:0;
  }
  const inkPath=trace(ink,info.width,info.height), goldPath=trace(gold,info.width,info.height);
  const bounds={ x:60,y:195,width:630,height:365 };
  const geometry=`// Traced from the supplied PROSPERA artwork. Shared by DOM and WebGL.\nexport const logoViewBox = "${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}";\nexport const logoInkPath = ${JSON.stringify(inkPath)};\nexport const logoGoldPath = ${JSON.stringify(goldPath)};\n`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" role="img" aria-labelledby="title"><title id="title">PROSPERA — Build Grow Prosper</title><defs><linearGradient id="gold" x1="235" y1="410" x2="505" y2="225" gradientUnits="userSpaceOnUse"><stop stop-color="#98733f"/><stop offset=".55" stop-color="#dfc18d"/><stop offset="1" stop-color="#b18c51"/></linearGradient></defs><path fill="#1b1b1b" fill-rule="evenodd" d="${inkPath}"/><path fill="url(#gold)" fill-rule="evenodd" d="${goldPath}"/></svg>\n`;
  // Output an apply_patch payload; this helper never writes application files.
  const fs=require('fs'); const existing=fs.readFileSync('public/prospera-logo.svg','utf8');
  const add=(path,body)=> fs.existsSync(path) ? '*** Update File: '+path+'\n@@\n'+fs.readFileSync(path,'utf8').trimEnd().split('\n').map(l=>'-'+l).join('\n')+'\n'+body.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n' : '*** Add File: '+path+'\n'+body.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n';
  process.stdout.write('*** Begin Patch\n'+add('components/prospera/logo-geometry.ts',geometry)+'*** Update File: public/prospera-logo.svg\n@@\n'+existing.trimEnd().split('\n').map(l=>'-'+l).join('\n')+'\n'+svg.trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n*** End Patch');
})().catch(error=>{console.error(error);process.exit(1);});
