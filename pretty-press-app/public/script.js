import { formatters } from '/formatters.js';

// ── Constants ─────────────────────────────────────────────────
const LS_PREFIX   = 'prettypress_input_';
const LS_FONTSIZE = 'prettypress_fontsize';
const LS_WORDWRAP = 'prettypress_wordwrap';
const FONT_MIN    = 10;
const FONT_MAX    = 24;

const ACE_MODE = {
    json:       'ace/mode/json',
    html:       'ace/mode/html',
    css:        'ace/mode/css',
    markdown:   'ace/mode/markdown',
    javascript: 'ace/mode/javascript',
    typescript: 'ace/mode/typescript',
    xml:        'ace/mode/xml',
    sql:        'ace/mode/sql',
};

// ── State ─────────────────────────────────────────────────────
let isMinify   = false;
let isDiff     = false;
let fontSize   = parseInt(localStorage.getItem(LS_FONTSIZE) ?? '14', 10);
let wordWrap   = localStorage.getItem(LS_WORDWRAP) === 'true';

// ── Editor init ───────────────────────────────────────────────
const inputEditor  = ace.edit('editor');
const outputEditor = ace.edit('output-editor');

function initEditor(editor, readOnly = false) {
    editor.setTheme('ace/theme/twilight');
    editor.setShowPrintMargin(false);
    editor.setHighlightActiveLine(!readOnly);
    editor.setReadOnly(readOnly);
    editor.setOption('scrollPastEnd', 0.5);
    editor.setOption('fontSize', `${fontSize}px`);
    editor.renderer.setShowGutter(true);
    editor.container.style.lineHeight = '1.6';
    editor.setOption('wrap', wordWrap);
}

initEditor(inputEditor);
initEditor(outputEditor, true);

// ── DOM refs ──────────────────────────────────────────────────
const formatTypeEl    = document.getElementById('formatType');
const formatBtn       = document.getElementById('formatBtn');
const clearBtn        = document.getElementById('clearBtn');
const copyBtn         = document.getElementById('copyBtn');
const downloadBtn     = document.getElementById('downloadBtn');
const previewBtn      = document.getElementById('previewBtn');
const loadFileBtn     = document.getElementById('loadFileBtn');
const fileInput       = document.getElementById('fileInput');
const modeFormatBtn   = document.getElementById('modeFormat');
const modeMinifyBtn   = document.getElementById('modeMinify');
const viewSplitBtn    = document.getElementById('viewSplit');
const viewDiffBtn     = document.getElementById('viewDiff');
const wordWrapToggle  = document.getElementById('wordWrapToggle');
const fontDecreaseBtn = document.getElementById('fontDecrease');
const fontIncreaseBtn = document.getElementById('fontIncrease');
const fontSizeDisplay = document.getElementById('fontSizeDisplay');
const inputCursorEl   = document.getElementById('inputCursor');
const inputCountEl    = document.getElementById('inputCount');
const outputCountEl   = document.getElementById('outputCount');
const outputSavingsEl = document.getElementById('outputSavings');
const emptyHint       = document.getElementById('emptyHint');
const dropOverlay     = document.getElementById('dropOverlay');
const diffOutput      = document.getElementById('diff-output');
const diffPanel       = document.getElementById('diffPanel');
const outputPanel     = document.getElementById('outputPanel');
const modal           = document.getElementById('previewModal');
const previewFrame    = document.getElementById('previewFrame');
const toastEl         = document.getElementById('toast');

// ── Toast ─────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = 'info') {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.className   = `toast show ${type}`;
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

// ── Format type / mode ────────────────────────────────────────
function currentType() { return formatTypeEl.value; }
function currentFormatter() { return formatters[currentType()]; }

function applyMode() {
    const type = currentType();
    const mode = ACE_MODE[type] ?? 'ace/mode/text';
    inputEditor.session.setMode(mode);
    outputEditor.session.setMode(mode);

    const fmt = currentFormatter();
    previewBtn.hidden = !fmt.canPreview;

    // Disable minify toggle for types that don't support it
    modeMinifyBtn.disabled = !fmt.canMinify;
    if (!fmt.canMinify && isMinify) setMode(false);

    restoreInput(type);
    updateEmptyHint();
}

