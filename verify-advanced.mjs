import assert from 'node:assert/strict';
import {project3d,trajectory3d} from './dist/trajectory.mjs';
import {sensitivity} from './dist/study.mjs';
import {defaults,example,survey} from './dist/engine.mjs';
for(let a of [0,30,90,180,359])for(let b of [-80,0,30,80]){let p={e:12,n:-34,tvd:56},v=project3d(p,a,b);assert.ok(Math.abs(Math.hypot(...v)-Math.hypot(p.e,p.n,p.tvd))<1e-10);}
assert.deepEqual(project3d({e:10,n:20,tvd:30},0,0),[10,30,20]);
const sweep=sensitivity(defaults,'q',500,1000,2);assert.ok(Math.abs(sweep[1].surfacePsi/sweep[0].surfacePsi-4)<1e-10);
const gas=sensitivity(defaults,'gas',0,5);assert.ok(gas.at(-1).surfacePsi<gas[0].surfacePsi);assert.ok(gas.at(-1).delay>gas[0].delay);
assert.throws(()=>sensitivity(defaults,'L',0,100));assert.throws(()=>sensitivity(defaults,'q',1,2,1));
for(let rows of [survey(example()),survey([{md:0,inc:0,azi:0},{md:100,inc:0,azi:0}])])assert.ok(!/NaN|Infinity/.test(trajectory3d(rows)));
console.log('Advanced checks passed: camera preserves distances, axis convention, degenerate path rendering, Q² source scaling, gas trends and invalid sweeps.');
