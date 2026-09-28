(function () {
  var form = document.querySelector("#kb-search-form");
  if (!form) return;

  var input = document.querySelector("#kb-search");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
  var status = document.querySelector("#search-status");
  var empty = document.querySelector("#search-empty");

  function norm(value) {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function apply(raw) {
    var query = norm(raw.trim());
    var shown = 0;

    cards.forEach(function (card) {
      var hay = norm((card.getAttribute("data-search") || "") + " " + (card.textContent || ""));
      var match = query.length === 0 || hay.indexOf(query) !== -1;
      card.hidden = !match;
      if (match) shown += 1;
    });

    if (empty) empty.hidden = shown !== 0 || query.length === 0;
    if (!status) return;

    if (!query) {
      status.textContent = "Mostrando todas las tarjetas. El texto filtra esta página; no busca artículos.";
      return;
    }

    if (shown === 0) {
      status.textContent = "Sin tarjetas para «" + raw.trim() + "». El índice de artículos se definirá con el CMS.";
      return;
    }

    var noun = shown === 1 ? "tarjeta" : "tarjetas";
    status.textContent = shown + " " + noun + " coinciden con «" + raw.trim() + "». Esto no busca dentro de artículos.";
  }

  var initial = new URLSearchParams(window.location.search).get("q");
  if (initial) {
    input.value = initial;
    apply(initial);
  }

  input.addEventListener("input", function () {
    apply(input.value);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var url = new URL(window.location.href);
    var value = input.value.trim();
    if (value) url.searchParams.set("q", value);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
    apply(input.value);
    input.focus();
  });
})();
