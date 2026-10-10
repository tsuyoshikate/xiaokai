import {shuffle,robotStep} from './logic.js';

export function solveRobot(start,goal,size,walls){
 const queue=[{position:{...start},path:[]}],seen=new Set();
 for(let i=0;i<queue.length;i++){const {position,path}=queue[i],key=`${position.x},${position.y},${position.direction}`;if(seen.has(key))continue;seen.add(key);
  if(position.x===goal[0]&&position.y===goal[1])return path;
  for(const command of ['F','L','R']){const next=robotStep(position,command,size,walls);if(!next.blocked)queue.push({position:next.position,path:[...path,command]});}
 }return null;
}
export function robotLevel(level){
 const templates=[
  {goal:[3,4],walls:[]},{goal:[2,2],walls:[]},{goal:[4,1],walls:[[2,4]]},
  {goal:[4,0],walls:[[2,4],[2,3],[2,2]]},
  {goal:[4,3],walls:[[1,4],[1,3],[3,1],[3,2]]},
  {goal:[3,0],walls:[[1,4],[1,3],[1,2],[3,2],[3,3]]},
  {goal:[4,0],walls:[[1,4],[1,3],[1,2],[3,0],[3,1],[3,2]]},
  {goal:[4,4],walls:[[1,4],[1,3],[2,3],[3,3]]},
  {goal:[3,4],walls:[[1,4],[1,3],[1,2],[2,2],[3,2]]},
  {goal:[4,0],walls:[[1,4],[1,3],[1,2],[2,2],[3,2],[3,0]]},
  {goal:[2,4],walls:[[1,4],[1,3],[1,2],[2,2],[3,2],[3,3]]},
  {goal:[4,4],walls:[[1,4],[1,3],[1,2],[3,0],[3,1],[3,2]]}
 ];
 const n=Math.max(1,Math.min(12,level)),base=templates[n-1],turn=n>6;
 const rotate=([x,y])=>turn?[4-y,x]:[x,y];
 const [x,y]=rotate([0,4]);return {size:5,start:{x,y,direction:turn?2:1},goal:rotate(base.goal),walls:base.walls.map(rotate)};
}
export function makePattern(hard,round,random=Math.random){
 const pick=n=>Math.floor(random()*n);
 if(round%2===0){const symbols=shuffle([0,1,2,3],random),modes=hard?[[0,1,2],[0,0,1],[0,1,1],[0,1]]:[[0,1],[0,0,1]];
  const cycle=modes[pick(modes.length)].map(i=>symbols[i]),length=cycle.length*2;
  return {patternMode:'shape',patternValues:Array.from({length},(_,i)=>cycle[i%cycle.length]),answer:cycle[0],options:shuffle([0,1,2,3],random),patternClue:`每 ${cycle.length} 个是一组，找找重复的顺序。`};
 }
 const step=(hard?1+pick(3):1+pick(2))*(hard&&random()<.4?-1:1),start=step<0?1+pick(3)+Math.abs(step)*3:1+pick(3);
 const answer=start+step*3,wrong=shuffle(Array.from({length:12},(_,i)=>i+1).filter(n=>n!==answer),random).slice(0,3);
 return {patternMode:'count',patternValues:[start,start+step,start+step*2],answer,options:shuffle([answer,...wrong],random),patternClue:`每次${step>0?'增加':'减少'} ${Math.abs(step)} 颗星星，再数一数。`};
}
export function makeChain(pairCount,random=Math.random){
 const objects=shuffle(['battery','crystal','water'],random).slice(0,pairCount),destinations=shuffle(['station','rocket','base'],random);
 const deliveries=objects.map((object,i)=>({object,destination:destinations[i]}));
 return {deliveries,steps:deliveries.flatMap(({object,destination})=>[object,destination])};
}
export const taskIcons={battery:'🔋',crystal:'💎',water:'💧',station:'🛰️',rocket:'🚀',base:'🏠'};
export const objectNames={battery:'电池',crystal:'宝石',water:'水滴'},destinationNames={station:'空间站',rocket:'飞船',base:'月球基地'};
export function chainLabels(deliveries){return Object.fromEntries(deliveries.flatMap(({object,destination})=>[[object,`拿起${objectNames[object]}`],[destination,`送${objectNames[object]}到${destinationNames[destination]}`]]));}
export function trackingBodies(count,random=Math.random){return Array.from({length:count},(_,i)=>{const a=i/count*Math.PI*2-Math.PI/2,sign=i%2?-1:1,speed=.22+random()*.15,grid=[[-.85,-.85],[0,-.85],[.85,-.85],[.85,0],[.85,.85],[0,.85],[-.85,.85],[-.85,0]];return {x:count===8?grid[i][0]:Math.cos(a)*.85,y:count===8?grid[i][1]:Math.sin(a)*.85,vx:-Math.sin(a)*speed*sign,vy:Math.cos(a)*speed*sign};});}
export function moveTracking(bodies,dt,minDistance=.58){
 const next=bodies.map(b=>({...b}));
 for(let i=0;i<next.length;i++){const b=next[i],old=bodies[i];let x=b.x+b.vx*dt,y=b.y+b.vy*dt;
  if(Math.abs(x)>.9){b.vx=-b.vx;x=old.x+b.vx*dt;}if(Math.abs(y)>.9){b.vy=-b.vy;y=old.y+b.vy*dt;}
  if(next.some((other,j)=>j!==i&&Math.hypot(x-other.x,y-other.y)<minDistance)){b.vx=-b.vx;b.vy=-b.vy;}else{b.x=x;b.y=y;}
 }return next;
}