formatTypeEl.addEventListener('change', applyMode);

// ── Format / Minify mode toggle ───────────────────────────────
function setMode(minify) {
    isMinify = minify;
    modeFormatBtn.classList.toggle('active', !minify);
    modeMinifyBtn.classList.toggle('active',  minify);
    modeFormatBtn.setAttribute('aria-pressed', String(!minify));
    modeMinifyBtn.setAttribute('aria-pressed', String(minify));
}

modeFormatBtn.addEventListener('click', () => setMode(false));
modeMinifyBtn.addEventListener('click', () => setMode(true));

// ── View: split vs diff ───────────────────────────────────────
function setView(diff) {
    isDiff = diff;
    viewSplitBtn.classList.toggle('active', !diff);
    viewDiffBtn.classList.toggle('active',   diff);
    viewSplitBtn.setAttribute('aria-pressed', String(!diff));
    viewDiffBtn.setAttribute('aria-pressed',  String(diff));
    outputPanel.hidden = diff;
    diffPanel.hidden   = !diff;
    // Toggle class for CSS grid fallback
    document.getElementById('formatterContainer').classList.toggle('diff-active', diff);
}

viewSplitBtn.addEventListener('click', () => setView(false));
viewDiffBtn.addEventListener('click',  () => setView(true));

// ── Word wrap ─────────────────────────────────────────────────
wordWrapToggle.checked = wordWrap;
wordWrapToggle.addEventListener('change', () => {
    wordWrap = wordWrapToggle.checked;
    localStorage.setItem(LS_WORDWRAP, wordWrap);
    inputEditor.setOption('wrap', wordWrap);
    outputEditor.setOption('wrap', wordWrap);
});

// ── Font size ─────────────────────────────────────────────────
function applyFontSize() {
    const px = `${fontSize}px`;
    inputEditor.setOption('fontSize', px);
    outputEditor.setOption('fontSize', px);
    fontSizeDisplay.textContent = fontSize;
    localStorage.setItem(LS_FONTSIZE, fontSize);
}

fontDecreaseBtn.addEventListener('click', () => {
    if (fontSize > FONT_MIN) { fontSize--; applyFontSize(); }
});
fontIncreaseBtn.addEventListener('click', () => {
    if (fontSize < FONT_MAX) { fontSize++; applyFontSize(); }
});

applyFontSize();

// ── Status bar ────────────────────────────────────────────────
inputEditor.session.selection.on('changeCursor', updateInputCursor);
inputEditor.session.on('change', () => {
    updateInputCursor();
    updateInputCount();
    saveInput();
    updateEmptyHint();
});

function updateInputCursor() {
    const pos = inputEditor.getCursorPosition();
    inputCursorEl.textContent = `Ln ${pos.row + 1}, Col ${pos.column + 1}`;
}

function updateInputCount() {
    const len = inputEditor.getValue().length;
    inputCountEl.textContent = `${len.toLocaleString()} chars`;
}

function updateOutputCount() {
    const inLen  = inputEditor.getValue().length;
    const outLen = outputEditor.getValue().length;
    outputCountEl.textContent = `${outLen.toLocaleString()} chars`;

    if (isMinify && inLen > 0 && outLen > 0) {
        const pct = Math.round((1 - outLen / inLen) * 100);
        outputSavingsEl.textContent = pct > 0 ? `${pct}% smaller` : '';
        outputSavingsEl.className   = 'savings' + (pct > 0 ? ' positive' : '');
    } else {
        outputSavingsEl.textContent = '';
    }
}

// ── Empty hint visibility ─────────────────────────────────────
function updateEmptyHint() {
    emptyHint.hidden = inputEditor.getValue().trim().length > 0;
}

// ── localStorage persistence ──────────────────────────────────
function saveInput() {
    try {
        localStorage.setItem(LS_PREFIX + currentType(), inputEditor.getValue());
    } catch { /* quota exceeded — silently ignore */ }
}

