const fs = require('fs');
let code = fs.readFileSync('src/components/Banner.tsx', 'utf8');

const regex = /\{\/\* Background Blurred Image Layer \(Fills container\) \*\/\}\s*<img\s*src=\{slide\.imageUrl\}\s*alt=""\s*className="absolute inset-0 w-full h-full object-cover object-center opacity-30 blur-2xl scale-110"\s*referrerPolicy="no-referrer"\s*\/>\s*\{\/\* Main Uncropped Image \*\/\}\s*<img\s*src=\{slide\.imageUrl\}\s*alt=\{slide\.title \|\| `Pasarela \$\{index \+ 1\}`\}\s*className=\{`relative w-full h-full object-contain object-center transition-transform duration-\[6000ms\] ease-out \$\{\s*isActive \? 'scale-105' : 'scale-100'\s*\}\`\}\s*referrerPolicy="no-referrer"\s*loading=\{index === 0 \? 'eager' : 'lazy'\}\s*\/>/;

const newHtml = `{/* Main Image with object-cover */}\n              <img\n                src={slide.imageUrl}\n                alt={slide.title || \`Pasarela \${index + 1}\`}\n                className={\`absolute inset-0 w-full h-full object-cover object-top sm:object-center transition-transform duration-[6000ms] ease-out \${ \n                  isActive ? 'scale-105' : 'scale-100' \n                }\`}\n                referrerPolicy="no-referrer"\n                loading={index === 0 ? 'eager' : 'lazy'}\n              />`;

code = code.replace(regex, newHtml);

fs.writeFileSync('src/components/Banner.tsx', code);
