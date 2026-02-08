(async function(){
  requireAuthOrRedirect();
  await initNav("recipes");

  const form = qs("#formRecipe");
  const msg = qs("#recipeMsg");
  const list = qs("#list");
  const listMsg = qs("#listMsg");
  const btnRefresh = qs("#btnRefresh");

  function parseComma(s){
    return s.split(",").map(x => x.trim()).filter(Boolean);
  }
  function parseLines(s){
    return s.split("\n").map(x => x.trim()).filter(Boolean);
  }

  async function load(){
    try{
      const recipes = await apiFetch("/recipes");
      setMsg(listMsg, "");
      if (!recipes.length){
        list.innerHTML = `<div class="sub">No recipes yet. Create one on the left.</div>`;
        return;
      }
      list.innerHTML = recipes.map(r => `
        <div class="item">
          <div class="row" style="justify-content:space-between">
            <h3>${escapeHtml(r.title)}</h3>
            <span class="badge">${escapeHtml(r.status)} • ${r.isPublic ? "public" : "private"}</span>
          </div>
          <div class="meta">
            <span>${new Date(r.createdAt).toLocaleString()}</span>
            <span>id: ${escapeHtml(r._id)}</span>
          </div>
          <p class="sub">${escapeHtml(r.description || "")}</p>

          <div class="row" style="margin-top:10px">
            <button class="btn btn--ghost small" data-act="view" data-id="${r._id}">View</button>
            <button class="btn btn--danger small" data-act="delete" data-id="${r._id}">Delete</button>
          </div>

          <div class="details" id="d-${r._id}"></div>
        </div>
      `).join("");

      qsa("button[data-act]").forEach(b => {
        b.addEventListener("click", async () => {
          const id = b.dataset.id;
          const act = b.dataset.act;

          if (act === "delete"){
            if (!confirm("Delete recipe?")) return;
            try{
              await apiFetch(`/recipes/${id}`, { method:"DELETE" });
              setMsg(msg, "Recipe deleted.", true);
              await load();
            }catch(err){
              setMsg(msg, err.message);
            }
          }

          if (act === "view"){
            try{
              const r = await apiFetch(`/recipes/${id}`);
              const box = qs(`#d-${id}`);
              box.innerHTML = `
                <hr class="sep"/>
                <div class="meta"><span><b>Ingredients</b></span></div>
                <p class="sub">${r.ingredients.map(escapeHtml).join(", ")}</p>
                <div class="meta"><span><b>Steps</b></span></div>
                <ol class="sub" style="margin:8px 0 0;padding-left:18px">
                  ${r.steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}
                </ol>
              `;
            }catch(err){
              setMsg(msg, err.message);
            }
          }
        });
      });

    }catch(err){
      setMsg(listMsg, err.message);
      list.innerHTML = `<div class="sub">Failed to load recipes.</div>`;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = qs("#rTitle").value.trim();
    const description = qs("#rDesc").value.trim();
    const ingredients = parseComma(qs("#rIngredients").value);
    const steps = parseLines(qs("#rSteps").value);
    const tags = parseComma(qs("#rTags").value);
    const imageUrl = qs("#rImageUrl").value.trim();
    const isPublic = qs("#rPublic").checked;
    const status = qs("#rStatus").value;

    // client-side validation
    if (!title) return setMsg(msg, "Title is required.");
    if (ingredients.length < 1) return setMsg(msg, "At least 1 ingredient required.");
    if (steps.length < 1) return setMsg(msg, "At least 1 step required.");

    try{
      await apiFetch("/recipes", {
        method:"POST",
        body: JSON.stringify({ title, description, ingredients, steps, tags, imageUrl, isPublic, status })
      });
      setMsg(msg, "Recipe created!", true);
      form.reset();
      qs("#rPublic").checked = true;
      qs("#rStatus").value = "published";
      await load();
    }catch(err){
      setMsg(msg, err.message);
    }
  });

  btnRefresh.addEventListener("click", load);

  load();
})();
