var supportedLocales = [
    "en",
    "fr",
    "pl",
    "de",
    "nl",
    "pt",
    "it",
    "es"
]

let languages = navigator.languages;
for (let i = 0; i < languages.length; i++) {
    let language = languages[i];
    let languageRoot = language.split("-")[0];
    if (supportedLocales.indexOf(languageRoot) != -1) {
        LOCALE = languageRoot;
        break;
    }
}

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

i18nData["play"]["pl"] = "GRAJ";
i18nData["completed"]["pl"] = "ukończone";
i18nData["home-story-mode"]["pl"] = "tryb opowieści";
i18nData["home-expert-mode"]["pl"] = "tryb eksperta";
i18nData["home-community-mode"]["pl"] = "zagadki społeczności";
i18nData["intro-to-play-keyboard"]["pl"] = "Kliknij, aby zagrać";
i18nData["intro-to-play-touch"]["pl"] = "Dotknij, aby zagrać";
i18nData["intro-tip-keyboard"]["pl"] = "Przytrzymaj [A] i [D] lub [<] i [>], aby przesunąć piłkę";
i18nData["intro-tip-touch"]["pl"] = "Przytrzymaj [<] i [>], aby przesunąć piłkę";
i18nData["success-title"]["pl"] = "SUKCES!";
i18nData["success-submit-score"]["pl"] = "Prześlij wynik";
i18nData["success-sending-score"]["pl"] = "Wysyłanie...";
i18nData["success-well-played"]["pl"] = "Dobrze zagrane!";
i18nData["success-continue"]["pl"] = "Kontynuuj";
i18nData["success-next-level"]["pl"] = "Następny poziom";
i18nData["success-expert-unlocked"]["pl"] = "zagadka odblokowana";
i18nData["tuto-title"]["pl"] = "Samouczek";
i18nData["tuto-0-label"]["pl"] = "Kontekst";
i18nData["tuto-0-text"]["pl"] = "To jest piłka.";
i18nData["tuto-1-label"]["pl"] = "Zasada";
i18nData["tuto-1-text"]["pl"] = "Piłka zawsze porusza się w górę i w dół.";
i18nData["tuto-2-label"]["pl"] = "Kontrola";
i18nData["tuto-2-text"]["pl"] = "Możesz sterować piłką tylko w lewo lub w prawo.";
i18nData["tuto-3-label"]["pl"] = "Cel";
i18nData["tuto-3-text"]["pl"] = "Zbierz wszystkie kafelki, aby ukończyć zagadkę!";
i18nData["lesson-1-title"]["pl"] = "Lekcja 1 - Kontrola";
i18nData["lesson-2-title"]["pl"] = "Lekcja 2 - Kolor";
i18nData["lesson-3-title"]["pl"] = "Lekcja 3 - Otwór";
i18nData["lesson-4-title"]["pl"] = "Lekcja 4 - Pchnięcie";
i18nData["lesson-5-title"]["pl"] = "Lekcja 5 - Drzwi";
i18nData["lesson-6-title"]["pl"] = "Lekcja 6 - Pęknięcie";
i18nData["lesson-7-title"]["pl"] = "Lekcja 7 - Woda";
i18nData["lesson-8-title"]["pl"] = "Lekcja 8 - Kolce";
i18nData["lesson-9-title"]["pl"] = "Lekcja 9 - Szczelina";
i18nData["lesson-1-haiku"]["pl"] = "Używaj [A] i [D], aby\nporuszać się w lewo i prawo.";
i18nData["lesson-2-haiku"]["pl"] = "Uderz w bęben,\naby zmienić kolor.";
i18nData["lesson-3-haiku"]["pl"] = "Nie wpadnij do dziury.";
i18nData["lesson-4-haiku"]["pl"] = "Drewniane skrzynki\nmożna pchać.";
i18nData["lesson-5-haiku"]["pl"] = "Uderz w kluczowy kafelek,\naby otworzyć kafelki drzwi.";
i18nData["lesson-6-haiku"]["pl"] = "Popękane kafelki można\nprzekroczyć tylko raz.";
i18nData["lesson-7-haiku"]["pl"] = "Woda spływa\nna dół.";
i18nData["lesson-8-haiku"]["pl"] = "Kolce są niebezpieczne,\nunikaj kolców.";
i18nData["lesson-9-haiku"]["pl"] = "Używaj kafelków,\naby uniknąć szczeliny.";

