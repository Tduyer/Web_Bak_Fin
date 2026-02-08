const API = "/api";

let token = localStorage.getItem("token") || null;

const qs = (s) => document.querySelector(s);
const authMsg = qs("#authMsg");
const profileMsg = qs("#profileMsg");
const recipeMsg = qs("#recipeMsg");

function setMsg(el, text, ok = false) {
  el.textContent = text;
  el.style.color = ok ? "green" : "crimson";
}

function setUIAuthed(isAuthed) {
  qs("#btnLogout").classList.toggle("hidden", !isAuthed);
  qs("#formProfile").classList.toggle("hidden", !isAuthed);
  qs("#formRecipe").classList.toggle("hidden", !isAuthed);
  qs("#btnLoadRecipes").classList.toggle("hidden", !isAuthed);

  qs("#profileBox").classList.toggle("muted", !isAuthed);
  qs("#recipesList").classList.toggle("muted", !isAuthed);

  if (!isAuthed) {
    qs("#profileBox").textContent = "Login to see profile.";
    qs("#recipesList").textContent = "Login to view recipes.";
  }
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  if (token) headers.Authorization = `Bearer ${token}`;
  headers["Content-Type"] = "application/json";
  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// Tabs
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tab = btn.dataset.tab;
    qs("#formLogin").classList.toggle("hidden", tab !== "login");
    qs("#formRegister").classList.toggle("hidden", tab !== "register");
    authMsg.textContent = "";
  });
});

// Register
qs("#formRegister").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = qs("#regUsername").value.trim();
  const email = qs("#regEmail").value.trim();
  const password = qs("#regPassword").value;

  if (password.length < 6) return setMsg(authMsg, "Password must be at least 6 chars.");

  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password })
    });

    token = data.token;
    localStorage.setItem("token", token);
    setMsg(authMsg, "Registered + logged in!", true);
    setUIAuthed(true);
    await loadProfile();
    await loadRecipes();
  } catch (err) {
    setMsg(authMsg, err.message);
  }
});

// Login
qs("#formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = qs("#loginEmail").value.trim();
  const password = qs("#loginPassword").value;

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    token = data.token;
    localStorage.setItem("token", token);
    setMsg(authMsg, "Logged in!", true);
    setUIAuthed(true);
    await loadProfile();
    await loadRecipes();
  } catch (err) {
    setMsg(authMsg, err.message);
  }
});

// Logout
qs("#btnLogout").addEventListener("click", () => {
  token = null;
  localStorage.removeItem("token");
  setUIAuthed(false);
  setMsg(authMsg, "Logged out.", true);
  profileMsg.textContent = "";
  recipeMsg.textContent = "";
});

// Profile
async function loadProfile() {
  try {
    const data = await apiFetch("/users/profile");
    const u = data.user;

    qs("#profileBox").innerHTML = `
      <div><b>${u.username}</b></div>
      <div>${u.email}</div>
      <div class="muted">role: ${u.role}</div>
    `;

    qs("#profUsername").value = u.username;
    qs("#profEmail").value = u.email;
  } catch (err) {
    setMsg(profileMsg, err.message);
  }
}

qs("#formProfile").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = qs("#profUsername").value.trim();
  const email = qs("#profEmail").value.trim();

  if (username && username.length < 3) return setMsg(profileMsg, "Username must be at least 3 chars.");

  try {
    const data = await apiFetch("/users/profile", {
      method: "PUT",
      body: JSON.stringify({ username, email })
    });
    setMsg(profileMsg, "Profile updated!", true);
    const u = data.user;
    qs("#profileBox").innerHTML = `
      <div><b>${u.username}</b></div>
      <div>${u.email}</div>
      <div class="muted">role: ${u.role}</div>
    `;
  } catch (err) {
    setMsg(profileMsg, err.message);
  }
});

// Recipes
qs("#formRecipe").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = qs("#rTitle").value.trim();
  const description = qs("#rDesc").value.trim();

  const ingredients = qs("#rIngredients").value.split(",").map(s => s.trim()).filter(Boolean);
  const steps = qs("#rSteps").value.split("\n").map(s => s.trim()).filter(Boolean);
  const tags = qs("#rTags").value.split(",").map(s => s.trim()).filter(Boolean);

  const imageUrl = qs("#rImageUrl").value.trim();
  const isPublic = qs("#rPublic").checked;

  if (!title) return setMsg(recipeMsg, "Title is required.");
  if (ingredients.length < 1) return setMsg(recipeMsg, "At least 1 ingredient required.");
  if (steps.length < 1) return setMsg(recipeMsg, "At least 1 step required.");

  try {
    await apiFetch("/recipes", {
      method: "POST",
      body: JSON.stringify({ title, description, ingredients, steps, tags, imageUrl, isPublic })
    });
    setMsg(recipeMsg, "Recipe created!", true);
    e.target.reset();
    qs("#rPublic").checked = true;
    await loadRecipes();
  } catch (err) {
    setMsg(recipeMsg, err.message);
  }
});

qs("#btnLoadRecipes").addEventListener("click", loadRecipes);

async function loadRecipes() {
  try {
    const recipes = await apiFetch("/recipes");
    const box = qs("#recipesList");

    if (!recipes.length) {
      box.innerHTML = `<div class="muted">No recipes yet.</div>`;
      return;
    }

    box.innerHTML = recipes.map(r => `
      <div class="item">
        <h3>${escapeHtml(r.title)}</h3>
        <div class="meta">
          <span>${r.status}</span>
          <span>${r.isPublic ? "public" : "private"}</span>
          <span>${new Date(r.createdAt).toLocaleString()}</span>
        </div>
        <p>${escapeHtml(r.description || "")}</p>
        <div class="actions">
          <button class="btn btn--ghost small" data-act="view" data-id="${r._id}">View</button>
          <button class="btn btn--ghost small" data-act="delete" data-id="${r._id}">Delete</button>
        </div>
        <div class="muted" id="details-${r._id}" style="margin-top:10px;"></div>
      </div>
    `).join("");

    box.querySelectorAll("button[data-act]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;

        if (act === "delete") {
          if (!confirm("Delete recipe?")) return;
          try {
            await apiFetch(`/recipes/${id}`, { method: "DELETE" });
            setMsg(recipeMsg, "Deleted.", true);
            await loadRecipes();
          } catch (err) {
            setMsg(recipeMsg, err.message);
          }
        }

        if (act === "view") {
          try {
            const r = await apiFetch(`/recipes/${id}`);
            const details = qs(`#details-${id}`);
            details.innerHTML = `
              <b>Ingredients:</b> ${r.ingredients.map(escapeHtml).join(", ")}<br/>
              <b>Steps:</b>
              <ol>${r.steps.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
            `;
          } catch (err) {
            setMsg(recipeMsg, err.message);
          }
        }
      });
    });

  } catch (err) {
    setMsg(recipeMsg, err.message);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

// Init
setUIAuthed(!!token);
if (token) {
  loadProfile();
  loadRecipes();
}
