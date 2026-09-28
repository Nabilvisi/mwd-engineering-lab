export const rad=Math.PI/180, psi=6894.757293168;
export const example=()=>Array.from({length:31},(_,k)=>({md:k*100,inc:k<=5?0:k<=17?(k-5)*5:60,azi:45}));
export function survey(rows,unit='m',tie={tvd:0,n:0,e:0},limit=3){
 if(rows.length<2||rows.length>1000)throw Error('Enter 2–1,000 survey stations.');
 if(!['m','ft'].includes(unit)||!Object.values(tie).every(Number.isFinite)||!Number.isFinite(limit)||limit<=0)throw Error('Invalid units, tie-in or DLS limit.');
 let out=[];
 rows.forEach((r,k)=>{
 if(![r.md,r.inc,r.azi].every(Number.isFinite)||r.md<0||r.inc<0||r.inc>180||r.azi<0||r.azi>=360)throw Error(`Station ${k+1}: MD ≥ 0, inclination 0–180°, azimuth 0–<360° are required.`);
 if(k&&r.md<=rows[k-1].md)throw Error(`Station ${k+1}: MD must increase strictly; do not sort surveys silently.`);
 if(!k){out.push({...r,...tie,dmd:0,beta:0,rf:1,dls:0,dtvd:0,dn:0,de:0});return;}
 let p=out[k-1],i1=p.inc*rad,i2=r.inc*rad,a1=p.azi*rad,a2=r.azi*rad;
 let v1=[Math.sin(i1)*Math.cos(a1),Math.sin(i1)*Math.sin(a1),Math.cos(i1)],v2=[Math.sin(i2)*Math.cos(a2),Math.sin(i2)*Math.sin(a2),Math.cos(i2)];
 let cross=[v1[1]*v2[2]-v1[2]*v2[1],v1[2]*v2[0]-v1[0]*v2[2],v1[0]*v2[1]-v1[1]*v2[0]];
 let beta=Math.atan2(Math.hypot(...cross),Math.max(-1,Math.min(1,v1.reduce((s,v,j)=>s+v*v2[j],0))));
 if(Math.PI-beta<1e-6)throw Error(`Station ${k+1}: near-180° dogleg is singular. Add valid intermediate surveys.`);
 let rf=beta<1e-6?1+beta*beta/12+beta**4/120:2*Math.tan(beta/2)/beta;
 let dmd=r.md-p.md,dtvd=dmd/2*(v1[2]+v2[2])*rf,dn=dmd/2*(v1[0]+v2[0])*rf,de=dmd/2*(v1[1]+v2[1])*rf;
 out.push({...r,dmd,beta:beta/rad,rf,dtvd,dn,de,tvd:p.tvd+dtvd,n:p.n+dn,e:p.e+de,dls:beta/rad/dmd*(unit==='m'?30:100)});
 });
 return out;
}
export function parseSurvey(text){return text.trim().split(/\n/).filter(s=>s.trim()).map((s,k)=>{let a=s.trim().split(/[\s,;]+/);if(a.length!==3||a.some(x=>x===''))throw Error(`Line ${k+1}: enter MD, inclination, azimuth (three numbers; no header).`);return {md:Number(a[0]),inc:Number(a[1]),azi:Number(a[2])};});}
export function friction(re,n){
 const turbulent=r=>{let lo=1e-5,hi=1;for(let k=0;k<90;k++){let f=(lo+hi)/2,res=1/Math.sqrt(f)-4/n**.75*Math.log10(r*f**(1-n/2))+.4/n**1.2;if(res>0)lo=f;else hi=f;}return 4*(lo+hi)/2;};
 if(re<=2100)return {fd:64/re,regime:'Laminar'};
 if(re<4000){let t=(re-2100)/1900;return {fd:(1-t)*64/2100+t*turbulent(4000),regime:'Transition · interpolated'};}
 return {fd:turbulent(re),regime:'Turbulent · smooth-pipe correlation'};
}
export function pipe(q,rho,L,D,K,n){let v=4*q/(Math.PI*D*D),re=rho*v**(2-n)*D**n/(K*8**(n-1)*((3*n+1)/(4*n))**n),f=friction(re,n);return {...f,v,re,dp:f.fd*L/D*rho*v*v/2,mu:K*(8*v/D*(3*n+1)/(4*n))**(n-1)};}
export function hydraulics(p){
 for(let [k,v] of Object.entries(p))if(typeof v==='number'&&!Number.isFinite(v))throw Error(`Invalid ${k}.`);
 if(p.q<=0||p.rho<=0||p.L<=0||p.bhaL<0||p.bhaL>=p.L||p.D<=0||p.bhaD<=0||p.K<=0||p.n<.4||p.n>1||p.cd<=0||p.cd>1||p.pcd<=0||p.pcd>1||p.open<=0||p.closed<=0||p.closed>=p.open||!p.nozzles.length||p.nozzles.some(x=>!Number.isFinite(x)||x<=0))throw Error('Check positive inputs. BHA length < total length; 0.4 ≤ n ≤ 1; restricted area < open area; 0 < Cd ≤ 1.');
 const q=p.q/1000/60,D=p.D/1000,bD=p.bhaD/1000;
 let dp=pipe(q,p.rho,p.L-p.bhaL,D,p.K,p.n),bha=pipe(q,p.rho,p.bhaL,bD,p.K,p.n);
 const area=p.nozzles.reduce((a,d)=>a+Math.PI*(d*.0254/32)**2/4,0),orifice=(a,cd)=>p.rho/2*(q/(cd*a))**2,bit=orifice(area,p.cd),open=orifice(p.open*1e-6,p.pcd),closed=orifice(p.closed*1e-6,p.pcd);
 return {q,dp,bha,area,bit,open,closed,pulse:closed-open,total:dp.dp+bha.dp+bit+open,restricted:dp.dp+bha.dp+bit+closed,jet:q/area};
}
export function telemetry(p,h){
 if(p.gas<0||p.gas>5||p.pressure<=0||p.bulk<=0||p.freq<=0||p.alpha<0||p.gasPenalty<0||p.noise<=0)throw Error('Telemetry: positive pressure, bulk modulus, frequency and noise; gas 0–5%; nonnegative attenuation.');
 const g=p.gas/100,P=p.pressure*1e6,K=p.bulk*1e9,rhoGas=P/(287.05*323.15),rhoMix=(1-g)*p.rho+g*rhoGas;
 const c=1/Math.sqrt(rhoMix*((1-g)/K+g/(1.4*P)));
 const effectiveD=p.L/((p.L-p.bhaL)/(p.D/1000)+p.bhaL/(p.bhaD/1000));
 const lossPerKm=(p.alpha+p.gasPenalty*p.gas)*Math.sqrt(p.freq)*(.1/effectiveD);
 const loss=lossPerKm*p.L/1000,gain=10**(-loss/20),surface=h.pulse*gain,delay=p.L/c,snr=20*Math.log10(surface/(Math.sqrt(2)*p.noise*psi));
 return {c,effectiveD,lossPerKm,loss,gain,surface,delay,snr};
}
export const defaults={q:1500,rho:1200,L:3000,bhaL:150,D:100,bhaD:70,K:.25,n:.65,cd:.95,pcd:.8,open:1800,closed:1400,nozzles:[12,12,12],gas:0,pressure:10,bulk:2.2,freq:1,alpha:2,gasPenalty:3,noise:5};