i18nData["play"]["de"] = "SPIELEN";
i18nData["completed"]["de"] = "abgeschlossen";
i18nData["home-story-mode"]["de"] = "Story-Modus";
i18nData["home-expert-mode"]["de"] = "Experten modus";
i18nData["home-community-mode"]["de"] = "Community-Rätsel";
i18nData["intro-to-play-keyboard"]["de"] = "Zum Spielen klicken";
i18nData["intro-to-play-touch"]["de"] = "Zum Spielen berühren";
i18nData["intro-tip-keyboard"]["de"] = "Halten Sie [A] und [D] oder [<] und [>] gedrückt, um den Ball zu bewegen";
i18nData["intro-tip-touch"]["de"] = "Halten Sie [<] und [>] gedrückt, um den Ball zu bewegen";
i18nData["success-title"]["de"] = "ERFOLGREICH!";
i18nData["success-submit-score"]["de"] = "Punktzahl übermitteln";
i18nData["success-sending-score"]["de"] = "Senden...";
i18nData["success-well-played"]["de"] = "Gut gespielt!";
i18nData["success-continue"]["de"] = "Weiter";
i18nData["success-next-level"]["de"] = "Nächstes Level";
i18nData["success-expert-unlocked"]["de"] = "Rätsel freigeschaltet";
i18nData["tuto-title"]["de"] = "Tutorial";
i18nData["tuto-0-label"]["de"] = "Kontext";
i18nData["tuto-0-text"]["de"] = "Das ist der Ball.";
i18nData["tuto-1-label"]["de"] = "Regel";
i18nData["tuto-1-text"]["de"] = "Der Ball bewegt sich immer auf und ab.";
i18nData["tuto-2-label"]["de"] = "Steuerung";
i18nData["tuto-2-text"]["de"] = "Sie können den Ball nur nach links oder rechts lenken.";
i18nData["tuto-3-label"]["de"] = "Ziel";
i18nData["tuto-3-text"]["de"] = "Sammeln Sie alle Kacheln, um das Rätsel zu lösen!";
i18nData["lesson-1-title"]["de"] = "Lektion 1 – Steuerung";
i18nData["lesson-2-title"]["de"] = "Lektion 2 – Farbe";
i18nData["lesson-3-title"]["de"] = "Lektion 3 – Loch";
i18nData["lesson-4-title"]["de"] = "Lektion 4 – Stoßen";
i18nData["lesson-5-title"]["de"] = "Lektion 5 – Die Türen";
i18nData["lesson-6-title"]["de"] = "Lektion 6 – Riss";
i18nData["lesson-7-title"]["de"] = "Lektion 7 – Wasser";
i18nData["lesson-8-title"]["de"] = "Lektion 8 – Stacheln";
i18nData["lesson-9-title"]["de"] = "Lektion 9 – Lücke";
i18nData["lesson-1-haiku"]["de"] = "Verwenden Sie [A] und [D],\num sich nach links\nund rechts zu bewegen.";
i18nData["lesson-2-haiku"]["de"] = "Schlagen Sie auf eine Trommel,\num die Farbe zu ändern.";
i18nData["lesson-3-haiku"]["de"] = "Fallen Sie nicht in ein Loch.";
i18nData["lesson-4-haiku"]["de"] = "Holzkisten können geschoben werden.";
i18nData["lesson-5-haiku"]["de"] = "Schlagen Sie auf eine\nSchlüsselkachel, um Türkacheln\nzu öffnen.";
i18nData["lesson-6-haiku"]["de"] = "Gesprungene Kacheln können\nnur einmal überquert werden.";
i18nData["lesson-7-haiku"]["de"] = "Wasser fließt nach unten.";
i18nData["lesson-8-haiku"]["de"] = "Spikes sind gefährlich,\nvermeiden Sie die Spikes.";
i18nData["lesson-9-haiku"]["de"] = "Verwenden Sie die Kacheln,\num der Gletscherspalte auszuweichen.";

