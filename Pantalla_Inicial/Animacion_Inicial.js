// Generar teclas si existe el elemento piano
const piano = document.getElementById("piano");
document.body.addEventListener("click", () => {
    const audio = document.getElementById("background-audio");
    if (audio.paused) audio.play();
  }, { once: true });
if (piano) {
  for (let i = 0; i < 22; i++) {
    const key = document.createElement("div");
    key.classList.add("key");
    piano.appendChild(key);

    if (![0, 3, 7, 10, 14, 17, 21].includes(i)) {
      const blackKey = document.createElement("div");
      blackKey.classList.add("key", "black");
      key.appendChild(blackKey);
    }
  }
}

// Crear notas musicales en bucle
const notas = ["♪", "♫", "♬", "♩", "♭", "♯", "𝄞", "𝄢", "𝅘𝅥𝅮", "𝅘𝅥𝅯", "𝅘𝅥𝅰"];

function crearNotasMultiples() {
  for (let i = 0; i < 3; i++) {
    const note = document.createElement("div");
    note.className = "note";
    note.innerText = notas[Math.floor(Math.random() * notas.length)];
    note.style.left = Math.random() * 100 + "%";
    note.style.fontSize = `${Math.random() * 20 + 20}px`;
    note.style.bottom = "-40px";
    note.style.zIndex = "5";
    document.body.appendChild(note);

    setTimeout(() => {
      note.remove();
    }, 5000);
  }
}

// Bucle continuo de notas
setTimeout(() => {
  setInterval(crearNotasMultiples, 300);
}, 300);

function playClickSound() {
  const clickSound = document.getElementById("clickSound");
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.volume = 0.4; // volumen suave
    clickSound.play();
  }
}

function expandAndRedirect(event, color, url) {
  playClickSound(); // ✅ sonido al hacer clic

  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();

  const overlay = document.createElement("div");
  overlay.className = "color-overlay";
  overlay.style.width = "100px";
  overlay.style.height = "100px";
  overlay.style.background = color;
  overlay.style.left = `${rect.left + rect.width / 2}px`;
  overlay.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.transform = "scale(50)";
  });

  setTimeout(() => {
    window.location.href = url;
  }, 700);
}

// Evento al hacer clic
document.getElementById("modoLibre")?.addEventListener("click", function (e) {
  expandAndRedirect(e, "#d4f4d2", "/Juego/libre.html");
});

document.getElementById("modoMemoria")?.addEventListener("click", function (e) {
  expandAndRedirect(e, "#e9d1f4", "/Juego/memoria.html");
});

// ✅ Evento al pasar el mouse (hover)
document.getElementById("modoLibre")?.addEventListener("mouseenter", playClickSound);
document.getElementById("modoMemoria")?.addEventListener("mouseenter", playClickSound);
