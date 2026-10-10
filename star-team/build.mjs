import {mkdir,copyFile,writeFile,readdir,lstat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'dist');
const files=['index.html','style.css','app.js','batch2.js','library.js','logic.js','upgrades.js'];
try{const stat=await lstat(out);if(stat.isSymbolicLink()||!stat.isDirectory())throw Error('dist must be a regular directory');const existing=await readdir(out);if(existing.some(name=>![...files,'.nojekyll'].includes(name)))throw Error('Unexpected file in dist; refusing to include it in public output');}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(out,{recursive:true});for(const file of files)await copyFile(path.join(root,file),path.join(out,file));await writeFile(path.join(out,'.nojekyll'),'');
console.log(`Prepared ${files.length} public application files in dist. No local records or credentials are included.`);
