import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  margin?: number;
  className?: string;
}

export default function Barcode({ 
  value, 
  width = 2, 
  height = 50, 
  fontSize = 12, 
  margin = 10,
  className = ''
}: BarcodeProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: 'CODE128',
          width: width,
          height: height,
          fontSize: fontSize,
          margin: margin,
          displayValue: true,
          fontOptions: 'bold',
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (error) {
        console.error('Erro ao gerar código de barras:', error);
      }
    }
  }, [value, width, height, fontSize, margin]);

  return (
    <div className={`flex justify-center ${className}`}>
      <svg ref={barcodeRef}></svg>
    </div>
  );
} 