i18nData["play"]["pt"] = "JOGAR";
i18nData["completed"]["pt"] = "concluído";
i18nData["home-story-mode"]["pt"] = "modo história";
i18nData["home-expert-mode"]["pt"] = "modo especialista";
i18nData["home-community-mode"]["pt"] = "quebra-cabeças da comunidade";
i18nData["intro-to-play-keyboard"]["pt"] = "Clique para jogar";
i18nData["intro-to-play-touch"]["pt"] = "Toque para jogar";
i18nData["intro-tip-keyboard"]["pt"] = "Segure [A] e [D] ou [<] e [>] para mover a bola";
i18nData["intro-tip-touch"]["pt"] = "Segure [<] e [>] para mover a bola";
i18nData["success-title"]["pt"] = "SUCESSO!";
i18nData["success-submit-score"]["pt"] = "Enviar pontuação";
i18nData["success-sending-score"]["pt"] = "Enviando...";
i18nData["success-well-played"]["pt"] = "Bem jogado!";
i18nData["success-continue"]["pt"] = "Continuar";
i18nData["success-next-level"]["pt"] = "Próximo nível";
i18nData["success-expert-unlocked"]["pt"] = "quebra-cabeça desbloqueado";
i18nData["tuto-title"]["pt"] = "Tutorial";
i18nData["tuto-0-label"]["pt"] = "Contexto";
i18nData["tuto-0-text"]["pt"] = "Esta é a bola.";
i18nData["tuto-1-label"]["pt"] = "Regra";
i18nData["tuto-1-text"]["pt"] = "A bola sempre se move para cima e para baixo.";
i18nData["tuto-2-label"]["pt"] = "Controle";
i18nData["tuto-2-text"]["pt"] = "Você só pode dirigir a bola para a esquerda ou direita.";
i18nData["tuto-3-label"]["pt"] = "Objetivo";
i18nData["tuto-3-text"]["pt"] = "Colete todas as peças para completar o quebra-cabeça!";
i18nData["lesson-1-title"]["pt"] = "Lição 1 - Controle";
i18nData["lesson-2-title"]["pt"] = "Lição 2 - Cor";
i18nData["lesson-3-title"]["pt"] = "Lição 3 - Buraco";
i18nData["lesson-4-title"]["pt"] = "Lição 4 - Empurrar";
i18nData["lesson-5-title"]["pt"] = "Lição 5 - As portas";
i18nData["lesson-6-title"]["pt"] = "Lição 6 - Rachadura";
i18nData["lesson-7-title"]["pt"] = "Lição 7 - Água";
i18nData["lesson-8-title"]["pt"] = "Lição 8 - Picos";
i18nData["lesson-9-title"]["pt"] = "Lição 9 - Lacuna";
i18nData["lesson-1-haiku"]["pt"] = "Use [A] e [D] para mover\npara a esquerda e direita.";
i18nData["lesson-2-haiku"]["pt"] = "Bata em um tambor\npara mudar de cor.";
i18nData["lesson-3-haiku"]["pt"] = "Não caia em um buraco.";
i18nData["lesson-4-haiku"]["pt"] = "Caixas de madeira\npodem ser empurradas.";
i18nData["lesson-5-haiku"]["pt"] = "Bata em uma Key Tile\npara abrir Door Tiles.";
i18nData["lesson-6-haiku"]["pt"] = "Tiles rachadas só podem\nser cruzadas uma vez.";
i18nData["lesson-7-haiku"]["pt"] = "A água flui\npara o fundo.";
i18nData["lesson-8-haiku"]["pt"] = "Spikes são perigosos,\nevite os Spikes.";
i18nData["lesson-9-haiku"]["pt"] = "Use os Tiles\npara evitar a fenda.";

