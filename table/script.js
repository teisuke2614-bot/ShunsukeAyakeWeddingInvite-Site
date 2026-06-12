// ============================================================
// Table Site Scripts
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initScratch();
  
  // 写真共有ボタンのリンク設定 (後から本番用URLに変更してください)
  const photoBtn = document.getElementById('photo-share-btn');
  if(photoBtn) {
    photoBtn.href = 'https://photos.google.com/share/...'; // ←ダミー
  }
});

/* --- Scratch Game Logic --- */
function initScratch() {
  const canvas = document.getElementById('scratch-canvas');
  if(!canvas) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const resultText = document.getElementById('scratch-result-text');
  
  let isDrawing = false;
  let isRevealed = false;

  // 当たり外れの設定 (例: 20%で当たり)
  const isWin = Math.random() < 0.2;
  if(isWin) {
    resultText.textContent = "✨大当り✨";
    resultText.classList.add('win');
  } else {
    resultText.textContent = "ハズレ";
  }

  // グレーのカバーを描画
  ctx.fillStyle = '#CCCCCC';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 模様（銀はがし風）
  ctx.fillStyle = '#AAAAAA';
  for(let i=0; i<300; i++) {
    ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2, 2);
  }
  
  // テキストを描画
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#666666';
  ctx.textAlign = 'center';
  ctx.fillText('こすってね！', canvas.width/2, canvas.height/2 + 7);

  // イベントリスナー
  const getMousePos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDraw = (e) => {
    if(isRevealed) return;
    isDrawing = true;
    e.preventDefault(); // スクロール防止
    scratch(e);
  };

  const endDraw = () => {
    isDrawing = false;
    checkReveal();
  };

  const scratch = (e) => {
    if(!isDrawing || isRevealed) return;
    e.preventDefault();
    
    const pos = getMousePos(e);
    
    // 消しゴムモード
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
    ctx.fill();
  };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', scratch);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  
  canvas.addEventListener('touchstart', startDraw, {passive: false});
  canvas.addEventListener('touchmove', scratch, {passive: false});
  canvas.addEventListener('touchend', endDraw);

  // 削り具合をチェック
  const checkReveal = () => {
    if(isRevealed) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentCount = 0;
    
    // 4要素で1ピクセル (r, g, b, a)
    for(let i = 3; i < pixels.length; i += 4) {
      if(pixels[i] === 0) {
        transparentCount++;
      }
    }
    
    const totalPixels = canvas.width * canvas.height;
    const percent = (transparentCount / totalPixels) * 100;
    
    // 40%削れたら全公開
    if(percent > 40) {
      isRevealed = true;
      canvas.style.transition = 'opacity 0.5s';
      canvas.style.opacity = '0';
      document.getElementById('scratch-instruction').textContent = "結果が出ました！";
      setTimeout(() => {
        canvas.style.display = 'none';
      }, 500);
    }
  };
}

// ==========================================
// Easter Egg (Mario Mode)
// ==========================================
const pixelChars = document.getElementById('pixel-chars');
const speechEl = document.getElementById('pixel-speech');

if (speechEl) {
  const speeches = [
    "やあ！",
    "僕たちをタップしてね！",
    "動画の最後まで見てね",
    "秘密のコードがあるかも？"
  ];
  let speechIndex = 0;
  setInterval(() => {
    speechIndex = (speechIndex + 1) % speeches.length;
    speechEl.textContent = speeches[speechIndex];
  }, 3500);
}

if (pixelChars) {
  pixelChars.addEventListener('click', () => {
    // promptを表示してパスコードを求める
    const secretCode = prompt("SECRET CODE?");
    
    // パスコード「214」の判定
    if (secretCode === "214") {
      alert("SECRET UNLOCKED!\nWELCOME TO THE RETRO STAGE!");
      window.location.href = 'secret.html'; // シークレットページへ遷移
    } else if (secretCode !== null && secretCode.trim() !== "") {
      // キャンセル以外の間違った入力
      alert("WRONG CODE...");
    }
  });
}
