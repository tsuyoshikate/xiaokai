import test from 'node:test';
import assert from 'node:assert/strict';
import {roundRecord,contextKey,addRound,cleanRounds,legacyRounds,emptyPassport,stampPassport,normalizePassport,csvRounds,chartSVG} from '../progress.js';
const settings={difficulty:'easy',motion:'still'};
const session=()=>({id:'orbit',roundId:'one',settingsAtStart:{...settings},trial:true,journey:false,n:5,total:3,correct:5,hints:1,errors:2,clock:{elapsed:12.6},optionsConfig:{memoryCount:0,level:1}});
test('所有完成模式有记录，保留过程指标，重复同一回合不重复写入',()=>{
 const s=session(),r=roundRecord(s,settings,new Date('2026-10-10T10:00:00Z'));assert.equal(r.seconds,13);assert.equal(r.mode,'trial');assert.equal(r.correct,5);let rows=addRound([],r);assert.equal(addRound(rows,r),rows);
 assert.equal(roundRecord({...s,journey:true},settings).mode,'journey');assert.equal(roundRecord({...s,trial:false},settings).mode,'formal');assert.equal(cleanRounds([r,r,{...r,id:'bad',hints:-1}],['orbit']).length,1);
});
test('只组合相同设置，模式、动态、数字范围变化分组，中途改动与旧记录不连线',()=>{
 const base=roundRecord(session(),settings);
 for(const patch of [{trial:false},{journey:true},{n:10},{settingsAtStart:{...settings,motion:'slow'}}])assert.notEqual(contextKey(roundRecord({...session(),...patch},settings)),contextKey(base));
 assert.equal(contextKey(roundRecord({...session(),motionChanged:true},settings)),'unknown');assert.equal(contextKey(roundRecord({...session(),layoutChanged:true},settings)),'unknown');
 const old=legacyRounds([{game:'orbit',date:'2026-10-09',hints:0,retries:0,seconds:20}],['orbit']);assert.equal(old.length,1);assert.equal(contextKey(old[0]),'unknown');
 assert.ok(!chartSVG([base],'retries').includes('polyline'));assert.ok(chartSVG([base,{...base,id:'two'}],'retries').includes('polyline'));
});
test('探索印章每天每类一枚，跨日累积不断签，记录和积分分离',()=>{
 let s=emptyPassport();const first=stampPassport(s,'orbit','2026-10-10');assert.equal(first.added,true);s=first.state;assert.equal(s.counts.attention,1);
 assert.equal(stampPassport(s,'search','2026-10-10').added,false);s=stampPassport(s,'pairs','2026-10-10').state;assert.equal(s.counts.memory,1);
 s=stampPassport(s,'orbit','2026-10-20').state;assert.equal(s.counts.attention,2);assert.equal(s.counts.memory,1);assert.equal(stampPassport(s,'missing','2026-10-20').added,false);
 assert.equal(normalizePassport({version:1,counts:{memory:-5},days:{memory:['bad','2026-10-10','2026-10-10']}}).counts.memory,0);
});
test('导出全部回合，特殊字符正确引用；超过容量保留最近5000条',()=>{
 const r=roundRecord(session(),settings);assert.match(csvRounds([r],{orbit:'数字"轨道'}),/数字""轨道/);const rows=Array.from({length:5000},(_,i)=>({...r,id:String(i)}));const next=addRound(rows,{...r,id:'new'});assert.equal(next.length,5000);assert.equal(next[0].id,'new');
});
