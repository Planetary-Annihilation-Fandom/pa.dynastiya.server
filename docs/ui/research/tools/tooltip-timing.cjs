const path=require('node:path'),fs=require('node:fs');
const root=process.env.PA_WORKSPACE || path.resolve(__dirname,'../../../../../../..');
const cdp=require(path.join(root,'docs/En/Modding/Debug/cdp.js'));
const port=Number(process.env.PA_UI_PORT || 9881);
const target='new_game/new_game.html';
(async()=>{
await cdp.input(port,target,'move',700,400);
await cdp.evaluate(port,target,"window.dynTipLog=[];var e=document.querySelector('button.option');jQuery(e).off('.dynTipProbe').on('mouseenter.dynTipProbe mouseleave.dynTipProbe show.bs.tooltip.dynTipProbe shown.bs.tooltip.dynTipProbe hide.bs.tooltip.dynTipProbe hidden.bs.tooltip.dynTipProbe',function(ev){var t=jQuery(e).data('bs.tooltip'),tip=t&&t.tip()[0],s=tip?getComputedStyle(tip):null;window.dynTipLog.push({event:ev.type,time:performance.now(),opacity:s?s.opacity:null,transition:s?s.webkitTransition:null});});if(window.dynTipObserver)window.dynTipObserver.disconnect();window.dynTipObserver=new MutationObserver(function(ms){ms.forEach(function(m){Array.prototype.forEach.call(m.removedNodes,function(n){if(n.nodeType===1&&n.classList.contains('tooltip'))window.dynTipLog.push({event:'detached',time:performance.now()});});});});window.dynTipObserver.observe(document.body,{childList:true,subtree:true});return true;");
for(let i=0;i<3;i++){await cdp.input(port,target,'move',270,550);await cdp.sleep(400);await cdp.input(port,target,'move',700,400);await cdp.sleep(400);}
const result=await cdp.evaluate(port,target,"window.dynTipObserver.disconnect();jQuery(document.querySelector('button.option')).off('.dynTipProbe');return window.dynTipLog;");
const out=path.resolve(__dirname,'../runs');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'tooltip-timing-'+Date.now()+'.json'),JSON.stringify(JSON.parse(result),null,2));console.log(result);
})().catch(e=>{console.error(e);process.exitCode=1;});
