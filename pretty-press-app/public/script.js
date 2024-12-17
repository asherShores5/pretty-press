import { formatters } from '/formatters.js';

// Initialize Ace Editor instances
let inputEditor = ace.edit("editor");
let outputEditor = ace.edit("output-editor");

// Configure editors
function configureEditor(editor, isReadOnly = false) {
    editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/json");
    editor.setShowPrintMargin(false);
    editor.setHighlightActiveLine(true);
    editor.setOption("scrollPastEnd", 0.5);
    editor.setReadOnly(isReadOnly);
    editor.setOption("fontSize", "14px");
    editor.renderer.setShowGutter(true);
    editor.container.style.lineHeight = 1.5;
}

// Configure both editors
configureEditor(inputEditor);
configureEditor(outputEditor, true);

function updateEditorMode() {
    clearCode();
    const formatType = document.getElementById('formatType').value;
    const modeMap = {
        'json': 'json',
        'markdown': 'markdown',
        'html': 'html',
        'css': 'css'
    };
    
    const mode = modeMap[formatType] || 'text';
    inputEditor.session.setMode(`ace/mode/${mode}`);
    outputEditor.session.setMode(`ace/mode/${mode}`);
    
    // Show/hide preview button based on format type
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.style.display = 
            (formatType === 'html' || formatType === 'markdown') ? 'block' : 'none';
    }
}

async function formatCode() {
    const formatType = document.getElementById('formatType').value;
    const inputCode = inputEditor.getValue();

    try {
        const formatter = formatters[formatType];
        const formattedCode = await formatter.format(inputCode);
        outputEditor.setValue(formattedCode, -1);
        
        // Update preview if it's open
        if (document.getElementById('previewModal').style.display === 'block') {
            showPreview();
        }
    } catch (error) {
        outputEditor.setValue(`Error: ${error.message}`, -1);
    }
}

function clearCode() {
    inputEditor.setValue('', -1);
    outputEditor.setValue('', -1);
}

function copyOutput() {
    const outputCode = outputEditor.getValue();
    navigator.clipboard.writeText(outputCode)
        .then(() => {
            const copyBtn = document.getElementById('copyBtn');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy', 2000);
        })
        .catch(err => alert('Failed to copy: ' + err));
}

function showPreview() {
    const formatType = document.getElementById('formatType').value;
    const content = outputEditor.getValue();
    const modal = document.getElementById('previewModal');
    const frame = document.getElementById('previewFrame');
    
    if (content) {
        let previewContent = content;
        if (formatType === 'markdown') {
            try {
                previewContent = marked.parse(content);
            } catch (error) {
                alert('Error generating preview: ' + error.message);
                return;
            }
        }
            
        const blob = new Blob([`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                                   Roboto, Arial, sans-serif;
                        line-height: 1.6;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    img { max-width: 100%; height: auto; }
                    pre { 
                        background-color: #f5f5f5; 
                        padding: 15px; 
                        border-radius: 5px;
                        overflow-x: auto;
                    }
                    code { 
                        background-color: #f5f5f5; 
                        padding: 2px 5px; 
                        border-radius: 3px;
                    }
                </style>
            </head>
            <body>${previewContent}</body>
            </html>
        `], { type: 'text/html' });

        const url = URL.createObjectURL(blob);
        frame.src = url;
        frame.onload = () => URL.revokeObjectURL(url);
        modal.style.display = 'block';
    }
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    const frame = document.getElementById('previewFrame');
    frame.src = 'about:blank';
    modal.style.display = 'none';
}

// Event Listeners
document.getElementById('formatType').addEventListener('change', updateEditorMode);
document.getElementById('formatBtn').addEventListener('click', formatCode);
document.getElementById('clearBtn').addEventListener('click', clearCode);
document.getElementById('copyBtn').addEventListener('click', copyOutput);
document.getElementById('closePreviewBtn').addEventListener('click', closePreview);

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        closePreview();
    }
});

// Initialize with proper mode
updateEditorMode();

// Add preview button dynamically
document.querySelector('.input-section .controls').insertAdjacentHTML(
    'beforeend',
    '<button id="previewBtn" class="secondary">Preview</button>'
);
document.getElementById('previewBtn').addEventListener('click', showPreview);