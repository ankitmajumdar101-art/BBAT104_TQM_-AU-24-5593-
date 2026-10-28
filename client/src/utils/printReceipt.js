/**
 * Dedicated utility for printing thermal receipts cleanly.
 * Uses an isolated hidden iframe so that modal overlays, fixed positioning,
 * page scrolling, and screen CSS never clip, offset, or distort the receipt.
 */
export const printReceiptElement = (elementId = 'printable-receipt', title = 'Restaurant Receipt') => {
  const receiptElement = document.getElementById(elementId);
  if (!receiptElement) {
    window.print();
    return;
  }

  // Remove any previous print iframe to ensure a clean DOM
  const existingFrame = document.getElementById('receipt-print-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'receipt-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: 80mm auto;
            margin: 2mm 3mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            background: #FFFFFF;
            color: #000000;
            padding: 8px 4px;
            font-size: 11px;
            line-height: 1.35;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            display: flex;
            justify-content: center;
          }
          .thermal-receipt-sheet {
            width: 80mm;
            max-width: 80mm;
            background: #FFFFFF;
            padding: 4px;
            color: #000000;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          svg, img {
            display: inline-block;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div class="thermal-receipt-sheet">
          ${receiptElement.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Allow styles and SVG elements to mount cleanly before invoking the print dialog
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.warn('Iframe print fallback to window.print():', err);
      window.print();
    }
  }, 250);
};
