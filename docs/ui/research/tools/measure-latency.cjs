const fs=require('node:fs');
const path=require('node:path');
const root=process.env.PA_WORKSPACE || path.resolve(__dirname,'../../../../../../..');
const cdp=require(path.join(root,'docs/En/Modding/Debug/cdp.js'));
const probe=fs.readFileSync(path.join(__dirname,'latency-probe.js'),'utf8');
const port=Number(process.env.PA_UI_PORT || 9881), target='new_game/new_game.html';
async function main(){
 const results=[];
 const rules={'no-visible-spinner':'.dyn-probe-visible{-webkit-animation:none!important}','no-hidden-spinner':'.working:not(.dyn-probe-visible){-webkit-animation:none!important}','no-motion':'*{transition:none!important;-webkit-transition:none!important;animation:none!important;-webkit-animation:none!important}','no-animations':'*{animation:none!important;-webkit-animation:none!important}','no-spinner':'.working{-webkit-animation:none!important}','no-pulse':'label.generate-planet-label{-webkit-animation:none!important;-webkit-filter:none!important}','no-transitions':'*{transition:none!important;-webkit-transition:none!important}'};
 for(const mode of (process.argv.slice(2).length?process.argv.slice(2):['baseline','no-pulse','no-transitions','baseline-restored'])){
  await cdp.evaluate(port,target,"Array.prototype.forEach.call(document.querySelectorAll('.working'),function(e){e.classList.toggle('dyn-probe-visible',!!e.getClientRects().length);});var old=document.getElementById('dyn-no-motion');if(old)old.parentNode.removeChild(old);"+(rules[mode]?"var s=document.createElement('style');s.id='dyn-no-motion';s.textContent="+JSON.stringify(rules[mode])+";document.head.appendChild(s);":"")+"return true;");
  await cdp.evaluate(port,target,probe);
  for(let i=0;i<30;i++) { await cdp.input(port,target,'move',i%2?270:310,550); await cdp.sleep(150); }
  results.push({mode,result:JSON.parse(await cdp.evaluate(port,target,'return window.dynLatencyProbe.stop();'))});
 }
 const out=path.resolve(__dirname,'../runs');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'latency-results-'+Date.now()+'.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
