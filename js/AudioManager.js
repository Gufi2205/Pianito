// Módulo para manejar todo el audio del piano
export class AudioManager {
    constructor() {
        this.audioContext = null
        this.masterVolume = 0.3
        this.initAudioContext()
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        } catch (error) {
            console.warn("Audio no disponible:", error)
        }
    }

    playNote(frequency, duration = 1.0, volume = null) {
        if (!this.audioContext) return

        const actualVolume = volume || this.masterVolume

        try {
            const oscillator = this.audioContext.createOscillator()
            const gainNode = this.audioContext.createGain()
            const filterNode = this.audioContext.createBiquadFilter()

            // Configurar filtro para sonido más realista
            filterNode.type = "lowpass"
            filterNode.frequency.setValueAtTime(2000, this.audioContext.currentTime)

            // Conectar nodos
            oscillator.connect(filterNode)
            filterNode.connect(gainNode)
            gainNode.connect(this.audioContext.destination)

            // Configurar oscilador
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
            oscillator.type = "triangle" // Sonido más suave que sine

            // Envelope ADSR para sonido más natural
            const now = this.audioContext.currentTime
            gainNode.gain.setValueAtTime(0, now)
            gainNode.gain.linearRampToValueAtTime(actualVolume, now + 0.01) // Attack
            gainNode.gain.exponentialRampToValueAtTime(actualVolume * 0.7, now + 0.1) // Decay
            gainNode.gain.setValueAtTime(actualVolume * 0.7, now + 0.1) // Sustain
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration) // Release

            oscillator.start(now)
            oscillator.stop(now + duration)
        } catch (error) {
            console.warn("Error reproduciendo sonido:", error)
        }
    }

    playChord(frequencies, duration = 1.0, volume = null) {
        frequencies.forEach((freq) => {
            this.playNote(freq, duration, volume)
        })
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume))
    }

    // Efectos especiales para el modo libre
    playArpeggio(frequencies, interval = 0.1) {
        frequencies.forEach((freq, index) => {
            setTimeout(
                () => {
                    this.playNote(freq, 0.8)
                },
                index * interval * 1000,
            )
        })
    }

    playScale(startFreq, steps, interval = 0.2) {
        for (let i = 0; i < steps; i++) {
            const freq = startFreq * Math.pow(2, i / 12)
            setTimeout(
                () => {
                    this.playNote(freq, 0.6)
                },
                i * interval * 1000,
            )
        }
    }
}
