// formatters.js — all formatting/minifying logic, browser-only

import prettier from 'https://unpkg.com/prettier@2.8.8/esm/standalone.mjs';
import parserPostcss  from 'https://unpkg.com/prettier@2.8.8/esm/parser-postcss.mjs';
import parserBabel    from 'https://unpkg.com/prettier@2.8.8/esm/parser-babel.mjs';
import parserTypescript from 'https://unpkg.com/prettier@2.8.8/esm/parser-typescript.mjs';
import { marked }     from 'https://cdn.jsdelivr.net/npm/marked@11.1.1/lib/marked.esm.js';

// ── Helpers ───────────────────────────────────────────────────
function requireGlobal(name) {
    if (typeof window[name] !== 'function') {
        throw new Error(`${name} not loaded — please refresh the page.`);
    }
}

// ── JSON ──────────────────────────────────────────────────────
function formatJson(code) {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, 2);
}

function minifyJson(code) {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed);
}

// ── HTML ──────────────────────────────────────────────────────
function formatHtml(code) {
    requireGlobal('html_beautify');
    return window.html_beautify(code, {
        indent_size: 2,
        indent_char: ' ',
        preserve_newlines: true,
        max_preserve_newlines: 1,
        wrap_line_length: 120,
        wrap_attributes: 'auto',
        end_with_newline: true,
    });
}

function minifyHtml(code) {
    // Simple but effective: collapse whitespace between tags
    return code
        .replace(/<!--[\s\S]*?-->/g, '')          // strip comments
        .replace(/\s*\n\s*/g, ' ')                // collapse newlines
        .replace(/>\s+</g, '><')                  // remove space between tags
        .replace(/\s{2,}/g, ' ')                  // collapse multiple spaces
        .trim();
}

// ── CSS ───────────────────────────────────────────────────────
async function formatCss(code) {
    return prettier.format(code, {
        parser: 'css',
        plugins: [parserPostcss],
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
    });
}

