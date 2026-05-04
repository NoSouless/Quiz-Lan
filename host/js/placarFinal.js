/**
 * Renderiza o placar final com base em um array de dados (JSON)
 * @param {Array} jogadores - Lista de objetos { nome, pontos }
 */
function renderizarPlacar(jogadores) {
    const listaRanking = document.getElementById("ranking-lista");
    
    
    jogadores.sort((a, b) => b.pontos - a.pontos);

    
    listaRanking.innerHTML = "";

    jogadores.forEach((jogador, index) => {
        const item = document.createElement("li");
        
       
        item.className = "ranking-item";
        
        
        if (index === 0) {
            item.classList.add("vencedor");
        }

       
        item.innerHTML = `
            <span>${index + 1}º ${jogador.nome}</span>
            <span>${jogador.pontos} pts</span>
        `;

        listaRanking.appendChild(item);
    });
}


document.getElementById("btnNovoJogo").onclick = () => {
    if (confirm("Deseja reiniciar o fluxo e começar um novo jogo?")) {
        
        window.location.href = "index.html";
    }
};

// --- SIMULAÇÃO DE CARREGAMENTO DE DADOS ---
document.addEventListener("DOMContentLoaded", () => {
    const dadosExemplo = [
        { "nome": "Ana Clara", "pontos": 2900 },
        { "nome": "Carlos Alberto", "pontos": 2500 },
        { "nome": "Mariana Silva", "pontos": 2100 },
        { "nome": "João Pedro", "pontos": 1850 }
    ];

 
    renderizarPlacar(dadosExemplo);
});