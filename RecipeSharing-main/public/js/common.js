const API = "/api";

/* ===== Helpers ===== */
function qs(s){ return document.querySelector(s); }
function qsa(s){ return [...document.querySelectorAll(s)]; }

function getToken(){ return localStorage.getItem("token"); }
function setToken(t){ t ? localStorage.setItem("token", t) : localStorage.removeItem("token"); }

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function setMsg(el, text, ok=false){
  if (!el) return;
  el.textContent = text || "";
  el.className = "msg " + (ok ? "ok" : "err");
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  headers["Content-Type"] = "application/json";

  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function requireAuthOrRedirect(){
  if (!getToken()) {
    window.location.href = "/index.html";
  }
}

async function initNav(active){
  const nav = qs("#navbar");
  if (!nav) return;

  nav.innerHTML = `
    <div class="nav">
      <div class="container nav__row">
        <a class="brand" href="/home.html">Recipe Sharing</a>

        <div class="nav__links">
          <a class="nav__link ${active==="home"?"active":""}" href="/home.html">Home</a>
          <a class="nav__link ${active==="create"?"active":""}" href="/create.html">Create</a>
          <a class="nav__link ${active==="profile"?"active":""}" href="/profile.html">Profile</a>
        </div>

        <button class="btn btn--ghost small" id="logoutBtn">Logout</button>
      </div>
    </div>
  `;

  qs("#logoutBtn").onclick = () => {
    setToken(null);
    window.location.href = "/index.html";
  };
}

function initFooter(){
  const footer = qs("#footer");
  if (!footer) return;

  footer.innerHTML = `
    <footer class="footer">
      <div class="container footer__row">
        <div class="footer__left">
          <b>Recipe Sharing App</b>
          <span class="sub">© ${new Date().getFullYear()}</span>
        </div>

        <div class="footer__right">
          <span class="sub">Node.js • Express • MongoDB</span>
        </div>
      </div>
    </footer>
  `;
}
