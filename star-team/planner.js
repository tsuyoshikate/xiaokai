import {journeyGroups,restOptions} from './journey.js';
import {gamePurposes} from './purpose.js';
const frequency=[['0','大多可以自己完成'],['1','有时需要提醒'],['2','常需要陪着一步步做'],['unknown','还不确定']];
export const parentQuestions=[
 {title:'做一小件事时，孩子能把注意放在当前任务上吗？',hint:'参考最近两周的游戏或日常小事，不和其他孩子比较。',options:frequency},
 {title:'听完一两步指令后，孩子能记住并照着做吗？',hint:'例如先拿杯子，再放到桌上。没观察过可以选不确定。',options:frequency},
 {title:'需要等一下、轮流或看清信号时，孩子能先停住吗？',hint:'例如轮流玩玩具，或者等大人说可以再开始。',options:frequency},
 {title:'遇到一个小任务时，孩子能安排步骤或换个办法吗？',hint:'例如拼图、整理玩具；可以把大人的帮助也考虑进去。',options:frequency},
 {title:'今天怎样开始，会让孩子更舒服？',hint:'只调整玩法和安排，不判断孩子属于哪一类。',options:[['usual','先从简单的小回合开始'],['short','容易累，先少玩一点'],['still','不喜欢移动画面，先用静止'],['both','少玩一点，也用静止'],['unknown','还不确定，保守一点开始']]}
];
export const childQuestions=[
 {title:'你现在想玩一会儿，还是先休息？',hint:'家长读给孩子听，按孩子的意思选；不想回答也可以。',options:[['ready','想玩一会儿'],['tired','有点累，先休息'],['rest','今天只想休息'],['unknown','暂时不想说']]},
 {title:'你更想玩哪种小游戏？',hint:'这是兴趣选择，没有对错。',options:[['numbers','找数字和目标'],['pictures','记图案和找配对'],['unknown','都可以 / 还不知道']]},
 {title:'画面怎样动，你会比较舒服？',hint:'随时可以改成静止。',options:[['still','先不要动'],['slow','可以慢慢动'],['unknown','还不知道']]},
 {title:'休息时，你更想做什么？',hint:'可以换一种，不需要坚持。',options:[['body','松松手和肩膀'],['breath','轻轻呼吸'],['story','听安静的故事'],['outside','离开屏幕，走动一下'],['unknown','请大人帮我选']]},
 {title:'今天想先玩几小轮？',hint:'第二项随时可以跳过，少玩一点也很好。',options:[['one','先一小轮就好'],['two','第一轮休息后，再决定第二轮'],['unknown','还不知道，先少一点']]}
];
const key='star-team-custom-plan';
export function cleanAnswers(values,questions){return questions.map((q,i)=>q.options.some(([v])=>v===values?.[i])?values[i]:null);}
export function normalizePlan(p){
 if(!p||!journeyGroups[0].includes(p.first)||!journeyGroups[1].includes(p.second)||!restOptions.some(o=>o.id===p.rest)||!['easy','challenge'].includes(p.difficulty)||!['still','slow'].includes(p.motion)||![1,2].includes(p.count)||![2,3,4].includes(p.minutes)||![1,2,3].includes(p.restMinutes)||![0,1,2].includes(p.restFirst))return null;
 return {first:p.first,second:p.second,rest:p.rest,difficulty:p.difficulty,motion:p.motion,count:p.count,minutes:p.minutes,restMinutes:p.restMinutes,restFirst:p.restFirst};
}
export function recommendPlan(parent,child){
 const a=cleanAnswers(parent,parentQuestions),c=cleanAnswers(child,childQuestions),score=i=>a[i]==='2'?2:a[i]==='1'?1:0;
 const memory=score(1)>score(0)||(score(1)===score(0)&&c[1]==='pictures');
 const short=a.some(v=>v===null||v==='unknown')||['short','both','unknown'].includes(a[4])||['one','unknown',null].includes(c[4])||['tired','rest'].includes(c[0]);
 const still=['still','both','unknown'].includes(a[4])||c[2]!=='slow';
 const plan={first:memory?'pairs':'orbit',second:score(2)>=score(3)?'traffic':'robot',rest:restOptions.some(o=>o.id===c[3])?c[3]:'body',difficulty:'easy',motion:still?'still':'slow',count:short?1:2,minutes:short?2:3,restMinutes:short?2:1,restFirst:c[0]==='rest'?2:c[0]==='tired'?1:0};
 const reasons=[memory?'先从图案配对开始，回应记住信息或图案兴趣的选择。':'先从顺序找数字开始，回应注意练习或数字兴趣的选择。',score(2)>=score(3)?'第二项备选通行灯，练习等信号再行动。':'第二项备选机器人，练习先安排步骤再执行。',short?'先安排一小轮；回答不确定或容易累时，保守开始。':'最多安排两小轮，第一轮休息后由孩子决定是否继续。',still?'先用静止画面，回应舒适偏好；不确定时也默认静止。':'使用慢速动态，孩子和家长仍可随时调成静止。'];
 if(plan.restFirst)reasons.unshift(plan.restFirst===2?'孩子选择今天只休息，所以不安排游戏执行。':'孩子说有点累，先休息，再决定是否开始游戏。');
 return {plan,reasons};
}
export function createPlanner(api){
 let active=false,screen='questions',group='parent',index=0,parent=Array(5).fill(null),child=Array(5).fill(null),plan=null,reasons=[],storageOK=true;
 try{const old=JSON.parse(localStorage.getItem(key));parent=cleanAnswers(old?.parent,parentQuestions);child=cleanAnswers(old?.child,childQuestions);plan=normalizePlan(old?.plan);reasons=recommendPlan(parent,child).reasons;}catch{}
 const name=id=>api.games.find(g=>g.id===id)?.name||'';
 function save(){try{localStorage.setItem(key,JSON.stringify({version:1,parent,child,plan}));storageOK=true;}catch{storageOK=false;}}
 function show(body){api.show(`<main class="planner-page"><button class="back" data-action="plan-home">← 返回文件夹</button>${body}<p class="micro">适合 6–9 岁孩子与家长一起使用。回答只用于安排游戏，不用于筛查、诊断或区分普通／特殊儿童。${storageOK?'内容仅保存在当前浏览器，可随时清除。':'当前浏览器不能保存，关闭后可能丢失。'}</p></main>`);}
 const button=(action,text,kind='secondary',extra='')=>`<button class="${kind}" data-action="${action}" ${extra}>${text}</button>`;
 function questions(){const qs=group==='parent'?parentQuestions:childQuestions,answers=group==='parent'?parent:child,q=qs[index];
  show(`<section class="planner-panel"><span class="eyebrow">${group==='parent'?'家长观察':'孩子意愿 · 家长读题'} · ${index+1} / 5</span><h1 tabindex="-1">${group==='parent'?'先了解孩子，再安排今天':'听听孩子自己的想法'}</h1><div class="planner-progress"><span style="width:${((group==='parent'?index:index+5)+1)*10}%"></span></div><h2>${q.title}</h2><p>${q.hint}</p><div class="planner-options">${q.options.map(([value,label])=>button('plan-answer',label,'secondary',`data-value="${value}" aria-pressed="${answers[index]===value}"`)).join('')}</div><div class="planner-actions">${button('plan-next',index===4?(group==='parent'?'接着听听孩子':'生成推荐安排'):'下一题 →','primary',answers[index]===null?'disabled':'')}${index>0||group==='child'?button('plan-prev','上一题','quiet'):''}${group==='child'?button('plan-skip-child','暂时不问孩子，保守安排','quiet'):''}</div>${group==='parent'?'<p class="micro">不确定也可以选。若持续担心孩子的发育或日常困难，建议向儿科或儿童发育专业人员咨询。</p>':''}</section>`);
 }
 function select(field,label,values){return `<label>${label}<select data-plan-field="${field}">${values.map(([value,text])=>`<option value="${value}" ${String(plan[field])===String(value)?'selected':''}>${text}</option>`).join('')}</select></label>`;}
 function editor(){
  show(`<section class="planner-panel"><span class="eyebrow">给家长 · 推荐与修改</span><h1 tabindex="-1">今天的专属游戏与休息安排</h1><p>按回答生成的起步建议。再次使用时，先确认孩子今天的状态；您可以改，孩子也可以随时停。</p><div class="planner-summary"><b>${plan.restFirst===2?'今天只休息':plan.restFirst===1?'先休息，再决定要不要玩':'先玩一小轮，再休息'}</b><p>${plan.restFirst===2?'不安排游戏，也不需要积分任务。':name(plan.first)+' → '+restOptions.find(o=>o.id===plan.rest).name+' → 离屏活动'+(plan.count===2?' → 自愿选择 '+name(plan.second):' → 结束')}</p></div><details class="planner-reasons"><summary>原始推荐依据</summary><ul>${reasons.map(r=>`<li>${r}</li>`).join('')}</ul><p>依据家长观察和孩子偏好分配练习方向，没有诊断分数或儿童类别。</p></details><h2>家长可以直接修改</h2><div class="planner-fields">${select('restFirst','今天先做什么',[[0,'先游戏，再休息'],[1,'先休息，再决定是否游戏'],[2,'今天只休息']])}${plan.restFirst===2?'':select('first','第一项 · 记忆与观察',journeyGroups[0].map(id=>[id,name(id)]))+select('count','最多安排几项',[[1,'一项，休息后结束'],[2,'两项，第二项自愿选择']])+(plan.count===2?select('second','第二项 · 反应与规划',journeyGroups[1].map(id=>[id,name(id)])):'')+select('difficulty','起步难度',[['easy','轻松探索'],['challenge','进阶挑战']])+select('motion','画面动态',[['still','静止'],['slow','慢速']])+select('minutes','游戏中的休息提醒',[[2,'约 2 分钟'],[3,'约 3 分钟'],[4,'约 4 分钟']])}${select('rest','优先推荐的休息方式',restOptions.map(o=>[o.id,o.name]))}${select('restMinutes','建议休息多久',[[1,'约 1 分钟'],[2,'约 2 分钟'],[3,'约 3 分钟']])}</div><p class="micro">游戏采用短回合；时间只作提醒和参考，不强制完成，也不是训练剂量。需要家长逐步提示时，可以一起操作。</p><div class="planner-actions">${button('plan-start','确认安排，交给孩子开始 →','primary')}${button('plan-review','重新看看回答')}${button('plan-regenerate','按回答恢复推荐','quiet')}${button('plan-clear','清除回答与方案','quiet')}</div></section>`);
 }
 function render(){if(screen==='questions')questions();else if(screen==='editor')editor();else if(screen==='replace')show(`<section class="planner-panel"><h1 tabindex="-1">上次的旅程还没有结束</h1><p>继续上次会保留游戏进度。开始新方案会替换未结束的旅程；积分与礼物会保留。</p><div class="planner-actions">${button('plan-resume','继续上次旅程','primary')}${button('plan-replace','用这份新方案开始')}${button('plan-edit','返回修改','quiet')}</div></section>`);else if(screen==='clear')show(`<section class="planner-panel"><h1 tabindex="-1">清除这台设备的回答与方案？</h1><p>积分、宠物和旅程记录会保留。</p><div class="planner-actions">${button('plan-clear-confirm','确认清除','primary')}${button('plan-edit','保留，返回修改')}</div></section>`);}
 function generate(){({plan,reasons}=recommendPlan(parent,child));screen='editor';save();render();}
 function start(){save();active=false;api.start(plan);}
 function handle(action,value){if(!action.startsWith('plan-'))return false;
  if(action==='plan-open'){api.enter();active=true;if(plan)screen='editor';else{screen='questions';group=parent.every(v=>v!==null)?'child':'parent';index=(group==='parent'?parent:child).findIndex(v=>v===null);if(index<0)index=0;}render();}
  else if(!active)return true;
  else if(action==='plan-home'){active=false;api.home();}
  else if(action==='plan-answer'&&screen==='questions'){const qs=group==='parent'?parentQuestions:childQuestions;if(qs[index].options.some(([v])=>v===value)){(group==='parent'?parent:child)[index]=value;save();render();}}
  else if(action==='plan-next'&&screen==='questions'&&(group==='parent'?parent:child)[index]!==null){if(index<4)index++;else if(group==='parent'){group='child';index=0;}else{generate();return true;}render();}
  else if(action==='plan-prev'&&screen==='questions'){if(index>0)index--;else if(group==='child'){group='parent';index=4;}render();}
  else if(action==='plan-skip-child'&&group==='child'){child=child.map(v=>v||'unknown');generate();}
  else if(action==='plan-review'){screen='questions';group='parent';index=0;render();}
  else if(action==='plan-regenerate')generate();
  else if(action==='plan-edit'){screen=plan?'editor':'questions';render();}
  else if(action==='plan-start'&&plan){if(api.pending()){screen='replace';render();}else start();}
  else if(action==='plan-replace'&&screen==='replace')start();
  else if(action==='plan-resume'&&screen==='replace'){active=false;api.resume();}
  else if(action==='plan-clear'){screen='clear';render();}
  else if(action==='plan-clear-confirm'&&screen==='clear'){try{localStorage.removeItem(key);}catch{}parent=Array(5).fill(null);child=Array(5).fill(null);plan=null;group='parent';index=0;screen='questions';render();}
  return true;
 }
 function change(target){const field=target.dataset.planField;if(!active||screen!=='editor'||!field)return false;const value=['count','minutes','restMinutes','restFirst'].includes(field)?Number(target.value):target.value;const next=normalizePlan({...plan,[field]:value});if(next){plan=next;save();render();}return true;}
 return {handle,change,leave:()=>{active=false;},refresh:()=>{if(!active)return false;render();return true;}};
}
