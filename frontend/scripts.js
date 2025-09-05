import { showPageByRole } from "./js/ui.js";
import { loadProducts } from "./js/products.js";
import { fetchOrders } from "./js/orders.js";
import { connectNotifications } from "./js/notifications.js";
import { setupLogin } from "./js/auth.js";
import { setupCart } from "./js/products.js";

// инициализация при загрузке страницы

// ждём загрузки DOM
document.addEventListener("DOMContentLoaded", () => {
const userRole = sessionStorage.getItem("userRole") || "user";
showPageByRole(userRole);
if (userRole === 'admin' || userRole === 'user'){
    loadProducts(); 
}

if (userRole === 'courier' || userRole === 'admin') {
    fetchOrders();
}
connectNotifications();
setupLogin();
setupCart();
 const loginBtn = document.querySelector('button[data-bs-toggle="modal"]');
      loginBtn.textContent = ` Login/Switch - ${sessionStorage.getItem('userRole')}`;
});


