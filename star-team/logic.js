export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export const numbers = n => Array.from({length:n}, (_,i)=>i+1);
export function orbitLayout(n, random = Math.random) {
  const capacities = n <= 10 ? [10] : n <= 20 ? [6,14] : n <= 30 ? [6,10,14] : [6,10,14,20];
  const values = shuffle(numbers(n), random); let offset = 0;
  return capacities.flatMap((count,ring)=> Array.from({length:count},(_,slot)=>({value:values[offset++],ring,slot,count})));
}
export const sequenceMatches = (expected, actual) => expected.length === actual.length && expected.every((v,i)=>v===actual[i]);
export function robotStep(position, command, size = 5, walls = []) {
  let {x,y,direction} = position;
  if (command === 'L') direction = (direction+3)%4;
  else if (command === 'R') direction = (direction+1)%4;
  else if (command === 'F') { const [dx,dy] = [[0,-1],[1,0],[0,1],[-1,0]][direction]; x+=dx; y+=dy; }
  if (x<0 || x>=size || y<0 || y>=size || walls.some(w=>w[0]===x&&w[1]===y)) return {position:{...position},blocked:true};
  return {position:{x,y,direction},blocked:false};
}
export function simulateRobot(start,commands,size,walls) {
  let position={...start};
  for (const command of commands) { const result=robotStep(position,command,size,walls); if(result.blocked) return {...result}; position=result.position; }
  return {position,blocked:false};
}
export function tickClock(clock,dt,paused) {
  return paused ? {...clock} : {elapsed:clock.elapsed+dt,phaseElapsed:clock.phaseElapsed+dt};
}
export function moveTower(towers,from,to){
 if(from===to||!towers[from]?.length||!towers[to])return null;
 const disk=towers[from].at(-1),top=towers[to].at(-1);
 if(top!==undefined&&top<disk)return null;
 const next=towers.map(t=>[...t]);next[from].pop();next[to].push(disk);return next;
}
export function puzzleNeighbors(board){const blank=board.indexOf(0);return [blank-3,blank+3,blank%3?blank-1:-1,blank%3<2?blank+1:-1].filter(i=>i>=0&&i<9);}
export function slidePuzzle(board,tile){const index=board.indexOf(tile),blank=board.indexOf(0);if(!tile||!puzzleNeighbors(board).includes(index))return null;const next=[...board];next[index]=0;next[blank]=tile;return next;}
export const puzzleSolved=board=>board.join('')==='123456780';
export function makePuzzle(steps=6,random=Math.random){
 let board=[1,2,3,4,5,6,7,8,0],previous=-1;
 for(let i=0;i<steps;i++){const choices=puzzleNeighbors(board).filter(index=>index!==previous);const index=choices[Math.floor(random()*choices.length)];previous=board.indexOf(0);board=slidePuzzle(board,board[index]);}
 if(puzzleSolved(board))board=slidePuzzle(board,board[puzzleNeighbors(board)[0]]);return board;
}
// A* with Manhattan distance. Heap keeps hints responsive even after many moves.
export function solvePuzzle(board){
 const heuristic=b=>b.reduce((sum,n,i)=>sum+(n?Math.abs(i%3-(n-1)%3)+Math.abs(Math.floor(i/3)-Math.floor((n-1)/3)):0),0);
 const heap=[],best=new Map();
 function push(node){heap.push(node);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p].f<=node.f)break;heap[i]=heap[p];i=p;}heap[i]=node;}
 function pop(){const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let child=i*2+1;if(child+1<heap.length&&heap[child+1].f<heap[child].f)child++;if(last.f<=heap[child].f)break;heap[i]=heap[child];i=child;}heap[i]=last;}return first;}
 const key=board.join('');best.set(key,0);push({board:[...board],g:0,f:heuristic(board),path:[]});
 while(heap.length){const node=pop();if(node.g!==best.get(node.board.join('')))continue;if(puzzleSolved(node.board))return node.path;
  for(const i of puzzleNeighbors(node.board)){const tile=node.board[i],next=slidePuzzle(node.board,tile),k=next.join(''),g=node.g+1;if(g>=(best.get(k)??Infinity))continue;best.set(k,g);push({board:next,g,f:g+heuristic(next),path:[...node.path,tile]});}
 }return null;
}