function minifyCss(code) {
    requireGlobal('css_beautify');
    // Use js-beautify to parse then strip — reliable enough for a browser tool
    return code
        .replace(/\/\*[\s\S]*?\*\//g, '')         // strip comments
        .replace(/\s*\n\s*/g, '')                  // collapse newlines
        .replace(/\s*([{}:;,>~+])\s*/g, '$1')     // strip space around operators
        .replace(/;}/g, '}')                       // remove trailing semicolons
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// ── JavaScript ────────────────────────────────────────────────
async function formatJavaScript(code) {
    return prettier.format(code, {
        parser: 'babel',
        plugins: [parserBabel],
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
    });
}

function minifyJs(code) {
    requireGlobal('js_beautify');
    // Strip comments and collapse whitespace — good enough without a full minifier
    return code
        .replace(/\/\/[^\n]*/g, '')               // single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')         // multi-line comments
        .replace(/\s*\n\s*/g, '')
        .replace(/\s*([=+\-*/%&|^!<>?:,;{}()[\]])\s*/g, '$1')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// ── TypeScript ────────────────────────────────────────────────
async function formatTypeScript(code) {
    return prettier.format(code, {
        parser: 'typescript',
        plugins: [parserTypescript],
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
    });
}

// ── XML ───────────────────────────────────────────────────────
function formatXml(code) {
    // Pure JS XML formatter — no external dep needed
    const INDENT = '  ';
    let depth = 0;
    let result = '';
    let inCdata = false;

    // Tokenise by splitting on tag boundaries
    const tokens = code
        .replace(/>\s*</g, '>\n<')
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

    for (const token of tokens) {
        if (token.startsWith('<![CDATA[')) {
            inCdata = true;
        }
        if (inCdata) {
            result += INDENT.repeat(depth) + token + '\n';
            if (token.includes(']]>')) inCdata = false;
            continue;
        }

        if (token.startsWith('</')) {
            depth = Math.max(0, depth - 1);
            result += INDENT.repeat(depth) + token + '\n';
        } else if (token.startsWith('<?') || token.startsWith('<!')) {
            result += INDENT.repeat(depth) + token + '\n';
        } else if (token.endsWith('/>') || token.includes('</')) {
            result += INDENT.repeat(depth) + token + '\n';
        } else if (token.startsWith('<')) {
            result += INDENT.repeat(depth) + token + '\n';
            depth++;
        } else {
            result += INDENT.repeat(depth) + token + '\n';
        }
    }
    return result.trimEnd();
}

function minifyXml(code) {
    return code
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s*\n\s*/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

// ── SQL ───────────────────────────────────────────────────────
const SQL_KEYWORDS = [
    'SELECT','FROM','WHERE','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN',
    'OUTER JOIN','FULL JOIN','CROSS JOIN','ON','AND','OR','NOT','IN',
    'EXISTS','BETWEEN','LIKE','IS NULL','IS NOT NULL','ORDER BY','GROUP BY',
    'HAVING','LIMIT','OFFSET','INSERT INTO','VALUES','UPDATE','SET',
    'DELETE FROM','CREATE TABLE','ALTER TABLE','DROP TABLE','CREATE INDEX',
    'UNION','UNION ALL','DISTINCT','AS','CASE','WHEN','THEN','ELSE','END',
    'WITH','RETURNING','EXPLAIN',
];

function formatSql(code) {
    // Normalise whitespace first
    let sql = code.replace(/\s+/g, ' ').trim();

    // Uppercase keywords
    const kwPattern = new RegExp(
        `\\b(${SQL_KEYWORDS.map(k => k.replace(/ /g, '\\s+')).join('|')})\\b`,
        'gi'
    );
    sql = sql.replace(kwPattern, m => m.toUpperCase());

    // Break on major clause keywords
    const breakBefore = [
        'SELECT','FROM','WHERE','JOIN','LEFT JOIN','RIGHT JOIN','INNER JOIN',
        'OUTER JOIN','FULL JOIN','CROSS JOIN','ON','ORDER BY','GROUP BY',
        'HAVING','LIMIT','OFFSET','INSERT INTO','VALUES','UPDATE','SET',
        'DELETE FROM','CREATE TABLE','ALTER TABLE','DROP TABLE','UNION',
        'UNION ALL','WITH','RETURNING',
    ];
    const breakPattern = new RegExp(
        `\\s+(${breakBefore.map(k => k.replace(/ /g, '\\s+')).join('|')})\\s+`,
        'gi'
    );
    sql = sql.replace(breakPattern, (_, kw) => `\n${kw.toUpperCase()} `);

    // Indent AND / OR inside WHERE
    sql = sql.replace(/\s+(AND|OR)\s+/gi, '\n  $1 ');

    // Indent column lists after SELECT
    sql = sql.replace(/^(SELECT) (.+?)(?=\nFROM)/ms, (_, sel, cols) => {
        const colList = cols.split(',').map((c, i) =>
            i === 0 ? c.trim() : '       ' + c.trim()
        ).join(',\n');
        return `${sel} ${colList}`;
    });

    return sql.trim();
}

function minifySql(code) {
    return code
        .replace(/--[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ── Markdown ──────────────────────────────────────────────────
function formatMarkdown(code) {
    return marked.parse(code);
}

// ── Public API ────────────────────────────────────────────────
export const formatters = {
    json: {
        async format(code, minify) { return minify ? minifyJson(code) : formatJson(code); },
        errorPrefix: 'Invalid JSON',
        ext: 'json',
        canMinify: true,
        canPreview: false,
    },
    html: {
        async format(code, minify) { return minify ? minifyHtml(code) : formatHtml(code); },
        errorPrefix: 'HTML formatting failed',
        ext: 'html',
        canMinify: true,
        canPreview: true,
    },
    css: {
        async format(code, minify) { return minify ? minifyCss(code) : await formatCss(code); },
        errorPrefix: 'Invalid CSS',
        ext: 'css',
        canMinify: true,
        canPreview: false,
    },
    markdown: {
        async format(code, _minify) { return formatMarkdown(code); },
        errorPrefix: 'Markdown error',
        ext: 'md',
        canMinify: false,
        canPreview: true,
    },
    javascript: {
        async format(code, minify) { return minify ? minifyJs(code) : await formatJavaScript(code); },
        errorPrefix: 'JavaScript error',
        ext: 'js',
        canMinify: true,
        canPreview: false,
    },
    typescript: {
        async format(code, _minify) { return await formatTypeScript(code); },
        errorPrefix: 'TypeScript error',
        ext: 'ts',
        canMinify: false,
        canPreview: false,
    },
    xml: {
        async format(code, minify) { return minify ? minifyXml(code) : formatXml(code); },
        errorPrefix: 'XML formatting failed',
        ext: 'xml',
        canMinify: true,
        canPreview: false,
    },
    sql: {
        async format(code, minify) { return minify ? minifySql(code) : formatSql(code); },
        errorPrefix: 'SQL formatting failed',
        ext: 'sql',
        canMinify: true,
        canPreview: false,
    },
};
