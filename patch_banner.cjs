const fs = require('fs');
let code = fs.readFileSync('src/components/Banner.tsx', 'utf8');

// We are targeting the image part in the Banner
const regex = /<img\s*src=\{slide\.imageUrl\}\s*alt=\{slide\.title \|\| `Pasarela \$\{index \+ 1\}`\}\s*className=\{`w-full h-full object-cover object-center transition-transform duration-\[6000ms\] ease-out \$\{\s*isActive \? 'scale-105' : 'scale-100'\s*\}\`\}\s*referrerPolicy="no-referrer"\s*loading=\{index === 0 \? 'eager' : 'lazy'\}\s*\/>/;

const newImageHtml = `{/* Background Blurred Image Layer (Fills container) */}
              <img
                src={slide.imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center opacity-30 blur-2xl scale-110"
                referrerPolicy="no-referrer"
              />
              {/* Main Uncropped Image */}
              <img
                src={slide.imageUrl}
                alt={slide.title || \`Pasarela \${index + 1}\`}
                className={\`relative w-full h-full object-contain object-center transition-transform duration-[6000ms] ease-out \${
                  isActive ? 'scale-105' : 'scale-100'
                }\`}
                referrerPolicy="no-referrer"
                loading={index === 0 ? 'eager' : 'lazy'}
              />`;

code = code.replace(regex, newImageHtml);

fs.writeFileSync('src/components/Banner.tsx', code);
