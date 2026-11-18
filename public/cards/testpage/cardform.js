// Card fields for the local test checkout. Nothing here sends, stores or logs a value.
// facts() reports only counts and pass/fail checks, never the number, name or CVC.
"use strict";
const CardsTestForm = (function () {
  const SINGLE = `
    <div class="field">
      <label for="cc-number">카드번호</label>
      <input id="cc-number" name="cardnumber" inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="19">
    </div>
    <div class="row">
      <div class="field">
        <label for="cc-exp">유효기간</label>
        <input id="cc-exp" name="cc-exp" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5">
      </div>
      <div class="field">
        <label for="cc-csc">CVC</label>
        <input id="cc-csc" name="cvc" type="password" inputmode="numeric" autocomplete="cc-csc" maxlength="4">
      </div>
    </div>
    <div class="field">
      <label for="cc-name">카드 소유자 이름</label>
      <input id="cc-name" name="ccname" autocomplete="cc-name">
    </div>`;

  const SPLIT = `
    <div class="field">
      <span class="label">카드번호</span>
      <div class="split">
        <input name="cardNo1" aria-label="카드번호 첫째 칸" inputmode="numeric" maxlength="4">
        <input name="cardNo2" aria-label="카드번호 둘째 칸" inputmode="numeric" maxlength="4">
        <input name="cardNo3" aria-label="카드번호 셋째 칸" type="password" inputmode="numeric" maxlength="4">
        <input name="cardNo4" aria-label="카드번호 넷째 칸" type="password" inputmode="numeric" maxlength="4">
      </div>
    </div>
    <div class="row">
      <div class="field">
        <span class="label">유효기간</span>
        <div class="split">
          <select name="expMonth" aria-label="유효기간 월"><option value="">월</option></select>
          <select name="expYear" aria-label="유효기간 년"><option value="">년</option></select>
        </div>
      </div>
      <div class="field">
        <label for="cvc">CVC (카드 뒷면 3자리)</label>
        <input id="cvc" name="cvc" type="password" inputmode="numeric" maxlength="3">
      </div>
    </div>
    <div class="field">
      <label for="ownerName">카드 소유자명</label>
      <input id="ownerName" name="ownerName">
    </div>
    <div class="field">
      <label for="birth">카드 소유자 생년월일 (6자리)</label>
      <input id="birth" name="birth" inputmode="numeric" placeholder="YYMMDD" maxlength="6">
    </div>`;

  const digits = (value) => String(value == null ? "" : value).replace(/\D+/g, "");

  function luhn(number) {
    if (number.length < 12) return false;
    let sum = 0;
    for (let i = 0; i < number.length; i++) {
      let d = number.charCodeAt(number.length - 1 - i) - 48;
      if (i % 2 === 1) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return sum % 10 === 0;
  }

  // month/year as entered -> { entered, validFormat, expired }
  function expiryFacts(entered, month, year, now) {
    const m = parseInt(month, 10);
    let y = parseInt(year, 10);
    const validFormat = /^\d{1,2}$/.test(month) && m >= 1 && m <= 12 && /^(\d{2}|\d{4})$/.test(year);
    if (!validFormat) return { entered, validFormat: false, expired: null };
    if (year.length === 2) y += 2000;
    const expired = y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth() + 1);
    return { entered: true, validFormat: true, expired };
  }

  function fillSelects(container) {
    const month = container.querySelector('select[name="expMonth"]');
    const year = container.querySelector('select[name="expYear"]');
    for (let m = 1; m <= 12; m++) {
      const text = String(m).padStart(2, "0");
      month.add(new Option(`${text}월`, text));
    }
    const first = new Date().getFullYear();
    for (let y = first; y <= first + 10; y++) year.add(new Option(`${y}년`, String(y % 100).padStart(2, "0")));
  }

  function render(container, layout) {
    const split = layout === "split";
    container.innerHTML = split ? SPLIT : SINGLE;
    if (split) fillSelects(container);
    const q = (selector) => container.querySelector(selector);
    const birth = q("#birth");
    const initialBirth = birth ? birth.value : null;

    function facts() {
      let number;
      let expiry;
      const now = new Date();
      if (split) {
        number = Array.from(container.querySelectorAll('input[name^="cardNo"]'), (i) => i.value).join("");
        const month = q('select[name="expMonth"]').value;
        const year = q('select[name="expYear"]').value;
        expiry = expiryFacts(Boolean(month || year), month, year, now);
      } else {
        number = q("#cc-number").value;
        const raw = q("#cc-exp").value.trim();
        const match = raw.match(/^(\d{2})\s*[\/\-.]?\s*(\d{2}|\d{4})$/);
        expiry = expiryFacts(raw !== "", match ? match[1] : "", match ? match[2] : "", now);
      }
      // Other characters in the number box (apart from spaces and hyphens) fail the check.
      const clean = /^[\d\s-]*$/.test(number);
      const pan = digits(number);
      return {
        number: {
          digits: pan.length,
          luhn: clean && luhn(pan),
          last4: pan.length >= 12 ? `•••• ${pan.slice(-4)}` : null,
        },
        expiry,
        name: { entered: q(split ? "#ownerName" : "#cc-name").value.trim() !== "" },
        cvc: { digits: digits(q(split ? "#cvc" : "#cc-csc").value).length },
        birthDate: birth ? (birth.value === initialBirth ? "untouched" : "changed") : null,
      };
    }

    return { facts };
  }

  return { render };
})();
