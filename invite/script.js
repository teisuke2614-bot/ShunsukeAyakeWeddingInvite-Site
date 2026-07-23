/**
 * Wedding RSVP - Form Logic & Data Storage
 * Uses localStorage for persistence
 */

const STORAGE_KEY = 'wedding_rsvp_responses';

// ============================================================
// FIREBASE SETUP
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyAuqVqpHIIAfcqdMpNKHuEAKkFNei13BSc",
  authDomain: "shunayakaweddingsite.firebaseapp.com",
  projectId: "shunayakaweddingsite",
  storageBucket: "shunayakaweddingsite.firebasestorage.app",
  messagingSenderId: "61051359742",
  appId: "1:61051359742:web:e87d66bf683a5ef4e930af"
};

// Initialize Firebase (Compat SDK)
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

// ============================================================
// STEP NAVIGATION
// ============================================================
let currentStep = 1;
const totalSteps = 4;

function updateProgress() {
  const steps = document.querySelectorAll('.rsvp-progress__step');
  const lines = document.querySelectorAll('.rsvp-progress__line');

  steps.forEach((step, i) => {
    const stepNum = i + 1;
    step.classList.remove('active', 'completed');
    if (stepNum === currentStep) step.classList.add('active');
    if (stepNum < currentStep) step.classList.add('completed');
  });

  lines.forEach((line, i) => {
    line.classList.toggle('active', i < currentStep - 1);
  });
}

function showStep(step) {
  document.querySelectorAll('.rsvp-step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`step-${step}`);
  if (target) {
    target.classList.add('active');
    // Generate review if on step 4
    if (step === 4) generateReview();
  }
  currentStep = step;
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep(step) {
  // Validate current step before advancing
  if (!validateStep(currentStep)) return;

  // Skip meal step if not attending
  const attendance = document.querySelector('input[name="attendance"]:checked');
  if (step === 3 && attendance && attendance.value === '欠席') {
    showStep(4);
    return;
  }

  showStep(step);
}

function prevStep(step) {
  // Skip meal step if not attending
  const attendance = document.querySelector('input[name="attendance"]:checked');
  if (step === 3 && attendance && attendance.value === '欠席') {
    showStep(2);
    return;
  }

  showStep(step);
}

// ============================================================
// VALIDATION
// ============================================================
function validateStep(step) {
  let isValid = true;

  // Clear all errors first
  clearErrors();

  if (step === 1) {
    const attendance = document.querySelector('input[name="attendance"]:checked');
    if (!attendance) {
      showError('err-attendance');
      isValid = false;
    }
  }

  if (step === 2) {
    const fields = [
      { id: 'last-name', error: 'err-lastName' },
      { id: 'first-name', error: 'err-firstName' },
      { id: 'last-name-kana', error: 'err-lastNameKana' },
      { id: 'first-name-kana', error: 'err-firstNameKana' },
      { id: 'email', error: 'err-email' },
    ];

    fields.forEach(f => {
      const el = document.getElementById(f.id);
      if (!el.value.trim()) {
        showError(f.error);
        el.classList.add('error');
        isValid = false;
      }
    });

    // Email format check
    const emailEl = document.getElementById('email');
    if (emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      showError('err-email');
      emailEl.classList.add('error');
      isValid = false;
    }

    // Relationship
    const rel = document.getElementById('relationship');
    if (!rel.value) {
      showError('err-relationship');
      rel.classList.add('error');
      isValid = false;
    }
  }

  if (step === 3) {
    const allergySelect = document.getElementById('allergy-select');
    const allergyDetails = document.getElementById('allergy');
    if (allergySelect && allergySelect.value === 'あり' && !allergyDetails.value.trim()) {
      showError('err-allergy');
      allergyDetails.classList.add('error');
      isValid = false;
    }
  }

  return isValid;
}

function showError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('visible');
}

function clearErrors() {
  document.querySelectorAll('.form-error-msg').forEach(e => e.classList.remove('visible'));
  document.querySelectorAll('.form-input, .form-select').forEach(e => e.classList.remove('error'));
}

// ============================================================
// COMPANION SECTION TOGGLE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Init
  window.scrollTo(0, 0);
  updateProgress();

  // Form submit handler
  const form = document.getElementById('rsvp-form');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  // Clear error on input
  document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const group = el.closest('.form-group');
      if (group) {
        const errMsg = group.querySelector('.form-error-msg');
        if (errMsg) errMsg.classList.remove('visible');
      }
    });
  });

  document.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      clearErrors();
    });
  });
});

