// ===========================================================================
// Design showcase — view + draft mode (edit captions, upload screenshots,
// export an updated showcase-data.js to publish the changes)
// ===========================================================================
(function () {
  const grid = document.getElementById("shots");
  const draftToggle = document.getElementById("draft-toggle");
  const exportBtn = document.getElementById("export-btn");
  const addBtn = document.getElementById("add-card");
  const banner = document.getElementById("draft-banner");

  let data = (typeof SHOWCASE !== "undefined" ? SHOWCASE : []).map((d) => ({ ...d }));
  // Draft edits persist locally until exported
  try {
    const saved = localStorage.getItem("me_showcase_draft");
    if (saved) data = JSON.parse(saved);
  } catch {}

  let draft = false;
  let toastTimer;

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function saveDraft() {
    try { localStorage.setItem("me_showcase_draft", JSON.stringify(data)); } catch {}
  }

  function render() {
    grid.innerHTML = "";
    data.forEach((d, i) => {
      const card = document.createElement("article");
      card.className = "shot-card";
      const shot = d.img
        ? `<img src="${d.img}" alt="MindEase design screen ${i + 1}">`
        : `<span>${draft ? "Click to add a Figma screenshot" : "Screenshot coming soon"}</span>`;
      card.innerHTML = `
        <div class="shot" ${draft ? 'role="button" tabindex="0" aria-label="Upload screenshot for card ' + (i + 1) + '"' : ""}>${shot}</div>
        <div class="cap">
          ${draft
            ? `<label class="sr-only" for="cap-${i}">Caption for screen ${i + 1}</label>
               <input type="text" id="cap-${i}" value="${(d.caption || "").replace(/"/g, "&quot;")}" placeholder="One-sentence description">`
            : `<p>${d.caption || ""}</p>`}
        </div>
        ${draft ? `<button class="del" type="button">Remove card</button>` : ""}`;
      if (draft) {
        const shotEl = card.querySelector(".shot");
        const pick = () => {
          const inp = document.createElement("input");
          inp.type = "file";
          inp.accept = "image/*";
          inp.addEventListener("change", () => {
            const f = inp.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => { data[i].img = r.result; saveDraft(); render(); };
            r.readAsDataURL(f);
          });
          inp.click();
        };
        shotEl.addEventListener("click", pick);
        shotEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
        card.querySelector("input[type=text]").addEventListener("input", (e) => {
          data[i].caption = e.target.value;
          saveDraft();
        });
        card.querySelector(".del").addEventListener("click", () => {
          data.splice(i, 1);
          saveDraft();
          render();
        });
      }
      grid.appendChild(card);
    });
  }

  draftToggle.addEventListener("click", () => {
    draft = !draft;
    draftToggle.textContent = draft ? "👁 Preview mode" : "✏️ Draft mode";
    exportBtn.hidden = !draft;
    addBtn.hidden = !draft;
    banner.hidden = !draft;
    render();
  });

  addBtn.addEventListener("click", () => {
    data.push({ img: "", caption: "" });
    saveDraft();
    render();
  });

  exportBtn.addEventListener("click", () => {
    const body = data.map((d) =>
      `  { img: ${JSON.stringify(d.img || "")}, caption: ${JSON.stringify(d.caption || "")} },`).join("\n");
    const file = `// Generated from design.html draft mode\nconst SHOWCASE = [\n${body}\n];\n`;
    const blob = new Blob([file], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "showcase-data.js";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Downloaded! Replace js/showcase-data.js in your repo to publish.");
  });

  render();
})();
