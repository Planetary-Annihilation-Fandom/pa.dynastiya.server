// Refresh only flat-effect styles in free isolated test scenes; never navigate.
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'../../../../../../..');
const cdp=require(path.join(root,'docs/En/Modding/Debug/cdp.js'));
const base=path.join(root,'mods/dynastiya/client/ui/mods/dynastiya.flat_effects');
const inventory=JSON.parse(fs.readFileSync(path.join(base,'inventory.json'),'utf8')).map(e=>({...e,css:fs.readFileSync(path.join(base,e.override),'utf8')}));
const globalCss=fs.readFileSync(path.join(base,'global.css'),'utf8');
async function main(){
 const port=Number(process.argv[2]||9882), results=[];
 for(const target of await cdp.listTargets(port)){
  if(!target.webSocketDebuggerUrl||!target.url.startsWith('coui://'))continue;
  const body=`
   var old=document.getElementById('dyn-flat-development');if(old)old.parentNode.removeChild(old);
   var originals=[];Array.prototype.forEach.call(document.styleSheets,function(s){if(/dynastiya.flat_effects/.test(s.href||'')){originals.push({sheet:s,disabled:s.disabled});s.disabled=true;}});
   var controls=Array.prototype.slice.call(document.querySelectorAll('button,input,select,.btn,.btn_std,.btn_toggle')).filter(function(e){return e.getClientRects().length;});
   function read(e){var r=e.getBoundingClientRect(),s=getComputedStyle(e);return {rect:[r.left,r.top,r.width,r.height],border:s.borderImageSource,filter:s.webkitFilter,shadow:s.boxShadow,text:s.textShadow};}
   var before=controls.map(read),sheets=Array.prototype.map.call(document.styleSheets,function(s){return s.href||'';});
   var entries=${JSON.stringify(inventory)}.filter(function(e){return sheets.some(function(h){return h.slice(-e.source.length)===e.source||(e.bundled&&h==='bundle://boot/boot.css');});});
   var style=document.createElement('style');style.id='dyn-flat-development';style.textContent=${JSON.stringify(globalCss)}+'\\n'+entries.map(function(e){return e.css;}).join('\\n');document.head.appendChild(style);
   var after=controls.map(read),moved=[],changedFrames=[];
   controls.forEach(function(e,i){if(JSON.stringify(before[i].rect)!==JSON.stringify(after[i].rect))moved.push(i);if(before[i].border!==after[i].border)changedFrames.push(i);});
   var effects=[];Array.prototype.forEach.call(document.querySelectorAll('body *'),function(e){if(!e.getClientRects().length)return;['',':before',':after'].forEach(function(p){var c=getComputedStyle(e,p||null);if(c.boxShadow!=='none'||c.textShadow!=='none'||/drop-shadow/.test(c.webkitFilter))effects.push({tag:e.tagName,id:e.id,cls:e.className,pseudo:p,shadow:c.boxShadow,text:c.textShadow,filter:c.webkitFilter});});});
   var prior=document.activeElement,fixture=document.createElement('div');fixture.style.cssText='position:fixed;left:-10000px;top:0';fixture.innerHTML='<button class="btn_std">Focus</button><button disabled>Disabled</button><img style="-webkit-filter:grayscale(100%)"/><div class="div_animated_flash_red">Warning</div>';document.body.appendChild(fixture);
   fixture.children[0].focus();var focus=getComputedStyle(fixture.children[0]);
   var states={focus:document.hasFocus()?(focus.outlineWidth==='2px'&&focus.outlineStyle==='solid'):null,disabled:Math.abs(Number(getComputedStyle(fixture.children[1]).opacity)-.45)<.001,grayscale:/grayscale/.test(getComputedStyle(fixture.children[2]).webkitFilter),warning:getComputedStyle(fixture.children[3]).backgroundColor==='rgb(139, 32, 32)'};
   fixture.parentNode.removeChild(fixture);if(prior&&prior.focus)prior.focus();
   style.parentNode.removeChild(style);originals.forEach(function(o){o.sheet.disabled=o.disabled;});
   return {url:location.href,controls:controls.length,moved:moved,changedFrames:changedFrames,effects:effects.slice(0,20),states:states,overrides:entries.map(function(e){return e.source;})};`;
  results.push(JSON.parse(await cdp.evaluate(port,target.url,body)));
 }
 console.log(JSON.stringify(results,null,2));
 if(results.some(r=>r.moved.length||r.changedFrames.length||r.effects.length||Object.values(r.states).some(v=>v===false)))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
