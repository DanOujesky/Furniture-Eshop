const socket = io();
let currentOrderId = null;

socket.on("orderUpdate", (data) => {
  console.log("ORDER UPDATE:", data.status);

  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = data.status;
});


async function sendOrder() {
  const address = document.getElementById("userAddress").value;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const resultDiv = document.getElementById("result");

  if (cart.length === 0) {
    resultDiv.innerHTML = "<b>Košík je prázdný!</b>";
    return;
  }

  resultDiv.innerHTML = "Odesílám objednávku...";

  const res = await fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address,
      furniture: cart,
      socket_id: socket.id
    }),
  });

  if (!res.ok) {
    resultDiv.innerHTML = "<b>Chyba serveru</b>";
    return;
  }

  const data = await res.json();

  currentOrderId = data.order_id;

  localStorage.removeItem("cart");
}

function newOrder() {
  localStorage.removeItem("cart");

  document.getElementById("cartItems").innerHTML = "";
  document.getElementById("result").innerHTML = "";

  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("email").value = "";
  document.getElementById("userAddress").value = "";

  currentOrderId = null;
}
