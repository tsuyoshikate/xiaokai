// Describe observable practice, without claiming clinical or everyday transfer.
export const gamePurposes={
 orbit:{skill:'有顺序地找目标',need:'想陪孩子练习看清目标，不被旁边的东西带走。',action:'在数字中依次找出 1、2、3……，可以静止，也可以缓慢旋转。',observe:'先确认下一个数字，再寻找和点击。'},
 signal:{skill:'记住并复现顺序',need:'想陪孩子练习听完、看完一小段指令，再行动。',action:'看星球依次亮起，等提示后按原顺序点回去。',observe:'先看完整段信号，再按顺序复现。'},
 pairs:{skill:'记住位置，再做选择',need:'想陪孩子练习把刚看到的信息暂时记在心里。',action:'翻开两张卡片，记住图案的位置，再找相同的一对。',observe:'把上一轮看到的位置用于下一次选择。'},
 traffic:{skill:'等到信号再行动',need:'想陪孩子练习先看清信号，合适的时候再出手。',action:'通行时发射飞船，等待时保持不动。',observe:'分清“现在行动”和“先等一等”。'},
 sort:{skill:'看清规则，灵活切换',need:'想陪孩子练习规则变化后，换一种做法。',action:'按当前颜色或形状规则，把物品送进对应箱子。',observe:'每次先看当前规则，再选择分类箱。'},
 search:{skill:'观察细节，排除干扰',need:'想陪孩子练习在相似的东西里看清区别。',action:'在陨石中找到颜色和形状都符合目标的一颗。',observe:'同时核对颜色和形状，而不只看其中一个。'},
 route:{skill:'记住位置与先后',need:'想陪孩子练习记住一小段路线和先后顺序。',action:'观察飞船访问的星球，航线消失后按顺序重走。',observe:'把看到的路线暂时记住，再依次回想。'},
 robot:{skill:'先安排，再执行',need:'想陪孩子练习做事前想一想步骤，走不通时再调整。',action:'排好前进与转向指令，让机器人绕开障碍到达终点。',observe:'先预想路线，执行后检查并修改步骤。'},
 reverse:{skill:'按新规则改变反应',need:'想陪孩子练习停一下，按规则而不是凭第一反应行动。',action:'看清方向提示，选择它的相反方向。',observe:'先想起“反着来”的规则，再做选择。'},
 cargo:{skill:'记住清单，再核对',need:'想陪孩子练习记住几件要做的事，逐项核对。',action:'先看货物清单，再从物品中找出需要装船的货物。',observe:'回想清单中的物品，并核对是否选齐。'},
 tracking:{skill:'持续跟住一个目标',need:'想陪孩子练习把注意放在同一个目标上。',action:'记住指定卫星，跟随它移动，再找出它。',observe:'在位置变化中持续追踪指定目标。'},
 hanoi:{skill:'想好先后，按规则搬',need:'想陪孩子练习为了后一步，先安排好这一步。',action:'把圆盘搬到目标柱，小圆盘才能放在大圆盘上。',observe:'遵守大小规则，预想搬动的先后顺序。'},
 puzzle:{skill:'规划位置，尝试调整',need:'想陪孩子练习把大任务拆成小步骤。',action:'利用空格移动相邻拼块，逐步拼回完整顺序。',observe:'观察空格，尝试移动，并根据结果调整。'},
 pattern:{skill:'比较变化，发现规律',need:'想陪孩子练习说明“为什么下一项是它”。',action:'比较图案或数量的变化，选出接下来的一项。',observe:'先比较相邻项，再用同一规律核对选项。'},
 wait:{skill:'核对目标，等待时机',need:'想陪孩子练习看见东西时先核对，符合条件再行动。',action:'记住需要的信号，只在它出现时让飞船出发。',observe:'对照目标，跳过不符合的信号。'},
 chain:{skill:'按顺序完成小任务',need:'想陪孩子练习把几步指令按顺序做完。',action:'按任务清单拿取物品，再送到指定位置。',observe:'做完一步再看下一步，核对物品和目的地。'}
};
export const folderPurposes={
 memory:{need:'想练习记住指令、物品和先后顺序',goal:'把刚看到的信息暂时记住，再拿来完成下一步。'},
 reaction:{need:'想练习先看清、等一等，再行动',goal:'核对信号和规则，选择何时行动、何时等待。'},
 attention:{need:'想练习找准目标，少受旁边干扰',goal:'在相似或移动的物品里寻找目标、跟住变化。'},
 planning:{need:'想练习先想步骤，遇到困难换个办法',goal:'把任务拆成几步，尝试路线、位置和规律。'}
};
export const restPurposes={
 breath:{need:'刚做完任务，想把节奏放慢一点',goal:'把注意轻轻放回呼吸，试着找一个舒服的节奏。'},
 body:{need:'坐了一会儿，手和肩膀想松一松',goal:'察觉身体哪里紧，轻轻放松、舒服地伸展。'},
 story:{need:'暂时不想做任务，想安静待一会儿',goal:'听或读安静的故事，给自己一段没有任务的空档。'},
 outside:{need:'眼睛累了，或者已经坐了一会儿',goal:'离开屏幕，看看远处，让身体换个姿势。'}
};
export function purposeBlock(label,title,detail,compact=false){return `<div class="purpose-block${compact?' compact':''}"><span class="purpose-label">${label}</span><strong>${title}</strong>${detail?`<p>${detail}</p>`:''}</div>`;}
export function gamePurpose(id,compact=false){const p=gamePurposes[id];return p?purposeBlock(compact?'这一关正在练':'这一关的练习目的',p.skill,compact?'':p.need,compact):'';}
