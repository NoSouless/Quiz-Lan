let ws = null;
const STORAGE_ROOM = "quizRoomCode";
const STORAGE_NAME = "quizPlayerName";
const STORAGE_ID = "quizPlayerId";

window.addEventListener("load", () => {
    const codigoSalaInput = document.getElementById("codigoSalaInput");
    const nomeJogadorInput = document.getElementById("nomeJogadorInput");
    const entrarBtn = document.getElementById("entrarBtn");

    const storedRoomCode = sessionStorage.getItem(STORAGE_ROOM);
    const storedPlayerName = sessionStorage.getItem(STORAGE_NAME);

    function updateButtonState() {
        entrarBtn.disabled = !codigoSalaInput.value.trim() || !nomeJogadorInput.value.trim();
    }

    codigoSalaInput.addEventListener("input", updateButtonState);
    nomeJogadorInput.addEventListener("input", updateButtonState);
    updateButtonState();

    entrarBtn.addEventListener("click", () => {
        const codigoSala = codigoSalaInput.value.trim();
        const nomeJogador = nomeJogadorInput.value.trim();

        if (!codigoSala || !nomeJogador) {
            showMessage("Por favor, preencha ambos os campos.", true);
            return;
        }

        const playerId = sessionStorage.getItem(STORAGE_ID);
        attemptJoin(codigoSala, nomeJogador, playerId);
    });

    if (storedRoomCode && storedPlayerName) {
        const playerId = sessionStorage.getItem(STORAGE_ID);
        attemptJoin(storedRoomCode, storedPlayerName, playerId);
    }
});

function connectSocket() {
    ws = new WebSocket("ws://localhost:8765");

    ws.onerror = (error) => {
        console.error("Erro ao conectar ao WebSocket:", error);
        showMessage("Não foi possível conectar ao servidor. Tente novamente mais tarde.", true);
        return false;
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        } catch (err) {
            console.error("Mensagem inválida do servidor", err);
        }
    };

    return true;
}

function attemptJoin(codigoSala, nomeJogador, playerId) {
    if (!connectSocket()) {
        console.log("erro ao conectar ao WebSocket");
        return;
    }

    ws.onopen = () => {
        console.log("Conexão estabelecida com o servidor.");
        ws.send(JSON.stringify({
            type: "join_room",
            code: codigoSala,
            name: nomeJogador,
            playerId: playerId || undefined
        }));
    };
}

function handleServerMessage(data) {
    switch (data.type) {
        case "joined_room":
            sessionStorage.setItem(STORAGE_ROOM, data.code);
            sessionStorage.setItem(STORAGE_NAME, document.getElementById("nomeJogadorInput").value.trim());
            if (data.playerId) {
                sessionStorage.setItem(STORAGE_ID, data.playerId);
            }
            showMessage("Você entrou na sala com sucesso!", false);
            window.location.href = "salaDeEspera.html";
            break;
        case "error":
            showMessage(data.message || "Erro desconhecido.", true);
            break;
        default:
            console.warn("Tipo de mensagem desconhecido:", data);
    }
}

function showMessage(text, isError) {
    const element = document.getElementById("message");
    element.innerText = text;
    element.className = isError ? "text-center text-danger" : "text-center text-success";
}