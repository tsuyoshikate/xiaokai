import {purposeBlock,restPurposes} from './purpose.js';
// A browser-local, child-led practice/rest flow. Timings are suggestions, not doses.
export const journeyGroups=[['orbit','signal','pairs','search','route','cargo','tracking','sort'],['robot','traffic','reverse','wait','chain','hanoi','puzzle','pattern']];
export const restOptions=[
 {id:'breath',icon:'◌',name:'星云呼吸',detail:'轻轻吸气，慢慢呼气，不憋气。'},
 {id:'body',icon:'🙌',name:'宇航员卸装备',detail:'松开小手，放下肩膀，舒服地伸展。'},
 {id:'story',icon:'☾',name:'太空休息舱',detail:'读一段安静的小故事，也可以闭眼听。'},
 {id:'outside',icon:'🌿',name:'返回地球',detail:'放下设备，和大人走动、看看窗外。'}
];
const feelings={ready:'精神不错',tired:'有点累',rest:'想休息'};
const endings={comfortable:'更舒服了',same:'差不多',tired:'有点累',skip:'暂时不想说'};
const story='飞船停在一座安静的小屋旁。这里没有任务要完成。你可以找个舒服的位置，让双脚稳稳地放着。窗外有一片柔软的草地，微风慢慢经过。小机器人坐在旁边陪着你，它说：今天做到这里也很好。你可以休息，等自己愿意的时候再出发。';
const pendingKey='star-team-journey',historyKey='star-team-journey-history';
const clone=value=>JSON.parse(JSON.stringify(value));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=seconds=>`${Math.floor(seconds/60)}分${Math.floor(seconds%60)}秒`;
function panelPurpose(eyebrow,title){
 const rest=restOptions.find(o=>o.name===title);
 if(rest){const p=restPurposes[rest.id];return purposeBlock('这次休息的目的',p.need,p.goal);}
 const goals={
  'YOUR SAVED JOURNEY':['按原来的进度继续，或安心结束','保留的是游戏步骤。先看看孩子现在的状态，再决定要不要继续。'],
  'BEFORE WE GO':['先听听孩子现在想练习，还是想休息','让孩子表达当下感受，按自己的状态选择。'],
  'A LITTLE ADVENTURE':['安排一小轮练习，再留出休息','先选想练习的事情，第二项可以跳过；不用一次玩很多。'],
  'YOUR CHOICE':['休息后，重新决定下一步','留意现在是否舒服，再决定继续、再休息或结束。'],
  'A SOFT LANDING':['回顾感受，给这次活动一个结束','孩子可以表达现在的感觉，也可以暂时不说。'],
  'SPACE REST STATION':['放慢节奏，松松身体，离开屏幕歇一会儿','呼吸、舒展、故事与离屏活动，提供一段没有任务压力的休息。'],
  'BACK TO EARTH':[restPurposes.outside.need,restPurposes.outside.goal],
  'JOURNEY FINISHED':['练习和休息告一段落，回到日常活动','这次做了多少都可以；不用为了积分再开一轮。'],
  'PARENT JOURNEY LOG':['了解练习与休息是怎样穿插的','回顾任务、休息和孩子自己表达的感受，为下次安排提供参考，不作效果评估。']
 };
 const p=goals[eyebrow];return p?purposeBlock('这一步的目的',p[0],p[1]):'';
}
function baseValidJourney(s){return !!(s&&s.version===1&&['checkin','plan','task','rest','outside','choice','landing'].includes(s.stage)&&Array.isArray(s.plan)&&s.plan.length===2&&s.plan.every((id,i)=>journeyGroups[i].includes(id))&&[0,1].includes(s.index)&&Array.isArray(s.tasks)&&s.tasks.length<=2&&s.tasks.every(t=>t&&journeyGroups.flat().includes(t.id)&&typeof t.completed==='boolean'&&Number.isFinite(t.seconds)&&t.seconds>=0)&&[s.restSeconds,s.outsideSeconds,s.restVisits,s.outsideVisits].every(n=>Number.isFinite(n)&&n>=0)&&(!s.snapshot||(s.snapshot.session?.id===s.plan[s.index]&&s.snapshot.session?.journey===true&&Number.isFinite(s.snapshot.session.clock?.elapsed)&&Number.isFinite(s.snapshot.session.clock?.phaseElapsed))));}
export function validCustom(p){return !!(p && [1,2].includes(p.count) && [0,1,2].includes(p.restFirst) && [1,2,3].includes(p.restMinutes) && restOptions.some(o=>o.id===p.rest) && ['easy','challenge'].includes(p.difficulty) && ['still','slow'].includes(p.motion));}
export function validJourney(s){return baseValidJourney(s) && (s.custom===undefined || validCustom(s.custom));}
export function createJourney(api){
 let state=null,active=false,screen='',rest=null,autosave=0;
 try{const saved=JSON.parse(localStorage.getItem(pendingKey));if(validJourney(saved))state=saved;}catch{}
 const name=id=>api.games.find(g=>g.id===id)?.name||'小游戏';
 function save(){try{if(state)localStorage.setItem(pendingKey,JSON.stringify(state));else localStorage.removeItem(pendingKey);}catch{}}
 function stopVoice(){if('speechSynthesis'in window)window.speechSynthesis.cancel();}
 function show(content){screen='journey';api.show(`<main class="journey-page"><button class="back" data-action="j-home">← 返回大厅 · 保留旅程进度</button>${content}</main>`);}
 const buttons=content=>`<div class="journey-actions">${content}</div>`;
 const button=(action,label,kind='secondary',value='')=>`<button class="${kind}" data-action="${action}" data-value="${value}">${label}</button>`;
 const panel=(eyebrow,title,content)=>`<section class="journey-panel"><div class="eyebrow">${eyebrow}</div><h1 tabindex="-1">${title}</h1>${panelPurpose(eyebrow,title)}${content}</section>`;
 function snapshot(){if(active&&state?.stage==='task'){const current=api.snapshot();if(current?.session?.journey){state.snapshot=clone(current);save();}}}
 function leave(){snapshot();save();stopVoice();rest=null;active=false;screen='';}
 function newJourney(){state={version:1,date:new Date().toISOString(),stage:'checkin',plan:['orbit','robot'],index:0,tasks:[],snapshot:null,restSeconds:0,outsideSeconds:0,restVisits:0,outsideVisits:0,feelingBefore:null};active=true;save();render();}
 function startPlan(p){
  if(!validCustom(p)||!journeyGroups[0].includes(p.first)||!journeyGroups[1].includes(p.second)||![2,3,4].includes(p.minutes))return false;
  stopVoice();rest=null;
  state={version:1,date:new Date().toISOString(),stage:p.restFirst?'rest':'task',plan:[p.first,p.second],index:0,tasks:[],snapshot:null,restSeconds:0,outsideSeconds:0,restVisits:0,outsideVisits:0,feelingBefore:p.restFirst?'rest':'ready',minutes:p.minutes,custom:{count:p.count,rest:p.rest,restMinutes:p.restMinutes,restFirst:p.restFirst,difficulty:p.difficulty,motion:p.motion}};
  active=true;save();render();return true;
 }
 function homeCards(){return `<section class="journey-entry" aria-label="练习与休息"><button class="journey-launch" data-action="j-open"><span class="entry-icon">🚀</span><div><span class="eyebrow">PLAY · REST · EXPLORE</span><h2>${state?'继续我的星际旅程':'今日星际旅程'}</h2><p>一小轮游戏 → 放松 → 离屏活动<br>第二项可跳过，随时可以结束。</p></div><span>↗</span></button><button class="rest-launch" data-action="j-station"><span class="entry-icon">☾</span><div><h2>太空休息站</h2><p>呼吸、伸展、故事与离屏休息<br>不计分，也没有必须完成的任务。</p></div><span>↗</span></button></section>`;}
 function progress(){const labels=['看看状态','第一项任务','放松休息','离屏活动','自愿继续','降落'];const step={checkin:0,plan:1,task:state.index===0?1:4,rest:2,outside:3,choice:4,landing:5}[state.stage];return `<ol class="journey-steps" aria-label="旅程安排">${labels.map((text,i)=>`<li class="${i===step?'current':''}" ${i===step?'aria-current="step"':''}>${i+1}. ${text}</li>`).join('')}</ol>`;}
 function render(){stopVoice();rest=null;screen='journey';
  if(!active){show(panel('YOUR SAVED JOURNEY','上次的旅程还在这里',`<p>已完成 ${state.tasks.filter(t=>t.completed).length} 项任务。你可以继续，也可以在这里结束。</p>${buttons(button('j-resume','继续这次旅程','primary')+button('j-end','今天到这里'))}`));return;}
  const steps=progress();
  if(state.stage==='checkin'){show(steps+panel('BEFORE WE GO','现在感觉怎么样？',`<p>没有正确答案。想休息，也可以直接去休息站。</p>${buttons(Object.entries(feelings).map(([id,label])=>button('j-feeling',label,id==='ready'?'primary':'secondary',id)).join(''))}<p class="micro">和大人一起选。觉得不舒服时，今天就先休息。</p>`));}
  else if(state.stage==='plan'){show(steps+panel('A LITTLE ADVENTURE','今天只选两个小任务',`<p>先玩一小轮，再休息。第二项到时候再决定，完成第一项就可以结束。</p><div class="journey-plan">${state.plan.map((id,i)=>`<label>${i===0?'第一项 · 记忆与观察':'第二项 · 反应与规划，可跳过'}<select data-journey-pick="${i}">${journeyGroups[i].map(id2=>`<option value="${id2}" ${id===id2?'selected':''}>${name(id2)}</option>`).join('')}</select></label>`).join('')}<label>休息提醒<select data-journey-minutes>${[2,3,4].map(n=>`<option value="${n}" ${(state.minutes||3)===n?'selected':''}>约 ${n} 分钟后提醒</option>`).join('')}</select></label></div><p class="micro">到时间只提醒，不切断游戏。时间是试玩安排，不是医学训练剂量。家长可在游戏准备页调整难度与动态。</p>${buttons(button('j-start','准备第一项任务','primary')+button('j-rest','先休息一下')+button('j-end','今天到这里','quiet'))}`));}
  else if(state.stage==='task'){if(state.snapshot){screen='game';api.restore(clone(state.snapshot));}else prepareTask();}
  else if(state.stage==='rest')station();
  else if(state.stage==='outside')outside();
  else if(state.stage==='choice'){const unfinished=!!state.snapshot;show(steps+panel('YOUR CHOICE','接下来，由你决定',`<p>${unfinished?'刚才的进度已保留，可以接着玩。':'第一项已完成。今天到这里也很好。'}</p><p>先问问自己：还想玩，还是想结束？</p>${buttons((state.custom?.restFirst===2||state.custom?.count===1&&state.tasks[0]?.completed)?button("j-end","今天到这里","primary")+button("j-rest","再休息一会儿","quiet"):button(unfinished?'j-continue':'j-second',unfinished?'接着刚才的任务':state.tasks[0]?.completed?'我想玩第二项':'准备第一项任务','primary')+button('j-end','今天到这里')+button('j-rest','再休息一会儿','quiet'))}<p class="micro">不会自动进入下一项，也不需要为了奖励继续玩。</p>`));}
  else if(state.stage==='landing'){show(steps+panel('A SOFT LANDING','今天的探索，到这里就好',`<p>做了一点点，也算一次旅程。现在感觉怎么样？</p>${buttons(Object.entries(endings).map(([id,label])=>button('j-finish',label,id==='comfortable'?'primary':'secondary',id)).join(''))}${state.snapshot?buttons(button('j-save-later','保留进度，下次继续')):''}<p class="micro">选择感受后会结束本次旅程。想接着未完成的任务，可以保留进度，下次继续。</p>`));}
 }
 function prepareTask(){screen='game';api.prepare(state.plan[state.index],state.custom);save();}
 function open(){if(state){active=false;render();}else newJourney();}
 function goRest(){if(!state)return;const wasTask=state.stage==='task';snapshot();if(!wasTask)state.snapshot=null;state.stage='rest';active=true;save();station();}
 function station(){stopVoice();rest=null;screen='station';api.show(`<main class="journey-page"><button class="back" data-action="${active?'j-return':api.currentActivity?.()==='rest'?'entry':'j-home'}">← ${active?'返回旅程':api.currentActivity?.()==='rest'?'重新选择活动':'返回大厅'}</button>${active?progress():''}${panel('SPACE REST STATION','太空休息站',`<p>累了、坐久了，或暂时不想做任务？选一种舒服的方式，让身体换个节奏；休息后再问孩子想不想继续。</p>${api.buddy?.()||''}${active&&state.custom?`<p class="custom-rest-note">今日推荐：${restOptions.find(o=>o.id===state.custom.rest)?.name} · 约 ${state.custom.restMinutes} 分钟，舒服就好，也可以换一种。</p>`:""}<div class="rest-grid">${restOptions.map(o=>`<button class="rest-card ${active&&state.custom?.rest===o.id?"recommended":""}" data-action="j-rest-pick" data-value="${o.id}"><span>${o.icon}</span><h2>${o.name}</h2><p>${o.detail}</p><span class="rest-purpose"><b>适合此刻</b>${restPurposes[o.id].need}</span><span class="rest-arrow">↗</span></button>`).join('')}</div><p class="micro">先从约 1–2 分钟试起，无需坚持到计时结束。屏幕动画不能替代离屏休息；呼吸或身体活动不舒服时立即停止。</p>${active?buttons(button('j-outside','放下设备，活动一下','primary')+button('j-end','今天到这里','quiet')):''}`)}</main>`);}
 function startRest(id){if(id==='outside'){if(active){state.stage='outside';save();}outside();return;}const option=restOptions.find(o=>o.id===id);if(!option)return;rest={id,elapsed:0,paused:false,tempo:'gentle'};if(active){state.restVisits++;save();}screen='rest';renderRest();}
 function restContent(){if(rest.id==='breath')return `<div class="breathing-scene"><div class="breath-orb" aria-hidden="true">✧</div><p class="breath-label" role="status">轻轻吸气</p><p>像闻花香一样轻轻吸气，再像吹凉汤一样缓慢呼气。<br>不用憋气，也不用吸得很深。按自己的舒适节奏来。</p><label>跟随节奏<select data-rest-tempo><option value="gentle" ${rest.tempo==='gentle'?'selected':''}>轻柔 · 吸气约 3 秒 / 呼气约 4 秒</option><option value="slow" ${rest.tempo==='slow'?'selected':''}>更慢 · 吸气约 4 秒 / 呼气约 6 秒</option><option value="own" ${rest.tempo==='own'?'selected':''}>自己呼吸 · 静止画面</option></select></label></div>`;
  if(rest.id==='body')return `<div class="rest-illustration">🙌</div><ol class="body-guide"><li>舒服地坐着或站着，让脚稳稳地放好。</li><li>轻轻握一下小手，再慢慢松开。</li><li>轻轻耸一下肩膀，再把它放下。</li><li>如果愿意，伸伸胳膊，然后回到舒服的位置。</li></ol><p>每一步都可以跳过。不用使劲，也不用做到标准姿势。</p>`;
  return `<div class="rest-illustration">☾</div><p class="rest-story">${story}</p>${buttons(button('j-read','读给我听')+button('j-voice-stop','停止朗读','quiet'))}<p class="micro" id="voice-status" role="status">也可以请家长读给你听。设备有中文语音时可使用朗读。</p>`;
 }
 function renderRest(){stopVoice();const option=restOptions.find(o=>o.id===rest.id);api.show(`<main class="journey-page"><button class="back" data-action="j-rest-back">← 换一种休息方式</button>${panel('NO SCORES · NO HURRY',option.name,`${restContent()}<p class="rest-clock">已经休息 <span id="rest-elapsed">${time(rest.elapsed)}</span> · 随时可以结束</p>${buttons(button('j-rest-toggle',rest.paused?'继续休息':'暂停引导')+button(active?'j-outside':'j-rest-back',active?'准备好了，离屏活动':'结束这次休息','primary'))}<p class="micro">若头晕、呼吸不适或感觉更紧张，请停止，告诉身边的大人。</p>`)}<p class="voice-note" role="status">${rest.paused?'引导已暂停。准备好再继续。':''}</p></main>`);animateRest();}
 function outside(){stopVoice();screen='outside';rest={id:'outside',elapsed:0,paused:false};if(active){state.outsideVisits++;save();}api.show(`<main class="journey-page">${active?progress():''}${panel('BACK TO EARTH','现在，把屏幕放下吧',`<div class="rest-illustration">🌿</div><p>和大人一起，选一件舒服的小事：</p><ul class="outside-list"><li>在安全的地方走几步，轻轻伸展。</li><li>看看窗外，留意远处的树或天空。</li><li>如果口渴，喝一点水。</li></ul><p>可以休息约 2–3 分钟，也可以更久。不用盯着计时，准备好了再回来。</p><p class="rest-clock">页面在前台的活动时间：<span id="rest-elapsed">${time(rest.elapsed)}</span><br><small>锁屏或离开页面的时间不计入；按自己的需要休息。</small></p>${buttons(button('j-outside-done','我回来啦','primary')+button(active?'j-end':'j-home','今天到这里'))}<p class="micro">请家长陪伴，确保周围空间安全。</p>`)} </main>`);}
 function finish(feeling){if(!Object.hasOwn(endings,feeling)||!state)return;stopVoice();const record={version:1,date:new Date().toISOString(),tasks:state.tasks,restSeconds:Math.round(state.restSeconds),outsideSeconds:Math.round(state.outsideSeconds),restVisits:state.restVisits,outsideVisits:state.outsideVisits,feelingBefore:state.feelingBefore,feelingAfter:feeling};try{const old=readRecords();localStorage.setItem(historyKey,JSON.stringify([record,...old].slice(0,20)));}catch{}state=null;active=false;rest=null;save();screen='finished';api.show(`<main class="journey-page">${panel('JOURNEY FINISHED','今天的旅程已结束',`<div class="rest-illustration">🏡</div><p>现在可以离开设备，去做别的喜欢的事情。</p><p>记录留在当前浏览器，没有上传，也不代表能力评级。</p>${buttons(button('j-home','返回大厅','primary')+button('j-records','家长查看旅程记录'))}`)}</main>`);}
 function readRecords(){try{const items=JSON.parse(localStorage.getItem(historyKey)||'[]');return Array.isArray(items)?items.filter(r=>r?.version===1&&Array.isArray(r.tasks)&&r.tasks.length<=2&&r.tasks.every(t=>api.games.some(g=>g.id===t.id)&&Number.isFinite(t.seconds))&&Object.hasOwn(endings,r.feelingAfter)&&Number.isFinite(r.restVisits)&&Number.isFinite(r.outsideVisits)).slice(0,20):[];}catch{return [];}}
 function records(){leave();screen='records';const rows=readRecords();api.show(`<main class="journey-page"><button class="back" data-action="j-home">← 返回大厅</button>${panel('PARENT JOURNEY LOG','练习与休息的记录',`<p>最近 20 次已结束的旅程，仅保存在当前浏览器。中途结束也会记录；短回合不会重复计入正式游戏记录。</p>${rows.length?`<div class="history-list">${rows.map(r=>`<article class="journey-record"><small>${escape(new Date(r.date).toLocaleString('zh-CN'))}</small><p>${r.tasks.length?r.tasks.map(t=>`${name(t.id)} · ${t.completed?'完成':'未完成，提前结束'} · ${time(t.seconds)}`).join('<br>'):'这次选择了休息，没有开始游戏。'}</p><p>放松 ${r.restVisits} 次 · 离屏活动 ${r.outsideVisits} 次</p><small>开始：${feelings[r.feelingBefore]||'未选择'} → 结束：${endings[r.feelingAfter]}</small></article>`).join('')}</div>${buttons(button('j-clear-records','清空旅程记录'))}`:'<p class="history-empty">还没有已结束的旅程。按自己的节奏来。</p>'}<p class="micro">不推断脑功能或情绪，不作治疗效果判断。离屏次数由孩子返回确认，不能验证实际活动。</p>`)} </main>`);}
 function taskStarted(){if(!active||state.stage!=='task')return;const current=api.snapshot();if(current?.session){state.snapshot=clone(current);save();}}
 function taskFinished(session){if(!active||!session.journey)return false;state.tasks[state.index]={id:session.id,completed:true,seconds:Math.round(session.clock.elapsed)};state.snapshot=null;state.stage=state.index===0?'rest':'landing';save();render();return true;}
 function taskBanner(){if(!active||state?.stage!=='task')return '';return `<div class="journey-task-bar"><div><b>今日星际旅程 · 第 ${state.index+1} 项</b><p id="journey-reminder" role="status">这是一个短回合。随时休息，进度会保留。</p></div>${button('j-rest','休息一下')}${button('j-end','今天到这里','quiet')}${button('j-save-later','保存，下次再玩','quiet')}</div>`;}
 function animateRest(){if(!rest||rest.id!=='breath')return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,orb=document.querySelector('.breath-orb'),label=document.querySelector('.breath-label');if(!orb||!label)return;const inhale=rest.tempo==='slow'?4:3,cycle=rest.tempo==='slow'?10:7,phase=(rest.elapsed-(rest.phaseStart||0))%cycle,own=rest.tempo==='own';const labelText=rest.paused?'引导暂停，按自己的节奏呼吸':own?'按自己的节奏，舒服就好':phase<inhale?'轻轻吸气':'慢慢呼气';if(label.textContent!==labelText)label.textContent=labelText;orb.style.transform=reduced||own?'none':`scale(${phase<inhale?1+phase/inhale*.25:1.25-(phase-inhale)/(cycle-inhale)*.25})`;}
 function tick(dt,current){if(document.hidden)return;
  if(rest&&!rest.paused&&['rest','outside'].includes(screen)){rest.elapsed+=dt;if(active&&state){if(rest.id==='outside')state.outsideSeconds+=dt;else state.restSeconds+=dt;}const clock=document.querySelector('#rest-elapsed');if(clock)clock.textContent=time(rest.elapsed);animateRest();}
  if(active&&state?.stage==='task'&&current?.journey){const tip=document.querySelector('#journey-reminder');if(tip){const tipText=current.errors>=3?'可以看看提示、休息一下，或返回准备页调简单。':current.clock.elapsed>=(state.minutes||3)*60?'已经探索了一会儿。要不要休息一下？进度会保留。':'这是一个短回合。随时休息，进度会保留。';if(tip.textContent!==tipText)tip.textContent=tipText;}}
  if(active){autosave+=dt;if(autosave>=5){autosave=0;snapshot();save();}}
 }
 function handle(action,value){if(!action.startsWith('j-'))return false;
  if(action==='j-open'){open();}
  else if(action==='j-station'){leave();station();}
  else if(action==='j-home'){leave();api.home();}
  else if(action==='j-resume'&&state){active=true;render();}
  else if(action==='j-feeling'&&Object.hasOwn(feelings,value)){state.feelingBefore=value;state.stage=value==='ready'?'plan':'rest';save();render();}
  else if(action==='j-start'){state.stage='task';state.index=0;state.snapshot=null;save();prepareTask();}
  else if(action==='j-rest'){if(state.stage==='rest'){station();}else if(state.stage==='choice'){state.stage='rest';save();station();}else goRest();}
  else if(action==='j-rest-pick'){startRest(value);}
  else if(action==='j-rest-back'){station();}
  else if(action==='j-return'&&state){rest=null;state.stage='choice';save();render();}
  else if(action==='j-outside'){rest=null;state.stage='outside';save();outside();}
  else if(action==='j-outside-done'){rest=null;if(active){state.stage='choice';save();render();}else station();}
  else if(action==='j-continue'&&state.snapshot){state.stage='task';save();render();}
  else if(action==='j-second'&&state?.custom?.restFirst!==2&&!(state?.custom?.count===1&&state.tasks[0]?.completed)){if(!state.tasks[0]?.completed){state.stage=state.custom?'task':'plan';save();render();}else{state.index=1;state.stage='task';state.snapshot=null;save();prepareTask();}}
  else if(action==='j-end'&&state){snapshot();if(state.snapshot){state.tasks[state.index]={id:state.plan[state.index],completed:false,seconds:Math.round(state.snapshot.session.clock.elapsed)};}active=true;state.stage='landing';save();render();}
  else if(action==='j-save-later'&&state){snapshot();if(state.snapshot){state.stage='task';state.tasks=state.tasks.filter(t=>t.completed);save();}leave();api.home();}
  else if(action==='j-finish'){finish(value);}
  else if(action==='j-rest-toggle'&&rest){rest.paused=!rest.paused;renderRest();}
  else if(action==='j-read'&&rest?.id==='story'){if('speechSynthesis'in window){stopVoice();const utterance=new SpeechSynthesisUtterance(story);utterance.lang='zh-CN';utterance.rate=.8;utterance.onerror=()=>{const status=document.querySelector('#voice-status');if(status)status.textContent='这台设备暂时不能朗读，可以请家长读给你听。';};window.speechSynthesis.speak(utterance);}else document.querySelector('#voice-status').textContent='这台设备不支持朗读，可以请家长读给你听。';}
  else if(action==='j-voice-stop')stopVoice();
  else if(action==='j-records')records();
  else if(action==='j-clear-records'){try{localStorage.removeItem(historyKey);}catch{}records();}
  return true;
 }
 function change(target){if(target.dataset.journeyPick!==undefined&&state?.stage==='plan'){const i=Number(target.dataset.journeyPick);if(journeyGroups[i]?.includes(target.value)){state.plan[i]=target.value;save();}return true;}if(target.hasAttribute('data-journey-minutes')&&state?.stage==='plan'){const n=Number(target.value);if([2,3,4].includes(n)){state.minutes=n;save();}return true;}if(target.hasAttribute('data-rest-tempo')&&rest){rest.tempo=target.value;rest.phaseStart=rest.elapsed;renderRest();return true;}return false;}
 function hidden(){snapshot();if(rest&&screen!=='outside'){rest.paused=true;stopVoice();renderRest();}save();}
 function refresh(){if(screen==='station')station();else if(screen==='rest')renderRest();else if(screen==='outside'||screen==='finished'){const content=document.querySelector('main')?.outerHTML;if(content)api.show(content);}else if(screen==='records')records();else if(state&&screen==='journey')render();else return false;return true;}
 return {startPlan,handle,change,homeCards,taskBanner,taskStarted,taskFinished,tick,leave,hidden,snapshot,refresh,hasSavedJourney:()=>!!state,isFinished:()=>['finished','records'].includes(screen),isTask:()=>active&&state?.stage==='task'};
}
