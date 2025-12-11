async function sendOrder() {
    const shopAddress = document.getElementById("shopAddress").value;
    const userAddress = document.getElementById("userAddress").value;
    const items = document.getElementById("items").value.split(",").map(t => t.trim());

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<p>Odesílám objednávku...</p>";

    try {
        const res = await fetch("http://localhost:3000/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                shopAddress,
                userAddress,
                items
            })
        });

        const data = await res.json();

        if (data.error) {
            resultDiv.innerHTML = `
            <div class="result">
                <b>Chyba:</b> ${data.error}
            </div>`;
            return;
        }

        resultDiv.innerHTML = `
        <div class="result">
            <h3>Objednávka vytvořena!</h3>
            <p><b>Vzdálenost:</b> ${data.distance} km</p>
            <p><b>Zvolené auto:</b> ${data.chosenCar.name}</p>
        </div>`;
    }
    catch (e) {
        resultDiv.innerHTML = `<div class="result"><b>Chyba připojení k backendu.</b></div>`;
    }
}
