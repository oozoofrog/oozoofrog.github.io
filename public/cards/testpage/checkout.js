// Local test checkout. 결제하기 only runs checks in this page; no request is made and
// nothing is stored. The result never contains the card number, name or CVC.
"use strict";
(function () {
  const LAYOUTS = ["single", "split", "iframe"];
  const requested = new URLSearchParams(location.search).get("layout");
  const layout = LAYOUTS.includes(requested) ? requested : "single";
  const $ = (id) => document.getElementById(id);

  for (const link of document.querySelectorAll(".layouts a")) {
    if (link.dataset.layout === layout) link.setAttribute("aria-current", "page");
  }

  const area = $("card-area");
  let form = null;
  let frame = null;
  if (layout === "iframe") {
    frame = document.createElement("iframe");
    frame.src = "card.html";
    frame.title = "카드 정보 입력";
    frame.className = "card-frame";
    area.append(frame);
  } else {
    form = CardsTestForm.render(area, layout);
  }

  const phone = $("phone");
  const installment = $("installment");
  if (layout === "single") phone.setAttribute("autocomplete", "tel");
  const initial = { phone: phone.value, installment: installment.value };
  const touched = (el, key) => (el.value === initial[key] ? "untouched" : "changed");

  function cardFacts() {
    if (form) return form.facts();
    try {
      const read = frame.contentWindow && frame.contentWindow.__cardsCardFacts;
      return typeof read === "function" ? read() : null;
    } catch (_) {
      return null;
    }
  }

  // Non-secret facts only: counts, pass/fail flags and the masked last four digits.
  function summary() {
    const card = cardFacts();
    return {
      layout,
      cardFormReady: card !== null,
      number: card ? card.number : null,
      expiry: card ? card.expiry : null,
      name: card ? card.name : null,
      cvc: card ? card.cvc : null,
      otherFields: {
        phone: touched(phone, "phone"),
        birthDate: card ? card.birthDate : null,
        installment: touched(installment, "installment"),
      },
    };
  }
  window.__cardsTestSummary = summary;

  function row(list, label, text, state) {
    const wrap = document.createElement("div");
    if (state) wrap.className = state;
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = text;
    wrap.append(dt, dd);
    list.append(wrap);
  }

  const OTHER_TEXT = { untouched: "그대로", changed: "바뀜" };

  function showResult() {
    const s = summary();
    const list = $("result-list");
    list.replaceChildren();
    if (!s.cardFormReady) {
      row(list, "카드 입력 칸", "읽을 수 없음", "bad");
    } else {
      const lengthOk = s.number.digits >= 15 && s.number.digits <= 16;
      row(list, "번호 자릿수", `${s.number.digits}자리`, lengthOk ? "good" : "bad");
      row(list, "Luhn 검사", s.number.luhn ? "통과" : "실패", s.number.luhn ? "good" : "bad");
      row(list, "끝 4자리", s.number.last4 || "없음", s.number.last4 ? "" : "bad");
      const e = s.expiry;
      const expiryText = !e.entered ? "입력 안 됨" : !e.validFormat ? "형식 오류" : e.expired ? "형식 맞음 · 만료됨" : "형식 맞음 · 유효";
      row(list, "유효기간", expiryText, e.validFormat && !e.expired ? "good" : "bad");
      row(list, "소유자 이름", s.name.entered ? "입력됨" : "입력 안 됨", s.name.entered ? "good" : "bad");
      const cvcOk = s.cvc.digits === 3 || s.cvc.digits === 4;
      row(list, "CVC 자릿수", `${s.cvc.digits}자리`, cvcOk ? "good" : "bad");
    }
    const other = s.otherFields;
    row(list, "휴대폰 번호 칸", OTHER_TEXT[other.phone], other.phone === "untouched" ? "good" : "bad");
    row(list, "생년월일 칸", other.birthDate ? OTHER_TEXT[other.birthDate] : "이 배치에 없음", other.birthDate === "changed" ? "bad" : other.birthDate ? "good" : "");
    row(list, "할부 개월", OTHER_TEXT[other.installment], other.installment === "untouched" ? "good" : "bad");
    const result = $("result");
    result.hidden = false;
    result.scrollIntoView({ block: "nearest" });
  }

  // Shows the masked inputs to the person at the screen, for 15 seconds at most.
  let revealTimer = null;
  function setRevealed(on) {
    const doc = frame ? frame.contentDocument : document;
    if (!doc) return;
    for (const input of doc.querySelectorAll("input[data-masked], input[type=password]")) {
      input.dataset.masked = "1";
      input.type = on ? "text" : "password";
    }
    $("reveal").setAttribute("aria-pressed", on ? "true" : "false");
    $("reveal").textContent = on ? "값 다시 가리기" : "가려진 값 보기";
    clearTimeout(revealTimer);
    if (on) revealTimer = setTimeout(() => setRevealed(false), 15000);
  }
  $("reveal").addEventListener("click", () => setRevealed($("reveal").getAttribute("aria-pressed") !== "true"));

  $("agree").addEventListener("change", () => {
    if ($("agree").checked) $("agree-error").hidden = true;
  });
  $("pay").addEventListener("click", () => {
    if (!$("agree").checked) {
      $("agree-error").hidden = false;
      $("result").hidden = true;
      return;
    }
    $("agree-error").hidden = true;
    showResult();
  });
})();
