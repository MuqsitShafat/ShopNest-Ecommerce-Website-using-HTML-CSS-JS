
      import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
      import {
        getAuth,
        signInWithEmailAndPassword,
        onAuthStateChanged,
        signOut,
      } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
      import {
        getFirestore,
        collection,
        query,
        getDocs,
        addDoc,
        updateDoc,
        deleteDoc,
        doc,
        orderBy,
        where,
        onSnapshot,
      } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

      const firebaseConfig = {
        apiKey: "AIzaSyC5dKkXC0QzbtrzSsYoZY-V38Y3MS8WDIQ",
        authDomain: "shopnest-e2d57.firebaseapp.com",
        projectId: "shopnest-e2d57",
        storageBucket: "shopnest-e2d57.firebasestorage.app",
        messagingSenderId: "171603675621",
        appId: "1:171603675621:web:94dacd14762cc7494b870c",
        measurementId: "G-JT0986ELFP",
      };

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);

/*  */
      const ALLOWED_ADMIN_EMAIL = "shopnest260@gmail.com";

/*  */
      document.getElementById("admin-login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("admin-email").value.trim().toLowerCase();
        const pass = document.getElementById("admin-pass").value;
        const btn = document.getElementById("login-submit-btn");
        const err = document.getElementById("login-error");
        err.style.display = "none";

/*  */
        if (email !== ALLOWED_ADMIN_EMAIL) {
          err.textContent = "⛔ Access Denied. This account is not authorized.";
          err.style.display = "block";
          return;
        }

        btn.textContent = "Signing in…";
        btn.disabled = true;
        try {
          await signInWithEmailAndPassword(auth, email, pass);
        } catch (ex) {
/*  */
          if (ex.code === "auth/wrong-password" || ex.code === "auth/invalid-credential") {
            err.textContent = "❌ Incorrect password. Please try again.";
          } else if (ex.code === "auth/user-not-found") {
            err.textContent = "❌ No account found. Check the email address.";
          } else if (ex.code === "auth/too-many-requests") {
            err.textContent = "⚠️ Too many failed attempts. Try again later.";
          } else {
            err.textContent = ex.message;
          }
          err.style.display = "block";
          btn.textContent = "Sign In";
          btn.disabled = false;
        }
      });

/*  */
      onAuthStateChanged(auth, (user) => {
        if (user) {
/*  */
          if (user.email.toLowerCase() !== ALLOWED_ADMIN_EMAIL) {
            signOut(auth);
            const err = document.getElementById("login-error");
            err.textContent = "⛔ Access Denied. Only the designated admin account can access this panel.";
            err.style.display = "block";
            document.getElementById("login-screen").style.display = "flex";
            return;
          }
/*  */
          document.getElementById("login-screen").style.display = "none";
          document.getElementById("admin-display-name").textContent = user.displayName || "Admin";
          document.getElementById("admin-display-email").textContent = user.email;
          document.getElementById("admin-avatar-initials").textContent = "A";
          loadOrders();
          loadProducts();
        } else {
          document.getElementById("login-screen").style.display = "flex";
        }
      });

      document.getElementById("admin-logout").addEventListener("click", () => signOut(auth));

/*  */
      window._db = db;
      window._fs = { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, where, onSnapshot };

