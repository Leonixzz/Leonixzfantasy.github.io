(function(){
const STORAGE_KEY = 'fantasy-proto-save-v1';

const DATA = {
  zones: [
    {id:'area1',name:'Greenwood Outskirts',minLevel:1,maxLevel:4,monsters:['Slime','ForestBat']},
    {id:'area2',name:'Ashen Fields',minLevel:5,maxLevel:9,monsters:['AshImp','CharredSkeleton']},
    {id:'area3',name:'Coastal Shoals',minLevel:8,maxLevel:12,monsters:['SeaHound','Corsair']}
  ],
  towns: [
    {id:'city',name:'City of Beginnings',area:'area1',reqLevel:1,reqArea:'area1',desc:'Starter city. Crafting and training.'},
    {id:'stone',name:'Stonefang Outpost',area:'area2',reqLevel:5,reqArea:'area2',desc:'Blacksmiths & Craftsmason Guild'},
    {id:'ember',name:'Emberport',area:'area2',reqLevel:8,reqArea:'area2',desc:'Sea order and harbors'},
    {id:'gild',name:'Gildenspire City',area:'area3',reqLevel:12,reqArea:'area3',desc:'Politics and high magic'}
  ],
  monsters: {
    'Slime':{hp:30,atk:4,behavior:'Passive',drops:{Gel:1}},
    'ForestBat':{hp:28,atk:5,behavior:'Neutral',drops:{Wing:1}},
    'AshImp':{hp:70,atk:10,behavior:'Neutral',drops:{Ember:1}},
    'CharredSkeleton':{hp:90,atk:12,behavior:'Aggressive',drops:{Bone:1}}
  },
  items: {
    'Minor Health Potion':{desc:'Restores 50 HP',type:'consumable',cost:50},
    'Minor Mana Potion':{desc:'Restores 30 MP',type:'consumable',cost:60}
  },
  classSkills: {
    'Knight':{name:'Bash',desc:'A heavy bash that can stun.',power:12},
    'Mage':{name:'Mana Ball',desc:'Small magic projectile.',power:14},
    'Thief':{name:'Stab',desc:'Precise strike with crit chance.',power:10},
    'Archer':{name:'Double Shot',desc:'Two quick arrow hits.',power:8}
  }
};

let state = load() || {
  screen:'menu',
  player: {
    name:'Hero',
    race:'Human',
    class:'Thief',
    level:1, exp:0, gold:100,
    stats:{HP:100,MP:50,STR:10,DEX:12,CON:10,INT:10,WIS:10,SPD:10},
    inventory:{'Minor Health Potion':2},
    equipment:{},
    skills:[],
    mapUnlocked:['area1'],
    memoryLog:[]
  },
  tutorialStage:0
};

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function load(){ try{ const s=localStorage.getItem(STORAGE_KEY); return s?JSON.parse(s):null }catch(e){return null} }

const app = document.getElementById('app');
function render(){ app.innerHTML=''; const panel=document.createElement('div');panel.className='panel'; app.appendChild(panel); if(state.screen==='menu') renderMenu(panel); else if(state.screen==='create') renderCreate(panel); else if(state.screen==='world') renderWorld(panel); else if(state.screen==='town') renderTown(panel); else if(state.screen==='combat') renderCombat(panel); else if(state.screen==='character') renderCharacter(panel); }
function navTo(screen,opts){ state.screen=screen; if(opts) Object.assign(state,opts); save(); render(); }

function renderMenu(container){
  const h=document.createElement('h1');h.textContent='🌌 Fantasy RPG Prototype'; container.appendChild(h);
  const startBtn=document.createElement('button'); startBtn.textContent='New Game'; startBtn.onclick=()=>{ state.player={...state.player,level:1,exp:0,inventory:{'Minor Health Potion':2},skills:[]}; state.tutorialStage=0; navTo('create'); }; container.appendChild(startBtn);
  const contBtn=document.createElement('button'); contBtn.textContent='Continue'; contBtn.onclick=()=>{ navTo('world'); }; container.appendChild(contBtn);
  const resetBtn=document.createElement('button'); resetBtn.textContent='Reset Save'; resetBtn.onclick=()=>{ localStorage.removeItem(STORAGE_KEY); alert('Save cleared. Refresh page.'); }; container.appendChild(resetBtn);
  const read=document.createElement('div'); read.className='small'; read.style.marginTop='10px'; read.innerHTML='Tip: After creating your character, meet Isaac in the city to start the map tutorial.'; container.appendChild(read);
}

function renderCreate(container){
  const h=document.createElement('h2'); h.textContent='Character Creation'; container.appendChild(h);
  const nameLabel=document.createElement('div'); nameLabel.className='small'; nameLabel.textContent='Enter your name:';
  const nameInput=document.createElement('input'); nameInput.className='input'; nameInput.value=state.player.name || ''; nameInput.oninput=(e)=>state.player.name=e.target.value;
  container.appendChild(nameLabel); container.appendChild(nameInput);
  const raceDiv=document.createElement('div'); raceDiv.className='zone'; raceDiv.innerHTML='<strong>Choose Race</strong><div class="small">(Racial bonuses are flavor in this prototype)</div>';
  ['Human','Elf','Dwarf','Orc'].forEach(r=>{ const b=document.createElement('button'); b.textContent=r; b.onclick=()=>{ state.player.race=r; save(); render(); }; raceDiv.appendChild(b); });
  container.appendChild(raceDiv);
  const classDiv=document.createElement('div'); classDiv.className='zone'; classDiv.innerHTML='<strong>Choose Class</strong><div class="small">Pick your base class. You will receive a basic skill.</div>';
  ['Knight','Mage','Thief','Archer'].forEach(c=>{ const b=document.createElement('button'); b.textContent=c; b.onclick=()=>{ state.player.class=c; const cs=DATA.classSkills[c]; if(cs){ state.player.skills=[cs]; } save(); render(); }; classDiv.appendChild(b); });
  container.appendChild(classDiv);
  const btn=document.createElement('button'); btn.textContent='Confirm & Enter City'; btn.onclick=()=>{ if(!state.player.name) state.player.name='Hero'; state.player.level=1; state.player.mapUnlocked=['area1']; state.tutorialStage=0; navTo('world',{tutorial:true}); }; container.appendChild(btn);
  const info=document.createElement('div'); info.className='small'; info.style.marginTop='8px'; info.innerHTML=`Name: ${state.player.name||'Hero'}<br>Race: ${state.player.race}<br>Class: ${state.player.class}<br>Skill: ${state.player.skills.length?state.player.skills[0].name:'(none)'}`; container.appendChild(info);
}

function renderWorld(container){
  const h=document.createElement('h2'); h.textContent='World Map'; container.appendChild(h);
  const top=document.createElement('div'); top.className='topbar'; container.appendChild(top);
  const mapBtn=document.createElement('button'); mapBtn.textContent='Open Map'; mapBtn.onclick=()=>{}; top.appendChild(mapBtn);
  const charBtn=document.createElement('button'); charBtn.textContent='Character'; charBtn.onclick=()=>navTo('character'); top.appendChild(charBtn);
  const invBtn=document.createElement('button'); invBtn.textContent='Inventory'; invBtn.onclick=()=>navTo('town',{townId:'city'}); top.appendChild(invBtn);
  const hub=document.createElement('div'); hub.className='zone'; hub.innerHTML=`<strong>City of Beginnings</strong><div class='small'>Your starting hub. Meet NPCs, shop or craft.</div>`;
  const meet=document.createElement('button'); meet.textContent='Meet Isaac (Tutorial)'; meet.onclick=()=>{ state.tutorialStage=1; state.player.memoryLog.push({location:'City of Beginnings',date:Date.now(),note:'Met Isaac, tutorial started.'}); save(); alert('Isaac: Welcome! Open the map and travel to Greenwood Outskirts (Area 1).'); }; hub.appendChild(meet);
  const travelBtn=document.createElement('button'); travelBtn.textContent='Open Full Map'; travelBtn.onclick=()=>{ renderMap(container); }; hub.appendChild(travelBtn);
  container.appendChild(hub);
  const townsDiv=document.createElement('div'); townsDiv.className='zone'; townsDiv.innerHTML='<strong>All Towns</strong><div class="small">You may travel to any town, but some trials/quests require a higher level or area progress.</div>';
  DATA.towns.forEach(t=>{
    const tdiv=document.createElement('div'); tdiv.className='zone'; if(state.player.level < t.reqLevel) tdiv.classList.add('locked');
    tdiv.innerHTML=`<strong>${t.name}</strong><div class='small'>${t.desc}</div><div class='small'>Requires Level: ${t.reqLevel}, Area: ${t.reqArea}</div>`;
    const go=document.createElement('button'); go.textContent='Travel'; go.onclick=()=>{ state.location=t.id; navTo('town',{townId:t.id}); };
    tdiv.appendChild(go);
    townsDiv.appendChild(tdiv);
  });
  container.appendChild(townsDiv);
  const mem=document.createElement('div'); mem.className='zone'; mem.innerHTML='<strong>Memory Log</strong>';
  if(!state.player.memoryLog.length) mem.innerHTML+='<div class="small">No discoveries yet.</div>'; else{ state.player.memoryLog.slice().reverse().forEach(m=>{ const e=document.createElement('div'); e.className='small'; e.style.marginTop='6px'; e.textContent=`📍 ${m.location} — ${new Date(m.date).toLocaleString()}: ${m.note}`; mem.appendChild(e); }); }
  container.appendChild(mem);
}

function renderMap(container){
  container.innerHTML='';
  const title=document.createElement('h2'); title.textContent='Map - Select an Area'; container.appendChild(title);
  DATA.zones.forEach(z=>{
    const zdiv=document.createElement('div'); zdiv.className='zone';
    const unlocked = state.player.mapUnlocked.includes(z.id);
    zdiv.innerHTML=`<strong>${z.name}</strong><div class='small'>Levels: ${z.minLevel}-${z.maxLevel}</div><div class='small'>Monsters: ${z.monsters.join(', ')}</div>`;
    const scout=document.createElement('button'); scout.textContent='Scout (Risk%)'; scout.onclick=()=>{ const risk = calcRisk(z); alert(`${z.name} — Encounter risk: ${risk}%`); };
    zdiv.appendChild(scout);
    const travel=document.createElement('button'); travel.textContent='Travel'; travel.onclick=()=>{ if(state.tutorialStage===1 && z.id==='area1'){ startTutorialBattle(z); return; } startAreaEncounter(z); };
    if(!unlocked) travel.classList.add('locked');
    zdiv.appendChild(travel);
    container.appendChild(zdiv);
  });
  const back=document.createElement('button'); back.textContent='Back to City'; back.onclick=()=>navTo('world'); container.appendChild(back);
}

function calcRisk(zone){
  const base = zone.minLevel*8 + 10;
  const thief = state.player.class==='Thief' ? (state.player.stats.SPD||10) : 0;
  const avoidance = Math.min(90, Math.max(10, 50 - thief/2 + (zone.minLevel*2)));
  return Math.round(avoidance);
}

function startAreaEncounter(zone){
  const mname = zone.monsters[Math.floor(Math.random()*zone.monsters.length)];
  const mon = JSON.parse(JSON.stringify(DATA.monsters[mname]));
  state.currentEncounter = {zone:zone.id,monsterName:mname,monster:mon};
  navTo('combat');
}

function startTutorialBattle(zone){
  const mname = zone.monsters[0];
  const mon = JSON.parse(JSON.stringify(DATA.monsters[mname]));
  state.currentEncounter = {zone:zone.id,monsterName:mname,monster:mon,tutorial:true};
  navTo('combat');
}

function renderCombat(container){
  const enc = state.currentEncounter;
  const player = state.player;
  const mon = enc.monster;
  const h=document.createElement('h2'); h.textContent='Combat Encounter'; container.appendChild(h);
  const statRow=document.createElement('div'); statRow.className='statbar';
  const ph=document.createElement('div'); ph.className='stat'; ph.textContent=`${player.name} HP:${player.stats.HP}`;
  const mh=document.createElement('div'); mh.className='stat'; mh.textContent=`${enc.monsterName} HP:${enc.monster.hp}`;
  statRow.appendChild(ph); statRow.appendChild(mh); container.appendChild(statRow);
  const actions=document.createElement('div'); actions.style.marginTop='8px';
  const attack=document.createElement('button'); attack.textContent='Attack'; attack.onclick=()=>{ playerAttack(false); };
  const defend=document.createElement('button'); defend.textContent='Defend'; defend.onclick=()=>{ playerDefend(); };
  const skill=document.createElement('button'); skill.textContent='Skill: '+(player.skills[0]?player.skills[0].name:'(none)'); skill.onclick=()=>{ playerSkill(); };
  const item=document.createElement('button'); item.textContent='Use Potion'; item.onclick=()=>{ useItem(); };
  actions.appendChild(attack); actions.appendChild(defend); actions.appendChild(skill); actions.appendChild(item);
  container.appendChild(actions);
  const log=document.createElement('div'); log.className='logbox'; log.style.marginTop='10px'; log.id='combat-log';
  log.innerHTML='Combat log:'; container.appendChild(log);
  const back=document.createElement('button'); back.textContent='Flee (End Tutorial)'; back.onclick=()=>{ if(enc.tutorial){ alert('You fled. Returning to City.'); navTo('world'); } else { navTo('world'); } };
  container.appendChild(back);
  save();
}

function playerAttack(isCritForced){
  const enc = state.currentEncounter;
  const player = state.player;
  const mon = enc.monster;
  const dmg = Math.max(1, Math.floor((player.stats.STR||10)/2 + Math.random()*6));
  mon.hp -= dmg;
  addCombatLog(`You attack and deal ${dmg} damage.`);
  if(mon.hp <= 0){ addCombatLog(`You defeated the ${enc.monsterName}!`); awardAfterBattle(enc); return; }
  monsterTurn();
  save(); render();
}
function playerDefend(){
  addCombatLog('You brace yourself, reducing incoming damage this turn.');
  state.player._defend = true;
  monsterTurn();
  state.player._defend = false;
  save(); render();
}
function playerSkill(){
  const enc = state.currentEncounter;
  const player = state.player;
  const skill = player.skills[0];
  if(!skill){ addCombatLog('No skill available.'); return; }
  let power = skill.power || 8;
  if(player.class==='Knight'){
    const stun = Math.random() < 0.25;
    enc.monster.hp -= power;
    addCombatLog(`You use ${skill.name} dealing ${power} damage.${stun? ' It stuns the enemy!':''}`);
    if(stun){ addCombatLog('Enemy stunned.'); }
    if(enc.monster.hp <= 0){ awardAfterBattle(enc); return; }
    if(!stun) monsterTurn(); else { save(); render(); return; }
  } else if(player.class==='Mage'){
    enc.monster.hp -= power;
    addCombatLog(`You cast ${skill.name} for ${power} magic damage.`);
    if(enc.monster.hp <= 0){ awardAfterBattle(enc); return; }
    monsterTurn();
  } else if(player.class==='Thief'){
    const crit = Math.random() < 0.35;
    const dmg = Math.floor(power * (crit?2:1));
    enc.monster.hp -= dmg;
    addCombatLog(`You stab for ${dmg} damage.${crit? ' Critical hit!':''}`);
    if(enc.monster.hp <= 0){ awardAfterBattle(enc); return; }
    monsterTurn();
  } else if(player.class==='Archer'){
    const dmg1 = Math.floor(power + Math.random()*4);
    const dmg2 = Math.floor(power + Math.random()*4);
    const total = dmg1 + dmg2; enc.monster.hp -= total;
    addCombatLog(`You fire Double Shot: ${dmg1} + ${dmg2} = ${total} damage.`);
    if(enc.monster.hp <= 0){ awardAfterBattle(enc); return; }
    monsterTurn();
  } else {
    enc.monster.hp -= power; addCombatLog(`You use ${skill.name} for ${power} damage.`); if(enc.monster.hp<=0){ awardAfterBattle(enc); return;} monsterTurn();
  }
  save(); render();
}
function useItem(){
  const inv = state.player.inventory;
  if(inv['Minor Health Potion']>0){ inv['Minor Health Potion']--; state.player.stats.HP = Math.min(100, state.player.stats.HP + 50); addCombatLog('You drink a Minor Health Potion (+50 HP).'); save(); render(); } else addCombatLog('No potions available.');
}
function monsterTurn(){
  const enc = state.currentEncounter;
  const mon = enc.monster;
  const atk = mon.atk + Math.floor(Math.random()*4);
  let damage = atk - Math.floor((state.player.stats.CON||10)/5);
  if(state.player._defend) damage = Math.floor(damage/2);
  damage = Math.max(1, damage);
  state.player.stats.HP -= damage;
  addCombatLog(`${enc.monsterName} attacks and deals ${damage} damage to you.`);
  if(state.player.stats.HP <= 0){ addCombatLog('You have been defeated. Returning to city and restoring HP.'); state.player.stats.HP = 50; state.player.gold = Math.max(0, state.player.gold - 20); navTo('world'); }
  save();
}
function awardAfterBattle(enc){
  addCombatLog('Battle won! You gain small XP and drops.');
  const drops = DATA.monsters[enc.monsterName].drops || {};
  for(const k in drops){ state.player.inventory[k] = (state.player.inventory[k]||0) + drops[k]; state.player.memoryLog.push({location:enc.zone,date:Date.now(),note:'Found '+k}); }
  if(enc.tutorial){
    alert('Tutorial complete! Isaac: Good. Return to the city and I will explain the map further.');
    if(!state.player.mapUnlocked.includes('area2')) state.player.mapUnlocked.push('area2');
    state.tutorialStage = 2;
    navTo('world');
  } else {
    navTo('world');
  }
  save();
}
function addCombatLog(text){ const el = document.getElementById('combat-log'); if(el) el.innerHTML += '<div class="small">• '+text+'</div>'; }

function renderTown(container){
  const townId = state.townId || state.location || 'city';
  const town = DATA.towns.find(t=>t.id===townId) || DATA.towns[0];
  const h=document.createElement('h2'); h.textContent=town.name; container.appendChild(h);
  const desc=document.createElement('div'); desc.className='small'; desc.textContent=town.desc; container.appendChild(desc);
  const npcDiv=document.createElement('div'); npcDiv.className='zone'; npcDiv.innerHTML='<strong>Inn & NPCs</strong>'; const isaacBtn=document.createElement('button'); isaacBtn.textContent='Talk to Isaac'; isaacBtn.onclick=()=>{ alert('Isaac: Good work getting here. Use the map to travel and level up. There is a crafting bench here.'); state.player.memoryLog.push({location:town.name,date:Date.now(),note:'Talked to Isaac in '+town.name}); save(); }; npcDiv.appendChild(isaacBtn);
  container.appendChild(npcDiv);
  const vendor=document.createElement('div'); vendor.className='zone'; vendor.innerHTML='<strong>Vendor</strong><div class="small">Buy potions</div>';
  Object.keys(DATA.items).forEach(it=>{ const row=document.createElement('div'); row.className='small'; row.textContent=`${it} - ${DATA.items[it].cost}g - ${DATA.items[it].desc}`; const buy=document.createElement('button'); buy.textContent='Buy'; buy.onclick=()=>{ if(state.player.gold>=DATA.items[it].cost){ state.player.gold -= DATA.items[it].cost; state.player.inventory[it] = (state.player.inventory[it]||0)+1; save(); alert('Purchased '+it); render(); } else alert('Not enough gold'); }; row.appendChild(buy); vendor.appendChild(row); });
  container.appendChild(vendor);
  const craft=document.createElement('div'); craft.className='zone'; craft.innerHTML='<strong>Crafting Bench</strong><div class="small">Example: 2 Gel -> 1 Minor Health Potion</div>';
  const craftBtn=document.createElement('button'); craftBtn.textContent='Craft Minor Health Potion'; craftBtn.onclick=()=>{ const inv=state.player.inventory; if((inv.Gel||0)>=2){ inv.Gel-=2; inv['Minor Health Potion']=(inv['Minor Health Potion']||0)+1; save(); alert('Crafted Minor Health Potion'); render(); } else alert('Need 2 Gel to craft.'); };
  craft.appendChild(craftBtn); container.appendChild(craft);
  const quests=document.createElement('div'); quests.className='zone'; quests.innerHTML='<strong>Available Quests</strong>';
  const trialLocked = !(state.player.level>=town.reqLevel && state.player.mapUnlocked.includes(town.area));
  if(trialLocked){ quests.innerHTML += `<div class='small'>Advanced trials locked. Reach Level ${town.reqLevel} and area ${town.reqArea} to unlock.</div>`; } else { const qbtn=document.createElement('button'); qbtn.textContent='Start Trial Quest'; qbtn.onclick=()=>{ alert('Trial started (placeholder)'); }; quests.appendChild(qbtn); }
  container.appendChild(quests);
  const back=document.createElement('button'); back.textContent='Return to World Map'; back.onclick=()=>navTo('world'); container.appendChild(back);
}

function renderCharacter(container){
  const p=state.player; const h=document.createElement('h2'); h.textContent=p.name+' — '+p.class; container.appendChild(h);
  const row=document.createElement('div'); row.className='row';
  const stats=document.createElement('div'); stats.className='col zone'; stats.innerHTML='<strong>Stats</strong>';
  Object.entries(p.stats).forEach(([k,v])=>{ const s=document.createElement('div'); s.className='small'; s.textContent=`${k}: ${v}`; stats.appendChild(s); });
  row.appendChild(stats);
  const inv=document.createElement('div'); inv.className='col zone'; inv.innerHTML='<strong>Inventory</strong>'; const il=document.createElement('div'); il.className='inventory-list'; Object.entries(p.inventory).forEach(([k,v])=>{ const it=document.createElement('div'); it.className='item'; it.innerHTML=`<strong>${k}</strong><div class='small'>x${v}</div><div style="margin-top:6px"><button onclick="alert('Item: '+k+' - '+(DATA.items[k]?DATA.items[k].desc:''))">Inspect</button></div>`; il.appendChild(it); }); inv.appendChild(il); row.appendChild(inv);
  container.appendChild(row);
  const back=document.createElement('button'); back.textContent='Back to World'; back.onclick=()=>navTo('world'); container.appendChild(back);
}

save(); render(); window.navTo = navTo;
})();