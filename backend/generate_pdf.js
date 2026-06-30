const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    const htmlPath = path.resolve('docs/AI_Vendor_Discovery_Agent_Professional_Documentation.html');
    const pdfPath = path.resolve('docs/AI_Vendor_Discovery_Agent_Professional_Documentation.pdf');
    
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle2' });
    
    // Inject CSS to ensure continuous flow and override page breaks except where necessary
    await page.addStyleTag({
        content: `
            @media print {
                /* Remove forced page breaks on sections */
                section, .doc-section {
                    page-break-before: auto !important;
                    break-before: auto !important;
                }
                
                /* Keep headings with content */
                h1, h2, h3, h4, h5, h6 {
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                }
                
                /* Keep tables and code blocks readable and unbroken where possible */
                table, pre, code, .table-wrapper {
                    page-break-inside: auto !important;
                }
                tr, td, th {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                thead {
                    display: table-header-group !important;
                }
                
                /* Only break before very large diagrams if they have a specific class, 
                   but generally auto */
                
                /* Typography enforcement if not already in HTML */
                h1 { font-size: 26pt !important; }
                h2 { font-size: 18pt !important; }
                h3 { font-size: 14pt !important; }
                p, li, div { font-size: 10.5pt !important; }
                figcaption, .caption { font-size: 9pt !important; }
                td, th { font-size: 9pt !important; }
                pre, code { font-size: 8.5pt !important; }
                .folder-tree { font-size: 8pt !important; }
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
    console.log('PDF generated successfully.');
})();
