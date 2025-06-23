// Módulo para el modo libre de tocar piano
export class FreePlayMode {
    constructor(pianoRenderer, audioManager) {
        this.pianoRenderer = pianoRenderer
        this.audioManager = audioManager
        this.isActive = false
        this.playedNotes = []
        this.pressedKeys = new Set()

        // Elementos del DOM
        this.clearBtn = document.getElementById("clear-btn")
        this.octaveSelector = document.getElementById("octave-selector")
        this.playedNotesDisplay = document.getElementById("played-notes")

        this.setupEventListeners()
    }

    setupEventListeners() {
        this.clearBtn.addEventListener("click", () => this.clearHistory())
        this.octaveSelector.addEventListener("change", (e) => {
            this.pianoRenderer.setOctaveFilter(e.target.value)
        })
    }

    activate() {
        this.isActive = true
        this.clearHistory()
        this.pianoRenderer.createPiano()
    }

    deactivate() {
        this.isActive = false
        this.pressedKeys.clear()
    }

    handleKeyboard(event) {
        if (!this.isActive) return

        const key = event.key.toLowerCase()
        const keyIndex = this.pianoRenderer.getKeyFromKeyboard(key)

        if (keyIndex !== undefined && this.pianoRenderer.isKeyVisible(keyIndex)) {
            if (!this.pressedKeys.has(keyIndex)) {
                event.preventDefault()
                this.playKey(keyIndex)
                this.pressedKeys.add(keyIndex)
            }
        }
    }

    handleKeyboardUp(event) {
        if (!this.isActive) return

        const key = event.key.toLowerCase()
        const keyIndex = this.pianoRenderer.getKeyFromKeyboard(key)

        if (keyIndex !== undefined && this.pianoRenderer.isKeyVisible(keyIndex)) {
            event.preventDefault()
            this.releaseKey(keyIndex)
            this.pressedKeys.delete(keyIndex)
        }
    }

    playKey(keyIndex) {
        if (!this.isActive) return

        const keyData = this.pianoRenderer.getKeyData(keyIndex)

        // Efectos visuales
        this.pianoRenderer.pressKey(keyIndex)
        this.pianoRenderer.highlightKey(keyIndex, "highlight")

        // Audio
        this.audioManager.playNote(keyData.frequency, 1.5) // Duración más larga en modo libre

        // Registrar nota tocada
        this.addToHistory(keyData)
    }

    releaseKey(keyIndex) {
        this.pianoRenderer.releaseKey(keyIndex)
    }

    addToHistory(keyData) {
        const timestamp = new Date().toLocaleTimeString()
        this.playedNotes.push({
            note: keyData.note,
            octave: keyData.octave,
            timestamp: timestamp,
        })

        // Mantener solo las últimas 20 notas
        if (this.playedNotes.length > 20) {
            this.playedNotes.shift()
        }

        this.updateHistoryDisplay()
    }

    updateHistoryDisplay() {
        if (this.playedNotes.length === 0) {
            this.playedNotesDisplay.textContent = "Comienza a tocar para ver las notas..."
            return
        }

        const notesText = this.playedNotes
            .slice(-10) // Mostrar solo las últimas 10
            .map((note) => `${note.note}`)
            .join(" - ")

        this.playedNotesDisplay.innerHTML = `
            <div class="font-mono text-lg mb-2">${notesText}</div>
            <div class="text-sm text-gray-500">
                Última nota: ${this.playedNotes[this.playedNotes.length - 1].note} 
                (${this.playedNotes[this.playedNotes.length - 1].timestamp})
            </div>
            <div class="text-xs text-gray-400 mt-2">
                Total de notas tocadas: ${this.playedNotes.length}
            </div>
        `
    }

    clearHistory() {
        this.playedNotes = []
        this.updateHistoryDisplay()
    }

    // Funciones especiales para el modo libre
    playRandomMelody() {
        const visibleKeys = Array.from(document.querySelectorAll("[data-index]")).map((el) =>
            Number.parseInt(el.dataset.index),
        )

        const melodyLength = 5 + Math.floor(Math.random() * 5)
        const melody = []

        for (let i = 0; i < melodyLength; i++) {
            const randomKey = visibleKeys[Math.floor(Math.random() * visibleKeys.length)]
            melody.push(randomKey)
        }

        // Tocar la melodía con delay
        melody.forEach((keyIndex, index) => {
            setTimeout(() => {
                const keyData = this.pianoRenderer.getKeyData(keyIndex)
                this.pianoRenderer.highlightKey(keyIndex, "highlight")
                this.audioManager.playNote(keyData.frequency, 0.8)
                this.addToHistory(keyData)
            }, index * 300)
        })
    }

    playScale(startNote = 12) {
        const scaleNotes = [0, 2, 4, 5, 7, 9, 11, 12] // Escala mayor
        scaleNotes.forEach((interval, index) => {
            setTimeout(() => {
                const keyIndex = startNote + interval
                if (this.pianoRenderer.isKeyVisible(keyIndex)) {
                    const keyData = this.pianoRenderer.getKeyData(keyIndex)
                    this.pianoRenderer.highlightKey(keyIndex, "highlight")
                    this.audioManager.playNote(keyData.frequency, 0.6)
                    this.addToHistory(keyData)
                }
            }, index * 200)
        })
    }
}
