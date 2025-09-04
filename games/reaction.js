export function createReaction(root){
  const box    = root.querySelector('#reactBox');
  const label  = root.querySelector('#reactLabel');
  const status = root.querySelector('#reactStatus');
  const startBtn = root.querySelector('#reactStart');
  const lastEl = root.querySelector('#reactLast');
  const bestEl = root.querySelector('#reactBest');

  let state = 'idle'; // idle -> waiting -> go
  let timer = null, goTime=0, best=null;

  function start(){
    clearTimeout(timer);
    state='waiting';
    label.textContent='Wait...';
    status.textContent='Get ready...';
    box.style.background='#2e2e53';
    timer=setTimeout(()=>{
      state='go';
      box.style.background='#1d3a2c';
      label.textContent='GO!';
      goTime=performance.now();
    }, 700 + Math.random()*1800);
  }
  function click(){
    if(state==='waiting'){
      status.innerHTML='Too early! <span style="color:#ffb1bc">Wait for green</span>.';
      reset();
    } else if(state==='go'){
      const t = Math.round(performance.now()-goTime);
      lastEl.textContent=t;
      if(best===null || t<best){ best = t; bestEl.textContent=best; }
      status.textContent='Nice! Press Start to try again.';
      resetBox();
    }
  }
  function resetBox(){
    state='idle';
    box.style.background='#2e2e53';
    label.textContent='Waiting…';
    clearTimeout(timer);
  }
  function reset(){
    resetBox();
    lastEl.textContent='—';
    bestEl.textContent = (best==null?'—':best);
    status.textContent='Click “Start” then wait for green.';
  }

  box.addEventListener('click', click);
  startBtn.addEventListener('click', start);

  return { reset, start, stop:()=>{} };
}
