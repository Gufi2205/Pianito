class PianoGame {
  constructor() {
    // Configuración básica
    this.keys = this.generateKeys()
    this.currentlyPressedKeys = new Set()
    this.keyPressTimeout = null
    this.inputBuffer = []

    this.keyboardMap = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
      7: 6,
      8: 7,
      9: 8,
      0: 9,
      q: 10,
      w: 11,
      e: 12,
      r: 13,
      t: 14,
      y: 15,
      u: 16,
      i: 17,
      o: 18,
      p: 19,
      a: 20,
      s: 21,
      d: 22,
      f: 23,
      g: 24,
      h: 25,
      j: 26,
      k: 27,
      l: 28,
      z: 29,
      x: 30,
      c: 31,
      v: 32,
      b: 33,
      n: 34,
      m: 35,
    }

    // Estado del juego
    this.score = 0
    this.level = 1
    this.lives = 3
    this.pattern = []
    this.userInput = []
    this.isPlaying = false
    this.gameStarted = false
    this.hasError = false
    this.isTransitioning = false
    this.waitingForInput = false

    // Elementos DOM
    this.scoreEl = document.getElementById("score")
    this.levelEl = document.getElementById("level")
    this.livesEl = document.getElementById("lives")
    this.statusEl = document.getElementById("status-message")
    this.startBtn = document.getElementById("start-btn")
    this.replayBtn = document.getElementById("replay-btn")
    this.progressEl = document.getElementById("progress-fill")
    this.modalEl = document.getElementById("game-over-modal")
    this.finalScoreEl = document.getElementById("final-score")
    this.restartBtn = document.getElementById("restart-btn")
    this.backBtn = document.getElementById("back-button")

    // Audio
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    this.init()
  }

  generateKeys() {
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const baseFreq = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.0, 415.3, 440.0, 466.16, 493.88]
    const keys = []

    for (let octave = 1; octave <= 3; octave++) {
      notes.forEach((note, i) => {
        keys.push({
          note: `${note}${octave}`,
          type: note.includes("#") ? "black" : "white",
          frequency: baseFreq[i] * Math.pow(2, octave - 2),
        })
      })
    }
    return keys
  }

  init() {
    this.createPiano()
    this.setupEvents()
    this.updateDisplay()
    this.pianoEl = document.getElementById("piano")
    this.pianoEl.classList.add("piano-disabled")
  }


  createPiano() {
    const piano = document.getElementById("piano")
    piano.innerHTML = ""

    // Determinar rango de teclas según el nivel
    let startIndex, endIndex
    if (this.level === 1) {
      startIndex = 0
      endIndex = 11
    } else if (this.level === 2) {
      startIndex = 0
      endIndex = 23
    } else {
      startIndex = 0
      endIndex = 35
    }

    // Crear solo las teclas del rango correspondiente
    for (let index = startIndex; index <= endIndex; index++) {
      const key = this.keys[index]
      const keyEl = document.createElement("div")
      const keyboardKey = Object.keys(this.keyboardMap).find((k) => this.keyboardMap[k] === index) || ""

      if (key.type === "white") {
        keyEl.className =
          "piano-key white-key w-12 h-40 mx-0.5 rounded-b-lg cursor-pointer flex flex-col items-center justify-between"
        keyEl.innerHTML = `
          <div class="px-2 py-1 rounded text-xs font-bold mt-2">${keyboardKey.toUpperCase()}</div>
          <div class="px-2 py-1 rounded text-sm font-bold mb-3">${key.note}</div>
        `
      } else {
        keyEl.className =
          "piano-key black-key w-8 h-24 -mx-4 z-10 rounded-b-lg cursor-pointer flex flex-col items-center justify-between"
        keyEl.innerHTML = `
          <div class="text-white text-xs font-bold mt-1 px-1">${keyboardKey.toUpperCase()}</div>
          <div class="text-white text-xs font-bold mb-2 px-1">${key.note}</div>
        `
      }

      keyEl.dataset.index = index
      keyEl.addEventListener("mousedown", () => this.handleMouseKey(index, true))
      keyEl.addEventListener("mouseup", () => this.handleMouseKey(index, false))
      piano.appendChild(keyEl)
    }
  }

  handleMouseKey(index, isPressed) {
    if (!this.gameStarted || this.isPlaying || this.hasError || this.isTransitioning) return

    if (isPressed) {
      this.currentlyPressedKeys.add(index)
      this.playSound(this.keys[index].frequency)
      this.updateKeyVisual(index, true)
    } else {
      this.currentlyPressedKeys.delete(index)
      this.updateKeyVisual(index, false)

      if (this.currentlyPressedKeys.size === 0) {
        this.processInput()
      }
    }
  }

  setupEvents() {
    this.startBtn.addEventListener("click", () => this.startGame())
    this.replayBtn.addEventListener("click", () => this.showPattern())
    this.restartBtn.addEventListener("click", () => this.restartGame())

    this.backBtn.addEventListener("click", () => {
      // Cambiar según tu estructura de archivos
      window.location.href = "/Pantalla_Inicial/Botones.html"
    })

    document.addEventListener("keydown", (e) => {
      if (!this.gameStarted || this.isPlaying || this.hasError || this.isTransitioning) {
        e.preventDefault()
        return
      }

      const key = e.key.toLowerCase()
      const index = this.keyboardMap[key]

      if (index !== undefined && this.isKeyAvailable(index) && !this.currentlyPressedKeys.has(index)) {
        e.preventDefault()
        this.currentlyPressedKeys.add(index)
        this.playSound(this.keys[index].frequency)
        this.updateKeyVisual(index, true)

        // Limpiar timeout anterior si existe
        if (this.keyPressTimeout) {
          clearTimeout(this.keyPressTimeout)
        }

        // Configurar timeout según el nivel
        const timeoutDelay = this.level === 1 ? 50 : 200 // Más rápido para nivel 1
        this.keyPressTimeout = setTimeout(() => {
          this.processInput()
        }, timeoutDelay)
      }
    })

    document.addEventListener("keyup", (e) => {
      if (!this.gameStarted || this.isPlaying || this.hasError || this.isTransitioning) {
        e.preventDefault()
        return
      }

      const key = e.key.toLowerCase()
      const index = this.keyboardMap[key]

      if (index !== undefined && this.isKeyAvailable(index)) {
        this.currentlyPressedKeys.delete(index)
        this.updateKeyVisual(index, false)

        // Si no hay teclas presionadas, procesar inmediatamente
        if (this.currentlyPressedKeys.size === 0) {
          if (this.keyPressTimeout) {
            clearTimeout(this.keyPressTimeout)
          }
          this.processInput()
        }
      }
    })
  }

  updateKeyVisual(index, pressed) {
    const keyEl = document.querySelector(`[data-index="${index}"]`)
    if (keyEl) {
      if (pressed) {
        keyEl.classList.add("pressed")
      } else {
        keyEl.classList.remove("pressed")
      }
    }
  }

  processInput() {
    if (this.inputBuffer.length > 0) return // Evitar procesamiento múltiple

    const pressedKeys = Array.from(this.currentlyPressedKeys).sort((a, b) => a - b)

    if (pressedKeys.length === 0) return

    // Validar según el nivel
    let isValidInput = false
    let inputToRecord = null

    if (this.level === 1) {
      // Nivel 1: Solo una tecla
      isValidInput = pressedKeys.length === 1
      inputToRecord = pressedKeys[0]
    } else if (this.level === 2) {
      // Nivel 2: Exactamente dos teclas
      isValidInput = pressedKeys.length === 2
      inputToRecord = pressedKeys
    } else if (this.level === 3) {
      // Nivel 3: Una o dos teclas (según el patrón esperado)
      const expectedPattern = this.pattern[this.userInput.length]
      if (Array.isArray(expectedPattern)) {
        // Se espera combinación doble
        isValidInput = pressedKeys.length === 2
        inputToRecord = pressedKeys
      } else {
        // Se espera tecla individual
        isValidInput = pressedKeys.length === 1
        inputToRecord = pressedKeys[0]
      }
    }

    if (isValidInput) {
      this.inputBuffer.push(inputToRecord)
      this.userInput.push(inputToRecord)
      this.checkInput()

      // Limpiar buffer después de un breve delay
      setTimeout(() => {
        this.inputBuffer = []
      }, 100)
    } else {
      // Entrada inválida
      this.showInvalidInput(pressedKeys)
      this.patternFailed()
    }

    // Limpiar teclas presionadas
    this.currentlyPressedKeys.clear()
    this.clearAllPressedKeys()
  }

  showInvalidInput(keys) {
    keys.forEach((index) => {
      const keyEl = document.querySelector(`[data-index="${index}"]`)
      if (keyEl) {
        keyEl.classList.add("wrong")
        setTimeout(() => keyEl.classList.remove("wrong"), 500)
      }
    })
  }

  clearAllPressedKeys() {
    const allKeys = document.querySelectorAll(".piano-key")
    allKeys.forEach((keyEl) => {
      keyEl.classList.remove("pressed")
    })
  }

  startGame() {
    this.gameStarted = true
    this.score = 0
    this.level = 1
    this.hasError = false
    this.updateDisplay()
    this.generatePattern()
  }

  generatePattern() {
    this.pattern = []
    this.userInput = []
    this.inputBuffer = []
    const length = 3 + this.level

    let maxIndex
    if (this.level === 1) {
      maxIndex = 11
      // Nivel 1: solo teclas individuales
      for (let i = 0; i < length; i++) {
        this.pattern.push(Math.floor(Math.random() * (maxIndex + 1)))
      }
    } else if (this.level === 2) {
      maxIndex = 23
      // Nivel 2: solo combinaciones dobles
      for (let i = 0; i < length; i++) {
        const index1 = Math.floor(Math.random() * (maxIndex + 1))
        let index2 = index1
        while (index2 === index1) {
          index2 = Math.floor(Math.random() * (maxIndex + 1))
        }
        this.pattern.push([index1, index2].sort((a, b) => a - b))
      }
    } else {
      maxIndex = 35
      // Nivel 3: mezcla de individuales y dobles
      for (let i = 0; i < length; i++) {
        if (Math.random() < 0.5) {
          // Tecla individual
          this.pattern.push(Math.floor(Math.random() * (maxIndex + 1)))
        } else {
          // Combinación doble
          const index1 = Math.floor(Math.random() * (maxIndex + 1))
          let index2 = index1
          while (index2 === index1) {
            index2 = Math.floor(Math.random() * (maxIndex + 1))
          }
          this.pattern.push([index1, index2].sort((a, b) => a - b))
        }
      }
    }

    this.showPattern()
  }

  clearAllKeys() {
    const allKeys = document.querySelectorAll(".piano-key")
    allKeys.forEach((keyEl) => {
      keyEl.classList.remove("pressed", "wrong", "correct", "highlight")
    })
  }

  async showPattern() {
    this.isPlaying = true
    this.hasError = false
    this.isTransitioning = false

    this.clearAllKeys()
    this.statusEl.textContent = "👀 Observa el patrón..."

    this.startBtn.classList.add("button-disabled")
    this.replayBtn.classList.add("button-disabled")

    const piano = document.getElementById("piano")
    piano.classList.add("piano-disabled")

    await this.delay(1000)

    for (let i = 0; i < this.pattern.length; i++) {
      const step = this.pattern[i]

      if (Array.isArray(step)) {
        // Combinación doble - mostrar ambas teclas simultáneamente
        await Promise.all(step.map((index) => this.highlightKey(index)))
        await this.delay(600)
      } else {
        // Tecla individual
        await this.highlightKey(step)
        await this.delay(600)
      }

      await this.delay(300)
    }

    this.isPlaying = false
    piano.classList.remove("piano-disabled")
    this.statusEl.textContent = "🎹 ¡Ahora toca tú!"

    this.startBtn.style.display = "none"
    this.replayBtn.classList.remove("button-disabled")
    this.replayBtn.style.display = "inline-block"

    this.updateProgress()
  }

  async highlightKey(index) {
    const keyEl = document.querySelector(`[data-index="${index}"]`)
    if (keyEl) {
      keyEl.classList.add("highlight", "pressed")
      this.playSound(this.keys[index].frequency)
      await this.delay(600)
      keyEl.classList.remove("highlight", "pressed")
    }
  }

  checkInput() {
    if (this.hasError) return

    const currentIndex = this.userInput.length - 1
    const expected = this.pattern[currentIndex]
    const actual = this.userInput[currentIndex]

    const isCorrect = Array.isArray(expected)
      ? Array.isArray(actual) &&
        expected.length === actual.length &&
        expected.every((val) => actual.includes(val)) &&
        actual.every((val) => expected.includes(val))
      : actual === expected

    if (isCorrect) {
      const feedback = Array.isArray(expected) ? expected : [expected]
      feedback.forEach((index) => this.showFeedback(index, true))
      this.updateProgress()

      if (this.userInput.length === this.pattern.length) {
        this.patternComplete()
      }
    } else {
      const feedback = Array.isArray(actual) ? actual : [actual]
      feedback.forEach((index) => this.showFeedback(index, false))
      this.hasError = true
      this.patternFailed()
    }
  }

  showFeedback(index, isCorrect) {
    const keyEl = document.querySelector(`[data-index="${index}"]`)
    if (keyEl) {
      keyEl.classList.add(isCorrect ? "correct" : "wrong")
      setTimeout(() => keyEl.classList.remove(isCorrect ? "correct" : "wrong"), 500)
    }
  }

  patternComplete() {
    this.isTransitioning = true
    this.score += this.level * 10
    this.level++
    this.statusEl.textContent = `🎉 ¡Nivel ${this.level - 1} completado!`
    this.updateDisplay()

    this.startBtn.classList.add("button-disabled")
    this.replayBtn.classList.add("button-disabled")

    const piano = document.getElementById("piano")
    piano.classList.add("piano-disabled")

    setTimeout(() => {
      this.createPiano()
      this.generatePattern()
    }, 2000)
  }

  patternFailed() {
    this.lives--
    this.updateDisplay()

    if (this.lives <= 0) {
      this.gameOver()
    } else {
      this.isTransitioning = true
      this.statusEl.textContent = `❌ Incorrecto. Vidas: ${this.lives}`

      const piano = document.getElementById("piano")
      piano.classList.add("piano-disabled")

      setTimeout(() => {
        this.userInput = []
        this.inputBuffer = []
        this.clearAllKeys()
        this.showPattern()
      }, 2000)
    }
  }

  updateProgress() {
    const progress = (this.userInput.length / this.pattern.length) * 100
    this.progressEl.style.width = `${progress}%`
  }

  playSound(frequency) {
    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5)

      oscillator.start()
      oscillator.stop(this.audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn("Error de audio:", error)
    }
  }

  updateDisplay() {
    this.scoreEl.textContent = this.score
    this.levelEl.textContent = this.level
    this.livesEl.textContent = this.lives
  }

  gameOver() {
    this.gameStarted = false
    this.statusEl.textContent = "💀 ¡Juego terminado!"
    this.finalScoreEl.textContent = this.score
    this.modalEl.style.display = "flex"
  }

  restartGame() {
    this.score = 0
    this.level = 1
    this.lives = 3
    this.pattern = []
    this.userInput = []
    this.inputBuffer = []
    this.gameStarted = false
    this.isPlaying = false
    this.hasError = false
    this.isTransitioning = false

    if (this.keyPressTimeout) {
      clearTimeout(this.keyPressTimeout)
    }

    this.modalEl.style.display = "none"
    this.startBtn.style.display = "inline-block"
    this.replayBtn.style.display = "none"

    this.startBtn.classList.remove("button-disabled")
    this.replayBtn.classList.remove("button-disabled")

    this.statusEl.textContent = "¡Presiona INICIAR para comenzar!"
    this.progressEl.style.width = "0%"

    const piano = document.getElementById("piano")
    piano.classList.remove("piano-disabled")

    this.createPiano()
    this.updateDisplay()
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  isKeyAvailable(index) {
    if (this.level === 1) {
      return index >= 0 && index <= 11
    } else if (this.level === 2) {
      return index >= 0 && index <= 23
    } else {
      return index >= 0 && index <= 35
    }
  }
}

// Inicializar cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
  new PianoGame()
})
