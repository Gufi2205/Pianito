class PianoLibre {
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

        // Audio Context para generar sonidos
        this.audioContext = null
        this.initAudioContext()

        // Sistema de notas tocadas
        this.playedNotes = []
        this.maxNotesDisplay = 15 // Máximo de notas a mostrar
        this.noteFadeTime = 3000 // Tiempo en ms antes de que la nota empiece a desaparecer

        // Inicializar el piano
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
     * Inicializa el piano creando las teclas y configurando eventos
     */
    init() {
        this.createPiano()
        this.setupEventListeners()
        this.initNotesDisplay()
    }

    /**
     * Inicializa el display de notas
     */
    initNotesDisplay() {
        this.notesDisplay = document.getElementById('notes-display')
    }

    /**
     * Crea las teclas del piano dinámicamente
     */
    createPiano() {
        const piano = document.getElementById("piano")
        piano.innerHTML = ""

        // Obtener las teclas del teclado para mostrar en cada tecla del piano
        const keyboardKeys = Object.keys(this.keyboardMap)

        // Crear todas las teclas (0-35)
        for (let index = 0; index < this.keys.length; index++) {
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
     * Configura todos los event listeners
     */
    setupEventListeners() {
        // Soporte para teclado
        document.addEventListener("keydown", (e) => this.handleKeyboard(e))
        document.addEventListener("keyup", (e) => this.handleKeyboardUp(e))

        // Botón de regresar al menú principal
        document.getElementById('back-button').addEventListener('click', () => {
            // Redirigir a la página del menú principal
            window.location.href = '/Pantalla_Inicial/Botones.html'
        })
    }

    /**
     * Maneja la entrada del teclado para tocar las teclas del piano
     */
    handleKeyboard(event) {
        const key = event.key === " " ? "Space" : event.key.toLowerCase()
        const keyIndex = this.keyboardMap[key]

        if (keyIndex !== undefined) {
            event.preventDefault()
            this.playKey(keyIndex)
        }
    }

    /**
     * Maneja cuando se suelta una tecla del teclado
     */
    handleKeyboardUp(event) {
        const key = event.key === " " ? "Space" : event.key.toLowerCase()
        const keyIndex = this.keyboardMap[key]

        if (keyIndex !== undefined) {
            event.preventDefault()
            this.releaseKey(keyIndex)
        }
    }

    /**
     * Maneja cuando el usuario toca una tecla
     */
    playKey(keyIndex) {
        const keyElement = document.querySelector(`[data-index="${keyIndex}"]`)
        if (!keyElement) return

        // Agregar efecto visual de tecla presionada
        keyElement.classList.add("pressed")

        // Reproducir sonido
        this.playSound(this.keys[keyIndex].frequency)

        // Agregar nota al display
        this.addNoteToDisplay(this.keys[keyIndex].note)
    }

    /**
     * Libera una tecla (efecto visual)
     */
    releaseKey(keyIndex) {
        const keyElement = document.querySelector(`[data-index="${keyIndex}"]`)
        if (keyElement) {
            keyElement.classList.remove("pressed")
        }
    }

    /**
     * Agrega una nota al display de notas tocadas
     */
    addNoteToDisplay(noteName) {
        const noteId = Date.now() + Math.random() // ID único para la nota
        
        // Agregar nota al array
        this.playedNotes.push({
            id: noteId,
            note: noteName,
            timestamp: Date.now()
        })

        // Limitar el número de notas mostradas
        if (this.playedNotes.length > this.maxNotesDisplay) {
            const oldestNote = this.playedNotes.shift()
            const oldElement = document.getElementById(`note-${oldestNote.id}`)
            if (oldElement) {
                oldElement.remove()
            }
        }

        this.updateNotesDisplay()

        // Programar la desaparición de la nota
        setTimeout(() => {
            this.fadeOutNote(noteId)
        }, this.noteFadeTime)
    }

    /**
     * Actualiza el display de notas
     */
    updateNotesDisplay() {
        // Si no hay notas, mostrar mensaje por defecto
        if (this.playedNotes.length === 0) {
            this.notesDisplay.innerHTML = '<div class="default-message text-sm font-medium">Toca una tecla para ver las notas aquí...</div>'
            return
        }

        // Crear elementos para las notas que no existen
        this.playedNotes.forEach(noteData => {
            const existingElement = document.getElementById(`note-${noteData.id}`)
            if (!existingElement) {
                const noteElement = document.createElement('span')
                noteElement.id = `note-${noteData.id}`
                noteElement.className = 'note-item'
                noteElement.textContent = noteData.note
                
                // Limpiar el display si es la primera nota
                if (this.notesDisplay.querySelector('.default-message')) {
                    this.notesDisplay.innerHTML = ''
                }
                
                this.notesDisplay.appendChild(noteElement)
            }
        })
    }

    /**
     * Hace desaparecer una nota gradualmente
     */
    fadeOutNote(noteId) {
        const noteElement = document.getElementById(`note-${noteId}`)
        if (noteElement) {
            noteElement.classList.add('fade-out')
            
            // Remover el elemento después de la animación
            setTimeout(() => {
                if (noteElement && noteElement.parentNode) {
                    noteElement.remove()
                }
                
                // Remover del array
                this.playedNotes = this.playedNotes.filter(note => note.id !== noteId)
                
                // Si no quedan notas, mostrar mensaje por defecto
                if (this.playedNotes.length === 0) {
                    this.updateNotesDisplay()
                }
            }, 500) // Tiempo de la animación CSS
        }
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
}

// Inicializar el piano cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
    new PianoLibre()
})