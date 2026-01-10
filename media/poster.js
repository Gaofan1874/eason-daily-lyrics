// Acquire VS Code API
const vscode = acquireVsCodeApi();

// Get data injected from the extension
const lyric = window.posterData.lyric;
const bgSrc = window.posterData.bgSrc;

const canvas = document.getElementById('posterCanvas');
const ctx = canvas.getContext('2d');

// --- State Management ---
const state = {
    img: null,
    isLoaded: false,
    x: 0,
    y: 0,
    scale: 1,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    theme: 'classic', // classic | polaroid | cinema
    showWatermark: true
};

// --- Initialization ---

// Load Image
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

// Watermark Toggle
document.getElementById('watermarkCheck').addEventListener('change', (e) => {
    state.showWatermark = e.target.checked;
    draw();
});

// Theme Switching
document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        state.theme = e.target.value;
        fitImageToLayout(); // Reset layout for new theme
        draw();
    });
});

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

// --- Layout Helpers ---

function getDrawingArea() {
    // Return the area where the image is allowed/expected to be drawn
    const w = canvas.width;
    const h = canvas.height;

    switch (state.theme) {
        case 'polaroid':
            // Image is a square in the top part
            // Padding: 40px
            return { x: 40, y: 40, w: w - 80, h: w - 80 }; 
        case 'cinema':
            // Image is full screen minus black bars
            // Bar height: 100px
            return { x: 0, y: 100, w: w, h: h - 200 };
        case 'classic':
        default:
            return { x: 0, y: 0, w: w, h: h };
    }
}

function fitImageToLayout() {
    if (!state.img) return;
    
    const area = getDrawingArea();
    
    // Calculate scale to cover the target area
    const areaRatio = area.w / area.h;
    const imgRatio = state.img.width / state.img.height;
    
    let scale;
    if (imgRatio > areaRatio) {
        // Image is wider: Match height
        scale = area.h / state.img.height;
    } else {
        // Image is taller: Match width
        scale = area.w / state.img.width;
    }
    
    state.scale = scale;
    
    // Center image in the area
    // state.x/y represents the top-left corner of the image relative to canvas (0,0)
    // We want: area.x + (area.w - imgW)/2
    state.x = area.x + (area.w - state.img.width * scale) / 2;
    state.y = area.y + (area.h - state.img.height * scale) / 2;
}


// --- Main Draw Loop ---

function draw() {
    // Clear
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
    // 1. Bg
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Image
    drawImageStandard();

    // 3. Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 4. Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    wrapText(ctx, lyric.content, 300, 320, 450, 60);

    ctx.shadowColor = 'transparent';

    ctx.fillStyle = '#dddddd';
    ctx.font = '22px sans-serif';
    ctx.fillText('—— ' + lyric.song + ' ——', 300, 580);
    ctx.font = '16px sans-serif';
    ctx.fillText('Album: ' + lyric.album, 300, 615);

    if (state.showWatermark) {
        drawFooter('#FFD700', 780);
    }
}

function drawPolaroid() {
    // 1. Paper Bg
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Image Area (Clipping)
    const area = getDrawingArea();
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.x, area.y, area.w, area.h);
    ctx.clip();
    
    // Draw Image
    if (state.isLoaded && state.img) {
        ctx.translate(state.x, state.y);
        ctx.scale(state.scale, state.scale);
        ctx.drawImage(state.img, 0, 0);
    }
    ctx.restore();

    // Inner shadow-like border
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(area.x, area.y, area.w, area.h);

    // 3. Text Section
    const margin = 50;
    const textStartY = area.y + area.h + 60;
    const maxWidth = canvas.width - (margin * 2);

    // Lyric - Center Aligned
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'normal 26px "Times New Roman", serif';
    
    // Lift text slightly (60 -> 50)
    const linesDrawn = wrapText(ctx, lyric.content, 300, textStartY - 10, maxWidth, 45);

    // Citation - Right Aligned (No Book Marks)
    ctx.fillStyle = '#777777';
    ctx.textAlign = 'right';
    ctx.font = 'italic 18px serif';
    
    const citationY = (textStartY - 10) + (linesDrawn * 45) + 15;
    const citationText = `—— ${lyric.song} · ${lyric.album}`;
    ctx.fillText(citationText, canvas.width - margin, citationY);

    // 4. Watermark - Bottom Center (Stylish)
    if (state.showWatermark) {
        drawFooter('#888888', 780);
    }
}

function drawCinema() {
    // 1. Black Bg (Letterbox)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Image Area (Clipping)
    const area = getDrawingArea();
    ctx.save();
    ctx.beginPath();
    ctx.rect(area.x, area.y, area.w, area.h);
    ctx.clip();
    
    // Draw Image
    if (state.isLoaded && state.img) {
        ctx.translate(state.x, state.y);
        ctx.scale(state.scale, state.scale);
        ctx.drawImage(state.img, 0, 0);
    }
    ctx.restore();

    // 3. Subtitle Text
    ctx.fillStyle = '#FFC90E'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = 'normal 24px sans-serif';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;

    const subY = area.y + area.h - 30;
    wrapTextCinema(ctx, lyric.content, 300, subY, 550, 35);

    // Song info (tiny, in bottom bar)
    ctx.fillStyle = '#bbbbbb'; 
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'transparent';
    ctx.fillText(`${lyric.song} - ${lyric.album}`, 300, 750);

    // Watermark (Credits Style - Centered)
    if (state.showWatermark) {
        ctx.fillStyle = '#aaaaaa'; // Brighter for visibility
        ctx.textAlign = 'center';
        // Monospace, small, wide spacing simulated
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

function drawFooter(color, y) {
    ctx.fillStyle = color;
    // Stylish Monospace Footer
    ctx.font = 'normal 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    // Simulate wide tracking
    const text = 'E  A  S  O  N     C  O  D  E';
    ctx.fillText(text, 300, y);
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const chars = text.split('');
    let line = '';
    let currentY = y;
    let lineCount = 0;

    for(let n = 0; n < chars.length; n++) {
        const testLine = line + chars[n];
        const metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            context.fillText(line, x, currentY);
            line = chars[n];
            currentY += lineHeight;
            lineCount++;
        } else {
            line = testLine;
        }
    }
    context.fillText(line, x, currentY);
    return lineCount + 1;
}

function wrapTextCinema(context, text, x, y, maxWidth, lineHeight) {
    const chars = text.split('');
    let lines = [];
    let line = '';
    
    for(let n = 0; n < chars.length; n++) {
        const testLine = line + chars[n];
        const metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = chars[n];
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    let currentY = y - (lines.length - 1) * lineHeight;

    lines.forEach(l => {
        context.strokeText(l, x, currentY);
        context.fillText(l, x, currentY);
        currentY += lineHeight;
    });
}

// Reset Action
document.getElementById('resetBtn').addEventListener('click', () => {
    fitImageToLayout();
    draw();
});

// Save Action
document.getElementById('saveBtn').addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    vscode.postMessage({
        command: 'savePoster',
        data: dataUrl
    });
});