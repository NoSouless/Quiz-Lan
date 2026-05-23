window.addEventListener("load", () => {
    const roundData = JSON.parse(sessionStorage.getItem("roundData"));
    if (!roundData) {
        alert("Dados da rodada não encontrados. Retornando para a sala de espera.");
        window.location.href = "salaDeEspera.html";
        return;
    }

    const startTime = Date.now();
    const endTime = startTime + roundData.roundDurationMs;

    document.querySelector(".pergunta-texto").textContent = roundData.quiz[roundData.indexRound].question;
    document.getElementById("rodadaAtual").textContent = `${roundData.round}/${roundData.totalRounds}`;

    const alternativas = roundData.quiz[roundData.indexRound].options;
    const buttons = document.querySelectorAll(".alternativa-btn");

    buttons.forEach((btn, idx) => {
        if (idx >= alternativas.length) {
            btn.style.display = "none"; // esconde botões extras
            return;
        }
        btn.querySelector(".forma-icon").textContent = alternativas[idx];
        btn.onclick = () => {
            if(btn.disabled || btn.classList.contains("selected")) return;
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, roundData.roundDurationMs - elapsedTime);

            ws.send(JSON.stringify({
                type: "submit_answer",
                code: roundData.code,
                name: sessionStorage.getItem("quizPlayerName"),
                answer: idx,
                remainingTime: remainingTime,
            }));

            buttons.forEach(b => { // impede o jogador de responder novamente
                if (b !== btn)  b.disabled = true;
                else b.classList.add("selected");
            });
        };
    });

    const timerBar = document.querySelector('.timer-bar');
    if (!timerBar) return;

    timerBar.style.animationDuration = `${roundData.roundDurationMs / 1000}s`;

    timerBar.addEventListener('animationend', (e) => {
        buttons.forEach(function(btn, idx) {
            const texto = btn.querySelector(".forma-icon");
            const icon = idx == roundData.quiz[roundData.indexRound].correct ? "✓" : "✗";
            texto.textContent = texto.textContent + ` ${icon}`;
        });
    });

    ws = new WebSocket("ws://localhost:8765");
    ws.onerror = (error) => {
        console.error("Erro ao conectar ao WebSocket:", error);
        return false;
    };
    ws.onopen = () => {
        ws.send(JSON.stringify({
            "type": "rejoin_room",
            "code": sessionStorage.getItem("quizRoomCode"),
            "name": sessionStorage.getItem("quizPlayerName")
        }));
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        } catch (err) {
            console.error("Mensagem inválida do servidor", err);
        }
    };

    function handleServerMessage(data) {
        switch(data.type) {
            case "round_started":
                sessionStorage.setItem("roundData", JSON.stringify(data));
                break;
            case "rejoined_room":
                console.log("Reconectado à sala:", data);
                break;
            case "player_answer":
                console.log("Resposta:", data);
                break;
            case "round_ended":
                window.location.href = "salaDeEspera.html";
                break;
            case "game_over":
                sessionStorage.setItem("roundData", JSON.stringify(data));
                window.location.href = "/partida/placarFinal.html";
                break;
            case "error":
                alert(data.message || "Erro desconhecido.");
                break;
        }
    }
})