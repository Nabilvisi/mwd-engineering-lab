import {hydraulics,telemetry,psi} from './engine.mjs';
export function sensitivity(p,key,low,high,count=41){
 if(!['q','gas','freq','L'].includes(key)||!Number.isFinite(low)||!Number.isFinite(high)||high<=low||!Number.isInteger(count)||count<2||count>501)throw Error('Invalid sensitivity range.');
 return Array.from({length:count},(_,i)=>{const value=low+(high-low)*i/(count-1),input={...p,[key]:value},h=hydraulics(input),s=telemetry(input,h);return {value,internalPsi:h.total/psi,surfacePsi:s.surface/psi,snr:s.snr,delay:s.delay};});
}
