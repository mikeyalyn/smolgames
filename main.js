import { createReaction } from './games/reaction.js';
import { createClicker }  from './games/clicker.js';
import { createMemory }   from './games/memory.js';
import { createCatch }    from './games/catch.js';
import { createRps }      from './games/rps.js';
import { createPong }     from './games/pong.js';
import { createMaze }     from './games/maze.js';
import { wipeAll }        from './utils/store.js';

const GAMES = [
  { key:'reaction', name:'Reaction Test ⚡', desc:'Wait for green, then click fast!', mount:'#game-reaction', factory:createReaction },
  { key:'clicker' , name:'Clicker 🐾', desc:'Tap for points, buy tiny upgrades.', mount:'#game-clicker', factory:createClicker },
  { key:'memory'  , name:'Memory Match 🧠', desc:'Flip cards and match pairs.', mount:'#game-memory', factory:createMemory },
  { key:'catch'   , name:'Catch 🧺', desc:'Catch drops. Don’t miss 3!', mount:'#game-catch', factory:createCatch },
  { key:'rps'     , name:'Rock · Paper · Scissors ✂️', desc:'Classic best-of ∞.', mount:'#game-rps', factory:createRps },
  { key:'pong'    , name:'Pong 🏓', desc:'Classic paddle duel vs CPU.', mount:'#game-pong', factory:createPong },
  { key:'maze'    , name:'Maze Runner 🧭', desc:'Generate & escape a maze.', mount:'#game-maze', factory:createMaze }
];

const menu     = document.getElementById('menu');
const backBtn  = document.getElementById('backBtn');
const resetBtn = document.getElementById('resetBtn');
const wipeBtn  = document.getElementById('wipeSavesBtn');

let instances = {};
let currentKey = null;

// Build menu
function renderMenu(){
  menu.innerHTML = '<h3 style="margin:6px 6px 4px 6px;">Games</h3>';
  GAMES.forEach(g=>{
    const b = document.createElement('button');
    b.className = 'menu-btn';
    b.dataset.key = g.key;
    b.innerHTML = `<div style="font-weight:800">${g.name}</div><div class="hint">${g.desc}</div>`;
    b.addEventListener('click', ()=>navigate(g.key));
    menu.appendChild(b);
  });
}

function setActiveSection(key){
  document.querySelectorAll('.game').forEach(sec=>{
    sec.classList.toggle('active', sec.dataset.key === key);
  });
  document.querySelectorAll('.menu-btn').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.key === key);
  });
}

function navigate(key){
  if (currentKey && instances[currentKey]?.stop) {
    instances[currentKey].stop();
  }
  currentKey = key;
  setActiveSection(key);

  // lazy create instance
  if (!instances[key]) {
    const def = GAMES.find(g=>g.key===key);
    const root = document.querySelector(def.mount);
    instances[key] = def.factory(root);
  }
  instances[key]?.start?.();
}

function goMenu(){
  if (currentKey && instances[currentKey]?.stop) instances[currentKey].stop();
  currentKey = null;
  document.querySelectorAll('.menu-btn').forEach(btn=>btn.classList.remove('active'));
  document.querySelectorAll('.game').forEach(sec=>sec.classList.remove('active'));
}

function resetCurrent(){
  if (!currentKey) return;
  instances[currentKey]?.reset?.();
}

backBtn.addEventListener('click', goMenu);
resetBtn.addEventListener('click', resetCurrent);
window.addEventListener('keydown', e=>{ if(e.key==='Escape') goMenu(); });

// Pause/resume animating games when tab hidden
document.addEventListener('visibilitychange', ()=>{
  if (!currentKey) return;
  const inst = instances[currentKey];
  if (!inst) return;
  if (document.visibilityState === 'visible') inst.start?.();
  else inst.stop?.();
});

// Wipe all saves
wipeBtn.addEventListener('click', ()=>{
  if(confirm('Delete all Tiny Arcade saves?')){ wipeAll(); alert('All saves cleared.'); }
});

renderMenu();
goMenu();
