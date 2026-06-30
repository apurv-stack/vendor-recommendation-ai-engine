const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    try {
        console.log('Reading HTML...');
        const htmlPath = path.resolve(__dirname, '../AI_Vendor_Discovery_Agent_Professional_Documentation.html');
        let html = fs.readFileSync(htmlPath, 'utf8');
        
        // Remove zero-width spaces and other bad invisible characters
        html = html.replace(/\u200B/g, '');
        html = html.replace(/&ZeroWidthSpace;/g, '');
        html = html.replace(/&#8203;/g, '');
        
        // Remove existing print stylesheets or style tags if they interfere, 
        // actually we can just append our extremely specific override at the end of <head>.
        
        const printCss = `
        <style>
            @media print {
                @page {
                    size: A4;
                    margin: 15mm;
                }
                body {
                    zoom: 0.95;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    line-height: 1.3;
                    margin: 0;
                    padding: 0;
                }
                /* Reduce huge white spaces */
                h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid;
                    break-after: avoid;
                    margin-top: 10px;
                    margin-bottom: 5px;
                }
                p, ul, ol, figure {
                    margin-top: 5px;
                    margin-bottom: 5px;
                }
                section {
                    break-inside: auto; /* Changed from avoid to prevent huge blank spaces */
                }
                
                /* Keep heading with following content */
                h1 + p, h2 + p, h3 + p, h4 + p, h5 + p, h6 + p,
                h1 + table, h2 + table, h3 + table, h4 + table, h5 + table, h6 + table,
                h1 + ul, h2 + ul, h3 + ul, h4 + ul, h5 + ul, h6 + ul {
                    page-break-before: avoid;
                    break-before: avoid;
                }

                img {
                    max-width: 100% !important;
                    height: auto !important;
                    page-break-inside: avoid;
                    break-inside: avoid;
                    display: block;
                    margin: 0 auto;
                }

                table {
                    width: 100% !important;
                    table-layout: auto !important;
                    border-collapse: collapse !important;
                    break-inside: auto;
                    page-break-inside: auto;
                    margin-top: 5px;
                    margin-bottom: 5px;
                }
                th {
                    font-size: 9px !important;
                    font-weight: 700 !important;
                    padding: 6px !important;
                    background-color: #f8f9fa;
                    border: 1px solid #ddd;
                }
                td {
                    font-size: 8px !important;
                    padding: 5px !important;
                    vertical-align: top !important;
                    /* Wrap ONLY after / _ spaces - we will handle this via JS wbr tags */
                    word-break: normal !important;
                    white-space: normal !important;
                    border: 1px solid #ddd;
                }
                thead {
                    display: table-header-group !important;
                }
                tfoot {
                    display: table-footer-group !important;
                }
                tr {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }

                /* Technical Text */
                code, pre, .api-endpoint, .json, .sql, .python, .folder-path, .env-var {
                    font-family: Consolas, "Courier New", monospace !important;
                }
                code {
                    font-size: 8px;
                    background-color: #f4f5f7;
                    padding: 1px 3px;
                    border-radius: 2px;
                }
                pre {
                    font-size: 8px;
                    background-color: #f4f5f7;
                    padding: 8px;
                    white-space: pre-wrap !important;
                    break-inside: avoid;
                    page-break-inside: avoid;
                    border: 1px solid #eaeaea;
                }
            }
        </style>
        `;
        
        if (html.includes('</head>')) {
            html = html.replace('</head>', printCss + '</head>');
        } else {
            html = printCss + html;
        }

        // Write to temporary file so that local images resolve correctly via file:// protocol
        const tempHtmlPath = path.resolve(__dirname, '../_print_temp.html');
        fs.writeFileSync(tempHtmlPath, html, 'utf8');

        console.log('Launching Puppeteer...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
        });
        const page = await browser.newPage();
        
        console.log('Navigating to HTML file...');
        // Wait until networkidle0 ensures all local images are loaded before printing
        await page.goto('file://' + tempHtmlPath, { waitUntil: 'networkidle0', timeout: 60000 });

        // Add zero-width spaces after /, _, and , to allow natural wrapping without breaking mid-word
        await page.evaluate(() => {
            const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            const nodesToModify = [];
            while (node = walk.nextNode()) {
                if (node.nodeValue && node.nodeValue.trim() && 
                    node.parentNode.tagName !== 'STYLE' && 
                    node.parentNode.tagName !== 'SCRIPT') {
                    nodesToModify.push(node);
                }
            }
            nodesToModify.forEach(n => {
                const text = n.nodeValue;
                if (text.includes('/') || text.includes('_') || text.includes(',')) {
                    const parts = text.split(/(\/|_|,)/);
                    const fragment = document.createDocumentFragment();
                    parts.forEach(part => {
                        if (part === '/' || part === '_' || part === ',') {
                            fragment.appendChild(document.createTextNode(part));
                            fragment.appendChild(document.createElement('wbr'));
                        } else {
                            fragment.appendChild(document.createTextNode(part));
                        }
                    });
                    n.parentNode.replaceChild(fragment, n);
                }
            });
            
            // Remove lazy loading from images
            document.querySelectorAll('img').forEach(img => {
                img.removeAttribute('loading');
            });
        });

        // Wait a tiny bit for DOM updates to settle
        await new Promise(r => setTimeout(r, 1000));

        console.log('Generating PDF...');
        await page.pdf({
            path: path.resolve(__dirname, '../AI_Vendor_Discovery_Agent_Professional_Documentation.pdf'),
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: '<div style="font-size: 9px; text-align: center; width: 100%; color: #666; font-family: -apple-system, sans-serif;">Page <span class="pageNumber"></span></div>',
            // Margins are primarily handled by @page in CSS, but puppeteer needs these set as well or it uses defaults
            margin: {
                top: '15mm',
                bottom: '15mm',
                left: '15mm',
                right: '15mm'
            },
            preferCSSPageSize: true
        });

        console.log('PDF generated successfully!');
        
        await browser.close();
        
        // Clean up temp file
        if (fs.existsSync(tempHtmlPath)) {
            fs.unlinkSync(tempHtmlPath);
        }
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
})();
