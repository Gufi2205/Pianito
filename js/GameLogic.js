// Módulo para la lógica del juego de memoria
import { FairyTailPatterns } from "./FairyTailPatterns.js"

export class GameLogic {
    constructor(pianoRenderer, audioManager) {
        this.pianoRenderer = pianoRenderer
        this.audioManager = audioManager
        this.fairyTailPatterns = new FairyTailPatterns()

        // Estado del juego
        this.score = 0
        this.level = 1
        this.lives = 3
        this.currentPattern = []
        this.userPattern = []
        this.isShowingPattern = false
        this.isUserTurn = false
        this.gameStarted = false
        this.currentSongIndex = 0
        this.isActive = false

        // Elementos del DOM
        this.scoreElement = document.getElementById("score")
        this.levelElement = document.getElementById("level")
        this.livesElement = document.getElementById("lives")
        this.statusMessage = document.getElementById("status-message")
        this.startBtn = document.getElementById("start-btn")
        this.replayBtn = document.getElementById("replay-btn")
        this.progressFill = document.getElementById("progress-fill")
        this.gameOverModal = document.getElementById("game-over-modal")
        this.finalScore = document.getElementById("final-score")
        this.finalLevel = document.getElementById("final-level")
        this.restartBtn = document.getElementById("restart-btn")

        this.setupEventListeners()
    }

    setupEventListeners() {
        this.startBtn.addEventListener("click", () => this.startGame())
        this.replayBtn.addEventListener("click", () => this.showPattern())
        this.restartBtn.addEventListener("click", () => this.restartGame())
    }

    activate() {
        this.isActive = true
        this.updateDisplay()
    }

    deactivate() {
        this.isActive = false
        this.gameStarted = false
        this.isUserTurn = false
        this.isShowingPattern = false
        clearTimeout(this.submitTimeout)
    }

    startGame() {
        if (!this.isActive) return

        this.gameStarted = true
        this.score = 0
        this.level = 1
        this.lives = 3
        this.currentSongIndex = 0
        this.updateDisplay()

        this.pianoRenderer.createPiano(1) // Nivel 1 restricción
        this.generateNewPattern()
    }

    generateNewPattern() {
        if (!this.isActive) return

        this.currentPattern = []
        this.userPattern = []

        const songData = this.fairyTailPatterns.getPattern(this.level, this.currentSongIndex)
        this.currentPattern = [...songData.pattern]

        this.showCurrentSong(songData)
        this.showPattern()
    }

    showCurrentSong(songData) {
        const originalMessage = this.statusMessage.textContent
        this.statusMessage.textContent = `Tocando: ${songData.name}`

        setTimeout(() => {
            if (!this.isShowingPattern && !this.isUserTurn) {
                this.statusMessage.textContent = originalMessage
            }
        }, 2000)
    }

    async showPattern() {
        if (!this.isActive) return

        this.isShowingPattern = true
        this.isUserTurn = false
        this.statusMessage.textContent = "👀 Observa el patrón..."
        this.startBtn.style.display = "none"
        this.replayBtn.style.display = "none"

        await this.delay(1000)

        for (let i = 0; i < this.currentPattern.length; i++) {
            const element = this.currentPattern[i]
            await this.highlightElement(element)
            await this.delay(400)
        }

        this.isShowingPattern = false
        this.isUserTurn = true
        this.statusMessage.textContent = "🎹 ¡Ahora toca tú la melodía!"
        this.replayBtn.style.display = "inline-block"
        this.updateProgress()
    }

    async highlightElement(element) {
        // Resaltar visualmente
        element.forEach((keyIndex) => {
            this.pianoRenderer.highlightKey(keyIndex, "highlight")
        })

        // Reproducir sonidos
        const frequencies = element.map((keyIndex) => this.pianoRenderer.getKeyData(keyIndex).frequency)
        this.audioManager.playChord(frequencies, 0.7)

        await this.delay(700)
    }

    handleKeyboard(event) {
        if (!this.isActive || !this.isUserTurn) return

        const key = event.key.toLowerCase()
        const keyIndex = this.pianoRenderer.getKeyFromKeyboard(key)

        if (keyIndex !== undefined && this.pianoRenderer.isKeyVisible(keyIndex)) {
            event.preventDefault()
            this.playKey(keyIndex)
        }
    }

