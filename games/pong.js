import { load, save } from '../utils/store.js';

export function createPong(root){
  const canvas = document.createElement('canvas');
  canvas.width = 680; canvas.height = 360;
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.border = '1px solid #2b2f55';
  canvas.style.borderRadius = '16px';
  canvas.style.background = 'radial-gradient(800px 300px at 50% -20%, #141a3f, #121738)';

  const panel = root.querySelector('.panel.center');
  panel.insertBefore(canvas, panel.children[2]);

  const leftScoreEl  = root.querySelector('#pongLeft');
  const rightScoreEl = root.querySelector('#pongRight');
  const hintEl       = root.querySelector('#pongHint');
  const diffSel      = root.querySelector('#pongDiff');
  const cumYouEl     = root.querySelector('#pongCumYou');
  const cumCpuEl     = root.querySelector('#pongCumCpu');

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const saved = load('pong:save', { diff:'normal', cumYou:0, cumCpu:0 });
  diffSel.value = saved.diff ?? 'normal';
  let cumYou = saved.cumYou || 0, cumCpu = saved.cumCpu || 0;
  cumYouEl.textContent = cumYou; cumCpuEl.textContent = cumCpu;

  // gameplay
  let running=false, raf=0, last=0;
  let left = { x: 20,  y: H/2-35, w: 10, h: 70, vy: 0 };
  let right= { x: W-30, y: H/2-35, w: 10, h: 70, vy: 0 };
  let ball = { x: W/2, y: H/2, r: 7, vx: 220*(Math.random()<.5?-1:1), vy: (Math.random()*2-1)*160 };
  let keys = {};
  let leftScore=0, rightScore=0;

  function aiMaxSpeed(){
    if(diffSel.value==='easy') return 170;
    if(diffSel.value==='hard') return 280;
    return 220;
  }

  function resetBall(dir = (Math.random()<.5?-1:1)){
    ball.x = W/2; ball.y = H/2;
    const speed = diffSel.value==='hard' ? 260 : diffSel.value==='easy' ? 200 : 220;
    ball.vx = speed * dir;
    ball.vy = (Math.random()*2-1) * (speed*0.75);
  }

  function update(dt){
    // input: left paddle (W/S or ArrowUp/Down)
    const up = keys['w'] || keys['ArrowUp'];
    const dn = keys['s'] || keys['ArrowDown'];
    left.vy = (dn? 250:0) - (up? 250:0);
    left.y += left.vy * dt;
    left.y = Math.max(0, Math.min(H-left.h, left.y));

    // AI
    const target = ball.y - right.h/2;
    const diff = target - right.y;
    const maxSpeed = aiMaxSpeed();
    right.vy = Math.max(-maxSpeed, Math.min(maxSpeed, diff * 6 * dt));
    right.y += right.vy;
    right.y = Math.max(0, Math.min(H-right.h, right.y));

    // ball
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // walls
    if(ball.y - ball.r < 0){ ball.y = ball.r; ball.vy *= -1; }
    if(ball.y + ball.r > H){ ball.y = H - ball.r; ball.vy *= -1; }

    // paddles
    if(ball.x - ball.r < left.x + left.w && ball.y > left.y && ball.y < left.y + left.h){
      ball.x = left.x + left.w + ball.r;
      const hit = (ball.y - (left.y + left.h/2)) / (left.h/2);
      ball.vx = Math.abs(ball.vx) * (1 + Math.random()*0.1);
      ball.vy = hit * 230;
    }
    if(ball.x + ball.r > right.x && ball.y > right.y && ball.y < right.y + right.h){
      ball.x = right.x - ball.r;
      const hit = (ball.y - (right.y + right.h/2)) / (right.h/2);
      ball.vx = -Math.abs(ball.vx) * (1 + Math.random()*0.1);
      ball.vy = hit * 230;
    }

    // scoring
    if(ball.x < -10){ rightScore++; rightScoreEl.textContent = rightScore; cumCpu++; saveState(); resetBall(1); }
    if(ball.x > W+10){ leftScore++;  leftScoreEl.textContent  = leftScore;  cumYou++; saveState(); resetBall(-1); }
  }

  function saveState(){
    cumYouEl.textContent = cumYou; cumCpuEl.textContent = cumCpu;
    save('pong:save', { diff: diffSel.value, cumYou, cumCpu });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.globalAlpha=0.4;
    for(let y=10; y<H; y+=18){ ctx.fillRect(W/2-1, y, 2, 10); }
    ctx.globalAlpha=1;
    ctx.fillRect(left.x, left.y, left.w, left.h);
    ctx.fillRect(right.x, right.y, right.w, right.h);
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
  }

  function loop(ts){
    if(!running) return;
    const dt = Math.min(0.033, (ts-last)/1000 || 0.016);
    last = ts;
    update(dt); draw();
    raf = requestAnimationFrame(loop);
  }

  function start(){
    if(running) return;
    running = true; last = performance.now();
    hintEl.textContent = 'Use W/S or ↑/↓ to move';
    raf = requestAnimationFrame(loop);
  }
  function stop(){
    running=false; cancelAnimationFrame(raf);
  }
  function reset(){
    leftScore=0; rightScore=0;
    leftScoreEl.textContent='0'; rightScoreEl.textContent='0';
    left.y = H/2-35; right.y = H/2-35;
    resetBall();
  }

  function onKey(e,down){
    const k = e.key.toLowerCase();
    keys[e.key] = down; keys[k] = down;
    if(['arrowup','arrowdown','w','s'].includes(k)) e.preventDefault();
  }
  window.addEventListener('keydown', e=>onKey(e,true));
  window.addEventListener('keyup',   e=>onKey(e,false));
  diffSel.addEventListener('change', ()=>{ saveState(); reset(); });

  reset();
  return { reset, start, stop };
}
