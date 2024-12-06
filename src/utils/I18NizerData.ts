var i18nData = {};

// Homepage
i18nData["play"] = {
    "en": "PLAY",
    "fr": "JOUER"
}
i18nData["completed"] = {
    "en": "completed",
    "fr": "completé"
}
i18nData["home-story-mode"] = {
    "en": "story mode",
    "fr": "mode histoire"
}
i18nData["home-expert-mode"] = {
    "en": "expert mode",
    "fr": "mode expert"
}
i18nData["home-community-mode"] = {
    "en": "community puzzles",
    "fr": "puzzles maison"
}

// Intro Screen
i18nData["intro-to-play-keyboard"] = {
    "en": "Click to play",
    "fr": "Cliquez pour démarrer",
}
i18nData["intro-to-play-touch"] = {
    "en": "Touch to play",
    "fr": "Pressez pour démarrer",
}
i18nData["intro-tip-keyboard"] = {
    "en": "Hold [A] and [D] or [<] and [>] to move the ball",
    "fr": "Pressez [A] et [D] ou [<] et [>] pour diriger la balle",
}
i18nData["intro-tip-touch"] = {
    "en": "Hold [<] and [>] to move the ball",
    "fr": "Pressez [<] et [>] pour diriger la balle",
}

// Success Panel
i18nData["success-title"] = {
    "en": "SUCCESS !",
    "fr": "VICTOIRE !"
}
i18nData["success-submit-score"] = {
    "en": "Submit Score",
    "fr": "Publier Score"
}
i18nData["success-sending-score"] = {
    "en": "Sending...",
    "fr": "Envoi..."
}
i18nData["success-well-played"] = {
    "en": "Well Played !",
    "fr": "Bien Joué !"
}
i18nData["success-continue"] = {
    "en": "Continue",
    "fr": "Continuer"
}
i18nData["success-next-level"] = {
    "en": "Next Level",
    "fr": "Niveau Suivant"
}
i18nData["success-expert-unlocked"] = {
    "en": "puzzle unlocked",
    "fr": "puzzle déverrouillé"
}

// Tutorial
i18nData["tuto-title"] = {
    "en": "Tutorial",
    "fr": "Instructions"
}
i18nData["tuto-0-label"] = {
    "en": "Context",
    "fr": "Contexte"
}
i18nData["tuto-0-text"] = {
    "en": "This is the Ball.",
    "fr": "Ceci est la Balle."
}
i18nData["tuto-1-label"] = {
    "en": "Rule",
    "fr": "Règle"
}
i18nData["tuto-1-text"] = {
    "en": "The Ball always moves up and down.",
    "fr": "La balle se déplace toujours verticalement."
}
i18nData["tuto-2-label"] = {
    "en": "Control",
    "fr": "Contrôle"
}
i18nData["tuto-2-text"] = {
    "en": "You can only steer the Ball Left or Right.",
    "fr": "Vous pouvez contrôler la balle horizontalement."
}
i18nData["tuto-3-label"] = {
    "en": "Objective",
    "fr": "Objectif"
}
i18nData["tuto-3-text"] = {
    "en": "Collect all the Tiles to complete the Puzzle !",
    "fr": "Collectez tous les Blocs pour terminer le Puzzle !"
}

// Puzzle Titles
i18nData["lesson-1-title"] = {
    "en": "Lesson 1 - Control",
    "fr": "Leçon 1 - Contrôle",
}
i18nData["lesson-2-title"] = {
    "en": "Lesson 2 - Color",
    "fr": "Leçon 2 - Couleur ",
}
i18nData["lesson-3-title"] = {
    "en": "Lesson 3 - Hole",
    "fr": "Leçon 3 - Trou",
}
i18nData["lesson-4-title"] = {
    "en": "Lesson 4 - Push",
    "fr": "Leçon 4 - Pousser",
}
i18nData["lesson-5-title"] = {
    "en": "Lesson 5 - The Doors",
    "fr": "Leçon 5 - Les Portes",
}
i18nData["lesson-6-title"] = {
    "en": "Lesson 6 - Crack",
    "fr": "Leçon 6 - Fissure",
}
i18nData["lesson-7-title"] = {
    "en": "Lesson 7 - Water",
    "fr": "Leçon 7 - Eau",
}
i18nData["lesson-8-title"] = {
    "en": "Lesson 8 - Spikes",
    "fr": "Leçon 8 - Piquants",
}
i18nData["lesson-9-title"] = {
    "en": "Lesson 9 - Gap",
    "fr": "Leçon 9 - Passage",
}

// Translated Haikus
i18nData["lesson-1-haiku"] = {
    "en": "Use [A] and [D] to\nmove Left and Right.",
    "fr": "Pressez [A] et [D] pour\naller à Gauche ou à Droite.",
}

i18nData["lesson-2-haiku"] = {
    "en": "Hit a Drum to\nchange Color.",
    "fr": "Touchez un disque\npour changer de Couleur.",
}

i18nData["lesson-3-haiku"] = {
    "en": "Do not fall in a hole.",
    "fr": "Ne tombez pas dans un trou.",
}

i18nData["lesson-4-haiku"] = {
    "en": "Wooden Boxes\ncan be Pushed.",
    "fr": "Les Blocs en bois\npeuvent être Poussés.",
}

i18nData["lesson-5-haiku"] = {
    "en": "Hit a Key Tile\nto open Door Tiles.",
    "fr": "Touchez une Clef\npour ouvrir les Portes.",
}

i18nData["lesson-6-haiku"] = {
    "en": "Cracked Tiles can\nonly be crossed once.",
    "fr": "Une Dalle fendue\ncède après un passage.",
}

i18nData["lesson-7-haiku"] = {
    "en": "Water flows\nto the bottom.",
    "fr": "L'eau s'écoule\nvers le bas.",
}

i18nData["lesson-8-haiku"] = {
    "en": "Spikes are dangerous\navoid the Spikes.",
    "fr": "Attention ! Piquants !\nEvitez les Piquants.",
}

i18nData["lesson-9-haiku"] = {
    "en": "Use the Tiles to\navoid the crevass.",
    "fr": "Utilisez les blocs\npour éviter le gouffre.",
}

let fullEnglishText = ""
for (const key in i18nData) {
    fullEnglishText += i18nData[key]["en"].replaceAll("\n", " ") + "\n";
}
console.log(fullEnglishText);

console.log(JSON.stringify(i18nData));