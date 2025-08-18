# Adiss - Profil Web

Moderní a interaktivní osobní profil web s tmavým designem a animacemi.

## 🚀 Funkce

- **Tmavý design** s gradientovým pozadím inspirovaný vesmírem
- **Animované hvězdy** na pozadí
- **Interaktivní profilový obrázek** s hover efekty
- **Sociální odkazy** pro X, Discord, YouTube a TikTok
- **Parallax efekty** při pohybu myši
- **Responzivní design** pro všechna zařízení
- **Smooth animace** a přechody
- **Floating částice** pro větší atmosféru

## 📁 Struktura projektu

```
adiss-profile/
├── index.html          # Hlavní HTML soubor
├── styles.css          # CSS styly a animace
├── script.js           # JavaScript interaktivita
├── README.md           # Tento soubor
└── assets/
    └── images/
        └── profile.jpg  # Váš profilový obrázek (přidejte vlastní)
```

## 🛠️ Nastavení

### 1. Přidání vlastního profilového obrázku
1. Uložte váš profilový obrázek jako `profile.jpg` do složky `assets/images/`
2. Nebo změňte cestu v `index.html` na řádku 18:
   ```html
   <img src="assets/images/VAS_OBRAZEK.jpg" alt="Adiss Profile" class="avatar" id="avatar">
   ```

### 2. Úprava sociálních odkazů
V souboru `index.html` změňte `href="#"` atributy na vaše skutečné odkazy:

```html
<!-- X (Twitter) -->
<a href="https://x.com/vase_uzivatelske_jmeno" class="social-link" data-platform="x">

<!-- Discord -->
<a href="https://discord.gg/vas_server" class="social-link" data-platform="discord">

<!-- YouTube -->
<a href="https://youtube.com/@vase_kanal" class="social-link" data-platform="youtube">

<!-- TikTok -->
<a href="https://tiktok.com/@vase_uzivatelske_jmeno" class="social-link" data-platform="tiktok">
```

### 3. Personalizace obsahu
Změňte následující prvky v `index.html`:
- **Název**: Změňte "Adiss" na váš název (řádek 24)
- **Status**: Změňte "🎮 Gaming enthusiast" na váš status (řádek 25)  
- **Popis**: Změňte "Welcome to my profile" na váš popis (řádek 26)
- **Počet views**: Změňte číslo na řádku 58

## 🎨 Přizpůsobení

### Změna barev
V souboru `styles.css` můžete změnit barevné schéma:
- **Pozadí**: Řádky 8-9 (gradient)
- **Hlavní barvy**: `#667eea` a `#764ba2` (používají se v celém designu)
- **Barvy sociálních sítí**: Řádky 270-289

### Přidání dalších sociálních sítí
1. Přidejte nový odkaz do HTML s odpovídajícím SVG
2. Přidejte CSS styling pro hover efekt
3. JavaScript automaticky přidá interaktivitu

## 📱 Responzivní design
Web je optimalizován pro:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobil** (480px - 767px)
- **Malé mobily** (<480px)

## 🌟 Efekty a animace

- **Parallax**: Karta se pohybuje za myší
- **Hover efekty**: Na všech interaktivních prvcích
- **Ripple efekt**: Při kliknutí na sociální odkazy
- **Floating částice**: Animované pozadí
- **Pulsing**: Profilový obrázek pulzuje
- **Rotating ring**: Otáčející se kroužek kolem avataru

## 🚀 Spuštění

1. Stáhněte všechny soubory do jedné složky
2. Přidejte vlastní profilový obrázek
3. Upravte odkazy a obsah podle potřeby
4. Otevřete `index.html` ve webovém prohlížeči

## 💡 Tipy

- Pro nejlepší výsledek používejte čtvercový obrázek (512x512px nebo více)
- Testujte na různých zařízeních
- Můžete změnit animace v CSS podle preference
- Pro hosting použijte GitHub Pages, Netlify nebo podobné služby

## 🔧 Pokročilé úpravy

### Změna animací
V `script.js` můžete upravit:
- Rychlost animací
- Počet částic
- Sílu parallax efektu

### Přidání dalších sekcí
Můžete přidat nové sekce jako:
- Portfolio
- Skills
- About me
- Contact form

---

**Užijte si váš nový profil web! 🎉**
