import test from 'node:test';
import assert from 'node:assert/strict';
import {orbitLayout,numbers,sequenceMatches,robotStep,simulateRobot,tickClock} from '../logic.js';
test('数字轨道各范围完整且槽位唯一',()=>{
 for(const n of [10,20,30,50]){for(let attempt=0;attempt<20;attempt++){const result=orbitLayout(n);assert.deepEqual(result.map(v=>v.value).sort((a,b)=>a-b),numbers(n));assert.equal(new Set(result.map(v=>`${v.ring}:${v.slot}`)).size,n);}}
});
test('顺序匹配区分遗漏、错误和多余步骤',()=>{
 assert.equal(sequenceMatches([1,2,3],[1,2,3]),true);
 for(const response of [[1,3,2],[1,2],[1,2,3,4]])assert.equal(sequenceMatches([1,2,3],response),false);
});
test('机器人转向不移动，墙和边界不允许穿过',()=>{
 const start={x:0,y:4,direction:1};assert.deepEqual(robotStep(start,'L').position,{x:0,y:4,direction:0});
 assert.equal(robotStep({x:0,y:0,direction:0},'F').blocked,true);
 assert.equal(robotStep({x:1,y:4,direction:1},'F',5,[[2,4]]).blocked,true);
 assert.deepEqual(start,{x:0,y:4,direction:1});
});
test('两张机器人地图都有实际可达路线',()=>{
 const start={x:0,y:4,direction:1};
 assert.deepEqual(simulateRobot(start,['F','F','L','F','F'],5,[]).position,{x:2,y:2,direction:0});
 const hard=simulateRobot(start,['F','L','F','F','F','F','R','F','F','F'],5,[[2,4],[2,3],[2,2]]);
 assert.equal(hard.blocked,false);assert.deepEqual(hard.position,{x:4,y:0,direction:1});
});
test('暂停冻结总时钟和阶段时钟，恢复只加有效时间',()=>{
 const clock={elapsed:10,phaseElapsed:2};assert.deepEqual(tickClock(clock,90,true),clock);
 assert.deepEqual(tickClock(clock,.1,false),{elapsed:10.1,phaseElapsed:2.1});assert.deepEqual(clock,{elapsed:10,phaseElapsed:2});
});
