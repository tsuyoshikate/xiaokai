import test from 'node:test';
import assert from 'node:assert/strict';
import {validJourney,journeyGroups} from '../journey.js';
const sample=()=>({version:1,stage:'rest',plan:['orbit','robot'],index:0,tasks:[{id:'orbit',completed:false,seconds:15}],restSeconds:30,outsideSeconds:0,restVisits:1,outsideVisits:0,snapshot:{session:{id:'orbit',journey:true,clock:{elapsed:15,phaseElapsed:15}}}});
test('旅程覆盖16款且两项来自不同任务组',()=>{assert.equal(new Set(journeyGroups.flat()).size,16);assert.equal(journeyGroups[0].filter(id=>journeyGroups[1].includes(id)).length,0);});
test('允许保留未完成回合，拒绝错配、损坏与无效计时的本地进度',()=>{assert.equal(validJourney(sample()),true);for(const change of [{plan:['robot','orbit']},{index:2},{tasks:[null]},{restSeconds:-1},{outsideSeconds:Infinity},{snapshot:{session:{id:'robot',journey:true,clock:{elapsed:15,phaseElapsed:15}}}},{snapshot:{session:{id:'orbit',journey:true,clock:{elapsed:NaN,phaseElapsed:0}}}}])assert.equal(validJourney({...sample(),...change}),false);});
