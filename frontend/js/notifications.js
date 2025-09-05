// notifications.js
import { apiUrl } from "./config.js";
export function connectNotifications(maxRetries = 5, retryDelay = 30000) {
  const token = sessionStorage.getItem("authToken");
  if (!token) return;
  let attempts = 0;
  let eventSource;
  // const eventSource = new EventSource(`${apiUrl}/notifications?token=${token}`);

  // eventSource.onopen = () => {console.log("🔔 SSE подключено");attempts = 0; };


   function startSSE() {
    attempts++;
    console.log(`🔌 Подключение SSE (попытка ${attempts})`);

    eventSource = new EventSource(`${apiUrl}/notifications?token=${token}`);

    eventSource.onopen = () => {
      console.log("🔔 SSE подключено");
      attempts = 0; // сбросить счетчик при успешном подключении
    };
     eventSource.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("📩 Пришло:", event.data)
      showToast(msg);
    } catch (e) {
      console.error("Ошибка парсинга сообщения:", e);
    }
  };

  eventSource.onerror = (err) => {
    console.error("❌ SSE ошибка:", err);
    eventSource.close();

     if (attempts < maxRetries) {
        console.log(`⏳ Повтор через ${retryDelay / 1000}с...`);
        setTimeout(startSSE, retryDelay);
      } else {
        console.error("🚫 SSE: достигнут лимит попыток");
      }
  };
  }
 
  startSSE();
}

function showToast(msg) {
  const toastContainer = document.getElementById("toastContainer");
  const toastId = `toast-${Date.now()}`;

  toastContainer.insertAdjacentHTML(
    "beforeend",
    `<div id="${toastId}" class="toast align-items-center text-bg-primary border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body"><b>${msg.orderId || ''}</b> ${msg.msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Закрыть"></button>
      </div>
    </div>`
  );

  const toastEl = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 5000 });
  bsToast.show();
  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}
