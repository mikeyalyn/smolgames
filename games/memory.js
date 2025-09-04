import { load, save } from '../utils/store.js';

export function createMemory(root){
  const boardEl  = root.querySelector('#memBoard');
  const movesEl  = root.querySelector('#memMoves');
  const matchesEl= root.querySelector('#memMatches');
  const bestEl   = root.querySelector('#memBest');

  const EMO = ['🦋','🍓','⭐','🌙','🍀','🔥','💎','🎈'];
  let deck=[], first=null, lock=false, moves=0, matches=0;
  let best = load('memory:best', null);
  bestEl.textContent = best ?? '—';

  function makeDeck(){
    const pool = [...EMO, ...EMO]; // 16 cards (8 pairs)
    for(let i=pool.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]];
    }
    deck = pool.map((v,i)=>({ id:i, v, matched:false, revealed:false }));
  }
  function render(){
    boardEl.innerHTML='';
    deck.forEach(card=>{
      const d=document.createElement('div');
      d.className='card'+(card.revealed?' revealed':'')+(card.matched?' matched':'');
      d.textContent= card.revealed || card.matched ? card.v : '❔';
      d.addEventListener('click', ()=>onFlip(card.id));
      boardEl.appendChild(d);
    });
    movesEl.textContent=moves;
    matchesEl.textContent=matches+'/8';
  }
  function onFlip(id){
    if(lock) return;
    const c = deck.find(x=>x.id===id);
    if(c.matched || c.revealed) return;
    c.revealed=true; render();

    if(!first){ first=c; return; }
    moves++;
    if(first.v===c.v){
      c.matched=true; first.matched=true; matches++;
      first=null; render();
      if(matches===8){
        if(best==null || moves<best){ best=moves; bestEl.textContent=best; save('memory:best', best); }
      }
    }else{
      lock=true;
      setTimeout(()=>{
        c.revealed=false; first.revealed=false; first=null; lock=false; render();
      }, 700);
    }
  }
  function reset(){ moves=0; matches=0; first=null; lock=false; makeDeck(); render(); }

  reset();
  return { reset, start:()=>{}, stop:()=>{} };
}
