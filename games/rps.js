export function createRps(root){
  const youEl = root.querySelector('#rpsYou');
  const cpuEl = root.querySelector('#rpsCpu');
  const roundEl = root.querySelector('#rpsRound');
  const buttons = root.querySelectorAll('.rps-btn');

  let you=0, cpu=0;
  const beats = { Rock:'Scissors', Paper:'Rock', Scissors:'Paper' };

  function play(y){
    const options = Object.keys(beats);
    const c = options[Math.floor(Math.random()*3)];
    let res, badge='draw';
    if(y===c){ res='Draw!'; badge='draw'; }
    else if(beats[y]===c){ res='You win!'; badge='win'; you++; }
    else { res='You lose!'; badge='lose'; cpu++; }
    youEl.textContent=you; cpuEl.textContent=cpu;
    roundEl.innerHTML = `You chose <b>${y}</b>, CPU chose <b>${c}</b> — <span class="badge ${badge}">${res}</span>`;
  }
  function reset(){ you=0; cpu=0; youEl.textContent=you; cpuEl.textContent=cpu; roundEl.textContent='Pick your move!'; }

  buttons.forEach(b=>b.addEventListener('click', ()=>play(b.dataset.move)));
  reset();
  return { reset, start:()=>{}, stop:()=>{} };
}
