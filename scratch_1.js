
      /* ---- NAV SECTION SWITCH ---- */
      const sectionTitles = {
        dashboard: "Dashboard",
        orders: "Order Management",
        products: "Product Inventory",
        payments: "Payment Verification",
      };

      function showSection(name) {
        document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
        document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
        document.getElementById(`section-${name}`)?.classList.add("active");
        document.querySelector(`[data-section="${name}"]`)?.classList.add("active");
        document.getElementById("topbar-title").textContent = sectionTitles[name] || name;
      }

      /* ---- SIDEBAR TOGGLE ---- */
      document.getElementById("sidebar-toggle").addEventListener("click", () => {
        const sidebar = document.getElementById("sidebar");
        const main = document.getElementById("main-content");
        sidebar.classList.toggle("collapsed");
        main.classList.toggle("expanded");
      });

      /* ---- MODAL CLOSE ON OVERLAY CLICK ---- */
      document.getElementById("product-modal-overlay").addEventListener("click", function (e) {
        if (e.target === this) closeProductModal();
      });
    