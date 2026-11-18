// Card form document used inside the iframe variant. ?layout=split switches the fields.
"use strict";
(function () {
  const layout = new URLSearchParams(location.search).get("layout") === "split" ? "split" : "single";
  const form = CardsTestForm.render(document.getElementById("card-area"), layout);
  // Read by the parent checkout page (same origin). Returns non-secret facts only.
  window.__cardsCardFacts = () => form.facts();
})();
