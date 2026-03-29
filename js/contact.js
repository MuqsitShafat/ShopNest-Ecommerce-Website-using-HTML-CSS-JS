/* ============================================================
   SHOPNEST — Contact Page Script (contact.js)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- FAQ Accordion ---- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      // Close all
      document.querySelectorAll('.faq-question').forEach(q => {
        q.setAttribute('aria-expanded', 'false');
        const a = q.nextElementSibling;
        if (a) a.hidden = true;
      });

      // Toggle clicked one
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        if (answer) answer.hidden = false;
      }
    });
  });

  /* ---- Character count for message ---- */
  const msgArea = document.getElementById('contact-message');
  const charCount = document.getElementById('char-count');
  const MAX_CHARS = 1000;

  msgArea?.addEventListener('input', () => {
    const len = msgArea.value.length;
    if (charCount) {
      charCount.textContent = `${len} / ${MAX_CHARS}`;
      charCount.style.color = len > MAX_CHARS * 0.9 ? '#ba1a1a' : 'var(--on-surface-var)';
    }
    if (len > MAX_CHARS) msgArea.value = msgArea.value.slice(0, MAX_CHARS);
  });

  /* ---- Form Validation & Submission ---- */
  const form = document.getElementById('contact-form');
  const successPanel = document.getElementById('contact-success');
  const successName = document.getElementById('success-name');
  const successEmail = document.getElementById('success-email');

  function showError(inputId, errId, msg) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (input) input.classList.add('error');
    if (err) err.textContent = msg;
    return false;
  }
  function clearError(inputId, errId) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (input) input.classList.remove('error');
    if (err) err.textContent = '';
  }

  // Live clear on input
  ['contact-firstname','contact-lastname','contact-email','contact-subject','contact-message'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      const errId = 'err-' + id.replace('contact-', '');
      clearError(id, errId);
    });
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const firstname = document.getElementById('contact-firstname')?.value.trim();
    const lastname  = document.getElementById('contact-lastname')?.value.trim();
    const email     = document.getElementById('contact-email')?.value.trim();
    const subject   = document.getElementById('contact-subject')?.value;
    const message   = document.getElementById('contact-message')?.value.trim();
    const consent   = document.getElementById('contact-consent')?.checked;

    if (!firstname) { showError('contact-firstname','err-firstname','First name is required'); valid = false; }
    else clearError('contact-firstname','err-firstname');

    if (!lastname) { showError('contact-lastname','err-lastname','Last name is required'); valid = false; }
    else clearError('contact-lastname','err-lastname');

    if (!email || !/\S+@\S+\.\S+/.test(email)) { showError('contact-email','err-email','Please enter a valid email address'); valid = false; }
    else clearError('contact-email','err-email');

    if (!subject) { showError('contact-subject','err-subject','Please select a topic'); valid = false; }
    else clearError('contact-subject','err-subject');

    if (!message || message.length < 10) { showError('contact-message','err-message','Message must be at least 10 characters'); valid = false; }
    else clearError('contact-message','err-message');

    if (!consent) {
      const err = document.getElementById('err-consent');
      if (err) err.textContent = 'You must agree to the privacy policy';
      valid = false;
    } else {
      const err = document.getElementById('err-consent');
      if (err) err.textContent = '';
    }

    if (!valid) return;

    /* Simulate submission */
    const submitBtn = document.getElementById('contact-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-icons" style="animation:spin 1s linear infinite">refresh</span> Sending…';

    setTimeout(() => {
      // Show success
      form.style.display = 'none';
      if (successPanel) {
        successPanel.classList.add('visible');
        if (successName) successName.textContent = firstname;
        if (successEmail) successEmail.textContent = email;
      }
    }, 1500);
  });

  /* ---- Spin animation for loader ---- */
  const style = document.createElement('style');
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);

});
