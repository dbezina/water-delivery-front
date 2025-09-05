// products.js
import { apiUrl } from "./config.js";
import { addToCart, renderCartModal, checkoutCart } from "./cart.js";
import { updateCartBadge, updateCartButton } from "./ui.js";

const prodSection = document.getElementById("productsRow");
const prodSectionAdmin = document.getElementById("productsRowAdmin");

async function fetchProductsAvailable() {
  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("Authorization token is missing");

    const resp = await fetch(`${apiUrl}/admin/inventory`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Failed to load products: ${resp.status} ${resp.statusText} — ${errText}`);
    }

    return await resp.json();
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

export async function loadProducts() {
  const userRole = sessionStorage.getItem("userRole") || "user";
  updateCartBadge();
  let availableData = [];

  if (userRole === "admin") {
    availableData = await fetchProductsAvailable();
  }

  const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
  prodSection.innerHTML = "";
  prodSectionAdmin.innerHTML = "";

  const products = [
    { id: 0, size: "18L", title: "Water 18L", image: "img/bottle_18_1280.jpg", description: "Clean artesian water in bottles for coolers." },
    { id: 1, size: "5L", title: "Water 5L", image: "img/bottle_5_1280.jpg", description: "Convenient container for home and garden." },
    { id: 2, size: "1L", title: "Water 1L", image: "img/bottle_1.jpg", description: "Easy to take on the go." },
  ];

  products.forEach((product) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    col.innerHTML = `
      <div class="card shadow-sm h-100 d-flex flex-column">
        <img src="${product.image}" class="card-img-top product-img" alt="${product.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${product.title}</h5>
          ${
            userRole === "admin"
              ? `<p class="text-muted">Available: <b>${availableData.find(item => item.size === product.size)?.quantity || 0}</b></p>`
              : `<p class="card-text">${product.description}</p>`
          }
          <div class="mt-auto d-flex align-items-center gap-2">
            <div class="input-group" style="width: 120px;">
              <button class="btn btn-outline-secondary btn-decrease" type="button">-</button>
              <input type="text" class="form-control text-center quantity" value="${cart.find(item => item.size === product.size)?.quantity || 0}" readonly>
              <button class="btn btn-outline-secondary btn-increase" type="button">+</button>
            </div>
            <button class="btn btn-primary flex-shrink-0" data-id="${product.id}" data-size="${product.size}">Add to Cart</button>
            
            <button class="btn btn-outline-danger btn-reset flex-shrink-0" style="display:none;">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    if (userRole === "user") prodSection.appendChild(col);
    if (userRole === "admin") prodSectionAdmin.appendChild(col);

    const card = col.querySelector(".card");
    const input = card.querySelector(".quantity");
    const btnIncrease = card.querySelector(".btn-increase");
    const btnDecrease = card.querySelector(".btn-decrease");
    const btnCart = card.querySelector("button[data-id]");
    const resetBtn = card.querySelector(".btn-reset");

    btnIncrease.addEventListener("click", () => {
      input.value = parseInt(input.value) + 1;
    });

    btnDecrease.addEventListener("click", () => {
      if (parseInt(input.value) > 0) input.value = parseInt(input.value) - 1;
    });

    btnCart.addEventListener("click", () => {
      const size = btnCart.dataset.size;
      const quantity = parseInt(input.value);
      addToCart(size, quantity);
      updateCartButton(btnCart, resetBtn, size, quantity);

      if (quantity > 0) {
        btnIncrease.disabled = true;
        btnDecrease.disabled = true;
      }
    });

    resetBtn.addEventListener("click", () => {
      const size = btnCart.dataset.size;
      input.value = 0;
      addToCart(size, 0);
      updateCartButton(btnCart, resetBtn, size, 0);
      btnIncrease.disabled = false;
      btnDecrease.disabled = false;
    });

    const quantity = parseInt(input.value);
    updateCartButton(btnCart, resetBtn, product.id, quantity);
    if (quantity > 0) {
      btnIncrease.disabled = true;
      btnDecrease.disabled = true;
    }
  });
}

export function setupCart() {
  // open cart modal
  document.getElementById("cartButton").addEventListener("click", () => {
    renderCartModal();
    new bootstrap.Modal(document.getElementById("cartModal")).show();
  });

  document.getElementById("checkoutBtn").addEventListener("click", () => {
    checkoutCart(apiUrl);
  });
}
