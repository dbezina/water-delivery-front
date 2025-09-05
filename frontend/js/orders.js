import { apiUrl } from "./config.js";
const ordersList = document.getElementById("ordersList");
const ordersListAdmin = document.getElementById("ordersListAdmin");

let orders = [];

export async function fetchOrders() {
  const userRole = sessionStorage.getItem("userRole");
  const token = sessionStorage.getItem("authToken");
  if (!token) return;

  try {
    const endpoint =
      userRole === "admin"
        ? `${apiUrl}/admin/delivery/assignments/all`
        : `${apiUrl}/courier/assignments/my`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to load orders");
    orders = await res.json();
    renderOrders();
  } catch (err) {
    console.error(err);
  }
}

async function updateOrderStatus(orderNo, newStatus) {
  const userRole = sessionStorage.getItem("userRole");
  const token = sessionStorage.getItem("authToken");
  const endpoint =
    userRole === "admin"
      ? `${apiUrl}/admin/delivery/${orderNo}/status`
      : `${apiUrl}/courier/${orderNo}/status`;

  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) throw new Error("Server error");
  const data = await res.json();
  return data.status;
}

export function renderOrders() {
  const userRole = sessionStorage.getItem("userRole");
  if (userRole === "courier") ordersList.innerHTML = "";
  if (userRole === "admin") ordersListAdmin.innerHTML = "";

  orders.forEach((order) => {
    const deliverFrom = new Date(order.deliverFrom).toLocaleString();
    const deliverTo = new Date(order.deliverTo).toLocaleString();

    const card = document.createElement("div");
    card.className = "card mb-3";

    // create select depending on role
    let selectHtml = "";
    if (userRole === "admin") {
      selectHtml = `
        <select class="form-select status-select" data-no="${order.orderNo}">
          <option ${order.status === "QUEUED" ? "selected" : ""}>QUEUED</option>
          <option ${order.status === "CONFIRMED" ? "selected" : ""}>CONFIRMED</option>
          <option ${order.status === "IN_ROUTE" ? "selected" : ""}>IN_ROUTE</option>
          <option ${order.status === "DELIVERED" ? "selected" : ""}>DELIVERED</option>
          <option ${order.status === "FAILED" ? "selected" : ""}>FAILED</option>
          <option ${order.status === "CANCELLED" ? "selected" : ""}>CANCELLED</option>
        </select>
      `;
    } else if (userRole === "courier") {
      selectHtml = `
        <select class="form-select status-select" data-no="${order.orderNo}" ${order.status === "DELIVERED" ? "disabled" : ""}>
          <option ${order.status === "QUEUED" ? "selected" : ""}>QUEUED</option>
          <option ${order.status === "IN_ROUTE" ? "selected" : ""}>IN_ROUTE</option>
          <option ${order.status === "DELIVERED" ? "selected" : ""}>DELIVERED</option>
          <option ${order.status === "FAILED" ? "selected" : ""}>FAILED</option>
        </select>
      `;
    }

    // create items list
    const itemsHtml = order.items
      .map((item) => `<li>${item.size} — ${item.quantity} pcs</li>`)
      .join("");

    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="card-title">Order #${order.orderNo}</h5>
            <p class="mb-1"><b>Address:</b> ${order.address}</p>
            <!-- <p class="mb-1"><b>From:</b> ${deliverFrom}</p>
            <p class="mb-1"><b>To:</b> ${deliverTo}</p> -->
            <p class="mb-1"><b>Status:</b> 
              <span class="badge ${
                order.status === "DELIVERED" ? "bg-success" :
                order.status === "CANCELLED" || order.status === "FAILED" ? "bg-danger" : "bg-info"
              }">${order.status}</span>
            </p>
            <ul class="mb-0"><b>Items:</b>${itemsHtml}</ul>
          </div>
          <div style="min-width: 180px;">${selectHtml}</div>
        </div>
      </div>
    `;

    if (userRole === "courier") ordersList.appendChild(card);
    if (userRole === "admin") ordersListAdmin.appendChild(card);

    const select = card.querySelector(".status-select");
    select.addEventListener("change", async (e) => {
      const newStatus = e.target.value;
      const confirmedStatus = await updateOrderStatus(order.orderNo, newStatus);
      if (confirmedStatus) {
        order.status = confirmedStatus;
        renderOrders();
      } else {
        e.target.value = order.status;
      }
    });
  });
}
