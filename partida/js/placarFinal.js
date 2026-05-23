window.addEventListener("load", () => {
    const roundData = JSON.parse(sessionStorage.getItem("roundData"));
    if (!roundData) {
        alert("Dados da rodada não encontrados. Retornando para a sala de espera.");
        window.location.href = "salaDeEspera.html";
        return;
    }

    Object.entries(roundData.scores).forEach(([key, value]) => {
        const isFirstPlace = key === Object.keys(roundData.scores)[0];
        const row = document.createElement("div");
        row.classList.add("row", "justify-content-center", "mb-3");

        const col = document.createElement("div");
        col.classList.add("col-12", "col-md-8", "col-lg-6", "d-flex", "justify-content-between");
        if (isFirstPlace) col.classList.add("first-place");

        const name = document.createElement("h2");
        name.textContent = key;
        if (!isFirstPlace) name.classList.add("text-white");

        const score = document.createElement("h2");
        score.textContent = value;
        if (!isFirstPlace) score.classList.add("text-white");

        col.appendChild(name);
        col.appendChild(score);
        row.appendChild(col);
        document.querySelector(".container").appendChild(row);
    });
});