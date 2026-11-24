
const curiosidades = [
    "A Finlândia possui milhares de lagos!",
    "A capital da Finlândia é Helsinque.",
    "A Finlândia é conhecida por suas saunas.",
    "O país fica localizado no norte da Europa.",
    "A aurora boreal pode ser observada na Finlândia.",
    "A Finlândia é conhecida por seus invernos frios."
];

function mostrarCuriosidade() {
    const numero = Math.floor(Math.random() * curiosidades.length);

    document.getElementById("curiosidade").textContent = curiosidades[numero];
}