i18nData["play"]["it"] = "GIOCA";
i18nData["completed"]["it"] = "completato";
i18nData["home-story-mode"]["it"] = "modalità storia";
i18nData["home-expert-mode"]["it"] = "modalità esperto";
i18nData["home-community-mode"]["it"] = "puzzle della comunità";
i18nData["intro-to-play-keyboard"]["it"] = "Clicca per giocare";
i18nData["intro-to-play-touch"]["it"] = "Tocca per giocare";
i18nData["intro-tip-keyboard"]["it"] = "Tieni premuti [A] e [D] o [<] e [>] per muovere la palla";
i18nData["intro-tip-touch"]["it"] = "Tieni premuti [<] e [>] per muovere la palla";
i18nData["success-title"]["it"] = "SUCCESSO !";
i18nData["success-submit-score"]["it"] = "Invia punteggio";
i18nData["success-sending-score"]["it"] = "Invio in corso...";
i18nData["success-well-played"]["it"] = "Ben giocato !";
i18nData["success-continue"]["it"] = "Continua";
i18nData["success-next-level"]["it"] = "Livello successivo";
i18nData["success-expert-unlocked"]["it"] = "puzzle sbloccato";
i18nData["tuto-title"]["it"] = "Tutorial";
i18nData["tuto-0-label"]["it"] = "Contesto";
i18nData["tuto-0-text"]["it"] = "Questa è la palla.";
i18nData["tuto-1-label"]["it"] = "Regola";
i18nData["tuto-1-text"]["it"] = "La palla si muove sempre su e giù.";
i18nData["tuto-2-label"]["it"] = "Controllo";
i18nData["tuto-2-text"]["it"] = "Puoi solo guidare la palla a sinistra o a destra.";
i18nData["tuto-3-label"]["it"] = "Obiettivo";
i18nData["tuto-3-text"]["it"] = "Raccogli tutte le tessere per completare il puzzle!";
i18nData["lesson-1-title"]["it"] = "Lezione 1 - Controllo";
i18nData["lesson-2-title"]["it"] = "Lezione 2 - Colore";
i18nData["lesson-3-title"]["it"] = "Lezione 3 - Buco";
i18nData["lesson-4-title"]["it"] = "Lezione 4 - Spingi";
i18nData["lesson-5-title"]["it"] = "Lezione 5 - Le porte";
i18nData["lesson-6-title"]["it"] = "Lezione 6 - Crepa";
i18nData["lesson-7-title"]["it"] = "Lezione 7 - Acqua";
i18nData["lesson-8-title"]["it"] = "Lezione 8 - Punte";
i18nData["lesson-9-title"]["it"] = "Lezione 9 - Spazio";
i18nData["lesson-1-haiku"]["it"] = "Usa [A] e [D] per muoverti\na sinistra e a destra.";
i18nData["lesson-2-haiku"]["it"] = "Colpisci un tamburo\nper cambiare colore.";
i18nData["lesson-3-haiku"]["it"] = "Non cadere in un buco.";
i18nData["lesson-4-haiku"]["it"] = "Le scatole di legno\npossono essere spinte.";
i18nData["lesson-5-haiku"]["it"] = "Colpisci una tessera chiave\nper aprire le tessere porta.";
i18nData["lesson-6-haiku"]["it"] = "Le tessere incrinate possono\nessere attraversate solo una volta.";
i18nData["lesson-7-haiku"]["it"] = "L'acqua scorre\nverso il basso.";
i18nData["lesson-8-haiku"]["it"] = "Le punte sono pericolose,\nevita le punte.";
i18nData["lesson-9-haiku"]["it"] = "Usa le tessere per\nevitare il crepaccio.";

