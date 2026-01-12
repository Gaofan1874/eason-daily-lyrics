// Acquire VS Code API
const vscode = acquireVsCodeApi();

// Get data injected from the extension
const initialLyric = window.posterData.lyric;
const bgSrc = window.posterData.bgSrc;

const canvas = document.getElementById('posterCanvas');
const ctx = canvas.getContext('2d');

// --- Configuration & Defaults ---
const THEME_DEFAULTS = {
    classic: { fontSize: 36, lineHeight: 60, fontFace: 'Microsoft YaHei', color: '#ffffff' },
    polaroid: { fontSize: 26, lineHeight: 42, fontFace: 'Times New Roman', color: '#333333' },
    cinema:   { fontSize: 24, lineHeight: 35, fontFace: 'sans-serif', color: '#FFC90E' }
};

// --- State Management ---
const initialTheme = 'classic';
const initialDefaults = THEME_DEFAULTS[initialTheme];

const state = {
    img: null,
    isLoaded: false,
    x: 0,
    y: 0,
    scale: 1,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    
    // User Settings
    theme: initialTheme, // classic | polaroid | cinema
    showWatermark: true,
    
    // Text Settings
    lyricText: initialLyric.content,
    fontSize: initialDefaults.fontSize,
    lineHeight: initialDefaults.lineHeight,
    textOffsetY: 0
};

// --- UI Elements ---
const els = {
    lyricInput: document.getElementById('lyricInput'),
    fontSizeInput: document.getElementById('fontSizeInput'),
    lineHeightInput: document.getElementById('lineHeightInput'),
    textOffsetInput: document.getElementById('textOffsetInput'),
    fontSizeVal: document.getElementById('fontSizeVal'),
    lineHeightVal: document.getElementById('lineHeightVal'),
    textOffsetVal: document.getElementById('textOffsetVal'),
    watermarkCheck: document.getElementById('watermarkCheck'),
    resetPosBtn: document.getElementById('resetPosBtn'),
    resetParamsBtn: document.getElementById('resetParamsBtn'),
    saveBtn: document.getElementById('saveBtn')
};

// --- Initialization ---

// 1. Initialize Inputs
els.lyricInput.value = state.lyricText;
updateInputsFromState();

// 2. Load Image
const img = new Image();
img.src = bgSrc;
img.onload = () => {
    state.img = img;
    state.isLoaded = true;
    fitImageToLayout();
    draw();
};
img.onerror = () => {
    draw(); 
}

// --- Interaction Events ---

// Text Controls
els.lyricInput.addEventListener('input', (e) => {
    state.lyricText = e.target.value;
    draw();
});

els.fontSizeInput.addEventListener('input', (e) => {
    state.fontSize = parseInt(e.target.value, 10);
    els.fontSizeVal.textContent = state.fontSize + 'px';
    draw();
});

els.lineHeightInput.addEventListener('input', (e) => {
    state.lineHeight = parseInt(e.target.value, 10);
    els.lineHeightVal.textContent = state.lineHeight + 'px';
    draw();
});

els.textOffsetInput.addEventListener('input', (e) => {
    state.textOffsetY = parseInt(e.target.value, 10);
    els.textOffsetVal.textContent = state.textOffsetY;
    draw();
});


// Watermark
els.watermarkCheck.addEventListener('change', (e) => {
    state.showWatermark = e.target.checked;
    draw();
});

// Theme Switching
document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        state.theme = newTheme;
        
        // Apply Theme Defaults
        const defaults = THEME_DEFAULTS[newTheme];
        state.fontSize = defaults.fontSize;
        state.lineHeight = defaults.lineHeight;
        state.textOffsetY = 0; // Reset offset on theme change
        
        updateInputsFromState();
        fitImageToLayout(); // Reset layout for new theme
        draw();
    });
});

// Canvas Interaction (Drag & Zoom)
canvas.addEventListener('mousedown', (e) => {
    if (!state.isLoaded) return;
    state.isDragging = true;
    state.lastMouseX = e.offsetX;
    state.lastMouseY = e.offsetY;
    canvas.style.cursor = 'grabbing';
});

window.addEventListener('mouseup', () => {
    state.isDragging = false;
    canvas.style.cursor = 'grab';
});

canvas.addEventListener('mousemove', (e) => {
    if (!state.isDragging) return;
    
    const dx = e.offsetX - state.lastMouseX;
    const dy = e.offsetY - state.lastMouseY;
    
    state.x += dx;
    state.y += dy;
    
    state.lastMouseX = e.offsetX;
    state.lastMouseY = e.offsetY;
    
    requestAnimationFrame(draw);
});

