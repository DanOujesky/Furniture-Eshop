let cart = JSON.parse(localStorage.getItem("cart")) || [];

const PRODUCTS = {
  "Židle": {
    name: "Židle",
    dimensions: { width: 45, length: 45, height: 90 },
    weight: 6
  },
  "Police": {
    name: "Police",
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
  if (totalCount === 67 && !window.memeActive) {
    trigger67Meme();
  }
}

function removeOne(index) {
  if (cart[index].count > 1) {
    cart[index].count--;
  } else {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
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

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <div>
        <b>${item.name}</b><br>
        ${item.dimensions.width} × ${item.dimensions.length} × ${item.dimensions.height} cm<br>
        ${item.weight} kg / kus<br>
        Počet: <b>${item.count}</b>
      </div>

      <button class="danger" onclick="removeOne(${index})">
        −
      </button>
    `;

    cartItemsDiv.appendChild(div);
  });
}

function trigger67Meme() {
  const leftHand = document.createElement("img");
  leftHand.src = "img/LeftHand.png";
  leftHand.className = "hand left";

  const rightHand = document.createElement("img");
  rightHand.src = "img/RightHand.png";
  rightHand.className = "hand right";

  document.body.appendChild(leftHand);
  document.body.appendChild(rightHand);
  window.memeActive = true;

  document.body.classList.add("meme-shake");

  const bars = [];
  const barCount = Math.floor(Math.random() * 5) + 3;

  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement("div");
    bar.className = "rainbow-bar";
    bar.style.top = Math.random() * window.innerHeight + "px";
    bar.style.opacity = Math.random().toFixed(2);
    document.body.appendChild(bar);
    bars.push(bar);
  }

  setTimeout(() => {
  document.body.classList.remove("meme-shake");
  bars.forEach(bar => bar.remove());
  leftHand.remove();
  rightHand.remove();
  window.memeActive = false;
  }, 3000);
}


renderCart();
updateCartCount();

