import React from 'react';
import Barcode from 'react-barcode';
import { Product, LabelElement } from '../../types';

interface PrintLabelPreviewProps {
  elements: LabelElement[];
  widthPx: number;
  heightPx: number;
  product?: Product;
}

export const PrintLabelPreview: React.FC<PrintLabelPreviewProps> = ({ elements, widthPx, heightPx, product }) => {
  
  const getDynamicContent = (el: LabelElement): string => {
    if (!el.isVariable || !product) return el.content;
    
    switch (el.variableField) {
      case 'productName':
        return product.name;
      case 'price':
        return `S/ ${product.price.toFixed(2)}`;
      case 'sku':
        return product.sku || product.id.substring(0, 8);
      case 'brand':
        return product.brand || '';
      default:
        return el.content;
    }
  };

  return (
    <div 
      className="print-label-container"
      style={{ 
        position: 'relative', 
        width: `${widthPx}px`, 
        height: `${heightPx}px`, 
        backgroundColor: '#ffffff',
        overflow: 'hidden'
      }}
    >
      {elements.map((el) => {
        const displayContent = getDynamicContent(el);
        
        return (
          <div 
            key={el.id}
            style={{ 
              position: 'absolute', 
              left: `${el.x}px`, 
              top: `${el.y}px` 
            }}
          >
            {el.type === 'text' && (
              <div 
                style={{ 
                  fontSize: `${el.fontSize}px`, 
                  fontWeight: el.fontWeight, 
                  fontFamily: el.fontFamily || 'sans-serif',
                  color: '#000000',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2
                }}
              >
                {displayContent}
              </div>
            )}
            {el.type === 'barcode' && (
              <Barcode 
                value={displayContent || '000000'} 
                width={el.width || 1.5} 
                height={el.height || 40} 
                displayValue={true}
                margin={0}
                fontSize={12}
                background="transparent"
                lineColor="#000000"
              />
            )}
            {el.type === 'image' && (
              <img 
                src={el.content} 
                alt="Logo Etiqueta" 
                style={{ 
                  width: `${el.width}px`, 
                  height: `${el.height}px`, 
                  objectFit: 'contain' 
                }} 
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