// ============================================================
// REVIEW GENERATION
// ============================================================
function generateReview() {
  const container = document.getElementById('review-content');
  const data = collectFormData();

  let html = '<div class="confirm-summary" style="margin: 0; box-shadow: none; padding: 0;">';

  const rows = [
    ['ご出欠', data.attendance],
    ['お名前', `${data.lastName} ${data.firstName}`],
    ['フリガナ', `${data.lastNameKana} ${data.firstNameKana}`],
    ['メールアドレス', data.email],
  ];

  if (data.phone) rows.push(['電話番号', data.phone]);
  rows.push(['新郎新婦との関係', data.relationship]);

  if (data.attendance === '出席') {
    if (data.allergy) rows.push(['アレルギー', data.allergy]);
    rows.push(['送迎バス', data.shuttle]);
  }

  if (data.message) rows.push(['メッセージ', data.message]);

  rows.forEach(([label, value]) => {
    html += `
      <div class="confirm-summary__row">
        <span class="confirm-summary__label">${label}</span>
        <span class="confirm-summary__value">${value || '—'}</span>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// ============================================================
// DATA COLLECTION
// ============================================================
function collectFormData() {
  const attendance = document.querySelector('input[name="attendance"]:checked');
  const shuttle = document.querySelector('input[name="shuttle"]:checked');

  return {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    attendance: attendance ? attendance.value : '',
    lastName: document.getElementById('last-name').value.trim(),
    firstName: document.getElementById('first-name').value.trim(),
    lastNameKana: document.getElementById('last-name-kana').value.trim(),
    firstNameKana: document.getElementById('first-name-kana').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    relationship: document.getElementById('relationship').value,
    hasCompanion: false,
    companionCount: 0,
    companionNames: [],
    meal: '',
    allergy: document.getElementById('allergy-select') && document.getElementById('allergy-select').value === 'あり' ? document.getElementById('allergy').value.trim() : 'なし',
    shuttle: shuttle ? shuttle.value : '利用しない',
    message: document.getElementById('message').value.trim(),
  };
}

// ============================================================
// FORM SUBMISSION
// ============================================================
async function handleSubmit(e) {
  e.preventDefault();

  // Validate all steps
  if (!validateStep(currentStep)) return;

  if (!confirm("入力内容を送信しますか？")) {
    return;
  }

  const data = collectFormData();

  // Show loading state
  const submitBtn = document.querySelector('button[onclick="handleSubmit(event)"]') || document.querySelector('button[type="submit"]');
  const originalText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.innerHTML = '送信中...';
    submitBtn.disabled = true;
  }

  try {
    await saveResponse(data);
    showConfirmation(data);
  } catch (err) {
    console.error("保存エラー:", err);
    alert("送信に失敗しました。もう一度お試しください。");
    if (submitBtn) {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }
}

async function saveResponse(data) {
  const saveToLocal = (data) => {
    const responses = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    responses.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  };

  if (db) {
    try {
      await db.collection("responses").doc(data.id).set(data);
    } catch (error) {
      console.warn("Firebase save failed (check rules/setup). Falling back to localStorage.", error);
      saveToLocal(data);
    }
  } else {
    saveToLocal(data);
  }
}

function showConfirmation(data) {
  // Hide form, show confirmation
  document.getElementById('form-container').style.display = 'none';
  document.getElementById('progress')?.closest('.rsvp-form-container')?.style && 
    (document.getElementById('form-container').style.display = 'none');

  const confirmScreen = document.getElementById('confirm-screen');
  confirmScreen.classList.add('active');

  // Update message based on attendance
  const msgEl = document.getElementById('confirm-message');
  if (data.attendance === '欠席') {
    msgEl.innerHTML = `
      ご連絡いただきありがとうございます。<br>
      残念ですが、またの機会にお会いできることを<br>
      楽しみにしています。
    `;
    document.querySelector('.confirm-icon').innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-terra)" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';
  }

  // Populate summary
  const summary = document.getElementById('confirm-summary');
  const rows = [
    ['ご出欠', data.attendance],
    ['お名前', `${data.lastName} ${data.firstName}`],
    ['メールアドレス', data.email],
    ['新郎新婦との関係', data.relationship],
  ];

  if (data.attendance === '出席') {
    if (data.allergy) rows.push(['アレルギー', data.allergy]);
    rows.push(['送迎バス', data.shuttle]);
  }

  if (data.message) rows.push(['メッセージ', data.message]);

  let html = '<div class="confirm-summary__title">回答内容</div>';
  rows.forEach(([label, value]) => {
    html += `
      <div class="confirm-summary__row">
        <span class="confirm-summary__label">${label}</span>
        <span class="confirm-summary__value">${value || '—'}</span>
      </div>
    `;
  });
  summary.innerHTML = html;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// ADMIN PAGE FUNCTIONS (shared)
// ============================================================
async function getResponses() {
  if (db) {
    const snapshot = await db.collection("responses").get();
    const responses = [];
    snapshot.forEach(doc => {
      responses.push(doc.data());
    });
    return responses;
  }
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

async function deleteResponse(id) {
  if (db) {
    await db.collection("responses").doc(id).delete();
  } else {
    const responses = (await getResponses()).filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  }
}

async function clearAllResponses() {
  if (db) {
    const snapshot = await db.collection("responses").get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

async function exportCSV() {
  const responses = await getResponses();
  if (responses.length === 0) {
    alert('エクスポートするデータがありません');
    return;
  }

  const headers = [
    '回答日時', 'ご出欠', '姓', '名', 'セイ', 'メイ',
    'メールアドレス', '電話番号', '関係', '同伴者', 'お食事',
    'アレルギー', '送迎バス', 'メッセージ'
  ];

  const rows = responses.map(r => [
    new Date(r.timestamp).toLocaleString('ja-JP'),
    r.attendance,
    r.lastName,
    r.firstName,
    r.lastNameKana,
    r.firstNameKana,
    r.email,
    r.phone || '',
    r.relationship,
    r.companionNames ? r.companionNames.join(' / ') : '',
    r.meal || '',
    r.allergy || '',
    r.shuttle || '',
    r.message || ''
  ]);

  // BOM for Excel compatibility
  let csv = '\uFEFF' + headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rsvp_responses_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function addSampleData() {
  const sampleData = [
    {
      id: 's1', timestamp: new Date().toISOString(), attendance: '出席',
      lastName: '田中', firstName: '太郎', lastNameKana: 'タナカ', firstNameKana: 'タロウ',
      email: 'tanaka@example.com', phone: '090-1111-2222', relationship: '新郎友人',
      hasCompanion: false, companionCount: 0, companionNames: [],
      allergy: '', shuttle: '利用する（諫早駅）', message: '結婚おめでとう！楽しみにしてます！'
    },
    {
      id: 's2', timestamp: new Date(Date.now() - 86400000).toISOString(), attendance: '出席',
      lastName: '佐藤', firstName: '花子', lastNameKana: 'サトウ', firstNameKana: 'ハナコ',
      email: 'sato@example.com', phone: '080-3333-4444', relationship: '新婦友人',
      hasCompanion: true, companionCount: 1, companionNames: ['佐藤 次郎'],
      allergy: 'エビアレルギー', shuttle: '利用しない', message: 'お幸せに♡'
    },
    {
      id: 's3', timestamp: new Date(Date.now() - 172800000).toISOString(), attendance: '欠席',
      lastName: '山本', firstName: '一郎', lastNameKana: 'ヤマモト', firstNameKana: 'イチロウ',
      email: 'yamamoto@example.com', phone: '', relationship: '新郎同僚',
      hasCompanion: false, companionCount: 0, companionNames: [],
      allergy: '', shuttle: '', message: '残念ですが出張で出席できません。お祝い申し上げます。'
    },
    {
      id: 's4', timestamp: new Date(Date.now() - 259200000).toISOString(), attendance: '出席',
      lastName: '鈴木', firstName: '美咲', lastNameKana: 'スズキ', firstNameKana: 'ミサキ',
      email: 'suzuki@example.com', phone: '070-5555-6666', relationship: '新婦親族',
      hasCompanion: true, companionCount: 2, companionNames: ['鈴木 健太', '鈴木 愛'],
      allergy: '小麦', shuttle: '利用する（新大村駅）', message: '家族みんなで楽しみにしてます！'
    },
    {
      id: 's5', timestamp: new Date(Date.now() - 345600000).toISOString(), attendance: '出席',
      lastName: '高橋', firstName: '翔太', lastNameKana: 'タカハシ', firstNameKana: 'ショウタ',
      email: 'takahashi@example.com', phone: '090-7777-8888', relationship: '新郎友人',
      hasCompanion: false, companionCount: 0, companionNames: [],
      allergy: '', shuttle: '利用する（諫早駅）', message: ''
    }
  ];

  if (db) {
    const batch = db.batch();
    sampleData.forEach(data => {
      const ref = db.collection("responses").doc(data.id);
      batch.set(ref, data);
    });
    await batch.commit();
  } else {
    const existing = await getResponses();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, ...sampleData]));
  }
}
