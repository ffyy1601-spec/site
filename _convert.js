const sharp = require('sharp');
const path = require('path');
const files = ['2.jpg', '3.jpg', '8.jpg'];
const dir = path.join(__dirname, 'img');

(async () => {
    for (const file of files) {
        const input = path.join(dir, file);
        const output = path.join(dir, file.replace('.jpg', '.webp'));
        await sharp(input).webp({ quality: 82 }).toFile(output);
        console.log(`Done: ${file} -> ${file.replace('.jpg', '.webp')}`);
    }
    console.log('All images converted!');
})();
