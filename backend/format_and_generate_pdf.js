const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
    const htmlPath = path.resolve('docs/AI_Vendor_Discovery_Agent_Professional_Documentation.html');
    const pdfPath = path.resolve('docs/AI_Vendor_Discovery_Agent_Professional_Documentation.pdf');

    // 1. Read HTML
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // 2. Replace local file paths with relative paths
    // Example: file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/user.py -> backend/app/models/user.py
    // Or without backend/ if it's already there
    const regexPath = /file:\/\/\/[a-zA-Z]:\/.*?\/vendor-recommendation-ai-engine\//g;
    htmlContent = htmlContent.replace(regexPath, '');

    // 3. Inject CSS for tables and nowrap
    const cssToInject = `
    <style>
        /* Table Name and SQLAlchemy Model columns width adjustment */
        table {
            table-layout: auto !important;
            width: 100% !important;
        }
        th, td {
            word-wrap: break-word;
        }
        /* Prevent wrapping for inline code symbols, identifiers, filenames */
        code {
            white-space: nowrap !important;
        }
        /* Allow wrapping for large code blocks */
        pre code {
            white-space: pre-wrap !important;
            word-break: break-all;
        }
        /* Specifically target first and second columns to prevent wrapping if they contain Table Name or Model names */
        th:nth-child(1), th:nth-child(2),
        td:nth-child(1), td:nth-child(2) {
            white-space: nowrap !important;
        }
        /* Reduce excessive blank space */
        .doc-section, section {
            margin-bottom: 15px !important;
            padding-bottom: 5px !important;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 15px !important;
            margin-bottom: 10px !important;
        }
    </style>
    </head>
    `;

    // Insert style before </head> if it exists
    if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', cssToInject);
    } else {
        htmlContent = cssToInject.replace('</head>', '') + htmlContent;
    }

    // Save modified HTML
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

    console.log('HTML updated. Generating PDF...');

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle2' });
    
    await page.addStyleTag({
        content: `
            @media print {
                section, .doc-section {
                    page-break-before: auto !important;
                    break-before: auto !important;
                }
                h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                }
                table, pre, .table-wrapper {
                    page-break-inside: auto !important;
                }
                tr, td, th {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                thead {
                    display: table-header-group !important;
                }
            }
        `
    });

    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '0.6in',
            bottom: '0.6in',
            left: '0.7in',
            right: '0.7in'
        },
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate: '<div style="font-size:10px; width:100%; text-align:center;"><span class="pageNumber"></span></div>',
    });

    await browser.close();
    console.log('PDF formatting pass completed successfully.');
})();
