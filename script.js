class PianoMemoryGame {
    constructor() {
        // Configuración del piano con 3 octavas (36 teclas)
        this.keys = this.generateThreeOctaves()

        // Mapeo del teclado usando 1-0 y A-Z
        this.keyboardMap = {
            // Primera octava (C1-B1) - Números y primeras letras
            1: 0, // C1
            2: 1, // C#1
            3: 2, // D1
            4: 3, // D#1
            5: 4, // E1
            6: 5, // F1
            7: 6, // F#1
            8: 7, // G1
            9: 8, // G#1
            0: 9, // A1
            q: 10, // A#1
            w: 11, // B1

            // Segunda octava (C2-B2) - Fila QWERTY continuación
            e: 12, // C2
            r: 13, // C#2
            t: 14, // D2
            y: 15, // D#2
            u: 16, // E2
            i: 17, // F2
            o: 18, // F#2
            p: 19, // G2
            a: 20, // G#2
            s: 21, // A2
            d: 22, // A#2
            f: 23, // B2

            // Tercera octava (C3-B3) - Fila ASDF continuación
            g: 24, // C3
            h: 25, // C#3
            j: 26, // D3
            k: 27, // D#3
            l: 28, // E3
            z: 29, // F3
            x: 30, // F#3
            c: 31, // G3
            v: 32, // G#3
            b: 33, // A3
            n: 34, // A#3
            m: 35, // B3
        }

        // Estado del juego
        this.score = 0
        this.level = 1
        this.lives = 3
        this.currentPattern = []
        this.userPattern = []
        this.isShowingPattern = false
        this.isUserTurn = false
        this.gameStarted = false
        this.currentPatternIndex = 0
        this.patternsPerLevel = { 1: 1, 2: 1, 3: 1 }
        this.completedPatterns = 0

        // Estado del modo
        this.isFreeMode = false
        this.sustainedKeys = new Set() // Para el modo libre

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

        // Elementos del modo libre
        this.modeToggle = document.getElementById("mode-toggle")
        this.gameInfo = document.getElementById("game-info")
        this.freeModeInfo = document.getElementById("free-mode-info")
        this.gameControls = document.getElementById("game-controls")
        this.freeModeControls = document.getElementById("free-mode-controls")
        this.progressSection = document.getElementById("progress-section")
        this.freeModeFooter = document.getElementById("free-mode-footer")
        this.clearSustainBtn = document.getElementById("clear-sustain-btn")
        this.gameModeLabel = document.getElementById("game-mode-label")
        this.freeModeLabel = document.getElementById("free-mode-label")

        // Audio Context para generar sonidos
        this.audioContext = null
        this.initAudioContext()

        // Inicializar el juego
        this.init()
    }

    /**
     * Genera las 3 octavas del piano (36 teclas)
     */
    generateThreeOctaves() {
        const baseNotes = [
            { note: "C", type: "white", baseFreq: 261.63 },
            { note: "C#", type: "black", baseFreq: 277.18 },
            { note: "D", type: "white", baseFreq: 293.66 },
            { note: "D#", type: "black", baseFreq: 311.13 },
            { note: "E", type: "white", baseFreq: 329.63 },
            { note: "F", type: "white", baseFreq: 349.23 },
            { note: "F#", type: "black", baseFreq: 369.99 },
            { note: "G", type: "white", baseFreq: 392.0 },
            { note: "G#", type: "black", baseFreq: 415.3 },
            { note: "A", type: "white", baseFreq: 440.0 },
            { note: "A#", type: "black", baseFreq: 466.16 },
            { note: "B", type: "white", baseFreq: 493.88 },
        ]

        const allKeys = []

        // Generar 3 octavas
        for (let octave = 1; octave <= 3; octave++) {
            baseNotes.forEach((baseNote) => {
                // Calcular frecuencia para cada octava
                const frequency = baseNote.baseFreq * Math.pow(2, octave - 2)
                allKeys.push({
                    note: `${baseNote.note}${octave}`,
                    type: baseNote.type,
                    frequency: frequency,
                    octave: octave,
                })
            })
        }

        return allKeys
    }

    /**
     * Inicializa el contexto de audio para generar sonidos del piano
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        } catch (error) {
            console.warn("Audio no disponible:", error)
        }
    }

    /**
     * Inicializa el juego creando el piano y configurando eventos
     */
    init() {
        this.createPiano()
        this.setupEventListeners()
        this.updateDisplay()
        this.updateModeDisplay()
    }

    /**
     * Actualiza la visualización según el modo actual
     */
    updateModeDisplay() {
        if (this.isFreeMode) {
            // Mostrar elementos del modo libre
            this.gameInfo.classList.add("hidden")
            this.freeModeInfo.classList.remove("hidden")
            this.gameControls.classList.add("hidden")
            this.freeModeControls.classList.remove("hidden")
            this.progressSection.classList.add("hidden")
            this.freeModeFooter.classList.remove("hidden")

            // Actualizar estilos de las etiquetas
            this.gameModeLabel.classList.add("text-gray-400")
            this.gameModeLabel.classList.remove("text-gray-700")
            this.freeModeLabel.classList.add("text-blue-600")
            this.freeModeLabel.classList.remove("text-gray-700")

            // Recrear piano con todas las teclas
            this.createPiano()
        } else {
            // Mostrar elementos del modo juego
            this.gameInfo.classList.remove("hidden")
            this.freeModeInfo.classList.add("hidden")
            this.gameControls.classList.remove("hidden")
            this.freeModeControls.classList.add("hidden")
            this.progressSection.classList.remove("hidden")
            this.freeModeFooter.classList.add("hidden")

            // Actualizar estilos de las etiquetas
            this.gameModeLabel.classList.add("text-blue-600")
            this.gameModeLabel.classList.remove("text-gray-400")
            this.freeModeLabel.classList.add("text-gray-400")
            this.freeModeLabel.classList.remove("text-blue-600")

            // Recrear piano según el nivel del juego
            this.createPiano()
        }
    }

    /**
     * Crea las teclas del piano dinámicamente según el modo y nivel actual
     */
    createPiano() {
        const piano = document.getElementById("piano")
        piano.innerHTML = ""

        // Determinar qué teclas mostrar
        let startIndex, endIndex

        if (this.isFreeMode) {
            // Modo libre: Mostrar todas las teclas
            startIndex = 0
            endIndex = 35
        } else {
            // Modo juego: Según el nivel
            if (this.level === 1) {
                // Nivel 1: Solo segunda octava (índices 12-23)
                startIndex = 12
                endIndex = 23
            } else {
                // Nivel 2 y 3+: Todas las octavas (índices 0-35)
                startIndex = 0
                endIndex = 35
            }
        }

        // Obtener las teclas del teclado para mostrar en cada tecla del piano
        const keyboardKeys = Object.keys(this.keyboardMap)

        // Crear solo las teclas del rango correspondiente
        for (let index = startIndex; index <= endIndex; index++) {
            const key = this.keys[index]
            const keyElement = document.createElement("div")

            // Encontrar la tecla del teclado correspondiente
            const keyboardKey = keyboardKeys.find((k) => this.keyboardMap[k] === index) || ""

            // Clases base para todas las teclas
            const baseClasses = "piano-key cursor-pointer transition-all duration-150 flex flex-col items-center justify-between select-none relative"

            if (key.type === "white") {
                keyElement.className = `${baseClasses} white-key w-12 h-40 mx-0.5 rounded-b-lg`
                keyElement.innerHTML = `
                    <div class="key-label text-gray-700 text-xs font-bold mt-2 bg-white bg-opacity-70 px-1 rounded">
                        ${keyboardKey.toUpperCase()}
                    </div>
                    <div class="key-label text-gray-600 text-sm font-bold mb-3 bg-white bg-opacity-70 px-2 py-1 rounded">
                        ${key.note}
                    </div>
                `
            } else {
                keyElement.className = `${baseClasses} black-key w-8 h-24 -mx-4 z-10 rounded-b-lg`
                keyElement.innerHTML = `
                    <div class="key-label text-white text-xs font-bold mt-1 bg-black bg-opacity-50 px-1 rounded">
                        ${keyboardKey.toUpperCase()}
                    </div>
                    <div class="key-label text-white text-xs font-bold mb-2 bg-black bg-opacity-50 px-1 rounded">
                        ${key.note}
                    </div>
                `
            }

            keyElement.dataset.index = index
            keyElement.dataset.note = key.note

            // Eventos para tocar la tecla
            keyElement.addEventListener("mousedown", () => this.playKey(index))
            keyElement.addEventListener("mouseup", () => this.releaseKey(index))
            keyElement.addEventListener("mouseleave", () => this.releaseKey(index))

            piano.appendChild(keyElement)
        }
    }

    /**
     * Configura todos los event listeners del juego
     */
    setupEventListeners() {
        this.startBtn.addEventListener("click", () => this.startGame())
        this.replayBtn.addEventListener("click", () => this.showPattern())
        this.restartBtn.addEventListener("click", () => this.restartGame())
        this.clearSustainBtn.addEventListener("click", () => this.clearSustainedKeys())

        // Toggle de modo
        this.modeToggle.addEventListener("change", (e) => {
            this.isFreeMode = e.target.checked
            this.updateModeDisplay()

            // Si estaba en medio de un juego, reiniciarlo
            if (this.gameStarted && !this.isFreeMode) {
                this.restartGame()
            }

            // Limpiar teclas sostenidas al cambiar de modo
            this.clearSustainedKeys()
        })

        // Soporte para teclado
        document.addEventListener("keydown", (e) => this.handleKeyboard(e))
        document.addEventListener("keyup", (e) => this.handleKeyboardUp(e))
    }

    /**
     * Maneja la entrada del teclado para tocar las teclas del piano
     */
    handleKeyboard(event) {
        const key = event.key === " " ? "Space" : event.key.toLowerCase()
        const keyIndex = this.keyboardMap[key]

        if (keyIndex !== undefined) {
            // Verificar si la tecla está visible en el modo/nivel actual
            const isKeyVisible = this.isKeyVisible(keyIndex)

            if (isKeyVisible) {
                event.preventDefault()

                // En modo libre, evitar repetir si ya está presionada
                if (this.isFreeMode && this.sustainedKeys.has(keyIndex)) {
                    return
                }

                this.playKey(keyIndex)
            }
        }
    }

    /**
     * Verifica si una tecla es visible en el modo/nivel actual
     */
    isKeyVisible(keyIndex) {
        if (this.isFreeMode) {
            // Modo libre: Todas las teclas están disponibles
            return keyIndex >= 0 && keyIndex <= 35
        } else {
            // Modo juego: Según el nivel
            if (this.level === 1) {
                // Nivel 1: Solo segunda octava (índices 12-23)
                return keyIndex >= 12 && keyIndex <= 23
            } else {
                // Nivel 2 y 3+: Todas las octavas (índices 0-35)
                return keyIndex >= 0 && keyIndex <= 35
            }
        }
    }

    /**
     * Maneja cuando se suelta una tecla del teclado
     */
    handleKeyboardUp(event) {
        const key = event.key === " " ? "Space" : event.key.toLowerCase()
        const keyIndex = this.keyboardMap[key]

        if (keyIndex !== undefined && this.isKeyVisible(keyIndex)) {
            event.preventDefault()
            this.releaseKey(keyIndex)
        }
    }

    /**
     * Limpia todas las teclas sostenidas en modo libre
     */
    clearSustainedKeys() {
        this.sustainedKeys.forEach(keyIndex => {
            this.releaseKey(keyIndex)
        })
        this.sustainedKeys.clear()
    }

    /**
     * Inicia una nueva partida (solo en modo juego)
     */
    startGame() {
        if (this.isFreeMode) return

        this.gameStarted = true
        this.score = 0
        this.level = 1
        this.lives = 3
        this.completedPatterns = 0
        this.updateDisplay()

        // Recrear el piano para el nivel 1
        this.createPiano()

        this.generateNewPattern()
    }

    /**
     * Genera un nuevo patrón basado en el nivel actual (solo en modo juego)
     */
    generateNewPattern() {
        if (this.isFreeMode) return

        this.currentPattern = []
        this.userPattern = []

        switch (this.level) {
            case 1:
                // Nivel 1: Solo segunda octava (índices 12-23), notas individuales
                this.currentPattern = this.generateLevel1Pattern()
                break
            case 2:
                // Nivel 2: Acordes en primera y tercera octava (índices 0-11 y 24-35)
                this.currentPattern = this.generateLevel2Pattern()
                break
            case 3:
                // Nivel 3: Todas las octavas con acordes y notas individuales
                this.currentPattern = this.generateLevel3Pattern()
                break
            default:
                // Niveles superiores: Patrones más complejos
                this.currentPattern = this.generateAdvancedPattern()
        }

        this.showPattern()
    }

    /**
     * Genera patrón para nivel 1: Solo segunda octava, notas individuales
     */
    generateLevel1Pattern() {
        const pattern = []
        const secondOctaveStart = 12
        const secondOctaveEnd = 23
        const patternLength = 4 + Math.floor(Math.random() * 3) // 4-6 notas

        for (let i = 0; i < patternLength; i++) {
            const keyIndex = secondOctaveStart + Math.floor(Math.random() * (secondOctaveEnd - secondOctaveStart + 1))
            pattern.push([keyIndex]) // Array con una sola nota
        }

        return pattern
    }

    /**
     * Genera patrón para nivel 2: Acordes en primera y tercera octava (SIN segunda octava)
     */
    generateLevel2Pattern() {
        const pattern = []
        const firstOctave = Array.from({ length: 12 }, (_, i) => i) // 0-11
        const thirdOctave = Array.from({ length: 12 }, (_, i) => i + 24) // 24-35
        const patternLength = 3 + Math.floor(Math.random() * 3) // 3-5 acordes

        for (let i = 0; i < patternLength; i++) {
            const useFirstOctave = Math.random() < 0.5
            const octaveKeys = useFirstOctave ? firstOctave : thirdOctave

            // Generar acorde de 2-3 notas
            const chordSize = 2 + Math.floor(Math.random() * 2) // 2-3 notas
            const chord = []
            const usedIndices = new Set()

            while (chord.length < chordSize) {
                const keyIndex = octaveKeys[Math.floor(Math.random() * octaveKeys.length)]
                if (!usedIndices.has(keyIndex)) {
                    chord.push(keyIndex)
                    usedIndices.add(keyIndex)
                }
            }

            chord.sort((a, b) => a - b) // Ordenar el acorde
            pattern.push(chord)
        }

        return pattern
    }

    /**
     * Genera patrón para nivel 3: Todas las octavas con acordes y notas
     */
    generateLevel3Pattern() {
        const pattern = []
        const patternLength = 4 + Math.floor(Math.random() * 4) // 4-7 elementos

        for (let i = 0; i < patternLength; i++) {
            const isChord = Math.random() < 0.6 // 60% probabilidad de acorde

            if (isChord) {
                // Generar acorde de 2-4 notas en cualquier octava
                const chordSize = 2 + Math.floor(Math.random() * 3) // 2-4 notas
                const chord = []
                const usedIndices = new Set()

                while (chord.length < chordSize) {
                    const keyIndex = Math.floor(Math.random() * this.keys.length)
                    if (!usedIndices.has(keyIndex)) {
                        chord.push(keyIndex)
                        usedIndices.add(keyIndex)
                    }
                }

                chord.sort((a, b) => a - b)
                pattern.push(chord)
            } else {
                // Nota individual
                const keyIndex = Math.floor(Math.random() * this.keys.length)
                pattern.push([keyIndex])
            }
        }

        return pattern
    }

    /**
     * Genera patrones avanzados para niveles superiores
     */
    generateAdvancedPattern() {
        const pattern = []
        const patternLength = 5 + Math.floor(Math.random() * 5) // 5-9 elementos

        for (let i = 0; i < patternLength; i++) {
            const complexity = Math.random()

            if (complexity < 0.3) {
                // Nota individual
                pattern.push([Math.floor(Math.random() * this.keys.length)])
            } else if (complexity < 0.7) {
                // Acorde pequeño (2-3 notas)
                const chordSize = 2 + Math.floor(Math.random() * 2)
                const chord = []
                const usedIndices = new Set()

                while (chord.length < chordSize) {
                    const keyIndex = Math.floor(Math.random() * this.keys.length)
                    if (!usedIndices.has(keyIndex)) {
                        chord.push(keyIndex)
                        usedIndices.add(keyIndex)
                    }
                }

                chord.sort((a, b) => a - b)
                pattern.push(chord)
            } else {
                // Acorde grande (3-5 notas)
                const chordSize = 3 + Math.floor(Math.random() * 3)
                const chord = []
                const usedIndices = new Set()

                while (chord.length < chordSize) {
                    const keyIndex = Math.floor(Math.random() * this.keys.length)
                    if (!usedIndices.has(keyIndex)) {
                        chord.push(keyIndex)
                        usedIndices.add(keyIndex)
                    }
                }

                chord.sort((a, b) => a - b)
                pattern.push(chord)
            }
        }

        return pattern
    }

    /**
     * Muestra el patrón al jugador (solo en modo juego)
     */
    async showPattern() {
        if (this.isFreeMode) return

        this.isShowingPattern = true
        this.isUserTurn = false
        this.statusMessage.textContent = "👀 Observa el patrón..."
        this.startBtn.style.display = "none"
        this.replayBtn.style.display = "none"

        // Pequeña pausa antes de empezar
        await this.delay(1000)

        // Mostrar cada elemento del patrón (nota o acorde)
        for (let i = 0; i < this.currentPattern.length; i++) {
            const element = this.currentPattern[i]
            await this.highlightElement(element)
            await this.delay(300) // Pausa entre elementos
        }

        // Cambiar a turno del usuario
        this.isShowingPattern = false
        this.isUserTurn = true
        this.statusMessage.textContent = "🎹 ¡Ahora toca tú el patrón!"
        this.replayBtn.style.display = "inline-block"
        this.updateProgress()
    }

    /**
     * Resalta un elemento (nota o acorde) durante la demostración
     */
    async highlightElement(element) {
        // Resaltar todas las teclas del elemento simultáneamente
        const keyElements = element.map((keyIndex) => document.querySelector(`[data-index="${keyIndex}"]`))

        // Aplicar efectos visuales
        keyElements.forEach((keyElement) => {
            if (keyElement) {
                keyElement.classList.add("highlight", "pressed")
            }
        })

        // Reproducir sonidos simultáneamente
        element.forEach((keyIndex) => {
            this.playSound(this.keys[keyIndex].frequency)
        })

        await this.delay(600)

        // Remover efectos visuales
        keyElements.forEach((keyElement) => {
            if (keyElement) {
                keyElement.classList.remove("highlight", "pressed")
            }
        })
    }

    /**
     * Maneja cuando el usuario toca una tecla
     */
    playKey(keyIndex) {
        const keyElement = document.querySelector(`[data-index="${keyIndex}"]`)
        if (!keyElement) return

        // Agregar efecto visual de tecla presionada
        keyElement.classList.add("pressed")

        this.playSound(this.keys[keyIndex].frequency)

        if (this.isFreeMode) {
            // En modo libre, agregar a teclas sostenidas
            this.sustainedKeys.add(keyIndex)
        } else {
            // Lógica del juego original
            if (!this.isUserTurn) return

            // Agregar la tecla al patrón del usuario
            if (this.userPattern.length === 0 || this.userPattern[this.userPattern.length - 1].submitted) {
                // Nuevo elemento (nota o acorde)
                this.userPattern.push({ keys: [keyIndex], submitted: false })
            } else {
                // Agregar a elemento actual (para formar acordes)
                const currentElement = this.userPattern[this.userPattern.length - 1]
                if (!currentElement.keys.includes(keyIndex)) {
                    currentElement.keys.push(keyIndex)
                    currentElement.keys.sort((a, b) => a - b)
                }
            }

            // Auto-submit después de un breve delay si no se presionan más teclas
            clearTimeout(this.submitTimeout)
            this.submitTimeout = setTimeout(() => {
                this.submitCurrentElement()
            }, 500)
        }
    }

    /**
     * Confirma el elemento actual del usuario (solo en modo juego)
     */
    submitCurrentElement() {
        if (this.isFreeMode) return
        if (this.userPattern.length === 0 || this.userPattern[this.userPattern.length - 1].submitted) {
            return
        }

        const currentElement = this.userPattern[this.userPattern.length - 1]
        currentElement.submitted = true

        this.checkUserInput()
    }

    /**
     * Libera una tecla (efecto visual)
     */
    releaseKey(keyIndex) {
        const keyElement = document.querySelector(`[data-index="${keyIndex}"]`)
        if (keyElement) {
            keyElement.classList.remove("pressed")

            // En modo libre, remover de teclas sostenidas
            if (this.isFreeMode) {
                this.sustainedKeys.delete(keyIndex)
            }
        }
    }

    /**
     * Verifica la entrada del usuario contra el patrón (solo en modo juego)
     */
    checkUserInput() {
        if (this.isFreeMode) return

        const currentIndex = this.userPattern.filter((el) => el.submitted).length - 1
        const expectedElement = this.currentPattern[currentIndex]
        const userElement = this.userPattern[currentIndex].keys

        // Comparar arrays de teclas
        const isCorrect = this.arraysEqual(expectedElement, userElement)

        if (isCorrect) {
            // Respuesta correcta
            this.showElementFeedback(userElement, true)
            this.updateProgress()

            // Verificar si completó el patrón
            if (this.userPattern.filter((el) => el.submitted).length === this.currentPattern.length) {
                this.patternCompleted()
            }
        } else {
            // Respuesta incorrecta
            this.showElementFeedback(userElement, false)
            this.showElementFeedback(expectedElement, true) // Mostrar la correcta
            this.patternFailed()
        }
    }

    /**
     * Compara dos arrays para verificar si son iguales
     */
    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false
        return arr1.every((val, index) => val === arr2[index])
    }

    /**
     * Muestra feedback visual en un elemento (nota o acorde)
     */
    showElementFeedback(element, isCorrect) {
        const className = isCorrect ? "correct" : "wrong"

        element.forEach((keyIndex) => {
            const keyElement = document.querySelector(`[data-index="${keyIndex}"]`)
            if (keyElement) {
                keyElement.classList.add(className)
                setTimeout(() => keyElement.classList.remove(className), 500)
            }
        })
    }

    /**
     * Maneja cuando el usuario completa correctamente un patrón
     */
    patternCompleted() {
        this.isUserTurn = false
        this.completedPatterns++
        this.score += this.level * 15 // Más puntos por la complejidad

        const patternsNeeded = this.patternsPerLevel[this.level] || 1

        if (this.completedPatterns >= patternsNeeded) {
            // Nivel completado
            this.statusMessage.textContent = `🎉 ¡Nivel ${this.level} completado!`
            setTimeout(() => {
                this.level++
                this.completedPatterns = 0
                this.updateDisplay()

                // Recrear el piano si cambiamos del nivel 1 al 2
                if (this.level === 2) {
                    this.createPiano()
                }

                this.generateNewPattern()
            }, 2000)
        } else {
            // Este caso ya no debería ocurrir con 1 patrón por nivel
            this.statusMessage.textContent = `✅ ¡Patrón completado!`
            setTimeout(() => {
                this.generateNewPattern()
            }, 1500)
        }
    }

    /**
     * Maneja cuando el usuario falla un patrón
     */
    patternFailed() {
        this.isUserTurn = false
        this.lives--
        this.updateDisplay()

        if (this.lives <= 0) {
            this.gameOver()
        } else {
            this.statusMessage.textContent = `❌ Patrón incorrecto. Vidas restantes: ${this.lives}`
            setTimeout(() => {
                this.userPattern = []
                this.showPattern()
            }, 2000)
        }
    }

    /**
     * Actualiza la barra de progreso
     */
    updateProgress() {
        if (this.isFreeMode) return

        const submittedElements = this.userPattern.filter((el) => el.submitted).length
        const progress = (submittedElements / this.currentPattern.length) * 100
        this.progressFill.style.width = `${progress}%`
    }

    /**
     * Reproduce un sonido con la frecuencia especificada
     */
    playSound(frequency) {
        if (!this.audioContext) return

        try {
            const oscillator = this.audioContext.createOscillator()
            const gainNode = this.audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
            oscillator.type = "sine"

            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8)

            oscillator.start(this.audioContext.currentTime)
            oscillator.stop(this.audioContext.currentTime + 0.8)
        } catch (error) {
            console.warn("Error reproduciendo sonido:", error)
        }
    }

    /**
     * Actualiza la información mostrada en pantalla
     */
    updateDisplay() {
        this.scoreElement.textContent = this.score
        this.levelElement.textContent = this.level
        this.livesElement.textContent = this.lives
    }

    /**
     * Maneja el fin del juego
     */
    gameOver() {
        this.gameStarted = false
        this.statusMessage.textContent = "💀 ¡Juego terminado!"
        this.finalScore.textContent = this.score
        this.finalLevel.textContent = this.level
        this.gameOverModal.style.display = "flex"
    }

    /**
     * Reinicia el juego completamente
     */
    restartGame() {
        this.gameOverModal.style.display = "none"
        this.startBtn.style.display = "inline-block"
        this.replayBtn.style.display = "none"
        this.statusMessage.textContent = "¡Presiona INICIAR para comenzar!"
        this.progressFill.style.width = "0%"
        this.gameStarted = false
        this.isUserTurn = false
        this.isShowingPattern = false
        this.completedPatterns = 0
        clearTimeout(this.submitTimeout)

        // Limpiar teclas sostenidas
        this.clearSustainedKeys()
    }

    /**
     * Función auxiliar para crear delays
     */
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
    new PianoMemoryGame()
})