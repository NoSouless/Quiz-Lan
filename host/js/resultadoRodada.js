let ws = null;

const statusText = document.getElementById("statusText");
const roundInfo = document.getElementById("roundInfo");
const btnEncerrarRodada = document.getElementById("btnEncerrarRodada");
const btnProximaRodada = document.getElementById("btnProximaRodada");
const btnEncerrarJogo = document.getElementById("btnEncerrarJogo");
const code = sessionStorage.getItem("quizRoomCode");

window.addEventListener("load", () => {
	const roundData = getRoundData();
	if (!roundData) {
		alert("Dados da rodada não encontrados. Retornando para a sala de espera.");
		window.location.href = "salaDeEspera.html";
	}

	if (!code) {
		alert("Código da sala não encontrado.");
		window.location.href = "salaDeEspera.html";
	}

	updateRoundInfo(roundData);
	connectSocket(code);
});

btnEncerrarRodada.addEventListener("click", () => {
	statusText.textContent = "Rodada encerrada. Pronto para iniciar a próxima.";
	btnEncerrarRodada.disabled = true;
	btnProximaRodada.disabled = false;

	ws.send(JSON.stringify({
		type: "end_round",
		code: code
	}));
});

btnProximaRodada.addEventListener("click", () => {
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		alert("Servidor indisponível. Recarregue a página.");
		return;
	}

	ws.send(JSON.stringify({
		type: "start_round",
		code: code
	}));

	statusText.textContent = "Iniciando próxima rodada...";
	btnProximaRodada.disabled = true;
});

btnEncerrarJogo.addEventListener("click", () => {
	window.location.href = "placarFinal.html";
});

function getRoundData() {
	try {
		return JSON.parse(sessionStorage.getItem("roundData"));
	} catch (error) {
		console.error("Falha ao ler roundData:", error);
		return null;
	}
}

function updateRoundInfo(roundData) {
	roundInfo.textContent = `Rodada ${roundData.round}/${roundData.totalRounds}`;
}

function updateStatusText(data) {
	if (data.type === "player_answer") {
		statusText.textContent = `Resposta recebida de ${data.name}: ${data.answer}`;
	}
}

function connectSocket(code) {
	ws = new WebSocket("ws://localhost:8765");

	ws.onopen = () => {
		console.log("Host conectado ao WebSocket na tela de resultado.");
		ws.send(JSON.stringify({
			type: "host_rejoin",
			code: code,
		}));
	};

	ws.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data);
			handleServerMessage(data);
		} catch (error) {
			console.error("Mensagem inválida do servidor:", error);
		}
	};

	ws.onerror = (error) => {
		console.error("Erro ao conectar no WebSocket:", error);
	};
}

function handleServerMessage(data) {
	switch (data.type) {
		case "round_started":
			sessionStorage.setItem("roundData", JSON.stringify(data));
			updateRoundInfo(data);
			statusText.textContent = "Esperando os Jogadores responderem...";
			btnEncerrarRodada.disabled = false;
			btnProximaRodada.disabled = true;
			break;
		case "game_over":
			window.location.href = "placarFinal.html";
			break;
		case "player_answer":
			console.log("Resposta recebida:", data);
			updateStatusText(data);
			break;
		case "round_ended":
			statusText.textContent = "Rodada encerrada. Aguardando para iniciar a próxima.";
			console.log("Rodada encerrada:", data);
			break;
		case "error":
			alert(data.message || "Erro desconhecido.");
			break;
		default:
			break;
	}
}