canvas.addEventListener('wheel', (e) => {
    if (!state.isLoaded) return;
    e.preventDefault();

    const zoomIntensity = 0.1;
    const delta = e.deltaY < 0 ? 1 : -1;
    const newScale = state.scale + (delta * zoomIntensity);

    if (newScale > 0.1 && newScale < 10) {
        const canvasCenterX = canvas.width / 2;
        const canvasCenterY = canvas.height / 2;
        
        state.x = canvasCenterX - (canvasCenterX - state.x) * (newScale / state.scale);
        state.y = canvasCenterY - (canvasCenterY - state.y) * (newScale / state.scale);
        
        state.scale = newScale;
        requestAnimationFrame(draw);
    }
});

canvas.style.cursor = 'grab';

// --- Helper Functions ---

function updateInputsFromState() {
    els.fontSizeInput.value = state.fontSize;
    els.fontSizeVal.textContent = state.fontSize + 'px';
    
    els.lineHeightInput.value = state.lineHeight;
    els.lineHeightVal.textContent = state.lineHeight + 'px';
    
    els.textOffsetInput.value = state.textOffsetY;
    els.textOffsetVal.textContent = state.textOffsetY;
}

function getDrawingArea() {
    const w = canvas.width;
    const h = canvas.height;

    switch (state.theme) {
        case 'polaroid':
            return { x: 45, y: 30, w: w - 90, h: w - 90 }; 
        case 'cinema':
            return { x: 0, y: 100, w: w, h: h - 200 };
        case 'classic':
        default:
            return { x: 0, y: 0, w: w, h: h };
    }
}

function fitImageToLayout() {
    if (!state.img) return;
    
    const area = getDrawingArea();
    const areaRatio = area.w / area.h;
    const imgRatio = state.img.width / state.img.height;
    
    let scale;
    if (imgRatio > areaRatio) {
        scale = area.h / state.img.height;
    } else {
        scale = area.w / state.img.width;
    }
    
    state.scale = scale;
    state.x = area.x + (area.w - state.img.width * scale) / 2;
    state.y = area.y + (area.h - state.img.height * scale) / 2;
}


// --- Main Draw Loop ---

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    switch (state.theme) {
        case 'polaroid':
            drawPolaroid();
            break;
        case 'cinema':
            drawCinema();
            break;
        case 'classic':
        default:
            drawClassic();
            break;
    }
}

// --- Theme Renderers ---

