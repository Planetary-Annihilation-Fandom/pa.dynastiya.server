// One representative native Coherent check, no navigation or game commands.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../../../../../..');
const cdp=require(path.join(root,'docs/En/Modding/Debug/cdp.js'));
const base=path.join(root,'mods/dynastiya/client/ui/mods/dynastiya.control_feedback');
async function main(){
 const css=fs.readFileSync(path.join(base,'control_feedback.css'),'utf8');
 const js=fs.readFileSync(path.join(base,'instant_motion.js'),'utf8');
 await cdp.evaluate(9881,'new_game/new_game.html',js);
 await cdp.evaluate(9881,'new_game/new_game.html',`
 var s=document.createElement('style');s.id='dyn-instant-check-style';s.textContent=${JSON.stringify(css)}+'#dyn-instant-check{position:fixed;top:200px;left:700px;width:100px;height:0;opacity:0;pointer-events:none;-webkit-transition:height .2s .1s,opacity .2s .1s}#dyn-instant-check.show{height:36px;opacity:1;pointer-events:auto}@-webkit-keyframes labelopen{from{max-width:0}to{max-width:100px}}';document.head.appendChild(s);
 var e=document.createElement('div');e.id='dyn-instant-check';document.body.appendChild(e);e.offsetHeight;e.className='show';
 var st=getComputedStyle(e);window.dynInstantCheck={transition:st.webkitTransitionDuration,delay:st.webkitTransitionDelay,openHeight:e.getBoundingClientRect().height,openOpacity:st.opacity,openPointer:st.pointerEvents};
 e.className='';st=getComputedStyle(e);window.dynInstantCheck.closedHeight=e.getBoundingClientRect().height;window.dynInstantCheck.closedPointer=st.pointerEvents;
 e.className='show';e.addEventListener('webkitAnimationEnd',function(){window.dynInstantCheck.endEvent=true;window.dynInstantCheck.duration=getComputedStyle(e).webkitAnimationDuration;window.dynInstantCheck.finalWidth=getComputedStyle(e).maxWidth;});e.style.webkitAnimation='labelopen 2s linear forwards';return true;`);
 const result=await cdp.waitFor(9881,'new_game/new_game.html','return window.dynInstantCheck&&window.dynInstantCheck.endEvent&&window.dynInstantCheck;',5,100);
 await cdp.evaluate(9881,'new_game/new_game.html',"var e=document.getElementById('dyn-instant-check');if(e)e.parentNode.removeChild(e);var s=document.getElementById('dyn-instant-check-style');if(s)s.parentNode.removeChild(s);return true;");
 const data=JSON.parse(result);
 if(data.openHeight!==36||data.closedHeight!==0||data.transition!=='0s'||data.delay!=='0s'||data.closedPointer!=='none'||data.duration!=='0.001s'||data.finalWidth!=='100px')throw new Error(result);
 fs.writeFileSync(path.join(__dirname,'../instant-motion-check.json'),JSON.stringify(data,null,2));
 console.log(result);
}
main().catch(e=>{console.error(e);process.exitCode=1;});

