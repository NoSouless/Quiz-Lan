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
}
