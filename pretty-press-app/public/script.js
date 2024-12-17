// File: public/script.js
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
}

async function formatCode() {
    const formatType = document.getElementById('formatType').value;
    const inputCode = inputEditor.getValue();

    try {
        const response = await fetch(`/api/format/${formatType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: inputCode })
        });

        const data = await response.json();
        
        if (response.ok) {
            outputEditor.setValue(data.formatted, -1);
            // Update preview if it's open
            if (document.getElementById('previewModal').style.display === 'block') {
                showPreview();
            }
        } else {
            outputEditor.setValue(`Error: ${data.error}`, -1);
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
            const copyButton = document.querySelector('.output-section button');
            copyButton.textContent = 'Copied!';
            setTimeout(() => copyButton.textContent = 'Copy', 2000);
        })
        .catch(err => alert('Failed to copy: ' + err));
}

document.querySelector('.input-section .controls').insertAdjacentHTML(
    'beforeend',
    '<button id="previewBtn" class="secondary" onclick="showPreview()">Preview</button>'
);

function updateEditorMode() {
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
    previewBtn.style.display = 
        (formatType === 'html' || formatType === 'markdown') ? 'block' : 'none';
}

function showPreview() {
    const formatType = document.getElementById('formatType').value;
    const content = outputEditor.getValue();
    const modal = document.getElementById('previewModal');
    const frame = document.getElementById('previewFrame');
    
    if (content) {
        // Set up HTML content with proper error handling
        let previewContent;
        try {
            previewContent = formatType === 'markdown' ? 
                window.marked.parse(content) : content;
        } catch (error) {
            alert('Error generating preview: ' + error.message);
            return;
        }
            
        // Create a blob with the HTML content
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

        // Create object URL and set it to the iframe
        const url = URL.createObjectURL(blob);
        frame.src = url;

        // Clean up the URL when the iframe loads
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

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        closePreview();
    }
}

// Initialize with proper mode
updateEditorMode();