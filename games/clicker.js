export function createClicker(root){
  const countEl = root.querySelector('#clickCount');
  const cpcEl   = root.querySelector('#cpc');
  const autoEl  = root.querySelector('#auto');
  const btn     = root.querySelector('#clickBtn');
  const upCpc   = root.querySelector('#upCpc');
  const upAuto  = root.querySelector('#upAuto');
  const costCpc = root.querySelector('#costCpc');
  const costAuto= root.querySelector('#costAuto');

  let count=0, cpc=1, auto=0, cost1=10, cost2=25, tickTimer=null;

  function update(){
    countEl.textContent=Math.floor(count);
    cpcEl.textContent=cpc;
    autoEl.textContent=auto;
    costCpc.textContent=Math.ceil(cost1);
    costAuto.textContent=Math.ceil(cost2);
  }
  function click(){ count+=cpc; update(); }
  function buyCpc(){
    if(count>=cost1){ count-=cost1; cpc+=1; cost1*=1.25; update(); }
  }
  function buyAuto(){
    if(count>=cost2){ count-=cost2; auto+=1; cost2*=1.25; update(); }
  }
  function start(){
    stop();
    tickTimer=setInterval(()=>{ count+=auto; update(); }, 1000);
  }
  function stop(){
    if(tickTimer) clearInterval(tickTimer);
    tickTimer=null;
  }
  function reset(){
    count=0; cpc=1; auto=0; cost1=10; cost2=25; update();
  }

  btn.addEventListener('click', click);
  upCpc.addEventListener('click', buyCpc);
  upAuto.addEventListener('click', buyAuto);
  update(); start();

  return { reset, start, stop };
}
