const cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartList = document.getElementById("cartItems");
cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    cartList.appendChild(li);
});

async function sendOrder() {
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const adress = document.getElementById("userAddress").value;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<p>Odesílám objednávku...</p>";

    if (cart.length === 0) {
        resultDiv.innerHTML = "<b>Košík je prázdný!</b>";
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer: {
                    firstName,
                    lastName,
                    email
                },
                adress: adress,
                furniture: cart
            })
        });

        resultDiv.innerHTML = `
            <div class="result">
                <h3>Objednávka odeslána</h3>
                <p>Děkujeme za nákup</p>
            </div>
        `;
        localStorage.removeItem("cart");

    } catch (e) {
        resultDiv.innerHTML = "<b>Chyba při odesílání objednávky</b>";
    }
}
