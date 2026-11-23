
const formulario = document.getElementById("formContato");

formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;

    document.getElementById("resposta").textContent =
        "Obrigado pelo contato, " + nome + "! Sua mensagem foi registrada.";

    formulario.reset();
});
