(async function(){
  await initNav("home");
  initFooter();

  const feed = qs("#feed");
  const feedMsg = qs("#feedMsg");
  const searchMsg = qs("#searchMsg");
  const form = qs("#searchForm");
  const btnAll = qs("#btnAll");

  const modalOverlay = qs("#modalOverlay");
  const mClose = qs("#mClose");
  const mTitle = qs("#mTitle");
  const mBody = qs("#mBody");

  let showingAll = false;
  let currentQuery = "";

  function openModal(){ modalOverlay.classList.remove("hidden"); }
  function closeModal(){ modalOverlay.classList.add("hidden"); }
  mClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e)=>{ if(e.target === modalOverlay) closeModal(); });

  async function showDetails(id){
    try{
      mTitle.textContent = "Loading...";
      mBody.innerHTML = "Loading...";
      openModal();

      const res = await fetch(`/api/public/recipes/${id}`);
      const r = await res.json();
      if (!res.ok) throw new Error(r.message || "Failed to load details");

      mTitle.textContent = r.title;

      mBody.innerHTML = `
        ${r.imageUrl ? `<img class="thumb" style="height:240px" src="${escapeHtml(r.imageUrl)}" alt=""/>` : ""}
        <p class="sub">${escapeHtml(r.description || "")}</p>

        <hr class="sep"/>

        <div class="row" style="justify-content:space-between">
          <b>Ingredients</b>
          <span class="badge">${(r.tags || []).slice(0,5).map(t=>`#${escapeHtml(t)}`).join(" ")}</span>
        </div>
        <p class="sub">${(r.ingredients || []).map(escapeHtml).join(", ")}</p>

        <hr class="sep"/>

        <b>Steps</b>
        <ol class="sub" style="margin:8px 0 0;padding-left:18px">
          ${(r.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join("")}
        </ol>
      `;
    }catch(err){
      mTitle.textContent = "Error";
      mBody.innerHTML = `<p class="msg err">${escapeHtml(err.message)}</p>`;
    }
  }

  function renderCatalog(recipes){
    if (!recipes.length){
      feed.innerHTML = `<div class="sub">No recipes found.</div>`;
      return;
    }

    feed.innerHTML = recipes.map(r => `
      <div class="item recipe-card" data-id="${r._id}">
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <h3 style="margin:0">${escapeHtml(r.title)}</h3>
          <span class="badge">approved</span>
        </div>

        ${r.imageUrl ? `<img class="thumb" src="${escapeHtml(r.imageUrl)}" alt=""/>` : ""}

        <p class="sub">${escapeHtml(r.description || "")}</p>

        <div class="meta">
          ${(r.tags || []).slice(0,4).map(t=>`<span class="badge">#${escapeHtml(t)}</span>`).join(" ")}
        </div>
      </div>
    `).join("");

    qsa(".recipe-card").forEach(card=>{
      card.addEventListener("click", ()=> showDetails(card.dataset.id));
    });
  }

  async function loadRecipes({ q = "", limit = 10 } = {}){
    try{
      setMsg(feedMsg, "");
      setMsg(searchMsg, "");
      const params = new URLSearchParams();
      if (q) params.set("q", q);

      const res = await fetch(`/api/public/recipes?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load");

      const list = limit ? data.slice(0, limit) : data;
      renderCatalog(list);
    }catch(err){
      setMsg(feedMsg, err.message);
      feed.innerHTML = `<div class="sub">Failed to load recipes.</div>`;
    }
  }

  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    currentQuery = qs("#q").value.trim();
    showingAll = false;
    btnAll.textContent = "Show all";
    loadRecipes({ q: currentQuery, limit: 10 });
  });

  btnAll.addEventListener("click", ()=>{
    showingAll = !showingAll;
    btnAll.textContent = showingAll ? "Show less" : "Show all";
    loadRecipes({ q: currentQuery, limit: showingAll ? null : 10 });
  });

  loadRecipes({ limit: 10 });
})();
