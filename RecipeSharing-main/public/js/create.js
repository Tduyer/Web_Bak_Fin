(async function(){
  requireAuthOrRedirect();
  await initNav("create");

  const form = qs("#formRecipe");
  const msg = qs("#createMsg");
  const preview = qs("#preview");
  const imageInput = qs("#rImageUrl");

  const parseComma = (s) => s.split(",").map(x=>x.trim()).filter(Boolean);
  const parseLines = (s) => s.split("\n").map(x=>x.trim()).filter(Boolean);

  function renderPreview(url){
    if (!url) {
      preview.textContent = "No image yet.";
      return;
    }
    preview.innerHTML = `
      <img src="${escapeHtml(url)}" alt="preview"
           style="width:100%;border-radius:14px;border:1px solid rgba(255,255,255,.08)"/>
    `;
  }

  imageInput.addEventListener("input", () => renderPreview(imageInput.value.trim()));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = qs("#rTitle").value.trim();
    const description = qs("#rDesc").value.trim();
    const ingredients = parseComma(qs("#rIngredients").value);
    const steps = parseLines(qs("#rSteps").value);
    const tags = parseComma(qs("#rTags").value);
    const imageUrl = qs("#rImageUrl").value.trim();
    const isPublic = qs("#rPublic").checked;

    if (!title) return setMsg(msg, "Title is required.");
    if (ingredients.length < 1) return setMsg(msg, "At least 1 ingredient required.");
    if (steps.length < 1) return setMsg(msg, "At least 1 step required.");

    try{
      await apiFetch("/recipes", {
        method:"POST",
        body: JSON.stringify({ title, description, ingredients, steps, tags, imageUrl, isPublic })
      });
      setMsg(msg, "Recipe submitted (pending approval).", true);
      form.reset();
      qs("#rPublic").checked = true;
      renderPreview("");
    }catch(err){
      setMsg(msg, err.message);
    }
  });
})();
