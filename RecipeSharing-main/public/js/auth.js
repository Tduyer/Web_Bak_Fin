(async function(){
  await initNav("auth");

  const token = getToken();
  if (token) {
    window.location.href = "/recipes.html";
    return;
  }

  const tabLogin = qs("#tabLogin");
  const tabRegister = qs("#tabRegister");
  const formLogin = qs("#formLogin");
  const formRegister = qs("#formRegister");
  const msg = qs("#authMsg");

  function show(which){
    formLogin.classList.toggle("hidden", which !== "login");
    formRegister.classList.toggle("hidden", which !== "register");
    setMsg(msg, "");
  }

  tabLogin.addEventListener("click", () => show("login"));
  tabRegister.addEventListener("click", () => show("register"));

  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = qs("#regUsername").value.trim();
    const email = qs("#regEmail").value.trim();
    const password = qs("#regPassword").value;

    if (password.length < 6) return setMsg(msg, "Password must be at least 6 characters.");
    try{
      const data = await apiFetch("/auth/register", {
        method:"POST",
        body: JSON.stringify({ username, email, password })
      });
      setToken(data.token);
      setMsg(msg, "Registered successfully!", true);
      window.location.href = "/recipes.html";
    }catch(err){
      setMsg(msg, err.message);
    }
  });

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = qs("#loginEmail").value.trim();
    const password = qs("#loginPassword").value;

    try{
      const data = await apiFetch("/auth/login", {
        method:"POST",
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      setMsg(msg, "Logged in!", true);
      window.location.href = "/recipes.html";
    }catch(err){
      setMsg(msg, err.message);
    }
  });
})();
