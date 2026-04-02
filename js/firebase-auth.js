import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5dKkXC0QzbtrzSsYoZY-V38Y3MS8WDIQ",
  authDomain: "shopnest-e2d57.firebaseapp.com",
  projectId: "shopnest-e2d57",
  storageBucket: "shopnest-e2d57.firebasestorage.app",
  messagingSenderId: "171603675621",
  appId: "1:171603675621:web:94dacd14762cc7494b870c",
  measurementId: "G-JT0986ELFP",
};

// Initialize Firebase — app MUST be initialized before getFirestore/getAuth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/* ============================================================
   AUTH MODAL (Email / Password)
   ============================================================ */
function showAuthModal() {
  let modal = document.getElementById("auth-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "auth-modal";
    modal.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(18,28,44,0.6);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;";
    modal.innerHTML = `
      <div style="background:#fff;padding:2.5rem;border-radius:16px;width:90%;max-width:400px;position:relative;box-shadow:0 10px 40px rgba(0,0,0,0.15);">
        <button id="auth-close" aria-label="Close" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:gray;">&#x2715;</button>
        <h3 id="auth-title" style="margin-top:0;margin-bottom:1.5rem;font-size:1.5rem;">Sign In</h3>
        <form id="auth-form" style="display:flex;flex-direction:column;gap:1.2rem;">
          <input type="email" id="auth-email" placeholder="Email Address" required style="padding:1rem;border:1px solid #eaeaea;border-radius:8px;width:100%;box-sizing:border-box;"/>
          <input type="password" id="auth-password" placeholder="Password" required minlength="6" style="padding:1rem;border:1px solid #eaeaea;border-radius:8px;width:100%;box-sizing:border-box;"/>
          <p id="auth-error" style="color:red;font-size:0.85rem;margin:0;display:none;"></p>
          <button type="submit" id="auth-submit" class="btn btn-primary btn-full" style="padding:1rem;">Sign In</button>
        </form>
        <p style="text-align:center;margin-top:1.5rem;font-size:0.95rem;">
          <span id="auth-switch-text">Don't have an account?</span> 
          <a href="#" id="auth-switch-btn" style="color:blue;font-weight:600;text-decoration:none;">Sign Up</a>
        </p>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("#auth-close").addEventListener("click", () => {
      modal.style.display = "none";
    });
    modal.querySelector("#auth-switch-btn").addEventListener("click", (e) => {
      e.preventDefault();
      const isLogin = document.getElementById("auth-submit").innerText === "Sign In";
      document.getElementById("auth-title").innerText = isLogin ? "Create Account" : "Sign In";
      document.getElementById("auth-submit").innerText = isLogin ? "Sign Up" : "Sign In";
      document.getElementById("auth-switch-text").innerText = isLogin
        ? "Already have an account?"
        : "Don't have an account?";
      document.getElementById("auth-switch-btn").innerText = isLogin ? "Sign In" : "Sign Up";
    });

    modal.querySelector("#auth-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("auth-email").value;
      const pass = document.getElementById("auth-password").value;
      const btn = document.getElementById("auth-submit");
      const errEl = document.getElementById("auth-error");
      const isLogin = btn.innerText === "Sign In";
      errEl.style.display = "none";
      btn.disabled = true;
      btn.textContent = "Please wait…";
      try {
        if (isLogin) await signInWithEmailAndPassword(auth, email, pass);
        else await createUserWithEmailAndPassword(auth, email, pass);
        modal.style.display = "none";
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = "block";
        btn.disabled = false;
        btn.textContent = isLogin ? "Sign In" : "Sign Up";
      }
    });
  }

  modal.style.display = "flex";
}

/* ============================================================
   BIND AUTH BUTTONS on the guest view (called each time the
   guest UI is rendered — both on initial load and after sign-out)
   ============================================================ */
function bindGuestButtons() {
  // We find buttons inside the CURRENT guest view in the DOM
  document.querySelectorAll(".account-guest-view").forEach((view) => {
    const buttons = view.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      // Avoid double-binding
      if (btn.dataset.authBound) return;
      btn.dataset.authBound = "1";

      if (btn.textContent.includes("Google")) {
        btn.addEventListener("click", async () => {
          try {
            btn.innerHTML = "Signing in…";
            btn.disabled = true;
            await signInWithPopup(auth, googleProvider);
          } catch (error) {
            console.error("Google Sign-In Error:", error.message);
            alert("Failed to sign in with Google. " + error.message);
            btn.innerHTML =
              '<img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style="width:16px;height:16px;" /> Continue with Google';
            btn.disabled = false;
          }
        });
      }

      if (btn.textContent.includes("Email")) {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          showAuthModal();
          const accountDropdown = document.getElementById("account-dropdown");
          if (accountDropdown) accountDropdown.classList.remove("open");
        });
      }
    });
  });
}

/* ============================================================
   INIT AUTH — watches auth state and updates header UI
   ============================================================ */
function initAuth() {
  // Bind buttons that already exist in the static HTML
  bindGuestButtons();

  onAuthStateChanged(auth, (user) => {
    const accountDropdownBody = document.querySelector(".account-dropdown-body");
    const headerAccountIcon = document.getElementById("btn-account");

    if (user) {
      // ---- User signed IN ----
      if (headerAccountIcon) {
        headerAccountIcon.innerHTML = `<span class="material-icons" style="color:var(--coral)">person</span>`;
      }
      if (accountDropdownBody) {
        accountDropdownBody.innerHTML = `
          <div style="padding:1rem;text-align:center;">
            <img src="${user.photoURL || "images/logo.png"}"
                 style="width:48px;height:48px;border-radius:50%;margin-bottom:0.5rem;object-fit:cover;" />
            <h4 style="margin:0;">${user.displayName || "User"}</h4>
            <p style="font-size:0.85rem;color:var(--text-light);margin-bottom:1rem;">${user.email}</p>
            <button id="btn-logout" class="btn btn-outline btn-full">Sign Out</button>
          </div>
        `;
        document.getElementById("btn-logout").addEventListener("click", () => {
          signOut(auth);
        });
      }
      sessionStorage.setItem("was_logged_in", "true");
    } else {
      // ---- User signed OUT ----
      if (headerAccountIcon) {
        headerAccountIcon.innerHTML = `<span class="material-icons">person_outline</span>`;
      }
      if (accountDropdownBody) {
        accountDropdownBody.innerHTML = `
          <div class="account-guest-view" id="account-guest-view">
            <p>Sign in to view your profile.</p>
            <button class="btn btn-primary btn-full">
              <span class="material-icons" style="font-size:16px;">email</span> Continue with Email
            </button>
            <button class="btn btn-outline btn-full" style="margin-top:0.5rem;">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style="width:16px;height:16px;" />
              Continue with Google
            </button>
          </div>
        `;
        // Bind the freshly created buttons
        bindGuestButtons();

        // If user just signed out (was logged in before), no full reload needed
        // The UI is already updated above
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAuth);
} else {
  initAuth();
}

// Export so other files (cart.js etc.) can import auth + db
export { auth, db };
