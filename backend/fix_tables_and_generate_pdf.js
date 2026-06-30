const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
    const htmlPath = path.resolve('docs/AI_Vendor_Discovery_Agent_Professional_Documentation.html');
    const pdfPath = path.resolve('docs/AI_Vendor_Discovery_Agent_Professional_Documentation.pdf');

    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // 1. Inject specific column widths and table styles by replacing <th> tags
    const thReplacements = {
        '<th>Table Name</th>': '<th style="width: 18%; white-space: nowrap;">Table Name</th>',
        '<th>SQLAlchemy Model</th>': '<th style="width: 18%; white-space: nowrap;">SQLAlchemy Model</th>',
        '<th>File Location</th>': '<th style="width: 18%; white-space: nowrap;">File Location</th>',
        '<th>Primary Columns</th>': '<th style="width: 26%; white-space: nowrap;">Primary Columns</th>',
        '<th>Purpose &amp; Constraints</th>': '<th style="width: 20%; white-space: nowrap;">Purpose &amp; Constraints</th>',
        '<th>Purpose & Constraints</th>': '<th style="width: 20%; white-space: nowrap;">Purpose & Constraints</th>',
        '<th>Source Table &amp; Column</th>': '<th style="width: 28%; white-space: nowrap;">Source Table &amp; Column</th>',
        '<th>Source Table & Column</th>': '<th style="width: 28%; white-space: nowrap;">Source Table & Column</th>',
        '<th>Referenced Table &amp; Column</th>': '<th style="width: 28%; white-space: nowrap;">Referenced Table &amp; Column</th>',
        '<th>Referenced Table & Column</th>': '<th style="width: 28%; white-space: nowrap;">Referenced Table & Column</th>',
        '<th>Constraint Details</th>': '<th style="width: 20%; white-space: nowrap;">Constraint Details</th>',
        '<th>Functional Purpose &amp; Domain Rules</th>': '<th style="width: 24%; white-space: nowrap;">Functional Purpose &amp; Domain Rules</th>',
        '<th>Functional Purpose & Domain Rules</th>': '<th style="width: 24%; white-space: nowrap;">Functional Purpose & Domain Rules</th>'
    };

    for (const [key, value] of Object.entries(thReplacements)) {
        const escapedKey = key.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'g');
        htmlContent = htmlContent.replace(regex, value);
    }

    // 2. Inject CSS to fix wrapping, row heights, and page breaks
    const cssToInject = `
    <style>
        @media print {
            table {
                table-layout: fixed !important;
                width: 100% !important;
                border-collapse: collapse !important;
            }
            thead {
                display: table-header-group !important;
            }
            tr {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
            th {
                font-weight: bold !important;
                vertical-align: middle !important;
                white-space: nowrap !important;
                overflow: hidden !important;
            }
            td {
                word-break: normal !important;
                overflow-wrap: break-word !important;
                white-space: normal !important;
                vertical-align: top !important;
            }
            code, pre {
                word-break: normal !important;
                overflow-wrap: break-word !important;
            }
        }
    </style>
    `;

    if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', cssToInject + '</head>');
    } else {
        htmlContent = cssToInject + htmlContent;
    }

    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log('HTML updated. Generating PDF...');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
    
    await page.evaluate(() => {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        let node;
        const textNodes = [];
        while ((node = walker.nextNode())) {
            if (node.parentElement && node.parentElement.closest('td')) {
                textNodes.push(node);
            }
        }
        textNodes.forEach(n => {
            if (n.nodeValue.trim().length > 0) {
                // Insert zero-width space (&#8203;) after _, /, and ,
                n.nodeValue = n.nodeValue
                    .replaceAll('_', '_\\u200B')
                    .replaceAll('/', '/\\u200B')
                    .replaceAll(',', ',\\u200B');
            }
        });
    });

    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '0.6in', bottom: '0.6in', left: '0.7in', right: '0.7in' },
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate: '<div style="font-size:10px; width:100%; text-align:center;"><span class="pageNumber"></span></div>',
    });

    await browser.close();
    console.log('PDF table formatting pass completed successfully.');
})();