function restoreInput(type) {
    const saved = localStorage.getItem(LS_PREFIX + type);
    if (saved) {
        inputEditor.setValue(saved, -1);
    } else {
        inputEditor.setValue('', -1);
    }
    outputEditor.setValue('', -1);
    updateInputCount();
    updateOutputCount();
    updateEmptyHint();
}

// ── Format ────────────────────────────────────────────────────
const FORMAT_BTN_HTML = formatBtn.innerHTML;

async function runFormat() {
    const input = inputEditor.getValue().trim();
    if (!input) return;

    const fmt = currentFormatter();
    formatBtn.disabled = true;
    formatBtn.innerHTML = '<span class="spinner"></span> Working…';

    try {
        const result = await fmt.format(input, isMinify);
        outputEditor.setValue(result, -1);
        updateOutputCount();

        if (isDiff) renderDiff(input, result);
        if (modal.classList.contains('open')) renderPreview(result);

        showToast(isMinify ? 'Minified ✓' : 'Formatted ✓', 'success');
    } catch (err) {
        const msg = `// ${fmt.errorPrefix}: ${err.message}`;
        outputEditor.setValue(msg, -1);
        showToast(`${fmt.errorPrefix}: ${err.message}`, 'error');
    } finally {
        formatBtn.disabled = false;
        formatBtn.innerHTML = FORMAT_BTN_HTML;
    }
}

formatBtn.addEventListener('click', runFormat);

// ── Keyboard shortcut: Ctrl/Cmd + Enter ──────────────────────
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runFormat();
    }
    if (e.key === 'Escape' && modal.classList.contains('open')) {
        closePreview();
    }
});

// ── Clear ─────────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
    inputEditor.setValue('', -1);
    outputEditor.setValue('', -1);
    diffOutput.innerHTML = '';
    updateInputCount();
    updateOutputCount();
    updateEmptyHint();
    localStorage.removeItem(LS_PREFIX + currentType());
});

// ── Copy ──────────────────────────────────────────────────────
copyBtn.addEventListener('click', async () => {
    const text = outputEditor.getValue();
    if (!text) return;
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    } catch {
        showToast('Copy failed — please copy manually.', 'error');
    }
});

// ── Download ──────────────────────────────────────────────────
downloadBtn.addEventListener('click', () => {
    const text = outputEditor.getValue();
    if (!text) { showToast('Nothing to download yet.', 'info'); return; }

    const ext  = currentFormatter().ext;
    const name = `output.${ext}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${name}`, 'success');
});

// ── Load file ─────────────────────────────────────────────────
const EXT_TO_TYPE = {
    json: 'json', html: 'html', htm: 'html', css: 'css',
    md: 'markdown', markdown: 'markdown',
    js: 'javascript', ts: 'typescript',
    xml: 'xml', sql: 'sql',
};

function loadFileContent(file) {
    const ext  = file.name.split('.').pop().toLowerCase();
    const type = EXT_TO_TYPE[ext];
    if (type) {
        formatTypeEl.value = type;
        applyMode();
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        inputEditor.setValue(e.target.result, -1);
        showToast(`Loaded ${file.name}`, 'success');
    };
    reader.readAsText(file);
}

loadFileBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadFileContent(fileInput.files[0]);
    fileInput.value = '';
});

// ── Drag & drop ───────────────────────────────────────────────
const inputPanel = document.getElementById('inputPanel');

inputPanel.addEventListener('dragenter', (e) => {
    if (e.dataTransfer.types.includes('Files')) {
        e.preventDefault();
        dropOverlay.classList.add('visible');
    }
});

inputPanel.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

inputPanel.addEventListener('dragleave', (e) => {
    if (!inputPanel.contains(e.relatedTarget)) {
        dropOverlay.classList.remove('visible');
    }
});

inputPanel.addEventListener('drop', (e) => {
    e.preventDefault();
    dropOverlay.classList.remove('visible');
    const file = e.dataTransfer.files[0];
    if (file) loadFileContent(file);
});

// ── Diff view ─────────────────────────────────────────────────
function renderDiff(original, formatted) {
    const origLines = original.split('\n');
    const fmtLines  = formatted.split('\n');

    // Simple line-level diff using LCS
    const lcs = computeLCS(origLines, fmtLines);
    const html = buildDiffHtml(origLines, fmtLines, lcs);
    diffOutput.innerHTML = html;
}

