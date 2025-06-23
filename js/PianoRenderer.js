// Módulo para renderizar y manejar la interfaz visual del piano
export class PianoRenderer {
    constructor() {
        this.keys = this.generateThreeOctaves()
        this.keyboardMap = this.createKeyboardMap()
        this.piano = document.getElementById("piano")
        this.currentOctaveFilter = "all"
    }

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
        for (let octave = 1; octave <= 3; octave++) {
            baseNotes.forEach((baseNote) => {
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

    createKeyboardMap() {
        return {
            // Primera octava (C1-B1)
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
            // Segunda octava (C2-B2)
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
            // Tercera octava (C3-B3)
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
    }

    createPiano(levelRestriction = null) {
        this.piano.innerHTML = ""

        let startIndex = 0,
            endIndex = 35

        // Aplicar restricciones de nivel o filtro de octava
        if (levelRestriction === 1) {
            startIndex = 12
            endIndex = 23
        } else if (this.currentOctaveFilter !== "all") {
            const octave = Number.parseInt(this.currentOctaveFilter)
            startIndex = (octave - 1) * 12
            endIndex = octave * 12 - 1
        }

        const keyboardKeys = Object.keys(this.keyboardMap)

        for (let index = startIndex; index <= endIndex; index++) {
            const key = this.keys[index]
            const keyElement = this.createKeyElement(key, index, keyboardKeys)
            this.piano.appendChild(keyElement)
        }
    }

    createKeyElement(key, index, keyboardKeys) {
        const keyElement = document.createElement("div")
        const keyboardKey = keyboardKeys.find((k) => this.keyboardMap[k] === index) || ""

        // Clases base
        const baseClasses =
            "piano-key cursor-pointer transition-all duration-150 flex flex-col items-center justify-between font-bold text-xs select-none relative"

        if (key.type === "white") {
            keyElement.className = `${baseClasses} white-key w-12 h-40 mx-0.5 rounded-b-xl text-gray-700`
        } else {
            keyElement.className = `${baseClasses} black-key w-8 h-26 -mx-3 z-10 rounded-b-lg text-gray-300`
        }

        // Contenido de la tecla con estilo clásico
        keyElement.innerHTML = `
            <div class="key-label text-center mt-2">
                <div class="font-bold text-sm">${keyboardKey.toUpperCase()}</div>
            </div>
            <div class="key-label text-center mb-2">
                <div class="text-xs opacity-75">${key.note}</div>
                <div class="text-xs opacity-50">♪</div>
            </div>
        `

        keyElement.dataset.index = index
        keyElement.dataset.note = key.note
        keyElement.dataset.octave = key.octave

        // Agregar event listeners para mouse
        keyElement.addEventListener("mousedown", (e) => {
            e.preventDefault()
            this.onKeyPress?.(index)
        })

        keyElement.addEventListener("mouseup", (e) => {
            e.preventDefault()
            this.onKeyRelease?.(index)
        })

        keyElement.addEventListener("mouseleave", (e) => {
            this.onKeyRelease?.(index)
        })

        return keyElement
    }

    pressKey(keyIndex) {
        const keyElement = document.querySelector(`[data-index="${keyIndex}"]`)
        if (keyElement) {
            keyElement.classList.add("pressed")
        }
    }

    releaseKey(keyIndex) {
        const keyElement = document.querySelector(`[data-index="${keyIndex}"]`)
        if (keyElement) {
            keyElement.classList.remove("pressed")
        }
    }

    highlightKey(keyIndex, className = "highlight") {
        const keyElement = document.querySelector(`[data-index="${keyIndex}"]`)
        if (keyElement) {
            keyElement.classList.add(className)
            setTimeout(() => keyElement.classList.remove(className), 700)
        }
    }

    setOctaveFilter(octave) {
        this.currentOctaveFilter = octave
        this.createPiano()
    }

    isKeyVisible(keyIndex) {
        const keyElement = document.querySelector(`[data-index="${keyIndex}"]`)
        return keyElement !== null
    }

    getKeyFromKeyboard(keyboardKey) {
        return this.keyboardMap[keyboardKey]
    }

    getKeyData(keyIndex) {
        return this.keys[keyIndex]
    }

    // Agregar métodos para configurar callbacks
    setKeyPressCallback(callback) {
        this.onKeyPress = callback
    }

    setKeyReleaseCallback(callback) {
        this.onKeyRelease = callback
    }
}
