(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const overlay = document.getElementById("overlay");
  const titleEl = document.getElementById("message-title");
  const textEl = document.getElementById("message-text");
  const startButton = document.getElementById("start-button");
  const pauseButton = document.getElementById("pause-button");

  const W = canvas.width;
  const H = canvas.height;
  const paddle = { w: 118, h: 14, x: W / 2 - 59, y: H - 42, speed: 8 };
  const ball = { x: W / 2, y: H - 65, r: 9, vx: 4, vy: -5 };
  const brickConfig = { rows: 5, cols: 10, w: 66, h: 22, gap: 9, top: 75, left: 37 };
  const colors = ["#fb7185", "#fb923c", "#facc15", "#4ade80", "#60a5fa"];

  let bricks = [];
  let score = 0;
  let lives = 3;
  let running = false;
  let paused = false;
  let animationId = null;
  let leftHeld = false;
  let rightHeld = false;
  let pointerX = null;

  function makeBricks() {
    bricks = [];
    for (let row = 0; row < brickConfig.rows; row++) {
      for (let col = 0; col < brickConfig.cols; col++) {
        bricks.push({
          x: brickConfig.left + col * (brickConfig.w + brickConfig.gap),
          y: brickConfig.top + row * (brickConfig.h + brickConfig.gap),
          w: brickConfig.w, h: brickConfig.h, alive: true, color: colors[row]
        });
      }
    }
  }

  function resetBallAndPaddle() {
    paddle.x = W / 2 - paddle.w / 2;
    ball.x = W / 2;
    ball.y = H - 65;
    ball.vx = Math.random() < 0.5 ? -4 : 4;
    ball.vy = -5;
  }

  function updateHud() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
  }

  function showOverlay(title, message, buttonText) {
    titleEl.textContent = title;
    textEl.textContent = message;
    startButton.textContent = buttonText;
    overlay.classList.remove("hidden");
  }

  function startGame() {
    if (bricks.length === 0 || lives <= 0 || bricks.every(b => !b.alive)) {
      score = 0;
      lives = 3;
      makeBricks();
      updateHud();
    }
    resetBallAndPaddle();
    running = true;
    paused = false;
    overlay.classList.add("hidden");
    pauseButton.textContent = "一時停止";
    if (animationId === null) loop();
  }

  function endGame(won) {
    running = false;
    paused = false;
    showOverlay(won ? "クリア！" : "ゲームオーバー",
      won ? `おめでとう！ スコアは ${score} 点です。` : `スコアは ${score} 点です。もう一度挑戦しよう！`,
      "もう一度遊ぶ");
  }

  function circleRectCollision(cx, cy, radius, rect) {
    const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return dx * dx + dy * dy <= radius * radius;
  }

  function update() {
    if (leftHeld) paddle.x -= paddle.speed;
    if (rightHeld) paddle.x += paddle.speed;
    if (pointerX !== null) paddle.x = pointerX - paddle.w / 2;
    paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; }
    if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx *= -1; }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; }

    if (ball.vy > 0 && circleRectCollision(ball.x, ball.y, ball.r, paddle)) {
      ball.y = paddle.y - ball.r;
      const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
      const speed = Math.min(8, Math.hypot(ball.vx, ball.vy) + 0.12);
      ball.vx = hit * speed * 0.9;
      ball.vy = -Math.sqrt(speed * speed - ball.vx * ball.vx);
    }

    for (const brick of bricks) {
      if (!brick.alive) continue;
      if (circleRectCollision(ball.x, ball.y, ball.r, brick)) {
        brick.alive = false;
        score += 10;
        updateHud();
        // 衝突面に応じてボールを反射
        const prevX = ball.x - ball.vx;
        const prevY = ball.y - ball.vy;
        if (prevX < brick.x || prevX > brick.x + brick.w) ball.vx *= -1;
        else ball.vy *= -1;
        break;
      }
    }

    if (bricks.every(b => !b.alive)) { endGame(true); return; }
    if (ball.y - ball.r > H) {
      lives--;
      updateHud();
      if (lives <= 0) { endGame(false); return; }
      resetBallAndPaddle();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#172554");
    gradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    // 背景の控えめな星
    ctx.fillStyle = "#ffffff18";
    for (let i = 0; i < 35; i++) {
      const x = (i * 137) % W;
      const y = (i * 83) % H;
      ctx.fillRect(x, y, 2, 2);
    }

    for (const brick of bricks) {
      if (!brick.alive) continue;
      ctx.fillStyle = brick.color;
      ctx.beginPath();
      ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 5);
      ctx.fill();
      ctx.fillStyle = "#ffffff55";
      ctx.fillRect(brick.x + 5, brick.y + 4, brick.w - 10, 3);
    }

    ctx.fillStyle = "#e0f2fe";
    ctx.shadowColor = "#7dd3fc";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 7);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function loop() {
    animationId = requestAnimationFrame(loop);
    if (running && !paused) update();
    draw();
    if (!running && animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseButton.textContent = paused ? "再開" : "一時停止";
  }

  function setPointerFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) * (W / rect.width);
  }

  document.addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) event.preventDefault();
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") leftHeld = true;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") rightHeld = true;
    if (event.key === " " && running) togglePause();
  });
  document.addEventListener("keyup", event => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") leftHeld = false;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") rightHeld = false;
  });
  window.addEventListener("blur", () => { leftHeld = false; rightHeld = false; });

  canvas.addEventListener("pointerdown", event => {
    setPointerFromEvent(event);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", event => {
    if (event.pointerType === "touch" || event.buttons === 1) setPointerFromEvent(event);
  });
  canvas.addEventListener("pointerup", () => { pointerX = null; });
  canvas.addEventListener("pointercancel", () => { pointerX = null; });

  function bindHoldButton(button, setter) {
    button.addEventListener("pointerdown", event => { event.preventDefault(); setter(true); });
    button.addEventListener("pointerup", () => setter(false));
    button.addEventListener("pointerleave", () => setter(false));
    button.addEventListener("pointercancel", () => setter(false));
  }
  bindHoldButton(document.getElementById("left-button"), value => leftHeld = value);
  bindHoldButton(document.getElementById("right-button"), value => rightHeld = value);

  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", togglePause);

  makeBricks();
  updateHud();
  draw();
})();
