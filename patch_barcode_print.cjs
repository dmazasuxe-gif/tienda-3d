const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/ProductFormModal.tsx', 'utf8');

const oldStyle = `<style>
                                      @page { margin: 0; size: auto; }
                                      body {
                                        margin: 0;
                                        padding: 10px;
                                        display: flex;
                                        justify-content: center;
                                        align-items: flex-start;
                                        background: white;
                                      }
                                      svg { max-width: 100%; height: auto; }
                                    </style>`;

const newStyle = `<style>
                                      @media print {
                                        @page { 
                                          margin: 0; 
                                          size: 58mm 40mm; /* Formato ticketera/etiqueta térmica */
                                        }
                                        html, body {
                                          margin: 0 !important;
                                          padding: 0 !important;
                                          width: 58mm;
                                          height: 40mm;
                                          background: white;
                                          overflow: hidden;
                                        }
                                        body {
                                          display: flex;
                                          justify-content: center;
                                          align-items: center;
                                        }
                                        svg { 
                                          max-width: 100%; 
                                          max-height: 100%; 
                                          page-break-inside: avoid;
                                          page-break-after: avoid;
                                          page-break-before: avoid;
                                          display: block;
                                        }
                                      }
                                      @media screen {
                                        body {
                                          margin: 0;
                                          padding: 10px;
                                          display: flex;
                                          justify-content: center;
                                          align-items: flex-start;
                                          background: #f8fafc;
                                        }
                                        svg { max-width: 100%; height: auto; }
                                      }
                                    </style>`;

code = code.replace(oldStyle, newStyle);
fs.writeFileSync('src/components/Admin/ProductFormModal.tsx', code);
