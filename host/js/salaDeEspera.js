const query = new URLSearchParams(window.location.search);
const roomCode = query.get("code");
const isHost = !!sessionStorage.getItem("quizData");
const quizData = sessionStorage.getItem("quizData");

let ws = null;

window.addEventListener("load", () => {
    if (!roomCode) {
        showMessage("Código da sala não encontrado.", true);
        return;
    }

    document.getElementById("roomCode").innerText = roomCode;

    connectSocket();
});

function connectSocket() {
    ws = new WebSocket("ws://localhost:8765");

    ws.onopen = () => {
        showMessage("Conexão estabelecida com o servidor.", false);

        if (isHost) {
            if (!quizData) {
                showMessage("Quiz não encontrado. Volte para a página anterior e carregue o arquivo novamente.", true);
                return;
            }

            const payload = {
                type: "create_room",
                code: roomCode,
                quiz: JSON.parse(quizData)
            };

            ws.send(JSON.stringify(payload));
        }
    };

    ws.onmessage = (event) => {
        try {
            console.log(event.data);
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        } catch (err) {
            console.error("Mensagem inválida do servidor", err);
        }
    };

    ws.onclose = () => {
        showMessage("Conexão perdida. Recarregue a página para tentar novamente.", true);
        setRoomStatus("Desconectado");
        setStartButton(false);
    };

    ws.onerror = () => {
        showMessage("Erro na conexão com o servidor.", true);
    };
}

function handleServerMessage(data) {
    switch (data.type) {
        case "room_created":
            setRoomStatus(data.open ? "Aberta" : "Fechada");
            setPlayers(data.players || []);
            setStartButton(data.open);
            sessionStorage.setItem("currentPlayers", JSON.stringify(data.players || []));
            showMessage("Sala criada. Aguardando jogadores.", false);
            break;
        case "room_update":
            setRoomStatus(data.open ? "Aberta" : "Fechada");
            setPlayers(data.players || []);
            setStartButton(data.open);
            sessionStorage.setItem("currentPlayers", JSON.stringify(data.players || []));
            showMessage(data.open ? "Sala aberta." : "Sala fechada. Nenhum jogador pode entrar.", false);
            break;
        case "joined_room":
            console.log("Jogador entrou:", data);
            setRoomStatus(data.open ? "Aberta" : "Fechada");
            setPlayers(data.players || []);
            showMessage("Jogador entrou na sala.", false);
            break;
        // case "room_closed":
        //     setRoomStatus("Fechada");
        //     setStartButton(false);
        //     showMessage("A sala foi fechada. Nenhum jogador pode entrar.", true);
        //     window.location.href = "rodada.html";
        //     break;
        case "round_started":
            showMessage("A rodada foi iniciada.", false);
            sessionStorage.setItem("roundData", JSON.stringify(data));
            // window.location.href = "rodada.html";
            break;
        case "error":
            showMessage(data.message || "Erro desconhecido.", true);
            break;
        default:
            console.warn("Tipo de mensagem desconhecido:", data);
    }
}

function setPlayers(players) {
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";

    if (!players.length) {
        const item = document.createElement("li");
        item.className = "list-group-item text-muted";
        item.innerText = "Ainda não há jogadores.";
        playerList.appendChild(item);
        return;
    }

    players.forEach((player) => {
        const item = document.createElement("li");
        item.className = "list-group-item";
        item.innerText = typeof player === "string" ? player : player.name;
        playerList.appendChild(item);
    });
}

function setRoomStatus(value) {
    document.getElementById("roomStatus").innerText = value;
}

function setStartButton(enabled) {
    const button = document.getElementById("startButton");
    button.disabled = !enabled;
}

// function sendCloseRoom() {
//     if (!ws || ws.readyState !== WebSocket.OPEN) {
//         showMessage("Servidor indisponível. Recarregue a página.", true);
//         return;
//     }

//     ws.send(JSON.stringify({
//         type: "close_room",
//         code: roomCode
//     }));
// }

function showMessage(text, isError) {
    const element = document.getElementById("message");
    element.innerText = text;
    element.className = isError ? "text-center text-danger" : "text-center text-success";
}

function sendStartRound() {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        showMessage("Servidor indisponível. Recarregue a página.", true);
        return;
    }

    ws.send(JSON.stringify({
        type: "start_round",
        code: roomCode
    }));
}