i18nData["play"]["es"] = "JUGAR";
i18nData["completed"]["es"] = "completado";
i18nData["home-story-mode"]["es"] = "modo historia";
i18nData["home-expert-mode"]["es"] = "modo experto";
i18nData["home-community-mode"]["es"] = "rompecabezas de la comunidad";
i18nData["intro-to-play-keyboard"]["es"] = "Haz clic para jugar";
i18nData["intro-to-play-touch"]["es"] = "Toca para jugar";
i18nData["intro-tip-keyboard"]["es"] = "Mantén presionados [A] y [D] o [<] y [>] para mover la pelota";
i18nData["intro-tip-touch"]["es"] = "Mantén presionados [<] y [>] para mover la pelota";
i18nData["success-title"]["es"] = "¡ÉXITO!";
i18nData["success-submit-score"]["es"] = "Enviar puntaje";
i18nData["success-sending-score"]["es"] = "Enviando...";
i18nData["success-well-played"]["es"] = "¡Bien jugado!";
i18nData["success-continue"]["es"] = "Continuar";
i18nData["success-next-level"]["es"] = "Siguiente nivel";
i18nData["success-expert-unlocked"]["es"] = "rompecabezas desbloqueado";
i18nData["tuto-title"]["es"] = "Tutorial";
i18nData["tuto-0-label"]["es"] = "Contexto";
i18nData["tuto-0-text"]["es"] = "Esta es la pelota.";
i18nData["tuto-1-label"]["es"] = "Regla";
i18nData["tuto-1-text"]["es"] = "La pelota siempre se mueve hacia arriba y hacia abajo.";
i18nData["tuto-2-label"]["es"] = "Control";
i18nData["tuto-2-text"]["es"] = "Solo puedes dirigir la pelota hacia la izquierda o la derecha.";
i18nData["tuto-3-label"]["es"] = "Objetivo";
i18nData["tuto-3-text"]["es"] = "¡Reúne todas las fichas para completar el rompecabezas!";
i18nData["lesson-1-title"]["es"] = "Lección 1: Control";
i18nData["lesson-2-title"]["es"] = "Lección 2: Color";
i18nData["lesson-3-title"]["es"] = "Lección 3: Agujero";
i18nData["lesson-4-title"]["es"] = "Lección 4: Empujar";
i18nData["lesson-5-title"]["es"] = "Lección 5: Las puertas";
i18nData["lesson-6-title"]["es"] = "Lección 6: Grieta";
i18nData["lesson-7-title"]["es"] = "Lección 7: Agua";
i18nData["lesson-8-title"]["es"] = "Lección 8: Púas";
i18nData["lesson-9-title"]["es"] = "Lección 9: Hueco";
i18nData["lesson-1-haiku"]["es"] = "Usa [A] y [D] para moverte\nhacia la izquierda y la derecha.";
i18nData["lesson-2-haiku"]["es"] = "Golpea un tambor\npara cambiar de color.";
i18nData["lesson-3-haiku"]["es"] = "No caigas en un agujero.";
i18nData["lesson-4-haiku"]["es"] = "Las cajas de madera\nse pueden empujar.";
i18nData["lesson-5-haiku"]["es"] = "Golpea una llave\npara abrir las puertas.";
i18nData["lesson-6-haiku"]["es"] = "Las fichas agrietadas\nsolo se pueden cruzar una vez.";
i18nData["lesson-7-haiku"]["es"] = "El agua fluye\nhacia el fondo.";
i18nData["lesson-8-haiku"]["es"] = "Los pinchos son peligrosos,\nevítalos.";
i18nData["lesson-9-haiku"]["es"] = "Usa las fichas\npara evitar la grieta.";

