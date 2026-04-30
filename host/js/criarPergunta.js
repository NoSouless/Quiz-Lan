function createQuestion() {
    const container = document.getElementById("questionsContainer");
    
    const total = document.querySelectorAll("#questionsContainer .card").length;
    const numero = total + 1;

    const cardId = Date.now();

    const card = document.createElement("div");
    card.className = "card shadow mb-4";

    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
                <strong>Pergunta #${numero}</strong>
                <button type="button" class="btn btn-sm btn-danger remove-question">X</button>
            </div>

            <div class="mb-3">
                <input class="form-control question-input" placeholder="Digite a pergunta">
            </div>

            <div class="options"></div>

            <button type="button" class="btn btn-outline-secondary w-100 mb-2 add-option">
                + Adicionar alternativa
            </button>
        </div>
    `;

    card.querySelector(".remove-question").onclick = () => {
        if (confirm("Tem certeza que deseja excluir esta pergunta?")) {
            card.remove();
            updateAddButton();
        }
    };

    container.appendChild(card);

    const newTotal = document.querySelectorAll("#questionsContainer .card").length;

    const optionsDiv = card.querySelector(".options");
    let optionCount = 0;
    const maxOptions = 4;

    function addOption() {
    if (optionCount >= maxOptions) return;

    const div = document.createElement("div");
    div.className = "input-group mb-2";

    const input = document.createElement("input");
    input.className = "form-control";
    input.placeholder = "Alternativa";

    const radioId = "opt-" + Math.random();

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "correct-" + cardId;
    radio.id = radioId;

    const checkDiv = document.createElement("label");
    checkDiv.className = "input-group-text option-label";
    checkDiv.setAttribute("for", radioId);

    const checkBox = document.createElement("div");
    checkBox.className = "option-check";

    checkDiv.appendChild(radio);
    checkDiv.appendChild(checkBox);

    const btnRemove = document.createElement("button");
    btnRemove.type = "button";
    btnRemove.className = "btn btn-danger";
    btnRemove.innerText = "X";

    btnRemove.onclick = () => {
        div.remove();
        optionCount--;
        card.querySelector(".add-option").disabled = false;
    };

    div.appendChild(input);
    div.appendChild(checkDiv);
    div.appendChild(btnRemove);

    optionsDiv.appendChild(div);
    optionCount++;

    if (optionCount >= maxOptions) {
        card.querySelector(".add-option").disabled = true;
    }
}

    card.querySelector(".add-option").onclick = addOption;
}

createQuestion();

function exportJSON() {
    const cards = document.querySelectorAll(".card");

    const questions = [];

    cards.forEach(card => {
        const question = card.querySelector(".question-input").value;

        const inputs = card.querySelectorAll(".options input[type='text'], .options input:not([type='radio'])");
        const radios = card.querySelectorAll(".options input[type='radio']");

        const options = [];
        let correct = null;

        inputs.forEach((input, i) => {
            const value = input.value.trim();

            if (value !== "") {
                options.push(value);

                if (radios[i] && radios[i].checked) {
                    correct = options.length - 1;
                }
            }
        });

        if (question && options.length > 0) {
            questions.push({
                question,
                options,
                correct
            });
        }
    });

    const json = JSON.stringify(questions, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz.json";
    a.click();

    URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
    createQuestion();
    updateAddButton();
});
