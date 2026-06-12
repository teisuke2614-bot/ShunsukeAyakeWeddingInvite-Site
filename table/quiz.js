// ============================================================
// Quiz Logic (quiz.html)
// ============================================================

const SECRET_PASSCODE = "1122"; // ※司会者が発表するパスコード

let totalScore = 0; // 合計スコアを保持する変数

// ダミーの10問。内容は後から自由に変更可能です。
const quizData = [
  // --- 難易度：易（10点） ---
  {
    question: "Q1. 新郎の出身地は？",
    difficulty: "★☆☆", points: 10,
    options: ["東京都", "長崎県", "福岡県"],
    answerIndex: 1,
    explanation: "長崎県で生まれ育ちました！"
  },
  {
    question: "Q2. 新婦の得意料理は？",
    difficulty: "★☆☆", points: 10,
    options: ["オムライス", "肉じゃが", "ハンバーグ"],
    answerIndex: 2,
    explanation: "ハンバーグは新郎も大好物です。"
  },
  {
    question: "Q3. 二人の出会いのきっかけは？",
    difficulty: "★☆☆", points: 10,
    options: ["職場の同僚", "共通の友人の紹介", "マッチングアプリ"],
    answerIndex: 1,
    explanation: "大学時代の友人が開いてくれた飲み会で出会いました。"
  },
  {
    question: "Q4. 初めてのデートの場所は？",
    difficulty: "★☆☆", points: 10,
    options: ["映画館", "水族館", "カフェ"],
    answerIndex: 1,
    explanation: "ペンギンを見て二人ではしゃいだのを覚えています🐧"
  },
  // --- 難易度：中（20点） ---
  {
    question: "Q5. プロポーズの場所はどこだった？",
    difficulty: "★★☆", points: 20,
    options: ["夜景の見えるレストラン", "初デートの場所", "ふたりの自宅"],
    answerIndex: 0,
    explanation: "サプライズで予約してくれていました！"
  },
  {
    question: "Q6. 新婦が一番好きな新郎の手料理は？",
    difficulty: "★★☆", points: 20,
    options: ["カレーライス", "チャーハン", "パスタ"],
    answerIndex: 2,
    explanation: "休日のランチによく作ってくれるパスタが絶品です。"
  },
  {
    question: "Q7. 新郎がこっそり直してほしいと思っている新婦の癖は？",
    difficulty: "★★☆", points: 20,
    options: ["寝相が悪い", "買い物をしすぎる", "テレビをつけたまま寝る"],
    answerIndex: 2,
    explanation: "いつもリビングで寝落ちしてしまいます（笑）"
  },
  // --- 難易度：難（30点） ---
  {
    question: "Q8. これまでに二人で旅行に行った回数は？",
    difficulty: "★★★", points: 30,
    options: ["3回", "7回", "12回"],
    answerIndex: 1,
    explanation: "温泉旅行を含めて全部で7回です！"
  },
  {
    question: "Q9. 新郎のスマホに登録されている新婦の名前は？",
    difficulty: "★★★", points: 30,
    options: ["采加", "あーちゃん", "奥さん"],
    answerIndex: 1,
    explanation: "出会った頃からずっと「あーちゃん」です♡"
  },
  {
    question: "Q10. 結婚式の準備で今日一番こだわったポイントは？",
    difficulty: "★★★", points: 30,
    options: ["料理とドリンク", "装花とテーブルコーディネート", "ゲスト参加型の演出"],
    answerIndex: 2,
    explanation: "まさにこの特設サイトなど、皆さんと楽しめる演出にこだわりました！"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const passcodeBtn = document.getElementById('passcode-btn');
  const passcodeInput = document.getElementById('passcode-input');
  
  if (passcodeBtn && passcodeInput) {
    passcodeBtn.addEventListener('click', checkPasscode);
    passcodeInput.addEventListener('keypress', (e) => {
      if(e.key === 'Enter') checkPasscode();
    });
  }
});

function checkPasscode() {
  const inputVal = document.getElementById('passcode-input').value.trim();
  const errorMsg = document.getElementById('passcode-error');
  
  if (inputVal === SECRET_PASSCODE) {
    document.getElementById('passcode-section').style.display = 'none';
    document.getElementById('quiz-section').style.display = 'block';
    initQuiz();
  } else {
    errorMsg.textContent = "パスコードが正しくありません";
    setTimeout(() => { errorMsg.textContent = ""; }, 3000);
  }
}

