import React, { useRef, useEffect } from 'react';
import { Product, StoreSettings } from '../../types';
import { useReactToPrint } from 'react-to-print';
import { PrintLabelPreview } from './PrintLabelPreview';

interface ProductLabelPrinterProps {
  product: Product | null;
  currencySymbol: string;
  onPrintComplete: () => void;
  settings?: StoreSettings;
}

export const ProductLabelPrinter: React.FC<ProductLabelPrinterProps> = ({ 
  product, 
  currencySymbol, 
  onPrintComplete,
  settings
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const template = settings?.labelTemplate;

  // Use dynamic size from template, or default to 50x25mm
  const printWidthMm = template ? template.sizeId.split('x')[0] : 50;

  const handlePrint = useReactToPrint({
    contentRef: containerRef,
    onAfterPrint: () => onPrintComplete(),
    pageStyle: `
      @page {
        size: ${printWidthMm}mm auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #000000;
        font-family: sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .print-label-container {
        filter: grayscale(100%) contrast(150%);
        transform-origin: top left;
        /* Escalar del tamaño del canvas (px) al tamaño físico real para impresión térmica */
        ${template ? `transform: scale(calc(${Number(printWidthMm) * 3.779527} / ${template.widthPx}));` : ''}
        ${template ? `width: ${template.widthPx}px !important;` : ''}
        ${template ? `height: ${template.heightPx}px !important;` : ''}
      }
    `,
  });

  useEffect(() => {
    if (product) {
      // Allow React to render the DOM updates
      const timer = setTimeout(() => {
        handlePrint();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  if (!product) return null;

  return (
    <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div ref={containerRef} style={{ background: 'white' }}>
        {template ? (
          <PrintLabelPreview 
            elements={template.elements}
            widthPx={template.widthPx}
            heightPx={template.heightPx}
            product={product}
          />
        ) : (
          <div 
            style={{ 
              width: '50mm', 
              textAlign: 'center', 
              padding: '10px 5px', 
              fontFamily: 'sans-serif',
              background: 'white',
              filter: 'grayscale(100%) contrast(150%)'
            }}
          >
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
              {product.brand}
            </h2>
            <p style={{ fontSize: '12px', margin: '0 0 5px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {product.name}
            </p>
            <p style={{ fontSize: '16px', fontWeight: '900', margin: '0' }}>
              {currencySymbol} {product.price.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
