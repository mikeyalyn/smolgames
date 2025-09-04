import { load, save } from '../utils/store.js';

export function createClicker(root){
  const countEl = root.querySelector('#clickCount');
  const cpcEl   = root.querySelector('#cpc');
  const autoEl  = root.querySelector('#auto');
  const btn     = root.querySelector('#clickBtn');
  const upCpc   = root.querySelector('#upCpc');
  const upAuto  = root.querySelector('#upAuto');
  const costCpc = root.querySelector('#costCpc');
  const costAuto= root.querySelector('#costAuto');
  const saveBtn = root.querySelector('#clickerSave');
  const newBtn  = root.querySelector('#clickerNew');

  let state = load('clicker:state', null) ?? {
    count:0, cpc:1, auto:0, cost1:10, cost2:25
  };
  let tickTimer=null, autosaveTimer=null;

  function update(){
    countEl.textContent=Math.floor(state.count);
    cpcEl.textContent=state.cpc;
    autoEl.textContent=state.auto;
    costCpc.textContent=Math.ceil(state.cost1);
    costAuto.textContent=Math.ceil(state.cost2);
  }
  function click(){ state.count+=state.cpc; update(); }
  function buyCpc(){
    if(state.count>=state.cost1){ state.count-=state.cost1; state.cpc+=1; state.cost1*=1.25; update(); }
  }
  function buyAuto(){
    if(state.count>=state.cost2){ state.count-=state.cost2; state.auto+=1; state.cost2*=1.25; update(); }
  }
  function start(){
    stop();
    tickTimer=setInterval(()=>{ state.count+=state.auto; update(); }, 1000);
    autosaveTimer=setInterval(()=>save('clicker:state', state), 3000);
  }
  function stop(){
    if(tickTimer) clearInterval(tickTimer);
    if(autosaveTimer) clearInterval(autosaveTimer);
    tickTimer=autosaveTimer=null;
  }
  function reset(){
    state = { count:0, cpc:1, auto:0, cost1:10, cost2:25 };
    save('clicker:state', state);
    update();
  }

  btn.addEventListener('click', click);
  upCpc.addEventListener('click', buyCpc);
  upAuto.addEventListener('click', buyAuto);
  saveBtn.addEventListener('click', ()=>save('clicker:state', state));
  newBtn.addEventListener('click', ()=>{ if(confirm('Start a new Clicker run?')) reset(); });
  update(); start();

  return { reset, start, stop };
}
