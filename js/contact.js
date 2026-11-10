/* ShopNest — contact.js: sends the contact form via WhatsApp */
(function () {
  "use strict";
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = form.elements;
    if (!f.name.value.trim() || !f.message.value.trim()) {
      window.SN.toast("Please enter your name and message", "error");
      return;
    }
    const text = `Hi ShopNest! 👋\n\n*Name:* ${f.name.value.trim()}\n*Topic:* ${f.topic.value}` +
      (f.order.value.trim() ? `\n*Order ID:* ${f.order.value.trim()}` : "") +
      `\n\n${f.message.value.trim()}`;
    window.open(`https://wa.me/${window.SN.RULES.wa}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
})();
