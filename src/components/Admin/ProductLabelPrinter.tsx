import React, { useRef, useEffect } from 'react';
import Barcode from 'react-barcode';
import { Product } from '../../types';
import { useReactToPrint } from 'react-to-print';

interface ProductLabelPrinterProps {
  product: Product | null;
  currencySymbol: string;
  onPrintComplete: () => void;
}

export const ProductLabelPrinter: React.FC<ProductLabelPrinterProps> = ({ 
  product, 
  currencySymbol, 
  onPrintComplete 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: containerRef,
    onAfterPrint: () => onPrintComplete(),
    pageStyle: `
      @page {
        size: 80mm auto;
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
    `,
  });

  useEffect(() => {
    if (product) {
      // Allow React to render the barcode and DOM updates
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
      <div 
        ref={containerRef} 
        style={{ 
          width: '80mm', 
          textAlign: 'center', 
          padding: '10px 5px', 
          fontFamily: 'sans-serif',
          background: 'white',
          filter: 'grayscale(100%) contrast(150%)'
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0', textTransform: 'uppercase' }}>
          {product.brand}
        </h2>
        <p style={{ fontSize: '14px', margin: '0 0 10px 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 10px 0' }}>
          <Barcode 
            value={product.sku || product.id.slice(0, 8)} 
            width={2} 
            height={50} 
            displayValue={true}
            margin={0}
            fontSize={14}
            background="transparent"
            lineColor="#000000"
          />
        </div>
        
        <p style={{ fontSize: '20px', fontWeight: '900', margin: '0' }}>
          {currencySymbol} {product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
};
