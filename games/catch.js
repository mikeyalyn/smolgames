export function createCatch(root){
  const canvas = root.querySelector('#catchCanvas');
  const scoreEl= root.querySelector('#catchScore');
  const livesEl= root.querySelector('#catchLives');
  const ctx = canvas.getContext('2d');

  const W=canvas.width, H=canvas.height;
  let paddle={ x:W/2, y:H-24, w:90, h:14, vx:0 };
  let drops=[], t=0, score=0, lives=3, running=false, raf=0;
  let keys={};
  let last=0;

  function spawn(){
    drops.push({ x: 20+Math.random()*(W-40), y: -20, r:10+Math.random()*10, vy: 1.8+Math.random()*2.2 });
  }
  function update(dt){
    paddle.vx = (keys['ArrowRight']||keys['d']? 280:0) - (keys['ArrowLeft']||keys['a']? 280:0);
    paddle.x += paddle.vx * dt; paddle.x = Math.max(paddle.w/2, Math.min(W - paddle.w/2, paddle.x));

    t += dt;
    if(t>0.8){ t=0; spawn(); }

    for(let i=drops.length-1;i>=0;i--){
      const d = drops[i];
      d.y += d.vy * (60*dt);
      if(d.y + d.r >= paddle.y && d.y - d.r <= paddle.y + paddle.h){
        if(Math.abs(d.x - paddle.x) < paddle.w/2 + d.r){
          score++; drops.splice(i,1); continue;
        }
      }
      if(d.y - d.r > H){
        drops.splice(i,1); lives--; if(lives<=0) gameOver();
      }
    }
    scoreEl.textContent=score; livesEl.textContent=lives;
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.globalAlpha=0.15;
    for(let i=0;i<8;i++){
      ctx.fillRect((i*85 + (performance.now()/50)%85)-85, 0, 2, H);
    }
    ctx.globalAlpha=1;

    roundedRect(ctx, paddle.x - paddle.w/2, paddle.y, paddle.w, paddle.h, 8);
    drops.forEach(d=>{
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
    });
  }
  function roundedRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.fill();
  }
  function loop(ts){
    if(!running){ return; }
    const dt = Math.min(0.033, (ts-last)/1000 || 0.016);
    last = ts;
    update(dt); draw();
    raf = requestAnimationFrame(loop);
  }
  function start(){
    if(running) return;
    running=true; last=performance.now(); raf=requestAnimationFrame(loop);
  }
  function stop(){
    running=false; cancelAnimationFrame(raf);
  }
  function reset(){
    stop(); drops=[]; score=0; lives=3; paddle.x=W/2; t=0; scoreEl.textContent=score; livesEl.textContent=lives; start();
  }
  function gameOver(){
    stop();
    ctx.fillStyle='rgba(15,18,32,.7)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#e6e8ff'; ctx.font='bold 28px system-ui';
    ctx.textAlign='center'; ctx.fillText('Game Over', W/2, H/2 - 10);
    ctx.font='16px system-ui'; ctx.fillText('Press Reset to try again', W/2, H/2 + 18);
  }
  function onKey(e,down){
    const k = e.key.toLowerCase();
    keys[e.key] = down; keys[k] = down;
    if(['arrowleft','arrowright','a','d'].includes(k)) e.preventDefault();
  }
  window.addEventListener('keydown', e=>onKey(e,true));
  window.addEventListener('keyup',   e=>onKey(e,false));
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState==='visible') start(); else stop();
  });

  // auto-start when section becomes active (main.js calls start/stop)
  reset();

  return { reset, start, stop };
}
