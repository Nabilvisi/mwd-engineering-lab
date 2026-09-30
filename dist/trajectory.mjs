// Orthographic camera: one world scale preserves the geometry of all three axes.
export function project3d(point,azimuth,elevation){
 const a=azimuth*Math.PI/180,b=elevation*Math.PI/180;
 const horizontal=point.e*Math.sin(a)+point.n*Math.cos(a);
 return [point.e*Math.cos(a)-point.n*Math.sin(a),point.tvd*Math.cos(b)-horizontal*Math.sin(b),horizontal*Math.cos(b)+point.tvd*Math.sin(b)];
}
export function trajectory3d(rows,baseline=[],{azimuth=30,elevation=30,zoom=1,unit='m'}={}){
 const all=[...rows,...baseline],origin={e:(Math.min(...all.map(r=>r.e))+Math.max(...all.map(r=>r.e)))/2,n:(Math.min(...all.map(r=>r.n))+Math.max(...all.map(r=>r.n)))/2,tvd:(Math.min(...all.map(r=>r.tvd))+Math.max(...all.map(r=>r.tvd)))/2};
 const radius=Math.max(1,...all.map(r=>Math.hypot(r.e-origin.e,r.n-origin.n,r.tvd-origin.tvd))),scale=145/radius*zoom;
 const project=r=>{let [x,y,z]=project3d({e:r.e-origin.e,n:r.n-origin.n,tvd:r.tvd-origin.tvd},azimuth,elevation);return [390+x*scale,205+y*scale,z];};
 let svg='<svg class="chart orbit" viewBox="0 0 780 430" role="img" aria-label="Three dimensional well trajectory, East, North and TVD positive down"><rect width="780" height="430" fill="#f8fbfd"/>';
 const start=project(origin);
 for(let [key,label,color] of [['e','East','#1168b2'],['n','North','#47852a'],['tvd','TVD +down','#a95116']]){let end=project({...origin,[key]:origin[key]+radius*.75});svg+=`<path d="M${start[0]},${start[1]}L${end[0]},${end[1]}" stroke="${color}" opacity=".6"/><text x="${end[0]+5}" y="${end[1]}">${label} (${unit})</text>`;}
 for(let [path,color,dashed] of [[baseline,'#c46b16',true],[rows,'#1168b2',false]])if(path.length)svg+=`<polyline points="${path.map(r=>project(r).slice(0,2).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="3" ${dashed?'stroke-dasharray="7 5"':''}/>`;
 for(let r of [...rows].sort((a,b)=>project(a)[2]-project(b)[2])){let [x,y]=project(r);svg+=`<circle cx="${x}" cy="${y}" r="4" fill="#1168b2"><title>MD ${r.md.toFixed(2)} ${unit}; East ${r.e.toFixed(2)}; North ${r.n.toFixed(2)}; TVD ${r.tvd.toFixed(2)}; DLS ${r.dls.toFixed(2)}</title></circle>`;}
 return svg+'<text x="18" y="412">Orthographic camera · survey station chords · drag to orbit</text></svg>';
}
