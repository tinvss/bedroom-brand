# Bedroom Brand

Ein Aufbauspiel fürs Handy. Vom Kinderzimmer zur Marke.

- Play in English: https://tinvss.github.io/bedroom-brand/
- Auf Deutsch spielen: https://tinvss.github.io/bedroom-brand/de.html

Hier liegt der fertige Stand zum Testen. Kein Build-Schritt, die Seiten laufen direkt.

- `index.html`, `de.html`: Gerüst pro Sprache, laden Texte und Code
- `text/en.js`, `text/de.js`: alle Texte, im Code als `TX.name`
- `js/`: der Code, für beide Sprachen gemeinsam, in Ladereihenfolge in den HTML-Dateien
- `css/spiel.css`: das Aussehen

Nach einer Änderung an `js/`, `text/` oder `css/` die Zahl hinter `?v=` in beiden HTML-Dateien hochzählen,
sonst zeigen Handys eine Weile noch die alte Fassung.

Zum Testen: `?test` in der Adresse zeigt Testknöpfe, `?test=k3` springt direkt zum Angebot für Kapitel 3.
Testspiele werden getrennt gespeichert und überschreiben den echten Spielstand nicht.
