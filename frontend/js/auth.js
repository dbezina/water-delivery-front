// auth.js
import { showPageByRole } from "./ui.js";
import { loadProducts } from "./products.js";
import { fetchOrders } from "./orders.js";
import { apiUrl } from "./config.js";

function normalizeRole(role) {
  switch (role) {
    case "ROLE_ADMIN":
      return "admin";
    case "ROLE_USER":
      return "user";
    case "ROLE_COURIER":
      return "courier";
    default:
      return null;
  }
}

export function setupLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        alert("❌ Ошибка: " + response.status);
        return;
      }

      const data = await response.json();
      const nRole = normalizeRole(data.userRole);

      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("userRole", nRole);

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("loginModal")
      );
      modal.hide();
      const loginBtn = document.querySelector('button[data-bs-toggle="modal"]');
      loginBtn.textContent = ` Login/Switch - ${sessionStorage.getItem('userRole')}`;

      showPageByRole(nRole);
      if (nRole === "admin" || nRole === "user") {
        loadProducts();
      }

      if (nRole === "courier" || nRole === "admin") {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Ошибка сети");
    }
  });
}
