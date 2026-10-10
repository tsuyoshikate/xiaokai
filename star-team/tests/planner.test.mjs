import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanAnswers,parentQuestions,childQuestions,recommendPlan,normalizePlan} from '../planner.js';
import {validJourney} from '../journey.js';
test('未知回答保守开始，无诊断分类或高难度推断',()=>{
 const {plan}=recommendPlan(Array(5).fill('unknown'),Array(5).fill('unknown'));
 assert.equal(plan.motion,'still');assert.equal(plan.count,1);assert.equal(plan.difficulty,'easy');assert.ok(normalizePlan(plan));
 assert.equal(parentQuestions.length,5);assert.equal(childQuestions.length,5);
 assert.deepEqual(cleanAnswers(['<script>'],parentQuestions),Array(5).fill(null));
});
test('不同观察与孩子偏好改变游戏、休息与安排，孩子只休息优先',()=>{
 const a=recommendPlan(['2','0','2','0','usual'],['ready','numbers','slow','breath','two']).plan;
 const b=recommendPlan(['0','2','0','2','both'],['tired','pictures','still','story','one']).plan;
 assert.equal(a.first,'orbit');assert.equal(a.second,'traffic');assert.equal(a.count,2);assert.equal(a.motion,'slow');assert.equal(a.rest,'breath');
 assert.equal(b.first,'pairs');assert.equal(b.second,'robot');assert.equal(b.count,1);assert.equal(b.motion,'still');assert.equal(b.restFirst,1);assert.equal(b.rest,'story');
 assert.equal(recommendPlan([],['rest']).plan.restFirst,2);
});
test('定制方案拒绝无效游戏、速度和数量，存档拒绝损坏配置',()=>{
 const plan=recommendPlan([],[]).plan;
 for(const bad of [{first:'robot'},{second:'pairs'},{rest:'invalid'},{count:99},{motion:'fast'},{minutes:-1},{restFirst:4}])assert.equal(normalizePlan({...plan,...bad}),null);
 const sample={version:1,stage:'rest',plan:['orbit','robot'],index:0,tasks:[],restSeconds:0,outsideSeconds:0,restVisits:0,outsideVisits:0,custom:{...plan}};
 assert.equal(validJourney(sample),true);assert.equal(validJourney({...sample,custom:{...plan,restMinutes:999}}),false);
 assert.deepEqual(Object.keys(normalizePlan({...plan,diagnosis:'fake'})),Object.keys(plan));
});