    handleKeyboardUp(event) {
        if (!this.isActive) return

        const key = event.key.toLowerCase()
        const keyIndex = this.pianoRenderer.getKeyFromKeyboard(key)

        if (keyIndex !== undefined && this.pianoRenderer.isKeyVisible(keyIndex)) {
            event.preventDefault()
            this.pianoRenderer.releaseKey(keyIndex)
        }
    }

    playKey(keyIndex) {
        if (!this.isActive || !this.isUserTurn) return

        this.pianoRenderer.pressKey(keyIndex)
        const keyData = this.pianoRenderer.getKeyData(keyIndex)
        this.audioManager.playNote(keyData.frequency)

        // Lógica del patrón del usuario
        if (this.userPattern.length === 0 || this.userPattern[this.userPattern.length - 1].submitted) {
            this.userPattern.push({ keys: [keyIndex], submitted: false })
        } else {
            const currentElement = this.userPattern[this.userPattern.length - 1]
            if (!currentElement.keys.includes(keyIndex)) {
                currentElement.keys.push(keyIndex)
                currentElement.keys.sort((a, b) => a - b)
            }
        }

        clearTimeout(this.submitTimeout)
        this.submitTimeout = setTimeout(() => {
            this.submitCurrentElement()
        }, 600)
    }

    submitCurrentElement() {
        if (this.userPattern.length === 0 || this.userPattern[this.userPattern.length - 1].submitted) {
            return
        }

        const currentElement = this.userPattern[this.userPattern.length - 1]
        currentElement.submitted = true
        this.checkUserInput()
    }

    checkUserInput() {
        const currentIndex = this.userPattern.filter((el) => el.submitted).length - 1
        const expectedElement = this.currentPattern[currentIndex]
        const userElement = this.userPattern[currentIndex].keys

        const isCorrect = this.arraysEqual(expectedElement, userElement)

        if (isCorrect) {
            this.showElementFeedback(userElement, true)
            this.updateProgress()

            if (this.userPattern.filter((el) => el.submitted).length === this.currentPattern.length) {
                this.patternCompleted()
            }
        } else {
            this.showElementFeedback(userElement, false)
            this.showElementFeedback(expectedElement, true)
            this.patternFailed()
        }
    }

    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false
        return arr1.every((val, index) => val === arr2[index])
    }

    showElementFeedback(element, isCorrect) {
        const className = isCorrect ? "correct" : "wrong"
        element.forEach((keyIndex) => {
            this.pianoRenderer.highlightKey(keyIndex, className)
        })
    }

    patternCompleted() {
        this.isUserTurn = false
        this.score += this.level * 20

        this.statusMessage.textContent = `🎉 ¡Nivel ${this.level} completado! ¡Melodía perfecta!`
        setTimeout(() => {
            this.level++
            this.currentSongIndex = 0
            this.updateDisplay()

            if (this.level === 2) {
                this.pianoRenderer.createPiano() // Mostrar todas las octavas
            }

            this.generateNewPattern()
        }, 2500)
    }

    patternFailed() {
        this.isUserTurn = false
        this.lives--
        this.updateDisplay()

        if (this.lives <= 0) {
            this.gameOver()
        } else {
            this.statusMessage.textContent = `❌ Melodía incorrecta. Vidas restantes: ${this.lives}`
            setTimeout(() => {
                this.userPattern = []
                this.showPattern()
            }, 2000)
        }
    }

    updateProgress() {
        const submittedElements = this.userPattern.filter((el) => el.submitted).length
        const progress = (submittedElements / this.currentPattern.length) * 100
        this.progressFill.style.width = `${progress}%`
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score
        this.levelElement.textContent = this.level
        this.livesElement.textContent = this.lives
    }

    gameOver() {
        this.gameStarted = false
        this.statusMessage.textContent = "💀 ¡Juego terminado! ¡Pero la música de Fairy Tail vive para siempre!"
        this.finalScore.textContent = this.score
        this.finalLevel.textContent = this.level
        this.gameOverModal.style.display = "flex"
    }

    restartGame() {
        this.gameOverModal.style.display = "none"
        this.startBtn.style.display = "inline-block"
        this.replayBtn.style.display = "none"
        this.statusMessage.textContent = "¡Presiona INICIAR para comenzar!"
        this.progressFill.style.width = "0%"
        this.gameStarted = false
        this.isUserTurn = false
        this.isShowingPattern = false
        this.currentSongIndex = 0
        clearTimeout(this.submitTimeout)
    }

    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}