function computeLCS(a, b) {
    const m = a.length, n = b.length;
    // Cap to avoid O(n²) freeze on huge inputs
    if (m > 500 || n > 500) return null;

    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);
        }
    }
    // Backtrack
    const seq = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
        if (a[i-1] === b[j-1]) { seq.unshift([i-1, j-1]); i--; j--; }
        else if (dp[i-1][j] > dp[i][j-1]) i--;
        else j--;
    }
    return seq;
}

function esc(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function buildDiffHtml(orig, fmt, lcs) {
    if (!lcs) {
        // Fallback for large files: just show both
        return `<div class="diff-note">File too large for line diff — showing formatted output.</div>` +
               fmt.map((l, i) => `<div class="diff-line diff-add"><span class="diff-ln">${i+1}</span><code>${esc(l)}</code></div>`).join('');
    }

    const lcsOrigSet = new Set(lcs.map(([oi]) => oi));
    const lcsFmtSet  = new Set(lcs.map(([, fi]) => fi));

    let html = '';
    let oi = 0, fi = 0;

    for (const [lo, lf] of lcs) {
        while (oi < lo) {
            html += `<div class="diff-line diff-remove"><span class="diff-ln">−</span><code>${esc(orig[oi])}</code></div>`;
            oi++;
        }
        while (fi < lf) {
            html += `<div class="diff-line diff-add"><span class="diff-ln">+</span><code>${esc(fmt[fi])}</code></div>`;
            fi++;
        }
        html += `<div class="diff-line diff-same"><span class="diff-ln">${oi+1}</span><code>${esc(orig[oi])}</code></div>`;
        oi++; fi++;
    }
    while (oi < orig.length) {
        html += `<div class="diff-line diff-remove"><span class="diff-ln">−</span><code>${esc(orig[oi])}</code></div>`;
        oi++;
    }
    while (fi < fmt.length) {
        html += `<div class="diff-line diff-add"><span class="diff-ln">+</span><code>${esc(fmt[fi])}</code></div>`;
        fi++;
    }

    if (!html.includes('diff-remove') && !html.includes('diff-add')) {
        html = '<div class="diff-note">No changes — input was already formatted.</div>' + html;
    }

    return html;
}

// Copy diff as plain text
document.getElementById('copyDiffBtn').addEventListener('click', async () => {
    const lines = [...diffOutput.querySelectorAll('.diff-line')].map(el => {
        const prefix = el.classList.contains('diff-add') ? '+ ' :
                       el.classList.contains('diff-remove') ? '- ' : '  ';
        return prefix + el.querySelector('code').textContent;
    }).join('\n');
    try {
        await navigator.clipboard.writeText(lines);
        showToast('Diff copied', 'success');
    } catch {
        showToast('Copy failed', 'error');
    }
});

// ── Preview ───────────────────────────────────────────────────
function renderPreview(content) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
         line-height: 1.65; padding: 24px; max-width: 820px; margin: 0 auto; color: #222; }
  img  { max-width: 100%; height: auto; }
  pre  { background: #f5f5f5; padding: 14px; border-radius: 5px; overflow-x: auto; }
  code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px; font-size: 0.9em; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #f0f0f0; }
</style>
</head>
<body>${content}</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    previewFrame.src = url;
    previewFrame.onload = () => URL.revokeObjectURL(url);
}

previewBtn.addEventListener('click', () => {
    const content = outputEditor.getValue();
    if (!content) { showToast('Format first to preview.', 'info'); return; }
    renderPreview(content);
    modal.classList.add('open');
});

function closePreview() {
    modal.classList.remove('open');
    previewFrame.src = 'about:blank';
}

document.getElementById('closePreviewBtn').addEventListener('click', closePreview);
modal.addEventListener('click', (e) => { if (e.target === modal) closePreview(); });

// ── Boot ──────────────────────────────────────────────────────
applyMode();
updateInputCursor();
updateInputCount();
updateOutputCount();
