(async function () {
  requireAuthOrRedirect();

  await initNav("profile");
  initFooter();

  const profileBox = qs("#profileBox");
  const profileMsg = qs("#profileMsg");
  const formProfile = qs("#formProfile");

  const myList = qs("#myList");
  const recipesMsg = qs("#recipesMsg");
  const btnMine = qs("#btnMine");
  const btnAll = qs("#btnAll");

  const adminPanel = qs("#adminPanel");
  const pendingList = qs("#pendingList");
  const adminMsg = qs("#adminMsg");

  const editOverlay = qs("#editOverlay");
  const editClose = qs("#editClose");
  const editForm = qs("#editForm");
  const editMsg = qs("#editMsg");

  const eId = qs("#eId");
  const eTitle = qs("#eTitle");
  const eDesc = qs("#eDesc");
  const eIngredients = qs("#eIngredients");
  const eSteps = qs("#eSteps");
  const eTags = qs("#eTags");
  const eImageUrl = qs("#eImageUrl");
  const ePublic = qs("#ePublic");

  let me = null;
  let showAll = false;

  const parseComma = (s) => s.split(",").map(x => x.trim()).filter(Boolean);
  const parseLines = (s) => s.split("\n").map(x => x.trim()).filter(Boolean);

  function openEdit() { editOverlay.classList.remove("hidden"); }
  function closeEdit() { editOverlay.classList.add("hidden"); setMsg(editMsg, ""); }

  editClose.onclick = closeEdit;
  editOverlay.addEventListener("click", e => {
    if (e.target === editOverlay) closeEdit();
  });

  async function loadProfile() {
    const data = await apiFetch("/users/profile");
    me = data.user;

    profileBox.innerHTML = `
      <div class="row">
        <span class="badge">role: ${escapeHtml(me.role)}</span>
        <span class="badge">id: ${escapeHtml(me._id)}</span>
      </div>
      <h2 style="margin-top:12px">${escapeHtml(me.username)}</h2>
      <p class="sub">${escapeHtml(me.email)}</p>
    `;

    qs("#pUsername").value = me.username || "";
    qs("#pEmail").value = me.email || "";

    if (me.role === "admin") {
      btnAll.classList.remove("hidden");
      adminPanel.classList.remove("hidden");
      loadPendingRecipes();
    } else {
      btnAll.classList.add("hidden");
      adminPanel.classList.add("hidden");
    }
  }

  formProfile.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = qs("#pUsername").value.trim();
    const email = qs("#pEmail").value.trim();

    try {
      await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify({ username, email })
      });
      setMsg(profileMsg, "Profile updated", true);
      await loadProfile();
      await initNav("profile");
      initFooter();
    } catch (err) {
      setMsg(profileMsg, err.message);
    }
  });

  async function loadRecipes(all = false) {
    showAll = all;
    try {
      setMsg(recipesMsg, "");
      myList.innerHTML = `<div class="sub">Loading...</div>`;

      const q = all ? "?all=true" : "";
      const recipes = await apiFetch(`/recipes${q}`);

      if (!recipes.length) {
        myList.innerHTML = `<div class="sub">No recipes found.</div>`;
        return;
      }

      myList.innerHTML = recipes.map(r => `
        <div class="item">
          <div class="row" style="justify-content:space-between">
            <h3 style="margin:0">${escapeHtml(r.title)}</h3>
            <span class="badge">${escapeHtml(r.status)}</span>
          </div>

          ${r.imageUrl ? `<img class="thumb" src="${escapeHtml(r.imageUrl)}" alt=""/>` : ""}

          <p class="sub" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">
            ${escapeHtml(r.description || "")}
          </p>

          <div class="row" style="margin-top:10px">
            <button class="btn btn--ghost small" data-edit="${r._id}">Edit</button>
            <button class="btn btn--danger small" data-del="${r._id}">Delete</button>
          </div>
        </div>
      `).join("");

      qsa("[data-del]").forEach(btn => {
        btn.onclick = async () => {
          if (!confirm("Delete recipe?")) return;
          try {
            await apiFetch(`/recipes/${btn.dataset.del}`, { method: "DELETE" });
            setMsg(recipesMsg, "Deleted", true);
            loadRecipes(showAll);
            if (me.role === "admin") loadPendingRecipes();
          } catch (e) {
            setMsg(recipesMsg, e.message);
          }
        };
      });

      qsa("[data-edit]").forEach(btn => {
        btn.onclick = async () => {
          try {
            const r = await apiFetch(`/recipes/${btn.dataset.edit}`);

            eId.value = r._id;
            eTitle.value = r.title || "";
            eDesc.value = r.description || "";
            eIngredients.value = (r.ingredients || []).join(", ");
            eSteps.value = (r.steps || []).join("\n");
            eTags.value = (r.tags || []).join(", ");
            eImageUrl.value = r.imageUrl || "";
            ePublic.checked = r.isPublic !== false;

            openEdit();
          } catch (e) {
            setMsg(recipesMsg, e.message);
          }
        };
      });

    } catch (err) {
      setMsg(recipesMsg, err.message);
      myList.innerHTML = `<div class="sub">Failed to load recipes.</div>`;
    }
  }

  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      title: eTitle.value.trim(),
      description: eDesc.value.trim(),
      ingredients: parseComma(eIngredients.value),
      steps: parseLines(eSteps.value),
      tags: parseComma(eTags.value),
      imageUrl: eImageUrl.value.trim(),
      isPublic: ePublic.checked
    };

    if (!payload.title) return setMsg(editMsg, "Title required");
    if (!payload.ingredients.length) return setMsg(editMsg, "Ingredients required");
    if (!payload.steps.length) return setMsg(editMsg, "Steps required");

    try {
      await apiFetch(`/recipes/${eId.value}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      setMsg(editMsg, "Saved", true);
      closeEdit();
      loadRecipes(showAll);
      if (me.role === "admin") loadPendingRecipes();
    } catch (err) {
      setMsg(editMsg, err.message);
    }
  });

  async function loadPendingRecipes() {
    try {
      setMsg(adminMsg, "");
      pendingList.innerHTML = `<div class="sub">Loading...</div>`;

      const all = await apiFetch("/recipes?all=true");
      const pending = all.filter(r => r.status === "pending");

      if (!pending.length) {
        pendingList.innerHTML = `<div class="sub">No pending recipes 🎉</div>`;
        return;
      }

      pendingList.innerHTML = pending.map(r => `
        <div class="item">
          <h3>${escapeHtml(r.title)}</h3>
          <div class="row">
            <button class="btn small" data-approve="${r._id}">Approve</button>
            <button class="btn btn--danger small" data-reject="${r._id}">Reject</button>
          </div>
        </div>
      `).join("");

      qsa("[data-approve]").forEach(btn => {
        btn.onclick = async () => {
          await apiFetch(`/recipes/${btn.dataset.approve}/approve`, { method: "PUT" });
          loadPendingRecipes();
          loadRecipes(showAll);
        };
      });

      qsa("[data-reject]").forEach(btn => {
        btn.onclick = async () => {
          const reason = prompt("Reject reason") || "Rejected";
          await apiFetch(`/recipes/${btn.dataset.reject}/reject`, {
            method: "PUT",
            body: JSON.stringify({ reason })
          });
          loadPendingRecipes();
          loadRecipes(showAll);
        };
      });

    } catch (err) {
      setMsg(adminMsg, err.message);
    }
  }

  btnMine.onclick = () => loadRecipes(false);
  btnAll.onclick = () => loadRecipes(true);

  await loadProfile();
  await loadRecipes(false);
})();
