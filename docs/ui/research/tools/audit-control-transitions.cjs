// Static inventory of transition declarations (not a full CSS parser).
const fs=require('node:fs'),path=require('node:path');
const root=process.argv[2]||'C:/workroot/software/steam/steamapps/common/Planetary Annihilation Titans/media/ui/main';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()&&e.name!=='thirdparty'?walk(path.join(dir,e.name)):e.isFile()&&e.name.endsWith('.css')?[path.join(dir,e.name)]:[]);}
const rows=[];
for(const file of walk(root)){
 const css=fs.readFileSync(file,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
 for(const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  const transitions=m[2].match(/(?:-webkit-)?transition[^:]*:[^;}]+/g);
  if(transitions)rows.push({file:path.relative(root,file).replaceAll('\\','/'),selector:m[1].trim().replace(/\s+/g,' '),transitions});
 }
}
const out=path.resolve(__dirname,'../2026-11-09-control-feedback/source-transitions.json');
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify({root,rows},null,2)+'\n');
console.log(JSON.stringify({out,declarations:rows.length}));
