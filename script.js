// ============================================================
//  ゆにこちゃん｜星よみ屋  無料鑑定フォーム
//  ENDPOINT が空のあいだは「トライアルモード」＝送信内容を
//  サーバーに送らず、画面確認だけできます（テスト公開中）。
//  受信サーバー（Google Apps Script など）ができたら
//  ENDPOINT に URL を入れるだけで本番接続に切り替わります。
// ============================================================
const ENDPOINT = ''; // 例：'https://script.google.com/macros/s/XXXX/exec'

// 年セレクトボックスを生成
function fillYearSelect(selectEl, from, to, selected) {
  for (let y = to; y >= from; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    if (y === selected) opt.selected = true;
    selectEl.appendChild(opt);
  }
}

// 日セレクトボックスを生成
function fillDaySelect(selectEl) {
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    selectEl.appendChild(opt);
  }
}

function showThankyou() {
  document.querySelector('.form-section').style.display = 'none';
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('.about').style.display = 'none';
  document.getElementById('thankyou').style.display = 'flex';
  window.scrollTo(0, 0);
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  const currentYear = new Date().getFullYear();

  // 本人の年
  fillYearSelect(
    document.querySelector('select[name="birth_year"]'),
    1940, currentYear - 10
  );
  // 本人の日
  fillDaySelect(document.querySelector('select[name="birth_day"]'));

  // パートナーの年
  fillYearSelect(
    document.querySelector('select[name="partner_year"]'),
    1940, currentYear - 10
  );
  // パートナーの日
  fillDaySelect(document.querySelector('select[name="partner_day"]'));

  // パートナー情報のトグル
  const toggleBtn = document.getElementById('togglePartner');
  const partnerFields = document.getElementById('partnerFields');
  let isOpen = false;

  toggleBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    partnerFields.style.display = isOpen ? 'flex' : 'none';
    toggleBtn.querySelector('span').textContent = isOpen
      ? '－ パートナーや気になる人がいる場合（任意）'
      : '＋ パートナーや気になる人がいる場合（任意）';
  });

  // 受信サーバーが繋がっているときはトライアル表示を消す
  const trialNote = document.getElementById('trialNote');
  if (ENDPOINT && trialNote) trialNote.style.display = 'none';

  // フォーム送信
  const form = document.getElementById('kanteiForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const emailConfirm = document.getElementById('email_confirm').value;
    if (email !== emailConfirm) {
      alert('メールアドレスが一致していません。もう一度確認してください。');
      return;
    }

    const btn = form.querySelector('.submit-btn');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // --- トライアルモード（受信先が未接続） ---
    if (!ENDPOINT) {
      console.log('[トライアル] 送信内容:', data);
      showThankyou();
      return;
    }

    // --- 本番 ---
    btn.disabled = true;
    btn.textContent = '送信中...';

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('送信エラー');

      const json = await res.json().catch(() => ({}));

      if (json.duplicate) {
        btn.disabled = false;
        btn.textContent = '鑑定書を申し込む';
        alert('このメールアドレスではすでにお申し込みいただいています。\n無料鑑定はお一人様1回限りとなっております。');
        return;
      }

      showThankyou();

    } catch (err) {
      btn.disabled = false;
      btn.textContent = '鑑定書を申し込む';
      alert('送信中にエラーが発生しました。もう一度お試しください。');
    }
  });
});