/*  */
      window.loadOrders = async function () {
        try {
          const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
          const snap = await getDocs(q);
          const orders = [];
          snap.forEach((d) => orders.push({ _id: d.id, ...d.data() }));
          window._allOrders = orders;
          renderDashboard(orders);
          renderOrders(orders);
          renderPayments(orders);
        } catch (err) {
          console.error("Failed to load orders:", err);
          showToast("Failed to load orders: " + err.message, "error");
        }
      };

      function renderDashboard(orders) {
        const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0);
        const pending = orders.filter((o) => o.status === "Pending").length;
        const shipped = orders.filter((o) => o.status === "Shipped").length;
        document.getElementById("stat-sales").textContent = `PKR ${totalSales.toLocaleString()}`;
        document.getElementById("stat-orders").textContent = orders.length;
        document.getElementById("stat-pending").textContent = pending;
        document.getElementById("stat-shipped").textContent = shipped;

        const recent = orders.slice(0, 8);
        const tbody = document.getElementById("dash-orders-body");
        if (recent.length === 0) {
          tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:2rem;">No orders yet.</td></tr>';
          return;
        }
        tbody.innerHTML = recent.map((o) => buildOrderRow(o, 7)).join("");
        attachStatusDropdowns();
      }

      function renderOrders(orders) {
        const tbody = document.getElementById("orders-body");
        if (orders.length === 0) {
          tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--text-muted);padding:2rem;">No orders found.</td></tr>';
          return;
        }
        tbody.innerHTML = orders.map((o) => buildOrderRow(o, 8)).join("");
        attachStatusDropdowns();
      }

      function buildOrderRow(o, cols) {
        const cust = o.customer || {};
        const date = o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-PK") : "—";
        const itemCount = (o.items || []).reduce((s, i) => s + i.qty, 0);
        const statusClass = "badge-" + (o.status || "pending").toLowerCase().replace(" ", "");
        const statusBadge = `<span class="badge ${statusClass}">${o.status || "Pending"}</span>`;
        const payBadge = o.paymentMethod === "Online Payment"
          ? `<span class="badge badge-processing">💳 Online</span>`
          : `<span class="badge badge-delivered">💵 COD</span>`;

        const statusSelect = `
          <select class="status-select" data-order-id="${o._id}" data-order-ref="${o._id}" onchange="updateOrderStatus(this)">
            ${["Pending","Processing","Shipped","Delivered","Cancelled"].map(s =>
              `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`
            ).join("")}
          </select>
        `;

        const rawPhone = (cust.phone || "").replace(/\D/g, "");
        const waPhone = rawPhone.startsWith("92") ? rawPhone : rawPhone.startsWith("0") ? "92" + rawPhone.slice(1) : "92" + rawPhone;
        const waIcon = waPhone.length > 5 ? `<a href="https://wa.me/${waPhone}" target="_blank" style="display:inline-flex;align-items:center;justify-content:center;color:#25d366;text-decoration:none;transition:transform 0.2s;" title="WhatsApp ${cust.name || 'customer'}"><svg style="width:24px;height:24px;fill:currentColor;" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.7c-33.1 0-65.5-8.9-94-25.8l-6.7-4-69.8 18.3L72 334.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 185.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg></a>` : "—";

        const actionBtn = `
          <button class="btn-admin btn-outline-admin" style="padding:0.4rem; border-radius:6px; margin: 0 auto;" onclick="printLabel('${o._id}')" title="Print Label">
            <span class="material-icons" style="font-size:18px;">print</span>
          </button>
        `;

        if (cols === 7) {
          return `<tr>
            <td><strong>${o.orderId || "—"}</strong></td>
            <td>${cust.name || "—"}</td>
            <td>${cust.phone || "—"}</td>
            <td style="text-align:center;">${waIcon}</td>
            <td>PKR ${(o.total || 0).toLocaleString()}</td>
            <td>${payBadge}</td>
            <td>${statusSelect}</td>
            <td>${date}</td>
            <td style="text-align:center;">${actionBtn}</td>
          </tr>`;
        }
        return `<tr>
          <td><strong>${o.orderId || "—"}</strong></td>
          <td>${cust.name || "—"}</td>
          <td>${cust.phone || "—"}</td>
          <td style="text-align:center;">${waIcon}</td>
          <td>${itemCount} item${itemCount !== 1 ? "s" : ""}</td>
          <td>PKR ${(o.total || 0).toLocaleString()}</td>
          <td>${payBadge}</td>
          <td>${statusSelect}</td>
          <td>${date}</td>
          <td style="text-align:center;">${actionBtn}</td>
        </tr>`;
      }

      function attachStatusDropdowns() {
/*  */
      }

      window.updateOrderStatus = async function (select) {
        const docId = select.dataset.orderRef;
        const newStatus = select.value;
        try {
          await updateDoc(doc(db, "orders", docId), { status: newStatus });
          showToast(`Order status updated to "${newStatus}" ✅`);
          await loadOrders();
        } catch (e) {
          showToast("Failed to update status: " + e.message, "error");
        }
      };

      window.printLabel = function(orderId) {
        const o = window._allOrders.find(x => x._id === orderId);
        if (!o) return;
        const cust = o.customer || {};
        
        let printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
          showToast("Popup blocked! Please allow popups for printing.", "error");
          return;
        }
        
        const content = `
          <html>
            <head>
              <title>Print Label - ${o.orderId || o._id}</title>
              <style>
                @page { size: auto; margin: 5mm; }
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #000; margin: 0; }
                .label-container { 
                  border: 2px dashed #000; 
                  padding: 24px; 
                  max-width: 450px; 
                  margin: 0 auto; 
                  border-radius: 12px;
                  box-sizing: border-box;
                }
                .label-header {
                  text-align: center;
                  border-bottom: 2px solid #000;
                  padding-bottom: 15px;
                  margin-bottom: 20px;
                }
                .label-header h2 {
                  margin: 0;
                  font-size: 24px;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                }
                .info-row { margin-bottom: 12px; font-size: 16px; display: flex; }
                .info-label { font-weight: bold; width: 140px; flex-shrink: 0; }
                .info-val { flex-grow: 1; }
                .amount-row {
                  margin-top: 20px;
                  padding-top: 15px;
                  border-top: 2px solid #000;
                  font-size: 20px;
                }
                .amount-val { font-weight: bold; font-size: 22px; }
                .print-btn-container { text-align: center; margin-top: 30px; }
                .print-btn {
                  padding: 12px 24px; 
                  font-size: 16px; 
                  cursor: pointer;
                  background: #6366f1;
                  color: #fff;
                  border: none;
                  border-radius: 8px;
                  font-weight: bold;
                }
                @media print {
                  body { padding: 0; background: #fff; }
                  .label-container { border: 2px solid #000; border-radius: 0; max-width: 100%; box-shadow: none; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div class="label-container">
                <div class="label-header">
                  <h2>Delivery Label</h2>
                  <div style="font-size:14px; margin-top:5px; color:#555;">Order #${o.orderId || o._id}</div>
                </div>
                <div class="info-row"><div class="info-label">Customer:</div> <div class="info-val">${cust.name || '—'}</div></div>
                <div class="info-row"><div class="info-label">Phone:</div> <div class="info-val">${cust.phone || '—'}</div></div>
                <div class="info-row"><div class="info-label">Address:</div> <div class="info-val">${cust.street || '—'}</div></div>
                <div class="info-row"><div class="info-label">City/Province:</div> <div class="info-val">${cust.city || '—'} / ${cust.province || '—'}</div></div>
                <div class="info-row amount-row">
                  <div class="info-label">Collect Amount:</div> 
                  <div class="info-val amount-val">PKR ${(o.total || 0).toLocaleString()}</div>
                </div>
                <div class="info-row" style="margin-top:5px; font-size:14px;">
                  <div class="info-label">Payment Type:</div> 
                  <div class="info-val"><strong>${o.paymentMethod || '—'}</strong></div>
                </div>
              </div>
              <div class="print-btn-container no-print">
                <button class="print-btn" onclick="window.print()">🖨️ Print Label</button>
              </div>
              <script>
                setTimeout(() => window.print(), 500);
              ${'</scr' + 'ipt>'}
            </body>
          </html>
        `;
        
        printWindow.document.write(content);
        printWindow.document.close();
      };

