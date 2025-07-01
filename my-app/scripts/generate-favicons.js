const fs = require('fs');
const path = require('path');

// SVGファイルの内容
const svgContent = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景の円 -->
  <circle cx="16" cy="16" r="15" fill="#FF6B35" stroke="#E55A2B" stroke-width="2"/>
  
  <!-- 犬の耳 -->
  <ellipse cx="10" cy="12" rx="3" ry="4" fill="#8B4513" transform="rotate(-15 10 12)"/>
  <ellipse cx="22" cy="12" rx="3" ry="4" fill="#8B4513" transform="rotate(15 22 12)"/>
  
  <!-- 犬の顔 -->
  <ellipse cx="16" cy="18" rx="8" ry="6" fill="#D2691E"/>
  
  <!-- 犬の目 -->
  <circle cx="13" cy="16" r="1.5" fill="#000"/>
  <circle cx="19" cy="16" r="1.5" fill="#000"/>
  <circle cx="13.5" cy="15.5" r="0.5" fill="#FFF"/>
  <circle cx="19.5" cy="15.5" r="0.5" fill="#FFF"/>
  
  <!-- 犬の鼻 -->
  <ellipse cx="16" cy="18" rx="1" ry="0.8" fill="#000"/>
  
  <!-- 犬の口 -->
  <path d="M 14 20 Q 16 22 18 20" stroke="#000" stroke-width="1" fill="none"/>
  
  <!-- 犬の舌 -->
  <ellipse cx="16" cy="21" rx="1" ry="0.5" fill="#FF69B4"/>
  
  <!-- 犬の足跡 -->
  <circle cx="8" cy="26" r="1" fill="#FF6B35"/>
  <circle cx="10" cy="24" r="1" fill="#FF6B35"/>
  <circle cx="12" cy="26" r="1" fill="#FF6B35"/>
  <circle cx="14" cy="24" r="1" fill="#FF6B35"/>
  
  <!-- ハート -->
  <path d="M 20 8 Q 20 6 22 6 Q 24 6 24 8 Q 24 10 22 12 Q 20 10 20 8" fill="#FF69B4"/>
</svg>`;

// より大きなサイズのSVG（180x180）
const largeSvgContent = `<svg width="180" height="180" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景の円 -->
  <circle cx="16" cy="16" r="15" fill="#FF6B35" stroke="#E55A2B" stroke-width="2"/>
  
  <!-- 犬の耳 -->
  <ellipse cx="10" cy="12" rx="3" ry="4" fill="#8B4513" transform="rotate(-15 10 12)"/>
  <ellipse cx="22" cy="12" rx="3" ry="4" fill="#8B4513" transform="rotate(15 22 12)"/>
  
  <!-- 犬の顔 -->
  <ellipse cx="16" cy="18" rx="8" ry="6" fill="#D2691E"/>
  
  <!-- 犬の目 -->
  <circle cx="13" cy="16" r="1.5" fill="#000"/>
  <circle cx="19" cy="16" r="1.5" fill="#000"/>
  <circle cx="13.5" cy="15.5" r="0.5" fill="#FFF"/>
  <circle cx="19.5" cy="15.5" r="0.5" fill="#FFF"/>
  
  <!-- 犬の鼻 -->
  <ellipse cx="16" cy="18" rx="1" ry="0.8" fill="#000"/>
  
  <!-- 犬の口 -->
  <path d="M 14 20 Q 16 22 18 20" stroke="#000" stroke-width="1" fill="none"/>
  
  <!-- 犬の舌 -->
  <ellipse cx="16" cy="21" rx="1" ry="0.5" fill="#FF69B4"/>
  
  <!-- 犬の足跡 -->
  <circle cx="8" cy="26" r="1" fill="#FF6B35"/>
  <circle cx="10" cy="24" r="1" fill="#FF6B35"/>
  <circle cx="12" cy="26" r="1" fill="#FF6B35"/>
  <circle cx="14" cy="24" r="1" fill="#FF6B35"/>
  
  <!-- ハート -->
  <path d="M 20 8 Q 20 6 22 6 Q 24 6 24 8 Q 24 10 22 12 Q 20 10 20 8" fill="#FF69B4"/>
</svg>`;

// ファイルを保存
const publicDir = path.join(__dirname, '..', 'public');

// SVGファイルを保存
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
console.log('✅ favicon.svg を作成しました');

// 大きなSVGファイルを保存（Apple Touch Icon用）
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), largeSvgContent);
console.log('✅ apple-touch-icon.svg を作成しました');

console.log('\n📝 注意: PNGファイルは手動でSVGから変換する必要があります');
console.log('以下のファイルを作成してください:');
console.log('- public/icon-16x16.png (16x16px)');
console.log('- public/icon-32x32.png (32x32px)');
console.log('- public/apple-touch-icon.png (180x180px)');
console.log('\nオンラインのSVG to PNG変換ツールを使用するか、');
console.log('デザインツール（Figma、Sketch、Adobe Illustrator等）で変換してください。'); 