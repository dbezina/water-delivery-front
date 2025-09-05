export function showPageByRole(role) {
    console.log(role);
    document.querySelectorAll(".role-section").forEach((div) => {
        div.style.display = "none";
    });

    const section = document.getElementById("role-" + role);
    console.log(section)
    if (section) section.style.display = "block";

    if (role === "user") {
        document.getElementById("deliveryAddress").style.display = "block";
    }
    if (role === "admin") {
        document.getElementById("deliveryAddress").style.display = "none";
    }
    document.getElementById("cartButton").style.display = role === "courier" ? "none" : "block";
}

export function updateCartBadge() {
    const cart = JSON.parse(sessionStorage.getItem("cart") || "[]");
    const cartBadge = document.getElementById("cartBadge");

    if (cart.length > 0) {
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalQuantity;
    } else {
        cartBadge.textContent = "";
    }
}

export function updateCartButton(btnCart, resetBtn, productId, quantity) {
    if (quantity > 0) {
        btnCart.classList.remove("btn-primary");
        btnCart.classList.add("btn-success");
        btnCart.textContent = "In Cart";
        resetBtn.style.display = "inline-block";
    } else {
        btnCart.classList.remove("btn-success");
        btnCart.classList.add("btn-primary");
        btnCart.textContent = "Add to Cart";
        resetBtn.style.display = "none";
    }
}
