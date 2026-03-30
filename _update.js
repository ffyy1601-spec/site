const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = ['index.html', 'kurumsal.html', 'hizmetler.html', 'iletisim.html', '404.html', 'gizlilik-politikasi.html'];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace JPG with WebP
    content = content.replace(/2\.jpg/g, '2.webp');
    content = content.replace(/3\.jpg/g, '3.webp');
    content = content.replace(/8\.jpg/g, '8.webp');
    
    // Replace CSS and JS links with minified versions
    content = content.replace(/"css\/styles\.css"/g, '"css/styles.min.css"');
    content = content.replace(/"js\/site\.js"/g, '"js/site.min.js"');
    
    // Inject KVKK link to footer if not already there
    const footerTextToReplace = 'Akar Elektrik. Tüm hakları saklıdır.</span>';
    const footerLink = 'Akar Elektrik. Tüm hakları saklıdır. <a href="gizlilik-politikasi.html" style="color:var(--teal);margin-left:12px">KVKK ve Çerez Politikası</a></span>';
    
    if (content.includes(footerTextToReplace) && !content.includes('KVKK ve Çerez Politikası')) {
        content = content.replace(footerTextToReplace, footerLink);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
console.log('All files updated successfully.');
