// cart.js
import { loadProducts } from './products.js';
import { updateCartBadge, updateCartButton } from "./ui.js";

export function addToCart(productSize, quantity) {
  let cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
  const existingIndex = cart.findIndex((item) => item.size === productSize);

  if (quantity > 0) {
    if (existingIndex >= 0) {
      cart[existingIndex].quantity = quantity;
    } else {
      cart.push({ size: productSize, quantity });
    }
  } else if (existingIndex >= 0) {
    cart.splice(existingIndex, 1);
  }

  sessionStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

export function renderCartModal() {
  const cartModalBody = document.getElementById("cartModalBody");
  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");

  if (cart.length === 0) {
    cartModalBody.innerHTML = "<p>Your cart is empty</p>";
    return;
  }

  cartModalBody.innerHTML = `
    <ul class="list-group">
      ${cart
        .map(
          (item) => `<li class="list-group-item d-flex justify-content-between">
        ${item.size} <span>${item.quantity} pcs</span>
      </li>`
        )
        .join("")}
    </ul>
  `;
}

export async function checkoutCart(apiUrl) {
  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
  const address = document.getElementById("deliveryAddress").value.trim();
  const userRole = sessionStorage.getItem("userRole");

  if (!address && userRole !== "admin") return alert("Please enter a delivery address");
  if (cart.length === 0) return alert("Your cart is empty");

  try {
    const token = sessionStorage.getItem("authToken");
    const endpoint =
      userRole === "admin"
        ? `${apiUrl}/admin/inventory/restock`
        : `${apiUrl}/user/orders`;
    const body =
      userRole === "admin" ? JSON.stringify(cart) : JSON.stringify({ address, items: cart });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();

    console.log("Order placed:", data);
    sessionStorage.removeItem("cart");
    updateCartBadge();
    const modal = bootstrap.Modal.getInstance(document.getElementById("cartModal"));
    modal.hide();
    alert("Order successfully placed!");
  } catch (err) {
    console.error(err);
    alert("Error placing order");
  }
  loadProducts();
}
