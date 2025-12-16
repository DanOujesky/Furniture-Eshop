let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartCountSpan = document.getElementById("cartCount");
if (cartCountSpan) {
  cartCountSpan.textContent = cart.length;
}

function addToCart(item) {
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
  if (cartCountSpan) cartCountSpan.textContent = cart.length;
}

function renderCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  if (!cartItemsDiv) return;

  cartItemsDiv.innerHTML = "";
  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.textContent = `${index + 1}. ${item}`;
    cartItemsDiv.appendChild(div);
  });
}

renderCart();