function initQuiz() {
  const container = document.getElementById('quiz-container');
  if(!container) return;

  // 初期化
  totalScore = 0;
  container.innerHTML = '';

  quizData.forEach((q, index) => {
    const qDiv = document.createElement('div');
    qDiv.className = `quiz-question ${index === 0 ? 'active' : ''}`;
    qDiv.id = `quiz-q-${index}`;
    
    // 難易度・配点表示
    const metaP = document.createElement('p');
    metaP.style.fontSize = "0.75rem";
    metaP.style.color = "var(--color-sage-medium)";
    metaP.style.marginBottom = "0.25rem";
    metaP.style.fontWeight = "bold";
    metaP.textContent = `難易度: ${q.difficulty} / 配点: ${q.points}点`;
    qDiv.appendChild(metaP);

    // 問題文
    const qText = document.createElement('p');
    qText.className = 'quiz-q-text';
    qText.textContent = q.question;
    qDiv.appendChild(qText);

    // 選択肢コンテナ
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';
    
    q.options.forEach((opt, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.onclick = () => handleQuizAnswer(index, optIdx, btn, optionsDiv);
      optionsDiv.appendChild(btn);
    });
    qDiv.appendChild(optionsDiv);

    // フィードバック
    const feedbackP = document.createElement('p');
    feedbackP.className = 'quiz-feedback';
    feedbackP.id = `quiz-feedback-${index}`;
    qDiv.appendChild(feedbackP);

    // 次へ/完了ボタン
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn--primary quiz-next';
    nextBtn.id = `quiz-next-${index}`;
    nextBtn.textContent = index === quizData.length - 1 ? '結果発表へ！' : '次の問題へ';
    nextBtn.onclick = () => goToNextQuiz(index);
    qDiv.appendChild(nextBtn);

    container.appendChild(qDiv);
  });
}

function handleQuizAnswer(qIndex, selectedOptIdx, btn, optionsDiv) {
  if (optionsDiv.classList.contains('answered')) return;
  optionsDiv.classList.add('answered');

  const q = quizData[qIndex];
  const isCorrect = (selectedOptIdx === q.answerIndex);
  
  if (isCorrect) {
    totalScore += q.points; // 正解ならポイント加算
  }
  
  const buttons = optionsDiv.querySelectorAll('.quiz-option');
  buttons.forEach((b, idx) => {
    if (idx === q.answerIndex) {
      b.classList.add('correct');
    } else if (idx === selectedOptIdx) {
      b.classList.add('wrong');
    } else {
      b.style.opacity = '0.5';
    }
  });

  const feedback = document.getElementById(`quiz-feedback-${qIndex}`);
  if (isCorrect) {
    feedback.innerHTML = `<span style="font-family: var(--font-script); font-size: 1.5rem; color: var(--color-gold);">Correct!</span> <strong style="color: var(--color-sage-dark);">+${q.points}pt</strong><br><span style="font-size:0.8rem; font-weight:normal; color: var(--color-brown-medium);">${q.explanation}</span>`;
    feedback.className = 'quiz-feedback correct-text';
  } else {
    feedback.innerHTML = `<span style="font-family: var(--font-script); font-size: 1.5rem; color: var(--color-terra);">Oops!</span><br><span style="font-size:0.8rem; font-weight:normal; color: var(--color-brown-medium);">正解は「${q.options[q.answerIndex]}」<br>${q.explanation}</span>`;
    feedback.className = 'quiz-feedback wrong-text';
  }

  const nextBtn = document.getElementById(`quiz-next-${qIndex}`);
  nextBtn.style.display = 'inline-block';
}

function goToNextQuiz(currentIndex) {
  const currentQ = document.getElementById(`quiz-q-${currentIndex}`);
  currentQ.classList.remove('active');

  if (currentIndex < quizData.length - 1) {
    const nextQ = document.getElementById(`quiz-q-${currentIndex + 1}`);
    nextQ.classList.add('active');
  } else {
    // 全問終了時の結果画面
    const container = document.getElementById('quiz-container');
    const maxScore = quizData.reduce((sum, q) => sum + q.points, 0); // 満点計算
    
    container.innerHTML = `
      <div class="text-center slide-up" style="padding: 1rem;">
        <span class="card__accent-script" style="font-size: 3rem; margin-bottom: 1rem; display: block;">Great Job!</span>
        <p style="font-family: var(--font-serif-en); letter-spacing: 0.1em; color: var(--color-brown-medium); margin-bottom: 0.5rem; text-transform: uppercase;">Your Score</p>
        <div style="background: var(--color-cream-light); border: 1px solid var(--color-gold); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-soft);">
          <p style="font-size: 1.5rem; color: var(--color-sage-dark); font-family: var(--font-serif-en);"><strong>${totalScore}</strong> <span style="font-size: 1rem; color: var(--color-brown-light);">/ ${maxScore} pt</span></p>
        </div>
        <p style="font-size: 0.85rem; color: var(--color-brown); line-height: 1.8; margin-bottom: 1rem;">
          最後までご参加いただきありがとうございます。<br>
          そのままの画面で、司会からのご案内をお待ちください。
        </p>
      </div>
    `;
  }
}
