// auth.js
import { showPageByRole } from "./ui.js";
import { loadProducts } from "./products.js";
import { fetchOrders } from "./orders.js";
import { apiUrl } from "./config.js";
import { connectNotifications } from "./notifications.js";


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
      const userName = data.userName;

      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("userRole", nRole);
      sessionStorage.setItem("userName", userName);

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("loginModal")
      );
      modal.hide();
      //  const loginBtn = document.querySelector('button[data-bs-toggle="modal"]');
      //  loginBtn.textContent = ` Login/Switch - ${sessionStorage.getItem('userRole')}`;

      showPageByRole(nRole);
      if (nRole === "admin" || nRole === "user") {
        loadProducts();
      }

      if (nRole === "courier" || nRole === "admin") {
        fetchOrders();
      }

      connectNotifications();
    } catch (err) {
      console.error(err);
      alert("❌ Ошибка сети");
    }

    checkLogin();
  });

}


export function setupLogout() {
  const logoutForm = document.getElementById("logout-btn");
  if (!logoutForm) return;


  logoutForm.addEventListener("click", async () => {
    console.log(logoutForm);

    try {
      /*  const response = await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
         // body: JSON.stringify({ username, password }),
        });
  
        if (!response.ok) {
          alert("❌ Ошибка: " + response.status);
          return;
        }*/

      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("userName");

      // const data = await response.json();


    } catch (err) {
      console.error(err);
      alert("❌ Ошибка ");
    }
    checkLogin();
  });

}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // exp в секундах, переводим в ms
    return Date.now() > exp;
  } catch (e) {
    return true; // если токен кривой — считаем истёкшим
  }
}

export function checkLogin() {

  const userRole = sessionStorage.getItem("userRole") || "user";
  const userName = sessionStorage.getItem("userName") || "";
  const token = sessionStorage.getItem("authToken");

  const loginBtn = document.querySelector('button[data-bs-toggle="modal"]');
  // loginBtn.textContent = ` Login`;

  ///Switch - ${sessionStorage.getItem('userRole')}
  const logoutBtn = document.getElementById("logout-btn");

  if (token && userRole && !isTokenExpired(token)) {
    // залогинен
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    logoutBtn.textContent = `Logout ${userName}`;
  } else {
    // токен истёк или его нет
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userRole");

    // не залогинен
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    loginBtn.textContent = "Login";
  }
}

