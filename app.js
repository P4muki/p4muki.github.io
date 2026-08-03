(function(){
  "use strict";

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loadNum(key, fallback){
    const v = localStorage.getItem(key);
    return v === null ? fallback : Number(v);
  }
  function save(key, val){ localStorage.setItem(key, val); }
  function bumpGamesPlayed(){
    const n = loadNum('ownerGamesPlayed', 0) + 1;
    save('ownerGamesPlayed', n);
    const el = document.getElementById('ownerGamesPlayed');
    if(el) el.textContent = n;
  }

  /* ============ Ambient starfield background ============ */
  const bg = document.getElementById('bgCanvas');
  const bctx = bg.getContext('2d');
  let stars = [];

  function resizeBg(){
    bg.width = window.innerWidth;
    bg.height = window.innerHeight;
    const count = Math.floor((bg.width * bg.height) / 9000);
    stars = Array.from({length: Math.min(count, 160)}, () => ({
      x: Math.random()*bg.width,
      y: Math.random()*bg.height,
      r: Math.random()*1.6 + 0.4,
      s: Math.random()*0.4 + 0.1,
      hue: [ '255,46,136', '0,229,255', '140,84,255', '255,210,63' ][Math.floor(Math.random()*4)]
    }));
  }
  window.addEventListener('resize', resizeBg);
  resizeBg();

  function drawBg(){
    bctx.clearRect(0,0,bg.width,bg.height);
    for(const st of stars){
      bctx.beginPath();
      bctx.fillStyle = `rgba(${st.hue},${0.5 + Math.sin(Date.now()*0.001*st.s)*0.3})`;
      bctx.arc(st.x, st.y, st.r, 0, Math.PI*2);
      bctx.fill();
      if(!reduceMotion){
        st.y += st.s * 0.15;
        if(st.y > bg.height) st.y = 0;
      }
    }
    requestAnimationFrame(drawBg);
  }
  drawBg();

  /* ============ Matrix rain (owner toggle) ============ */
  const matrixCanvas = document.getElementById('matrixCanvas');
  const mctx = matrixCanvas.getContext('2d');
  let matrixOn = false, matrixCols = [];
  const glyphs = 'アイウエオカキクケコサシスセソ0123456789';

  function resizeMatrix(){
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    const cols = Math.floor(matrixCanvas.width / 16);
    matrixCols = Array.from({length: cols}, () => Math.random() * -100);
  }
  window.addEventListener('resize', resizeMatrix);
  resizeMatrix();

  function drawMatrix(){
    if(matrixOn && !reduceMotion){
      mctx.fillStyle = 'rgba(5,10,5,0.15)';
      mctx.fillRect(0,0,matrixCanvas.width, matrixCanvas.height);
      mctx.fillStyle = '#39ff6a';
      mctx.font = '14px monospace';
      matrixCols.forEach((y, i) => {
        const ch = glyphs[Math.floor(Math.random()*glyphs.length)];
        mctx.fillText(ch, i*16, y*16);
        matrixCols[i] = (y*16 > matrixCanvas.height && Math.random() > 0.975) ? 0 : y + 1;
      });
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  /* ============ Nav / section switching ============ */
  const stages = ['home','snake','g2048stage','memory','reflex','ttt','whack','breakout','flappy'];
  const navButtons = document.querySelectorAll('#mainNav button');

  function showStage(id){
    document.getElementById('home').style.display = (id === 'home') ? '' : 'none';
    document.querySelectorAll('.grid').forEach(g => g.style.display = (id === 'home') ? '' : 'none');
    document.querySelectorAll('.section-label').forEach(g => g.style.display = (id === 'home') ? '' : 'none');
    stages.filter(s => s !== 'home').forEach(s => {
      const el = document.getElementById(s);
      if(!el) return;
      el.classList.toggle('active', s === id);
    });
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.target === id));
    if(id === 'snake') Snake.onShow();
    if(id === 'g2048stage') Game2048.onShow();
    if(id === 'memory') Memory.onShow();
    if(id === 'reflex') Reflex.onShow();
    if(id === 'ttt') TTT.onShow();
    if(id === 'whack') Whack.onShow();
    if(id === 'breakout') Breakout.onShow();
    if(id === 'flappy') Flappy.onShow();
    window.scrollTo({top: 0, behavior: reduceMotion ? 'auto' : 'smooth'});
  }

  navButtons.forEach(b => b.addEventListener('click', () => showStage(b.dataset.target)));
  document.querySelectorAll('[data-jump]').forEach(el => {
    el.addEventListener('click', () => showStage(el.dataset.jump));
  });

  /* ============ SNAKE ============ */
  const Snake = (function(){
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const cell = 18, cols = canvas.width/cell, rows = canvas.height/cell;
    const scoreEl = document.getElementById('snakeScore');
    const bestEl = document.getElementById('snakeBest');
    const overlay = document.getElementById('snakeOverlay');
    const startBtn = document.getElementById('snakeStart');
    const restartBtn = document.getElementById('snakeRestart');

    let snake, dir, nextDir, food, score, best, running, loopId, speed;

    function reset(){
      snake = [{x:8,y:9},{x:7,y:9},{x:6,y:9}];
      dir = {x:1,y:0}; nextDir = {x:1,y:0};
      score = 0; speed = 130;
      best = loadNum('snakeBest', 0);
      placeFood();
      scoreEl.textContent = score;
      bestEl.textContent = best;
      running = false;
    }

    function placeFood(){
      let ok = false;
      while(!ok){
        food = { x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows) };
        ok = !snake.some(s => s.x===food.x && s.y===food.y);
      }
    }

    function draw(){
      ctx.fillStyle = '#07060f';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      for(let i=0;i<=cols;i++){ ctx.beginPath(); ctx.moveTo(i*cell,0); ctx.lineTo(i*cell,canvas.height); ctx.stroke(); }
      for(let j=0;j<=rows;j++){ ctx.beginPath(); ctx.moveTo(0,j*cell); ctx.lineTo(canvas.width,j*cell); ctx.stroke(); }

      ctx.fillStyle = '#ffd23f';
      ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(food.x*cell+cell/2, food.y*cell+cell/2, cell/2-2, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;

      snake.forEach((s,i) => {
        const grad = i===0 ? '#38f2b0' : '#00e5ff';
        ctx.fillStyle = grad;
        ctx.shadowColor = grad; ctx.shadowBlur = i===0 ? 10 : 4;
        ctx.fillRect(s.x*cell+1, s.y*cell+1, cell-2, cell-2);
      });
      ctx.shadowBlur = 0;
    }

    function tick(){
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if(head.x<0 || head.y<0 || head.x>=cols || head.y>=rows || snake.some(s=>s.x===head.x && s.y===head.y)){
        gameOver(); return;
      }
      snake.unshift(head);
      if(head.x===food.x && head.y===food.y){
        score++;
        scoreEl.textContent = score;
        if(score % 4 === 0 && speed > 60) speed -= 8;
        placeFood();
      } else {
        snake.pop();
      }
      draw();
      loopId = setTimeout(tick, speed);
    }

    function gameOver(){
      running = false;
      if(score > best){ best = score; save('snakeBest', best); bestEl.textContent = best; }
      overlay.style.display = 'flex';
      overlay.innerHTML = `<h3>Game Over</h3><p class="mono" style="color:var(--ink-dim)">Score: ${score}</p><button class="btn primary" id="snakeStart2">Play Again</button>`;
      document.getElementById('snakeStart2').addEventListener('click', begin);
    }

    function begin(){
      reset();
      overlay.style.display = 'none';
      running = true;
      bumpGamesPlayed();
      draw();
      loopId = setTimeout(tick, speed);
    }

    document.addEventListener('keydown', e => {
      if(!running) return;
      const k = e.key.toLowerCase();
      if((k==='arrowup'||k==='w') && dir.y===0){ nextDir={x:0,y:-1}; e.preventDefault(); }
      else if((k==='arrowdown'||k==='s') && dir.y===0){ nextDir={x:0,y:1}; e.preventDefault(); }
      else if((k==='arrowleft'||k==='a') && dir.x===0){ nextDir={x:-1,y:0}; e.preventDefault(); }
      else if((k==='arrowright'||k==='d') && dir.x===0){ nextDir={x:1,y:0}; e.preventDefault(); }
    });

    let touchStart = null;
    canvas.addEventListener('touchstart', e => { touchStart = e.touches[0]; }, {passive:true});
    canvas.addEventListener('touchend', e => {
      if(!touchStart || !running) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.clientX, dy = t.clientY - touchStart.clientY;
      if(Math.abs(dx) > Math.abs(dy)){
        if(dx>20 && dir.x===0) nextDir={x:1,y:0};
        else if(dx<-20 && dir.x===0) nextDir={x:-1,y:0};
      } else {
        if(dy>20 && dir.y===0) nextDir={x:0,y:1};
        else if(dy<-20 && dir.y===0) nextDir={x:0,y:-1};
      }
      touchStart = null;
    }, {passive:true});

    startBtn.addEventListener('click', begin);
    restartBtn.addEventListener('click', () => { clearTimeout(loopId); begin(); });

    reset(); draw();
    return { onShow(){} };
  })();

  /* ============ 2048 ============ */
  const Game2048 = (function(){
    const gridEl = document.getElementById('g2048');
    const scoreEl = document.getElementById('score2048');
    const bestEl = document.getElementById('best2048');
    const overlay = document.getElementById('overlay2048');
    const msg = document.getElementById('msg2048');
    const again = document.getElementById('again2048');
    const restartBtn = document.getElementById('restart2048');

    const colors = {
      2:'#1b1840',4:'#241f52',8:'#8c54ff',16:'#a262ff',32:'#ff2e88',
      64:'#ff5fa3',128:'#ffd23f',256:'#ffcf20',512:'#38f2b0',1024:'#00e5ff',2048:'#ffffff'
    };

    let board, score, best, over;
    function empty(){ return Array.from({length:4},()=>Array(4).fill(0)); }

    function reset(){
      board = empty(); score = 0; over = false;
      best = loadNum('best2048', 0);
      addTile(); addTile();
      overlay.style.display = 'none';
      bumpGamesPlayed();
      render();
    }

    function addTile(){
      const empties = [];
      for(let r=0;r<4;r++) for(let c=0;c<4;c++) if(board[r][c]===0) empties.push([r,c]);
      if(!empties.length) return;
      const [r,c] = empties[Math.floor(Math.random()*empties.length)];
      board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function render(){
      gridEl.innerHTML = '';
      for(let r=0;r<4;r++) for(let c=0;c<4;c++){
        const v = board[r][c];
        const d = document.createElement('div');
        d.className = 'tile2048';
        d.style.background = v ? (colors[v]||'#fff') : 'rgba(255,255,255,0.03)';
        d.style.color = v>=8 ? '#0a0a16' : '#eef0ff';
        d.textContent = v || '';
        gridEl.appendChild(d);
      }
      scoreEl.textContent = score;
      bestEl.textContent = best;
    }

    function slideRow(row){
      let arr = row.filter(x=>x);
      for(let i=0;i<arr.length-1;i++){
        if(arr[i]===arr[i+1]){ arr[i]*=2; score+=arr[i]; arr.splice(i+1,1); }
      }
      while(arr.length<4) arr.push(0);
      return arr;
    }

    function rotate(b){
      const n = empty();
      for(let r=0;r<4;r++) for(let c=0;c<4;c++) n[c][3-r] = b[r][c];
      return n;
    }

    function move(dir){
      if(over) return;
      let b = board;
      let rotations = {left:0, up:3, right:2, down:1}[dir];
      for(let i=0;i<rotations;i++) b = rotate(b);
      let moved = false;
      const newB = b.map(row => {
        const res = slideRow(row);
        if(res.join(',') !== row.join(',')) moved = true;
        return res;
      });
      let bb = newB;
      for(let i=0;i<(4-rotations)%4;i++) bb = rotate(bb);
      if(moved){
        board = bb;
        addTile();
        if(score > best){ best = score; save('best2048', best); }
        render();
        checkOver();
      }
    }

    function checkOver(){
      for(let r=0;r<4;r++) for(let c=0;c<4;c++){
        if(board[r][c]===0) return;
        if(c<3 && board[r][c]===board[r][c+1]) return;
        if(r<3 && board[r][c]===board[r+1][c]) return;
      }
      over = true;
      msg.textContent = 'Game Over';
      overlay.style.display = 'flex';
    }

    document.addEventListener('keydown', e => {
      if(!document.getElementById('g2048stage').classList.contains('active')) return;
      const map = {arrowleft:'left',arrowright:'right',arrowup:'up',arrowdown:'down'};
      const k = map[e.key.toLowerCase()];
      if(k){ e.preventDefault(); move(k); }
    });

    let ts = null;
    gridEl.addEventListener('touchstart', e => { ts = e.touches[0]; }, {passive:true});
    gridEl.addEventListener('touchend', e => {
      if(!ts) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - ts.clientX, dy = t.clientY - ts.clientY;
      if(Math.max(Math.abs(dx),Math.abs(dy)) < 20) return;
      if(Math.abs(dx) > Math.abs(dy)) move(dx>0?'right':'left');
      else move(dy>0?'down':'up');
      ts = null;
    }, {passive:true});

    again.addEventListener('click', reset);
    restartBtn.addEventListener('click', reset);

    reset();
    return { onShow(){ render(); } };
  })();

  /* ============ MEMORY MATCH ============ */
  const Memory = (function(){
    const gridEl = document.getElementById('memGrid');
    const movesEl = document.getElementById('memMoves');
    const bestEl = document.getElementById('memBest');
    const restartBtn = document.getElementById('memRestart');
    const emojis = ['🚀','👾','🎮','🛸','🪐','⭐','🎯','🔮'];

    let cards, flipped, matched, moves, lock;

    function shuffle(arr){
      for(let i=arr.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]] = [arr[j],arr[i]];
      }
      return arr;
    }

    function reset(){
      const pairs = shuffle([...emojis, ...emojis]);
      cards = pairs.map((e,i) => ({ id:i, val:e }));
      flipped = []; matched = new Set(); moves = 0; lock = false;
      movesEl.textContent = moves;
      const best = localStorage.getItem('memBest');
      bestEl.textContent = best ? best : '—';
      bumpGamesPlayed();
      render();
    }

    function render(){
      gridEl.innerHTML = '';
      cards.forEach(c => {
        const el = document.createElement('div');
        el.className = 'memCard' + (matched.has(c.id) ? ' matched' : (flipped.includes(c.id) ? ' flipped' : ''));
        el.textContent = (matched.has(c.id) || flipped.includes(c.id)) ? c.val : '?';
        el.addEventListener('click', () => flip(c.id));
        gridEl.appendChild(el);
      });
    }

    function flip(id){
      if(lock || flipped.includes(id) || matched.has(id)) return;
      flipped.push(id);
      render();
      if(flipped.length === 2){
        moves++; movesEl.textContent = moves;
        lock = true;
        const [a,b] = flipped;
        if(cards[a].val === cards[b].val){
          matched.add(a); matched.add(b);
          flipped = []; lock = false;
          render();
          if(matched.size === cards.length){
            const best = localStorage.getItem('memBest');
            if(!best || moves < Number(best)){ localStorage.setItem('memBest', moves); }
            fireConfetti();
          }
        } else {
          setTimeout(() => { flipped = []; lock = false; render(); }, 700);
        }
      }
    }

    restartBtn.addEventListener('click', reset);
    reset();
    return { onShow(){ render(); } };
  })();

  /* ============ REFLEX TEST ============ */
  const Reflex = (function(){
    const box = document.getElementById('reflexBox');
    const text = document.getElementById('reflexText');
    const lastEl = document.getElementById('reflexLast');
    const bestEl = document.getElementById('reflexBest');
    const historyEl = document.getElementById('reflexHistory');
    let state = 'idle', timer = null, startTime = 0;
    let history = JSON.parse(localStorage.getItem('reflexHistory') || '[]');

    function renderHistory(){
      historyEl.innerHTML = '';
      history.slice(0,5).forEach(ms => {
        const li = document.createElement('li');
        li.textContent = ms + ' ms';
        historyEl.appendChild(li);
      });
      if(history.length) bestEl.textContent = Math.min(...history) + ' ms';
    }

    function start(){
      state = 'waiting';
      box.className = 'ready';
      text.textContent = 'Wait for green...';
      bumpGamesPlayed();
      const delay = 800 + Math.random()*2200;
      timer = setTimeout(() => {
        state = 'go';
        box.className = 'go';
        text.textContent = 'CLICK NOW!';
        startTime = performance.now();
      }, delay);
    }

    box.addEventListener('click', () => {
      if(state === 'idle'){ start(); return; }
      if(state === 'waiting'){
        clearTimeout(timer);
        state = 'idle';
        box.className = 'early';
        text.textContent = 'Too soon! Click to retry';
        return;
      }
      if(state === 'go'){
        const rt = Math.round(performance.now() - startTime);
        lastEl.textContent = rt + ' ms';
        history.unshift(rt);
        history = history.slice(0,10);
        localStorage.setItem('reflexHistory', JSON.stringify(history));
        renderHistory();
        state = 'idle';
        box.className = 'ready';
        text.textContent = rt + ' ms — click to try again';
      }
    });

    renderHistory();
    return { onShow(){} };
  })();

  /* ============ TIC TAC TOE (vs optimal AI, minimax) ============ */
  const TTT = (function(){
    const gridEl = document.getElementById('tttGrid');
    const overlay = document.getElementById('tttOverlay');
    const msg = document.getElementById('tttMsg');
    const again = document.getElementById('tttAgain');
    const restartBtn = document.getElementById('tttRestart');
    const winsEl = document.getElementById('tttWins');
    const drawsEl = document.getElementById('tttDraws');
    const lossEl = document.getElementById('tttLoss');

    let board, over, wins, draws, losses, winLine;

    function reset(){
      board = Array(9).fill(null);
      over = false; winLine = null;
      overlay.style.display = 'none';
      wins = loadNum('tttWins', 0);
      draws = loadNum('tttDraws', 0);
      losses = loadNum('tttLoss', 0);
      winsEl.textContent = wins; drawsEl.textContent = draws; lossEl.textContent = losses;
      bumpGamesPlayed();
      render();
    }

    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    function winner(b){
      for(const [a,c,d] of lines){
        if(b[a] && b[a]===b[c] && b[a]===b[d]) return {p:b[a], line:[a,c,d]};
      }
      if(b.every(x=>x)) return {p:'draw', line:null};
      return null;
    }

    function minimax(b, isMax){
      const w = winner(b);
      if(w){
        if(w.p==='X') return -10;
        if(w.p==='O') return 10;
        return 0;
      }
      const scores = [];
      for(let i=0;i<9;i++){
        if(!b[i]){
          b[i] = isMax ? 'O' : 'X';
          scores.push(minimax(b, !isMax));
          b[i] = null;
        }
      }
      return isMax ? Math.max(...scores) : Math.min(...scores);
    }

    function aiMove(){
      let best = -Infinity, move = -1;
      for(let i=0;i<9;i++){
        if(!board[i]){
          board[i] = 'O';
          const s = minimax(board, false);
          board[i] = null;
          if(s > best){ best = s; move = i; }
        }
      }
      if(move >= 0) board[move] = 'O';
    }

    function render(){
      gridEl.innerHTML = '';
      board.forEach((v,i) => {
        const c = document.createElement('div');
        c.className = 'tttCell' + (v==='X'?' x':v==='O'?' o':'') + (winLine && winLine.includes(i) ? ' win' : '');
        c.textContent = v || '';
        c.addEventListener('click', () => playerMove(i));
        gridEl.appendChild(c);
      });
    }

    function playerMove(i){
      if(over || board[i]) return;
      board[i] = 'X';
      let w = winner(board);
      if(!w){
        aiMove();
        w = winner(board);
      }
      render();
      if(w){
        over = true; winLine = w.line;
        render();
        if(w.p==='draw'){ draws++; save('tttDraws', draws); msg.textContent = "It's a draw!"; }
        else if(w.p==='X'){ wins++; save('tttWins', wins); msg.textContent = 'You win?! 🎉'; fireConfetti(); }
        else { losses++; save('tttLoss', losses); msg.textContent = 'AI wins.'; }
        winsEl.textContent = wins; drawsEl.textContent = draws; lossEl.textContent = losses;
        setTimeout(() => { overlay.style.display = 'flex'; }, 400);
      }
    }

    again.addEventListener('click', reset);
    restartBtn.addEventListener('click', reset);
    reset();
    return { onShow(){ render(); } };
  })();

  /* ============ WHACK-A-MOLE ============ */
  const Whack = (function(){
    const gridEl = document.getElementById('whackGrid');
    const scoreEl = document.getElementById('whackScore');
    const bestEl = document.getElementById('whackBest');
    const timeEl = document.getElementById('whackTime');
    const startBtn = document.getElementById('whackStart');

    let holes = [], score, best, timeLeft, running, spawnTimer, countdownTimer, activeHole;

    function buildHoles(){
      gridEl.innerHTML = '';
      holes = [];
      for(let i=0;i<9;i++){
        const h = document.createElement('div');
        h.className = 'mole-hole';
        const m = document.createElement('div');
        m.className = 'mole'; m.textContent = '🐹';
        h.appendChild(m);
        h.addEventListener('click', () => hit(i));
        gridEl.appendChild(h);
        holes.push(h);
      }
    }

    function reset(){
      score = 0; timeLeft = 30; running = false; activeHole = null;
      best = loadNum('whackBest', 0);
      scoreEl.textContent = score; bestEl.textContent = best; timeEl.textContent = timeLeft;
      buildHoles();
      startBtn.textContent = 'Start';
      startBtn.disabled = false;
    }

    function popRandom(){
      holes.forEach(h => h.classList.remove('up','hit'));
      const idx = Math.floor(Math.random()*holes.length);
      activeHole = idx;
      holes[idx].classList.add('up');
      const dur = Math.max(420, 900 - score*15);
      spawnTimer = setTimeout(() => {
        if(running){ holes[idx].classList.remove('up'); popRandom(); }
      }, dur);
    }

    function hit(i){
      if(!running || i !== activeHole) return;
      holes[i].classList.add('hit');
      score++;
      scoreEl.textContent = score;
      clearTimeout(spawnTimer);
      setTimeout(() => { if(running) popRandom(); }, 150);
    }

    function start(){
      reset();
      running = true;
      bumpGamesPlayed();
      startBtn.disabled = true;
      popRandom();
      countdownTimer = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        if(timeLeft <= 0) end();
      }, 1000);
    }

    function end(){
      running = false;
      clearTimeout(spawnTimer);
      clearInterval(countdownTimer);
      holes.forEach(h => h.classList.remove('up','hit'));
      if(score > best){ best = score; save('whackBest', best); bestEl.textContent = best; }
      startBtn.disabled = false;
      startBtn.textContent = 'Play Again';
      if(score > 0 && score >= best) fireConfetti();
    }

    startBtn.addEventListener('click', start);
    reset();
    return { onShow(){} };
  })();

  /* ============ BREAKOUT ============ */
  const Breakout = (function(){
    const canvas = document.getElementById('breakCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('breakScore');
    const livesEl = document.getElementById('breakLives');
    const bestEl = document.getElementById('breakBest');
    const overlay = document.getElementById('breakOverlay');
    const startBtn = document.getElementById('breakStart');
    const restartBtn = document.getElementById('breakRestart');

    const W = canvas.width, H = canvas.height;
    const paddleW = 80, paddleH = 12;
    const brickRows = 5, brickCols = 8, brickW = (W-20)/brickCols, brickH = 18, brickPad = 4;
    const rowColors = ['#ff2e88','#ff7a3d','#ffd23f','#38f2b0','#00e5ff'];

    let paddleX, ball, bricks, score, lives, best, running, raf;

    function initBricks(){
      bricks = [];
      for(let r=0;r<brickRows;r++){
        for(let c=0;c<brickCols;c++){
          bricks.push({ x: 10 + c*brickW, y: 40 + r*(brickH+brickPad), w: brickW-brickPad, h: brickH, alive:true, color: rowColors[r] });
        }
      }
    }

    function reset(){
      paddleX = W/2 - paddleW/2;
      ball = { x: W/2, y: H-40, vx: 3, vy: -3.4, r: 6 };
      score = 0; lives = 3;
      best = loadNum('breakBest', 0);
      initBricks();
      scoreEl.textContent = score; livesEl.textContent = lives; bestEl.textContent = best;
      running = false;
    }

    function draw(){
      ctx.fillStyle = '#07060f';
      ctx.fillRect(0,0,W,H);

      bricks.forEach(b => {
        if(!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color; ctx.shadowBlur = 6;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 10;
      ctx.fillRect(paddleX, H-20, paddleW, paddleH);
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.fillStyle = '#ffd23f';
      ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 10;
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function step(){
      ball.x += ball.vx; ball.y += ball.vy;

      if(ball.x < ball.r || ball.x > W-ball.r) ball.vx *= -1;
      if(ball.y < ball.r) ball.vy *= -1;

      if(ball.y > H-20-ball.r && ball.y < H-20+ball.r && ball.x > paddleX && ball.x < paddleX+paddleW){
        ball.vy = -Math.abs(ball.vy);
        const hitPos = (ball.x - (paddleX+paddleW/2)) / (paddleW/2);
        ball.vx = hitPos * 4.5;
      }

      bricks.forEach(b => {
        if(!b.alive) return;
        if(ball.x > b.x && ball.x < b.x+b.w && ball.y > b.y && ball.y < b.y+b.h){
          b.alive = false;
          ball.vy *= -1;
          score += 10;
          scoreEl.textContent = score;
        }
      });

      if(ball.y > H+20){
        lives--;
        livesEl.textContent = lives;
        if(lives <= 0){ gameOver(); return; }
        ball.x = W/2; ball.y = H-40; ball.vx = 3; ball.vy = -3.4;
      }

      if(bricks.every(b => !b.alive)) win();

      draw();
      if(running) raf = requestAnimationFrame(step);
    }

    function gameOver(){
      running = false;
      if(score > best){ best = score; save('breakBest', best); bestEl.textContent = best; }
      overlay.style.display = 'flex';
      overlay.innerHTML = `<h3>Game Over</h3><p class="mono" style="color:var(--ink-dim)">Score: ${score}</p><button class="btn primary" id="breakStart2">Play Again</button>`;
      document.getElementById('breakStart2').addEventListener('click', begin);
    }

    function win(){
      running = false;
      if(score > best){ best = score; save('breakBest', best); bestEl.textContent = best; }
      overlay.style.display = 'flex';
      overlay.innerHTML = `<h3>All bricks cleared! 🎉</h3><p class="mono" style="color:var(--ink-dim)">Score: ${score}</p><button class="btn primary" id="breakStart2">Play Again</button>`;
      document.getElementById('breakStart2').addEventListener('click', begin);
      fireConfetti();
    }

    function begin(){
      reset();
      overlay.style.display = 'none';
      running = true;
      bumpGamesPlayed();
      draw();
      raf = requestAnimationFrame(step);
    }

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (W/rect.width);
      paddleX = Math.min(Math.max(x - paddleW/2, 0), W-paddleW);
    });
    canvas.addEventListener('touchmove', e => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) * (W/rect.width);
      paddleX = Math.min(Math.max(x - paddleW/2, 0), W-paddleW);
      e.preventDefault();
    }, {passive:false});
    document.addEventListener('keydown', e => {
      if(!running) return;
      if(e.key === 'ArrowLeft') paddleX = Math.max(paddleX-24, 0);
      if(e.key === 'ArrowRight') paddleX = Math.min(paddleX+24, W-paddleW);
    });

    startBtn.addEventListener('click', begin);
    restartBtn.addEventListener('click', () => { cancelAnimationFrame(raf); begin(); });

    reset(); draw();
    return { onShow(){} };
  })();

  /* ============ FLAPPY NEON ============ */
  const Flappy = (function(){
    const canvas = document.getElementById('flapCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('flapScore');
    const bestEl = document.getElementById('flapBest');
    const overlay = document.getElementById('flapOverlay');
    const startBtn = document.getElementById('flapStart');
    const restartBtn = document.getElementById('flapRestart');

    const W = canvas.width, H = canvas.height;
    const gap = 130, pipeW = 54;

    let bird, pipes, score, best, running, raf, frame;

    function reset(){
      bird = { x: 70, y: H/2, vy: 0, r: 12 };
      pipes = [];
      score = 0; frame = 0;
      best = loadNum('flapBest', 0);
      scoreEl.textContent = score; bestEl.textContent = best;
      running = false;
    }

    function spawnPipe(){
      const top = 40 + Math.random() * (H - gap - 120);
      pipes.push({ x: W, top, passed:false });
    }

    function draw(){
      ctx.fillStyle = '#07060f';
      ctx.fillRect(0,0,W,H);

      pipes.forEach(p => {
        ctx.fillStyle = '#38f2b0';
        ctx.shadowColor = '#38f2b0'; ctx.shadowBlur = 8;
        ctx.fillRect(p.x, 0, pipeW, p.top);
        ctx.fillRect(p.x, p.top+gap, pipeW, H-(p.top+gap));
      });
      ctx.shadowBlur = 0;

      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(Math.min(Math.max(bird.vy/12, -0.5), 0.9));
      ctx.fillStyle = '#ffd23f';
      ctx.shadowColor = '#ffd23f'; ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0,0,bird.r,0,Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function step(){
      frame++;
      bird.vy += 0.45;
      bird.y += bird.vy;

      if(frame % 95 === 0) spawnPipe();
      pipes.forEach(p => p.x -= 2.6);
      pipes = pipes.filter(p => p.x > -pipeW);

      pipes.forEach(p => {
        if(!p.passed && p.x + pipeW < bird.x){ p.passed = true; score++; scoreEl.textContent = score; }
        const withinX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + pipeW;
        const hitTop = bird.y - bird.r < p.top;
        const hitBottom = bird.y + bird.r > p.top + gap;
        if(withinX && (hitTop || hitBottom)) die();
      });

      if(bird.y + bird.r > H || bird.y - bird.r < 0) die();

      draw();
      if(running) raf = requestAnimationFrame(step);
    }

    function die(){
      if(!running) return;
      running = false;
      if(score > best){ best = score; save('flapBest', best); bestEl.textContent = best; }
      overlay.style.display = 'flex';
      overlay.innerHTML = `<h3>Game Over</h3><p class="mono" style="color:var(--ink-dim)">Score: ${score}</p><button class="btn primary" id="flapStart2">Play Again</button>`;
      document.getElementById('flapStart2').addEventListener('click', begin);
    }

    function flap(){
      if(!running) return;
      bird.vy = -7.2;
    }

    function begin(){
      reset();
      overlay.style.display = 'none';
      running = true;
      bumpGamesPlayed();
      draw();
      raf = requestAnimationFrame(step);
    }

    canvas.addEventListener('mousedown', flap);
    canvas.addEventListener('touchstart', e => { flap(); e.preventDefault(); }, {passive:false});
    document.addEventListener('keydown', e => {
      if(e.code === 'Space' && document.getElementById('flappy').classList.contains('active')){
        e.preventDefault(); flap();
      }
    });

    startBtn.addEventListener('click', begin);
    restartBtn.addEventListener('click', () => { cancelAnimationFrame(raf); begin(); });

    reset(); draw();
    return { onShow(){} };
  })();

  /* ============ Confetti ============ */
  function fireConfetti(){
    const c = document.getElementById('confettiCanvas');
    c.width = window.innerWidth; c.height = window.innerHeight;
    const ctx = c.getContext('2d');
    const colors = ['#ff2e88','#00e5ff','#8c54ff','#ffd23f','#38f2b0','#ff7a3d'];
    let parts = Array.from({length: reduceMotion ? 0 : 140}, () => ({
      x: Math.random()*c.width, y: -20, vx: (Math.random()-0.5)*4, vy: Math.random()*3+2,
      r: Math.random()*5+3, color: colors[Math.floor(Math.random()*colors.length)], rot: Math.random()*Math.PI
    }));
    let frames = 0;
    function anim(){
      ctx.clearRect(0,0,c.width,c.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += 0.1;
        ctx.save();
        ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r);
        ctx.restore();
      });
      frames++;
      if(frames < 150 && parts.length){ requestAnimationFrame(anim); }
      else { ctx.clearRect(0,0,c.width,c.height); }
    }
    anim();
  }

  /* ============ SECRET OWNER PANEL ============ */
  const OwnerPanel = (function(){
    const panel = document.getElementById('ownerPanel');
    const closeBtn = document.getElementById('ownerClose');
    const matrixToggle = document.getElementById('matrixToggle');
    const rainbowToggle = document.getElementById('rainbowToggle');
    const confettiBtn = document.getElementById('confettiBtn');
    const resetBtn = document.getElementById('resetScoresBtn');
    const visitsEl = document.getElementById('ownerVisits');
    const gamesPlayedEl = document.getElementById('ownerGamesPlayed');
    const title = document.querySelector('.title');

    // Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
    const secretCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let progress = 0;

    function open(){
      panel.classList.add('open');
      panel.setAttribute('aria-hidden','false');
      gamesPlayedEl.textContent = loadNum('ownerGamesPlayed', 0);
      const visits = loadNum('ownerVisits', 0) + 1;
      save('ownerVisits', visits);
      visitsEl.textContent = visits;
      fireConfetti();
    }
    function close(){
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
    }

    document.addEventListener('keydown', e => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if(key === secretCode[progress]){
        progress++;
        if(progress === secretCode.length){ open(); progress = 0; }
      } else {
        progress = (key === secretCode[0]) ? 1 : 0;
      }
    });

    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });

    document.querySelectorAll('.swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        const theme = sw.dataset.theme;
        document.documentElement.setAttribute('data-theme', theme);
        save('ownerTheme', theme);
      });
    });

    matrixToggle.addEventListener('change', () => {
      matrixOn = matrixToggle.checked;
      document.getElementById('matrixCanvas').classList.toggle('on', matrixOn);
      save('ownerMatrix', matrixOn ? '1' : '0');
    });

    rainbowToggle.addEventListener('change', () => {
      title.classList.toggle('rainbow', rainbowToggle.checked);
      save('ownerRainbow', rainbowToggle.checked ? '1' : '0');
    });

    confettiBtn.addEventListener('click', fireConfetti);

    resetBtn.addEventListener('click', () => {
      if(!confirm('Reset ALL saved scores? This cannot be undone.')) return;
      ['snakeBest','best2048','memBest','reflexHistory','tttWins','tttDraws','tttLoss','whackBest','breakBest','flapBest'].forEach(k => localStorage.removeItem(k));
      location.reload();
    });

    // restore saved preferences on load
    const savedTheme = localStorage.getItem('ownerTheme');
    if(savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    if(localStorage.getItem('ownerMatrix') === '1'){
      matrixOn = true;
      matrixToggle.checked = true;
      document.getElementById('matrixCanvas').classList.add('on');
    }
    if(localStorage.getItem('ownerRainbow') === '1'){
      rainbowToggle.checked = true;
      title.classList.add('rainbow');
    }

    return { open, close };
  })();

  showStage('home');
})();
