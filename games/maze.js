export function createMaze(root){
  // UI
  const movesEl = root.querySelector('#mazeMoves');
  const sizeEl  = root.querySelector('#mazeSize');
  const canvas  = document.createElement('canvas');
  canvas.width = 640; canvas.height = 384; // 32px tiles for 20x12-ish
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.border = '1px solid #2b2f55';
  canvas.style.borderRadius = '16px';
  canvas.style.background = '#101536';
  const panel = root.querySelector('.panel.center');
  panel.insertBefore(canvas, panel.children[2]);

  const ctx = canvas.getContext('2d');

  // Grid config
  let COLS = 21; // must be odd
  let ROWS = 15; // must be odd
  const TILE = Math.floor(Math.min(canvas.width/COLS, canvas.height/ROWS));
  const XOFF = Math.floor((canvas.width - COLS*TILE)/2);
  const YOFF = Math.floor((canvas.height - ROWS*TILE)/2);

  let grid = []; // 0=wall, 1=path
  let player = { c:1, r:1 };
  let goal   = { c:COLS-2, r:ROWS-2 };
  let moves = 0;

  function carveMaze(){
    // init walls
    grid = Array.from({length:ROWS}, ()=>Array(COLS).fill(0));
    function inb(r,c){ return r>0 && r<ROWS-1 && c>0 && c<COLS-1; }

    // recursive backtracker
    const stack = [];
    let r = 1, c = 1;
    grid[r][c] = 1;
    stack.push([r,c]);

    const dirs = [[0,2],[0,-2],[2,0],[-2,0]];

    while(stack.length){
      const [cr, cc] = stack[stack.length-1];
      // shuffle dirs
      for(let i=dirs.length-1;i>0;i--){ const j=(Math.random()* (i+1))|0; [dirs[i],dirs[j]]=[dirs[j],dirs[i]]; }
      let carved = false;
      for(const [dr,dc] of dirs){
        const nr = cr+dr, nc = cc+dc;
        if(inb(nr,nc) && grid[nr][nc]===0){
          grid[cr + dr/2][cc + dc/2] = 1; // open wall between
          grid[nr][nc] = 1;
          stack.push([nr,nc]);
          carved = true;
          break;
        }
      }
      if(!carved) stack.pop();
    }
    // ensure start & goal open
    grid[1][1]=1; grid[ROWS-2][COLS-2]=1;
  }

  function draw(){
    // board
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const x = XOFF + c*TILE, y = YOFF + r*TILE;
        if(grid[r][c]===0){
          // wall tile
          ctx.fillStyle = '#18204a';
          ctx.fillRect(x,y,TILE,TILE);
          ctx.fillStyle = '#222a63';
          ctx.fillRect(x+2,y+2,TILE-4,TILE-4);
        } else {
          // path tile
          ctx.fillStyle = '#0f1330';
          ctx.fillRect(x,y,TILE,TILE);
          ctx.fillStyle = '#141a3f';
          ctx.fillRect(x+2,y+2,TILE-4,TILE-4);
        }
      }
    }
    // goal
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(XOFF + goal.c*TILE+5, YOFF + goal.r*TILE+5, TILE-10, TILE-10);

    // player (circle)
    ctx.beginPath();
    ctx.fillStyle = '#e6e8ff';
    ctx.arc(XOFF + player.c*TILE + TILE/2, YOFF + player.r*TILE + TILE/2, Math.min(10, TILE/2-4), 0, Math.PI*2);
    ctx.fill();
  }

  function canMove(r,c){ return r>=0 && c>=0 && r<ROWS && c<COLS && grid[r][c]===1; }
  function tryMove(dr,dc){
    const nr = player.r + dr, nc = player.c + dc;
    if(canMove(nr,nc)){
      player.r = nr; player.c = nc; moves++; movesEl.textContent = moves;
      draw();
      if(player.r===goal.r && player.c===goal.c){
        // win flash overlay
        ctx.fillStyle='rgba(14,17,48,.7)'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='#8bf0b8'; ctx.font='bold 26px system-ui';
        ctx.textAlign='center';
        ctx.fillText('You escaped the maze!', canvas.width/2, canvas.height/2 - 6);
        ctx.font='14px system-ui';
        ctx.fillStyle='#e6e8ff';
        ctx.fillText('Press Reset for a new maze', canvas.width/2, canvas.height/2 + 18);
      }
    }
  }

  function onKey(e){
    const k = e.key.toLowerCase();
    if(['arrowup','w'].includes(k)){ e.preventDefault(); tryMove(-1,0); }
    else if(['arrowdown','s'].includes(k)){ e.preventDefault(); tryMove(1,0); }
    else if(['arrowleft','a'].includes(k)){ e.preventDefault(); tryMove(0,-1); }
    else if(['arrowright','d'].includes(k)){ e.preventDefault(); tryMove(0,1); }
  }
  window.addEventListener('keydown', onKey);

  function reset(){
    moves=0; movesEl.textContent = '0';
    player = { c:1, r:1 };
    goal   = { c:COLS-2, r:ROWS-2 };
    carveMaze(); draw();
    sizeEl.textContent = `${COLS}×${ROWS}`;
  }

  // public API
  function start(){ /* no loop needed */ }
  function stop(){ /* no loop needed */ }

  reset();
  return { reset, start, stop };
}
