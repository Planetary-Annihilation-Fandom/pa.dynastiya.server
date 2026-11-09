// Run from pa workspace with the isolated host already in a lobby.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../../..');
const cdp = require(path.join(root, 'docs/En/Modding/Debug/cdp.js'));
const target = process.argv[2] || 'new_game/new_game.html';
const patch = fs.readFileSync(path.join(root, 'mods/dynastiya/client/ui/mods/dynastiya.tooltip/tooltip.js'), 'utf8');
async function evaluate(body) {
    const result = await cdp.evaluate(9881, target, body);
    if (result.startsWith('THROW:')) throw new Error(result);
    return JSON.parse(result);
}
async function sample(mode) {
    await evaluate("window.tipResult={mode:" + JSON.stringify(mode) + ",events:[]};var host=document.createElement('div');host.id='dyn-tip-test';host.style.cssText='position:fixed;top:120px;left:120px;z-index:99999';host.innerHTML='<button data-container=\"body\" data-bind=\"tooltip: title\">Tooltip A</button><button data-bind=\"tooltip: title\">Tooltip B</button>';document.body.appendChild(host);window.tipTitle=ko.observable('First');ko.applyBindings({title:tipTitle},host);window.tipButtons=jQuery(host).find('button');tipButtons.on('show.bs.tooltip.probe shown.bs.tooltip.probe hide.bs.tooltip.probe hidden.bs.tooltip.probe',function(e){tipResult.events.push({event:e.type,time:performance.now()});});window.tipObserver=new MutationObserver(function(ms){ms.forEach(function(m){Array.prototype.forEach.call(m.removedNodes,function(n){if(n.nodeType===1&&n.classList.contains('tooltip'))tipResult.events.push({event:'detached',time:performance.now()});});});});tipObserver.observe(document.body,{childList:true,subtree:true});tipResult.enter=performance.now();tipButtons.eq(0).trigger('mouseenter');return true;");
    await cdp.sleep(40);
    await evaluate("tipResult.leave=performance.now();tipButtons.eq(0).trigger('mouseleave');return true;");
    await cdp.sleep(320);
    await evaluate("tipButtons.off('.probe');tipObserver.disconnect();return true;");
    const result = await evaluate("tipButtons.eq(0).triggerHandler('focus');tipButtons.eq(0).trigger('mouseenter').trigger('mouseleave');var a=tipButtons.eq(0).data('bs.tooltip');tipResult.focusRetained=a.tip().hasClass('in');tipButtons.eq(0).triggerHandler('blur');tipResult.blurHidden=!a.tip().hasClass('in');for(var i=0;i<20;i++){tipButtons.eq(0).trigger('mouseenter').trigger('mouseleave');tipButtons.eq(1).trigger('mouseenter').trigger('mouseleave');}tipResult.tipsAfterRapid=document.querySelectorAll('.tooltip.in').length;tipTitle('Updated');tipButtons.eq(0).trigger('mouseenter');tipResult.dynamicTitle=a.tip().text();tipResult.options={delay:a.options.delay,animation:a.options.animation,container:a.options.container};var tip=a.tip()[0];ko.removeNode(document.getElementById('dyn-tip-test'));tipResult.removedWithOwner=!document.documentElement.contains(tip);tipResult.instanceRemoved=!tipButtons.eq(0).data('bs.tooltip');clearTimeout(a.timeout);a.hoverState='out';a.destroy();a.tip().remove();var b=tipButtons.eq(1).data('bs.tooltip');if(b){clearTimeout(b.timeout);b.hoverState='out';b.destroy();b.tip().remove();}tipObserver.disconnect();return tipResult;");
    return result;
}
(async function () {
    const preloaded = await evaluate('return !!ko.bindingHandlers.tooltip.dynastiyaLifecycle;');
    const results = [];
    if (!preloaded) results.push(await sample('baseline'));
    if (!process.argv.includes('--baseline-only')) {
        await evaluate(patch + '\nreturn true;');
        results.push(await sample(preloaded ? 'integrated' : 'patched'));
    }
    const report = {target,results};
    if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(results.map(r => ({mode:r.mode, showMs:r.events.find(e=>e.event==='shown').time-r.enter, hideMs:r.events.find(e=>e.event==='hide').time-r.leave, detachMs:r.events.find(e=>e.event==='detached').time-r.leave, focusRetained:r.focusRetained, blurHidden:r.blurHidden, tipsAfterRapid:r.tipsAfterRapid, removedWithOwner:r.removedWithOwner, instanceRemoved:r.instanceRemoved})), null, 2));
    results.filter(r => r.mode !== 'baseline').forEach(r => {
        if (!r.focusRetained || !r.blurHidden || r.tipsAfterRapid || !r.removedWithOwner || !r.instanceRemoved || r.dynamicTitle !== 'Updated') throw new Error('Tooltip lifecycle regression');
    });
})().catch(e => { console.error(e); process.exitCode = 1; });