i18nData["play"]["nl"] = "SPELEN";
i18nData["completed"]["nl"] = "voltooid";
i18nData["home-story-mode"]["nl"] = "verhaalmodus";
i18nData["home-expert-mode"]["nl"] = "expertmodus";
i18nData["home-community-mode"]["nl"] = "communitypuzzels";
i18nData["intro-to-play-keyboard"]["nl"] = "Klik om te spelen";
i18nData["intro-to-play-touch"]["nl"] = "Aanraken om te spelen";
i18nData["intro-tip-keyboard"]["nl"] = "Houd [A] en [D] of [<] en [>] ingedrukt om de bal te verplaatsen";
i18nData["intro-tip-touch"]["nl"] = "Houd [<] en [>] ingedrukt om de bal te verplaatsen";
i18nData["success-title"]["nl"] = "SUCCES!";
i18nData["success-submit-score"]["nl"] = "Score indienen";
i18nData["success-sending-score"]["nl"] = "Verzenden...";
i18nData["success-well-played"]["nl"] = "Goed gespeeld!";
i18nData["success-continue"]["nl"] = "Doorgaan";
i18nData["success-next-level"]["nl"] = "Volgend niveau";
i18nData["success-expert-unlocked"]["nl"] = "puzzel ontgrendeld";
i18nData["tuto-title"]["nl"] = "Tutorial";
i18nData["tuto-0-label"]["nl"] = "Context";
i18nData["tuto-0-text"]["nl"] = "Dit is de bal.";
i18nData["tuto-1-label"]["nl"] = "Regel";
i18nData["tuto-1-text"]["nl"] = "De bal beweegt altijd omhoog en omlaag.";
i18nData["tuto-2-label"]["nl"] = "Besturing";
i18nData["tuto-2-text"]["nl"] = "Je kunt de bal alleen naar links of rechts sturen.";
i18nData["tuto-3-label"]["nl"] = "Doel";
i18nData["tuto-3-text"]["nl"] = "Verzamel alle tegels om de puzzel te voltooien!";
i18nData["lesson-1-title"]["nl"] = "Les 1 - Besturing";
i18nData["lesson-2-title"]["nl"] = "Les 2 - Kleur";
i18nData["lesson-3-title"]["nl"] = "Les 3 - Gat";
i18nData["lesson-4-title"]["nl"] = "Les 4 - Duwen";
i18nData["lesson-5-title"]["nl"] = "Les 5 - De deuren";
i18nData["lesson-6-title"]["nl"] = "Les 6 - Barst";
i18nData["lesson-7-title"]["nl"] = "Les 7 - Water";
i18nData["lesson-8-title"]["nl"] = "Les 8 - Spikes";
i18nData["lesson-9-title"]["nl"] = "Les 9 - Gap";
i18nData["lesson-1-haiku"]["nl"] = "Gebruik [A] en [D] om naar\nlinks en rechts te bewegen.";
i18nData["lesson-2-haiku"]["nl"] = "Sla op een trommel om\nvan kleur te veranderen.";
i18nData["lesson-3-haiku"]["nl"] = "Val niet in een gat.";
i18nData["lesson-4-haiku"]["nl"] = "Houten kisten kunnen\nworden geduwd.";
i18nData["lesson-5-haiku"]["nl"] = "Sla op een sleuteltegel\nom deurtegels te openen.";
i18nData["lesson-6-haiku"]["nl"] = "Gebarsten tegels kunnen maar\néén keer worden overgestoken.";
i18nData["lesson-7-haiku"]["nl"] = "Water stroomt\nnaar de bodem.";
i18nData["lesson-8-haiku"]["nl"] = "Spikes zijn gevaarlijk,\nvermijd de spikes.";
i18nData["lesson-9-haiku"]["nl"] = "Gebruik de tegels om\nde spleet te vermijden.";

let fullEnglishText = "";
for (const key in i18nData) {
    fullEnglishText += i18nData[key]["en"].replaceAll("\n", " ") + "\n";
}
console.log(fullEnglishText);

function AddTranslation(locale: string, text: string): void {
    let lines = text.split("\n");
    let n = 0;
    let output = "";
    for (const key in i18nData) {
        output += "i18nData[\"" + key + "\"][\"" + locale + "\"] = \"" + lines[n] + "\";\n";
        n++;
    }
    console.log(output);
}