/*  */
      function renderPayments(orders) {
        const onlineOrders = orders.filter((o) => o.paymentMethod === "Online Payment" && o.status === "Pending");
        const container = document.getElementById("payments-list");
        if (onlineOrders.length === 0) {
          container.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:3rem;">
            <span class="material-icons" style="font-size:3rem;display:block;margin-bottom:0.5rem;">check_circle</span>
            No pending online payment orders to verify.
          </div>`;
          return;
        }
        container.innerHTML = onlineOrders.map((o) => {
          const cust = o.customer || {};
          const items = (o.items || []).slice(0, 3).map(i => i.name).join(", ");
/*  */
          const rawPhone = (cust.phone || "").replace(/\D/g, "");
          const waPhone = rawPhone.startsWith("92") ? rawPhone : rawPhone.startsWith("0") ? "92" + rawPhone.slice(1) : "92" + rawPhone;
          return `<div class="pay-verify-card">
            <div class="pay-verify-header">
              <div>
                <div class="pay-verify-id">${o.orderId || o._id}</div>
                <div class="pay-verify-meta">${cust.name || "—"} • ${cust.phone || "—"} • PKR ${(o.total || 0).toLocaleString()}</div>
              </div>
              <span class="badge badge-pending">⏳ Awaiting Verification</span>
            </div>
            <div class="pay-verify-items">🛍️ ${items}${(o.items || []).length > 3 ? " …" : ""}</div>
            <div class="pay-verify-actions">
              <button class="btn-admin btn-primary-admin" onclick="verifyPayment('${o._id}', 'Processing')">
                <span class="material-icons">check_circle</span> Payment Verified — Mark Processing
              </button>
              <button class="btn-admin btn-danger" onclick="verifyPayment('${o._id}', 'Cancelled')">
                <span class="material-icons">cancel</span> Cancel Order
              </button>
              <a href="https://wa.me/${waPhone}" target="_blank" class="btn-admin btn-outline-admin" title="WhatsApp ${cust.name || 'customer'} (${cust.phone || ''})">
                <span class="material-icons">chat</span> WhatsApp Customer
              </a>
            </div>
          </div>`;
        }).join("");
      }

      window.verifyPayment = async function (docId, newStatus) {
        try {
          await updateDoc(doc(db, "orders", docId), { status: newStatus });
          showToast(`Order marked as ${newStatus} ✅`);
          await loadOrders();
        } catch (e) {
          showToast("Failed: " + e.message, "error");
        }
      };

/*  */
      window.loadProducts = async function () {
        try {
          const snap = await getDocs(collection(db, "products"));
          const prods = [];
          snap.forEach((d) => prods.push({ _id: d.id, ...d.data() }));
          window._allProducts = prods;
          renderProducts(prods);
        } catch (err) {
          console.warn("Products collection may be empty:", err.message);
          window._allProducts = [];
          renderProducts([]);
        }
      };

      function renderProducts(prods) {
        const tbody = document.getElementById("products-body");
        if (prods.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">No products yet. Click "Add Product" to get started.</td></tr>';
          return;
        }
        tbody.innerHTML = prods.map((p) => `
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:0.75rem;">
                ${p.imageUrl ? `<img src="${p.imageUrl}" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" />` : `<div style="width:40px;height:40px;border-radius:8px;background:var(--surface2);display:flex;align-items:center;justify-content:center;"><span class="material-icons" style="font-size:18px;color:var(--text-muted);">image</span></div>`}
                <div>
                  <div style="font-weight:600;">${p.name || "—"}</div>
                  ${p.description ? `<div style="font-size:0.8rem;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.description}</div>` : ""}
                </div>
              </div>
            </td>
            <td><span class="badge badge-processing" style="text-transform:capitalize;">${p.category || "—"}</span></td>
            <td style="font-weight:700;">PKR ${(p.price || 0).toLocaleString()}</td>
            <td style="color:var(--text-muted);text-decoration:line-through;">${p.oldPrice ? `PKR ${Number(p.oldPrice).toLocaleString()}` : "—"}</td>
            <td><span class="badge ${p.stock === "In Stock" ? "badge-delivered" : p.stock === "Limited Stock" ? "badge-pending" : "badge-cancelled"}">${p.stock || "—"}</span></td>
            <td>${p.isNewArrival ? '<span class="badge badge-shipped">⭐ Yes</span>' : '<span style="color:var(--text-muted);">No</span>'}</td>
            <td>
              <div style="display:flex;gap:0.5rem;">
                <button class="btn-admin btn-outline-admin" onclick="editProduct('${p._id}')" title="Edit">
                  <span class="material-icons" style="font-size:16px;">edit</span>
                </button>
                <button class="btn-admin btn-danger" onclick="deleteProduct('${p._id}', '${p.name}')" title="Delete">
                  <span class="material-icons" style="font-size:16px;">delete</span>
                </button>
              </div>
            </td>
          </tr>
        `).join("");
      }

/*  */
      window.openProductModal = function () {
        document.getElementById("product-modal-title").textContent = "Add Product";
        document.getElementById("product-form").reset();
        document.getElementById("prod-doc-id").value = "";
        document.getElementById("product-modal-overlay").classList.add("open");
      };
      window.closeProductModal = function () {
        document.getElementById("product-modal-overlay").classList.remove("open");
      };

      window.saveProduct = async function (e) {
        e.preventDefault();
        const docId = document.getElementById("prod-doc-id").value;
        const data = {
          name: document.getElementById("prod-name").value.trim(),
          category: document.getElementById("prod-category").value,
          price: Number(document.getElementById("prod-price").value),
          oldPrice: Number(document.getElementById("prod-old-price").value) || null,
          imageUrl: document.getElementById("prod-image").value.trim() || null,
          stock: document.getElementById("prod-stock").value,
          rating: Number(document.getElementById("prod-rating").value) || 5,
          isNewArrival: document.getElementById("prod-new-arrival").checked,
          description: document.getElementById("prod-description").value.trim() || null,
          updatedAt: new Date().toISOString(),
        };
        try {
          if (docId) {
            await updateDoc(doc(db, "products", docId), data);
            showToast("Product updated successfully ✅");
          } else {
            data.createdAt = new Date().toISOString();
            await addDoc(collection(db, "products"), data);
            showToast("Product added successfully 🎉");
          }
          closeProductModal();
          loadProducts();
        } catch (err) {
          showToast("Error: " + err.message, "error");
        }
      };

      window.editProduct = function (id) {
        const p = window._allProducts.find((x) => x._id === id);
        if (!p) return;
        document.getElementById("product-modal-title").textContent = "Edit Product";
        document.getElementById("prod-doc-id").value = id;
        document.getElementById("prod-name").value = p.name || "";
        document.getElementById("prod-category").value = p.category || "";
        document.getElementById("prod-price").value = p.price || "";
        document.getElementById("prod-old-price").value = p.oldPrice || "";
        document.getElementById("prod-image").value = p.imageUrl || "";
        document.getElementById("prod-stock").value = p.stock || "In Stock";
        document.getElementById("prod-rating").value = p.rating || "";
        document.getElementById("prod-new-arrival").checked = !!p.isNewArrival;
        document.getElementById("prod-description").value = p.description || "";
        document.getElementById("product-modal-overlay").classList.add("open");
      };

      window.deleteProduct = async function (id, name) {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
          await deleteDoc(doc(db, "products", id));
          showToast(`"${name}" deleted ✅`);
          loadProducts();
        } catch (err) {
          showToast("Failed to delete: " + err.message, "error");
        }
      };

/*  */
      window.showToast = function (msg, type = "success") {
        const area = document.getElementById("toast-area");
        const t = document.createElement("div");
        t.className = `toast ${type}`;
        t.innerHTML = `<span class="material-icons">${type === "success" ? "check_circle" : "error"}</span> ${msg}`;
        area.appendChild(t);
        setTimeout(() => t.remove(), 3100);
      };

/*  */
      window.filterOrders = function () {
        const search = document.getElementById("orders-search").value.toLowerCase();
        const status = document.getElementById("orders-status-filter").value;
        let filtered = window._allOrders || [];
        if (status !== "all") filtered = filtered.filter((o) => o.status === status);
        if (search) {
          filtered = filtered.filter((o) => {
            const cust = o.customer || {};
            return (
              (o.orderId || "").toLowerCase().includes(search) ||
              (cust.name || "").toLowerCase().includes(search) ||
              (cust.phone || "").includes(search)
            );
          });
        }
        renderOrders(filtered);
      };

/*  */
      window.filterProducts = function () {
        const search = document.getElementById("products-search").value.toLowerCase();
        let filtered = window._allProducts || [];
        if (search) filtered = filtered.filter((p) => (p.name || "").toLowerCase().includes(search));
        renderProducts(filtered);
      };

/*  */
      document.getElementById("global-search").addEventListener("input", function () {
        const q = this.value.toLowerCase();
        showSection("orders");
        document.getElementById("orders-search").value = q;
        filterOrders();
      });
    