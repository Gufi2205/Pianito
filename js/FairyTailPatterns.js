// Módulo con todos los patrones musicales de Fairy Tail
export class FairyTailPatterns {
    constructor() {
        this.patterns = {
            level1: [
                {
                    name: "🎵 Fairy Tail Main Theme",
                    pattern: [[12], [14], [16], [17], [19], [21]], // C-D-E-F-G-A
                    description: "El tema principal heroico",
                },
                {
                    name: "🐉 Dragon Force",
                    pattern: [[16], [17], [19], [16], [14], [12]], // E-F-G-E-D-C
                    description: "La fuerza del dragón",
                },
                {
                    name: "⚔️ Erza's Theme",
                    pattern: [[19], [21], [23], [19], [17], [16]], // G-A-B-G-F-E
                    description: "El tema de la reina de las hadas",
                },
            ],

            level2: [
                {
                    name: "🎵 Main Theme (Acordes)",
                    pattern: [
                        [0, 4],
                        [24, 28],
                        [2, 6],
                        [26, 30],
                        [5, 9],
                        [29, 33],
                    ],
                    description: "Armonías del tema principal",
                },
                {
                    name: "🏰 Guild Theme",
                    pattern: [
                        [0, 4, 7],
                        [24, 28, 31],
                        [2, 5, 9],
                        [26, 29, 33],
                    ],
                    description: "El espíritu del gremio",
                },
                {
                    name: "😢 Sad Theme",
                    pattern: [
                        [1, 4, 8],
                        [25, 28, 32],
                        [3, 6, 10],
                        [27, 30, 34],
                    ],
                    description: "Momentos melancólicos",
                },
            ],

            level3: [
                {
                    name: "🎵 Main Theme Completo",
                    pattern: [[12], [14, 26], [16, 28], [17, 5], [19, 7, 31], [21, 9, 33]],
                    description: "La versión completa épica",
                },
                {
                    name: "🐉 Dragon Force Épico",
                    pattern: [
                        [0, 12, 24],
                        [4, 16, 28],
                        [7, 19, 31],
                        [2, 14, 26],
                        [5, 17, 29],
                    ],
                    description: "El poder del dragón en toda su gloria",
                },
                {
                    name: "⚔️ The Last Battle",
                    pattern: [
                        [0, 4, 7, 12],
                        [16, 19, 23],
                        [24, 28, 31, 35],
                        [2, 5, 9, 14],
                    ],
                    description: "La batalla final épica",
                },
                {
                    name: "🔥 Natsu's Theme",
                    pattern: [
                        [12, 16, 19],
                        [14, 17, 21],
                        [16, 19, 23],
                        [24, 28, 31],
                    ],
                    description: "La llama del dragón",
                },
            ],
        }
    }

    getPatternsByLevel(level) {
        const levelKey = `level${level}`
        return this.patterns[levelKey] || this.patterns.level3
    }

    getPattern(level, index) {
        const patterns = this.getPatternsByLevel(level)
        return patterns[index % patterns.length]
    }

    getAllSongs() {
        const allSongs = []
        Object.keys(this.patterns).forEach((level) => {
            this.patterns[level].forEach((song) => {
                allSongs.push({
                    ...song,
                    level: level,
                })
            })
        })
        return allSongs
    }
}
