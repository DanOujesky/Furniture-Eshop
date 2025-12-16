let cart = JSON.parse(localStorage.getItem("cart")) || [];

const PRODUCTS = {
  "Židle": {
    name: "Židle",
    dimensions: { width: 45, length: 45, height: 90 },
    weight: 6
  },
  "Sedačka": {
    name: "Sedačka",
    dimensions: { width: 200, length: 90, height: 85 },
    weight: 60
  },
  "Postel": {
    name: "Postel",
    dimensions: { width: 180, length: 200, height: 50 },
    weight: 80
  },
  "Skříň": {
    name: "Skříň",
    dimensions: { width: 120, length: 60, height: 200 },
    weight: 90
  }
};

const cartCountSpan = document.getElementById("cartCount");

function updateCartCount() {
  if (cartCountSpan) {
    cartCountSpan.textContent = cart.length;
  }
}

function addToCart(productName) {
  const baseProduct = PRODUCTS[productName];
  if (!baseProduct) return;

  const product = {
    name: baseProduct.name,
    dimensions: {
      width: baseProduct.dimensions.width,
      length: baseProduct.dimensions.length,
      height: baseProduct.dimensions.height
    },
    weight: baseProduct.weight
  };

  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
}

function renderCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  if (!cartItemsDiv) return;

  cartItemsDiv.innerHTML = "";

  cart.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <b>${i + 1}. ${item.name}</b><br>
      ${item.dimensions.width} ×
      ${item.dimensions.length} ×
      ${item.dimensions.height} cm<br>
      ${item.weight} kg
    `;
    cartItemsDiv.appendChild(div);
  });
}

updateCartCount();
renderCart();
