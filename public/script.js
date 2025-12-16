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
  if (!cartCountSpan) return;

  const totalCount = cart.reduce((sum, item) => sum + item.count, 0);
  cartCountSpan.textContent = totalCount;
}

function addToCart(productName) {
  const baseProduct = PRODUCTS[productName];
  if (!baseProduct) return;

  const existing = cart.find(item => item.name === productName);

  if (existing) {
    existing.count += 1;
  } else {
    cart.push({
      name: baseProduct.name,
      dimensions: {
        width: baseProduct.dimensions.width,
        length: baseProduct.dimensions.length,
        height: baseProduct.dimensions.height
      },
      weight: baseProduct.weight,
      count: 1
    });
  }

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
      ${item.weight} kg / kus<br>
      Počet: <b>${item.count}</b>
    `;
    cartItemsDiv.appendChild(div);
  });
}

updateCartCount();
renderCart();