function drawClassic() {
    const defaults = THEME_DEFAULTS.classic;

    // 1. Bg
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Image
    drawImageStandard();

    // 3. Text
    ctx.fillStyle = defaults.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${state.fontSize}px "${defaults.fontFace}", sans-serif`;
    
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Base Y is 320, apply offset
    const startY = 320 + state.textOffsetY;
    wrapText(ctx, state.lyricText, 300, startY, 450, state.lineHeight);

    ctx.shadowColor = 'transparent';

    // Song Info (Fixed position relative to bottom, but we can move it slightly if needed, keeping it fixed for now)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#dddddd';
    ctx.font = '22px sans-serif';
    ctx.fillText('—— ' + initialLyric.song + ' ——', 300, 580 + state.textOffsetY); // Move song info too? Yes, usually together.
    ctx.font = '16px sans-serif';
    ctx.fillText('Album: ' + initialLyric.album, 300, 615 + state.textOffsetY);
    ctx.restore();

    if (state.showWatermark) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#FFD700';
        ctx.font = 'normal 12px "Courier New", monospace';
        ctx.textAlign = 'center';
        const text = 'E  A  S  O  N     C  O  D  E     D  A  I  L  Y';
        ctx.fillText(text, 300, 780);
        ctx.restore();
    }
}

function drawPolaroid() {
    const defaults = THEME_DEFAULTS.polaroid;

    // 1. Paper Bg
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Image Area
    const area = getDrawingArea();
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.x, area.y, area.w, area.h);
    ctx.clip();
    
    if (state.isLoaded && state.img) {
        ctx.translate(state.x, state.y);
        ctx.scale(state.scale, state.scale);
        ctx.drawImage(state.img, 0, 0);
    }
    ctx.restore();

    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(area.x, area.y, area.w, area.h);

    // 3. Text Section
    const margin = 50;
    // Base Start Y
    const textBaseY = area.y + area.h + 35; 
    const textStartY = textBaseY + state.textOffsetY;
    const maxWidth = canvas.width - (margin * 2);

    // Lyric
    ctx.fillStyle = defaults.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `normal ${state.fontSize}px "${defaults.fontFace}", serif`;
    
    const linesDrawn = wrapText(ctx, state.lyricText, 300, textStartY, maxWidth, state.lineHeight);

    // Citation
    ctx.fillStyle = '#777777';
    ctx.textAlign = 'right';
    ctx.font = 'italic 18px serif';
    
    const citationY = textStartY + (linesDrawn * state.lineHeight) + 15;
    const citationText = `—— ${initialLyric.song} · ${initialLyric.album}`;
    ctx.fillText(citationText, canvas.width - margin, citationY);

    // 4. Watermark
    if (state.showWatermark) {
        ctx.fillStyle = '#555555'; 
        ctx.font = 'normal 10px "Courier New", monospace';
        ctx.textAlign = 'center';
        const text = 'S  H  O  T     O  N     E  A  S  O  N     C  O  D  E';
        ctx.fillText(text, 300, 780);
    }
}

function drawCinema() {
    const defaults = THEME_DEFAULTS.cinema;

    // 1. Black Bg
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Image Area
    const area = getDrawingArea();
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.x, area.y, area.w, area.h);
    ctx.clip();
    
    if (state.isLoaded && state.img) {
        ctx.translate(state.x, state.y);
        ctx.scale(state.scale, state.scale);
        ctx.drawImage(state.img, 0, 0);
    }
    ctx.restore();

    // 3. Subtitle Text
    ctx.fillStyle = defaults.color; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `normal ${state.fontSize}px sans-serif`;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;

    // Base Y is bottom of image area - 30
    const subY = (area.y + area.h - 30) + state.textOffsetY;
    wrapTextCinema(ctx, state.lyricText, 300, subY, 550, state.lineHeight);

    // Song info
    ctx.fillStyle = '#bbbbbb'; 
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'transparent';
    ctx.fillText(`${initialLyric.song} - ${initialLyric.album}`, 300, 750);

    // Watermark
    if (state.showWatermark) {
        ctx.fillStyle = '#eeeeee'; 
        ctx.textAlign = 'center';
        ctx.font = 'normal 10px "Courier New", monospace';
        const text = 'P R E S E N T E D   B Y   E A S O N   C O D E';
        ctx.fillText(text, 300, 780);
    }
}

// --- Helpers ---

function drawImageStandard() {
    if (state.isLoaded && state.img) {
        ctx.save();
        ctx.translate(state.x, state.y);
        ctx.scale(state.scale, state.scale);
        ctx.drawImage(state.img, 0, 0);
        ctx.restore();
    }
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    // Split by newline OR space
    const segments = text.split(/[\n\s]+/);
    let currentY = y;
    let totalLines = 0;

    for (const segment of segments) {
        const chars = segment.split('');
        let line = '';
        
        for(let n = 0; n < chars.length; n++) {
            const testLine = line + chars[n];
            const metrics = context.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                context.fillText(line, x, currentY);
                line = chars[n];
                currentY += lineHeight;
                totalLines++;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, currentY);
        currentY += lineHeight;
        totalLines++;
    }
    return totalLines;
}

function wrapTextCinema(context, text, x, y, maxWidth, lineHeight) {
    const segments = text.split(/[\n\s]+/);
    let allLines = [];

    segments.forEach(segment => {
        const chars = segment.split('');
        let line = '';
        
        for(let n = 0; n < chars.length; n++) {
            const testLine = line + chars[n];
            const metrics = context.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                allLines.push(line);
                line = chars[n];
            } else {
                line = testLine;
            }
        }
        allLines.push(line);
    });

    let currentY = y - (allLines.length - 1) * lineHeight;

    allLines.forEach(l => {
        context.strokeText(l, x, currentY);
        context.fillText(l, x, currentY);
        currentY += lineHeight;
    });
}

// Reset Actions
els.resetPosBtn.addEventListener('click', () => {
    fitImageToLayout();
    draw();
});

els.resetParamsBtn.addEventListener('click', () => {
    const defaults = THEME_DEFAULTS[state.theme];
    state.fontSize = defaults.fontSize;
    state.lineHeight = defaults.lineHeight;
    state.textOffsetY = 0;
    
    updateInputsFromState();
    draw();
});

// Save Action
els.saveBtn.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    vscode.postMessage({
        command: 'savePoster',
        data: dataUrl
    });
});