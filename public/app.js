const socket = io();
let currentOrderId = null;

socket.on("orderUpdate", data => {
  if (data.order_id === currentOrderId) {
    document.getElementById("result").innerHTML +=
      `<div>Stav objednávky: <b>${data.status}</b></div>`;
  }
});

async function sendOrder() {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const adress = document.getElementById("userAddress").value;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const resultDiv = document.getElementById("result");

  if (cart.length === 0) {
    resultDiv.innerHTML = "<b>Košík je prázdný!</b>";
    return;
  }

  resultDiv.innerHTML = "⏳ Odesílám objednávku...";

  const res = await fetch("/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: { firstName, lastName, email },
      adress,
      furniture: cart
    })
  });

  const data = await res.json();
  currentOrderId = data.order_id;

  resultDiv.innerHTML = `
    Objednávka vytvořena<br>
    ID: <b>${data.order_id}</b><br>
    Čekám na stav objednávky...
  `;

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
