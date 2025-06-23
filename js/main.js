// Script principal que coordina todos los módulos
import { PianoRenderer } from "./PianoRenderer.js"
import { AudioManager } from "./AudioManager.js"
import { GameLogic } from "./GameLogic.js"
import { FreePlayMode } from "./FreePlayMode.js"

class FairyTailPiano {
    constructor() {
        // Inicializar módulos
        this.audioManager = new AudioManager()
        this.pianoRenderer = new PianoRenderer()
        this.gameLogic = new GameLogic(this.pianoRenderer, this.audioManager)
        this.freePlayMode = new FreePlayMode(this.pianoRenderer, this.audioManager)

        // Configurar callbacks del piano
        this.pianoRenderer.setKeyPressCallback((keyIndex) => this.handlePianoKeyPress(keyIndex))
        this.pianoRenderer.setKeyReleaseCallback((keyIndex) => this.handlePianoKeyRelease(keyIndex))

        // Estado de la aplicación
        this.currentMode = "none" // 'memory' | 'free' | 'none'

        // Elementos del DOM
        this.memoryModeBtn = document.getElementById("memory-mode-btn")
        this.freeModeBtn = document.getElementById("free-mode-btn")
        this.gameStats = document.getElementById("game-stats")
        this.memoryControls = document.getElementById("memory-controls")
        this.freeControls = document.getElementById("free-controls")
        this.progressContainer = document.getElementById("progress-container")
        this.notesHistory = document.getElementById("notes-history")
        this.statusMessage = document.getElementById("status-message")

        this.init()
    }

    init() {
        this.setupEventListeners()
        this.pianoRenderer.createPiano()
        this.updateUI()
    }

    setupEventListeners() {
        // Botones de modo
        this.memoryModeBtn.addEventListener("click", () => this.switchToMemoryMode())
        this.freeModeBtn.addEventListener("click", () => this.switchToFreeMode())

        // Eventos de teclado globales
        document.addEventListener("keydown", (e) => this.handleGlobalKeyboard(e))
        document.addEventListener("keyup", (e) => this.handleGlobalKeyboardUp(e))
    }

    switchToMemoryMode() {
        this.currentMode = "memory"
        this.freePlayMode.deactivate()
        this.gameLogic.activate()
        this.updateUI()
        this.statusMessage.textContent = "¡Presiona INICIAR para comenzar el desafío!"
    }

    switchToFreeMode() {
        this.currentMode = "free"
        this.gameLogic.deactivate()
        this.freePlayMode.activate()
        this.updateUI()
        this.statusMessage.textContent = "🎵 ¡Toca libremente las teclas del piano!"
    }

    updateUI() {
        // Actualizar botones de modo
        this.memoryModeBtn.classList.toggle("active", this.currentMode === "memory")
        this.freeModeBtn.classList.toggle("active", this.currentMode === "free")

        // Mostrar/ocultar elementos según el modo
        if (this.currentMode === "memory") {
            this.gameStats.classList.remove("hidden")
            this.memoryControls.classList.remove("hidden")
            this.freeControls.classList.add("hidden")
            this.progressContainer.classList.remove("hidden")
            this.notesHistory.classList.add("hidden")
        } else if (this.currentMode === "free") {
            this.gameStats.classList.add("hidden")
            this.memoryControls.classList.add("hidden")
            this.freeControls.classList.remove("hidden")
            this.progressContainer.classList.add("hidden")
            this.notesHistory.classList.remove("hidden")
        } else {
            this.gameStats.classList.add("hidden")
            this.memoryControls.classList.add("hidden")
            this.freeControls.classList.add("hidden")
            this.progressContainer.classList.add("hidden")
            this.notesHistory.classList.add("hidden")
        }
    }

    handleGlobalKeyboard(event) {
        if (this.currentMode === "memory") {
            this.gameLogic.handleKeyboard(event)
        } else if (this.currentMode === "free") {
            this.freePlayMode.handleKeyboard(event)
        }
    }

    handleGlobalKeyboardUp(event) {
        if (this.currentMode === "memory") {
            this.gameLogic.handleKeyboardUp(event)
        } else if (this.currentMode === "free") {
            this.freePlayMode.handleKeyboardUp(event)
        }
    }

    // Agregar métodos para manejar clics del piano
    handlePianoKeyPress(keyIndex) {
        if (this.currentMode === "memory") {
            this.gameLogic.playKey(keyIndex)
        } else if (this.currentMode === "free") {
            this.freePlayMode.playKey(keyIndex)
        }
    }

    handlePianoKeyRelease(keyIndex) {
        if (this.currentMode === "memory") {
            this.pianoRenderer.releaseKey(keyIndex)
        } else if (this.currentMode === "free") {
            this.freePlayMode.releaseKey(keyIndex)
        }
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
    new FairyTailPiano()
})
