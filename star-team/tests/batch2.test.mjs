import test from 'node:test';
import assert from 'node:assert/strict';
import {moveTower,makePuzzle,slidePuzzle,puzzleNeighbors,puzzleSolved,solvePuzzle} from '../logic.js';
test('星球搬家只移动顶层且禁止大压小，不修改原状态',()=>{const original=[[3,2],[1],[]];assert.equal(moveTower(original,0,1),null);assert.equal(moveTower(original,2,1),null);assert.deepEqual(moveTower(original,0,2),[[3],[1],[2]]);assert.deepEqual(original,[[3,2],[1],[]]);});
test('滑块只能移入相邻空位，状态不被意外修改',()=>{const b=[1,2,3,4,5,6,7,0,8];assert.deepEqual(puzzleNeighbors(b).sort(),[4,6,8]);assert.equal(slidePuzzle(b,1),null);assert.ok(puzzleSolved(slidePuzzle(b,8)));assert.deepEqual(b,[1,2,3,4,5,6,7,0,8]);});
test('各种洗牌必定非完成且可解，提示路线能真正完成',()=>{for(const steps of [3,6,18])for(let attempt=0;attempt<30;attempt++){let board=makePuzzle(steps);assert.equal(puzzleSolved(board),false);assert.equal(new Set(board).size,9);const solution=solvePuzzle(board);assert.ok(solution&&solution.length<=steps+1);for(const tile of solution){board=slidePuzzle(board,tile);assert.ok(board);}assert.ok(puzzleSolved(board));}});
