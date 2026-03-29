import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Your web app's Firebase configuration from the screenshot
const firebaseConfig = {
  apiKey: "AIzaSyC5dKkXC0QzbtrzSsYoZY-V38Y3MS8WDIQ",
  authDomain: "shopnest-e2d57.firebaseapp.com",
  projectId: "shopnest-e2d57",
  storageBucket: "shopnest-e2d57.firebasestorage.app",
  messagingSenderId: "171603675621",
  appId: "1:171603675621:web:94dacd14762cc7494b870c",
  measurementId: "G-JT0986ELFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize the Auth UI
function showAuthModal() {
  let modal = document.getElementById('auth-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(18,28,44,0.6);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;">
        <div style="background:#fff;padding:2.5rem;border-radius:16px;width:90%;max-width:400px;position:relative;box-shadow:0 10px 40px rgba(0,0,0,0.15);">
          <button id="auth-close" aria-label="Close" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-light);">&times;</button>
          <h3 id="auth-title" style="margin-top:0;margin-bottom:1.5rem;font-size:1.5rem;color:var(--text-dark);">Sign In</h3>
          <form id="auth-form" style="display:flex;flex-direction:column;gap:1.2rem;">
            <input type="email" id="auth-email" placeholder="Email Address" required style="padding:1rem;border:1px solid #eaeaea;border-radius:8px;font-family:inherit;font-size:1rem;width:100%;box-sizing:border-box;"/>
            <input type="password" id="auth-password" placeholder="Password" required minlength="6" style="padding:1rem;border:1px solid #eaeaea;border-radius:8px;font-family:inherit;font-size:1rem;width:100%;box-sizing:border-box;"/>
            <p id="auth-error" style="color:var(--coral);font-size:0.85rem;margin:0;display:none;"></p>
            <button type="submit" id="auth-submit" class="btn btn-primary btn-full" style="padding:1rem;">Sign In</button>
          </form>
          <p style="text-align:center;margin-top:1.5rem;font-size:0.95rem;color:var(--text-light);">
            <span id="auth-switch-text">Don't have an account?</span> 
            <a href="#" id="auth-switch-btn" style="color:var(--primary);font-weight:600;text-decoration:none;">Sign Up</a>
          </p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = document.getElementById('auth-close');
    const form = document.getElementById('auth-form');
    const switchBtn = document.getElementById('auth-switch-btn');
    const title = document.getElementById('auth-title');
    const submitBtn = document.getElementById('auth-submit');
    const switchText = document.getElementById('auth-switch-text');
    const errorMsg = document.getElementById('auth-error');
    
    let isLogin = true;

    const resetForm = () => {
      form.reset();
      errorMsg.style.display = 'none';
      isLogin = true;
      title.innerText = 'Sign In';
      submitBtn.innerText = 'Sign In';
      switchText.innerText = "Don't have an account?";
      switchBtn.innerText = 'Sign Up';
    };

    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      resetForm();
    });
    
    switchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      title.innerText = isLogin ? 'Sign In' : 'Create Account';
      submitBtn.innerText = isLogin ? 'Sign In' : 'Sign Up';
      switchText.innerText = isLogin ? "Don't have an account?" : "Already have an account?";
      switchBtn.innerText = isLogin ? 'Sign Up' : 'Sign In';
      errorMsg.style.display = 'none';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value;
      const pass = document.getElementById('auth-password').value;
      errorMsg.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerText = 'Please wait...';

      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, pass);
        } else {
          await createUserWithEmailAndPassword(auth, email, pass);
        }
        modal.style.display = 'none';
        resetForm();
      } catch (err) {
        errorMsg.innerText = err.message.replace('Firebase: ', '');
        errorMsg.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = isLogin ? 'Sign In' : 'Sign Up';
      }
    });
  }
  
  modal.style.display = 'flex';
}

function initAuth() {
  // Grab the Continue with Google button
  // We identify it by its text content or image since it doesn't have an ID yet
  const authButtons = document.querySelectorAll('.account-guest-view .btn');
  let googleBtn = null;
  let emailBtn = null;

  authButtons.forEach(btn => {
    if (btn.textContent.includes('Google')) googleBtn = btn;
    if (btn.textContent.includes('Email')) emailBtn = btn;
  });

  // Google Sign In trigger
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        googleBtn.innerHTML = 'Signing in...';
        googleBtn.disabled = true;
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log("Logged in gracefully: ", user.displayName);
        // Will handle UI changes in the observer below
      } catch (error) {
        console.error("Authentication Error: ", error.message);
        alert("Failed to sign in. " + error.message);
        googleBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style="width:16px; height:16px;" /> Continue with Google';
        googleBtn.disabled = false;
      }
    });
  }

  // Email Sign In trigger
  if (emailBtn) {
    emailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showAuthModal();
      // Dropdown close gracefully
      const accountDropdown = document.getElementById('account-dropdown');
      if (accountDropdown) accountDropdown.classList.remove('open');
    });
  }

  // Listen to auth state changes to update the Header UI
  onAuthStateChanged(auth, (user) => {
    const accountDropdownBody = document.querySelector('.account-dropdown-body');
    const headerAccountIcon = document.getElementById('btn-account');
    
    if (user) {
      // User is signed in
      if (headerAccountIcon) {
        headerAccountIcon.innerHTML = `<span class="material-icons" style="color:var(--coral)">person</span>`;
      }
      if (accountDropdownBody) {
        accountDropdownBody.innerHTML = `
          <div style="padding: 1rem; text-align: center;">
            <img src="${user.photoURL || 'images/logo.png'}" style="width:48px;height:48px;border-radius:50%;margin-bottom:0.5rem;object-fit:cover;" />
            <h4 style="margin:0;">${user.displayName || 'User'}</h4>
            <p style="font-size:0.85rem; color:var(--text-light); margin-bottom:1rem;">${user.email}</p>
            <button id="btn-logout" class="btn btn-outline btn-full">Sign Out</button>
          </div>
        `;
        document.getElementById('btn-logout').addEventListener('click', () => {
          signOut(auth);
        });
      }
    } else {
      // User is signed out
      if (headerAccountIcon) {
        headerAccountIcon.innerHTML = `<span class="material-icons">person_outline</span>`;
      }
      if (accountDropdownBody) {
        // Restore Guest UI
        accountDropdownBody.innerHTML = `
          <div class="account-guest-view" id="account-guest-view">
            <p>Sign in to view your profile and manage orders.</p>
            <button class="btn btn-primary btn-full"><span class="material-icons" style="font-size:16px;">email</span> Continue with Email</button>
            <button class="btn btn-outline btn-full" style="margin-top:0.5rem;"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style="width:16px; height:16px;" /> Continue with Google</button>
          </div>
        `;
        // Full page reload handles rebinding correctly
        if (sessionStorage.getItem('was_logged_in')) {
           window.location.reload();
        }
      }
    }
    
    if (user) {
      sessionStorage.setItem('was_logged_in', 'true');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
