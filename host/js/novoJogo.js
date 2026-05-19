let loadedQuiz = null;

function loadJSON() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Selecione um arquivo JSON.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            loadedQuiz = data;
            renderQuiz(data);
        } catch (err) {
            alert("JSON inválido.");
        }
    };

    reader.readAsText(file);
}

function renderQuiz(questions) {
    const container = document.getElementById("quizContainer");
    container.innerHTML = "";

    questions.forEach((q, qIndex) => {
        const card = document.createElement("div");
        card.className = "card shadow mb-4";

        const body = document.createElement("div");
        body.className = "card-body";

        const title = document.createElement("h5");
        title.innerText = `Pergunta #${qIndex + 1}`;
        body.appendChild(title);

        const questionText = document.createElement("p");
        questionText.innerText = q.question;
        body.appendChild(questionText);

        q.options.forEach((opt, index) => {
            const div = document.createElement("div");
            div.className = "option d-flex justify-content-between align-items-center";
            div.innerText = opt;

            if (index === q.correct) {
                div.classList.add("correct");

                const check = document.createElement("span");
                check.innerText = "✔";
                check.style.fontWeight = "bold";

                div.appendChild(check);
            }

            body.appendChild(div);
        });

        card.appendChild(body);
        container.appendChild(card);
    });

    const prosseguirBtn = document.createElement("button");
    prosseguirBtn.innerText = "Prosseguir";
    prosseguirBtn.className = "btn btn-success w-100 mb-3";
    prosseguirBtn.onclick = createRoom;

    container.appendChild(prosseguirBtn);
}

function createRoom() {
    if (!loadedQuiz) {
        alert("Carregue primeiro o quiz antes de prosseguir.");
        return;
    }

    const roomCode = generateRoomCode();
    sessionStorage.setItem("quizData", JSON.stringify(loadedQuiz));
    sessionStorage.setItem("quizRoomCode", roomCode);

    window.location.href = `salaDeEspera.html?code=${roomCode}`;
}

function generateRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}
