(async function(){
  requireAuthOrRedirect();
  await initNav("profile");
  initFooter();

  const box = qs("#profileBox");
  const msg = qs("#profileMsg");
  const form = qs("#formProfile");

  async function refresh(){
    try{
      const data = await apiFetch("/users/profile");
      const u = data.user;
      box.innerHTML = `
        <div class="row">
          <span class="badge">role: ${escapeHtml(u.role)}</span>
          <span class="badge">id: ${escapeHtml(u._id)}</span>
        </div>
        <h2 style="margin-top:12px">${escapeHtml(u.username)}</h2>
        <p class="sub">${escapeHtml(u.email)}</p>
      `;
      qs("#pUsername").value = u.username || "";
      qs("#pEmail").value = u.email || "";
      setMsg(msg, "");
    }catch(err){
      setMsg(msg, err.message);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = qs("#pUsername").value.trim();
    const email = qs("#pEmail").value.trim();

    if (username && username.length < 3) return setMsg(msg, "Username must be at least 3 characters.");

    try{
      await apiFetch("/users/profile", {
        method:"PUT",
        body: JSON.stringify({ username, email })
      });
      setMsg(msg, "Profile updated!", true);
      await refresh();
      await initNav("profile");
    }catch(err){
      setMsg(msg, err.message);
    }
  });

  refresh();
})();
