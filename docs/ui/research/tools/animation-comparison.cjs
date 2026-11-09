// Node 22+, visible isolated PA host. No production profile, no scene navigation.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../../..');
const cdp = require(path.join(root, 'docs/En/Modding/Debug/cdp.js'));
const client = path.join(root, 'mods/dynastiya/client');
const scene = process.argv[2] || 'new_game/new_game.html';
const label = process.argv[3] || 'empty';
const duration = Number(process.argv[4] || 8000);
const svg = fs.readFileSync(path.join(client, 'ui/main/shared/img/working.svg'), 'utf8');
const stockSvg = fs.readFileSync('C:/workroot/software/steam/steamapps/common/Planetary Annihilation Titans/media/ui/main/shared/img/working.svg','utf8');
const css = fs.readFileSync(path.join(client, 'ui/mods/dynastiya.animation/animation.css'), 'utf8');
const probe = fs.readFileSync(path.join(__dirname, 'animation-probe.js'), 'utf8');
const result = [];
const pulse = process.argv.includes('--pulse');
const integrated = process.argv.includes('--integrated');
const modes = integrated ? ['integrated'] : pulse ? ['pulse-baseline','pulse-static','pulse-restored','pulse-static-repeat'] : ['baseline', 'static-original', 'hourglass', 'baseline-restored', 'hourglass-repeat'];
const candidate = pulse ? 'label.generate-planet-label{-webkit-animation:none!important;-webkit-filter:drop-shadow(0 0 3px rgba(6,255,234,.89))!important;}' : css;
async function session(target, run) {
    const ws = new WebSocket(target.webSocketDebuggerUrl), pending = new Map();
    let id = 0;
    const opened = new Promise((resolve, reject) => {ws.onopen=resolve;ws.onerror=reject;});
    ws.onmessage = event => {
        const reply = JSON.parse(event.data), p = pending.get(reply.id);
        if (!p) return;
        pending.delete(reply.id);
        clearTimeout(p.timer);
        reply.error ? p.reject(new Error(JSON.stringify(reply.error))) : p.resolve(reply.result);
    };
    await opened;
    const send = (method, params) => new Promise((resolve, reject) => {
        const key = ++id;
        const timer = setTimeout(() => {pending.delete(key);reject(new Error('CDP timeout: ' + method));}, 10000);
        pending.set(key, {resolve,reject,timer});
        ws.send(JSON.stringify({id:key,method,params}));
    });
    try { return await run(send); } finally { ws.close(); }
}
async function main() {
    try {
        for (const mode of modes) {
            await cdp.sleep(300);
            await session(await cdp.resolveTarget(9881, scene), async function(send) {
            async function evaluate(body) {
                const r = await send('Runtime.evaluate', {expression:'(function(){' + body + '})()', returnByValue:true});
                if(r.wasThrown) throw new Error(JSON.stringify(r));
                return r.result.value;
            }
            await evaluate(`
                var s=document.getElementById('dyn-animation-comparison');
                if(s)s.parentNode.removeChild(s);
                Array.prototype.forEach.call(document.querySelectorAll('img.working'),function(e){
                    if(!e.hasAttribute('data-dyn-original-src'))e.setAttribute('data-dyn-original-src',e.getAttribute('src'));
                    e.src=${JSON.stringify(integrated || pulse)} ? e.getAttribute('data-dyn-original-src') : ${JSON.stringify('data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'))};
                    ${!integrated && !pulse && !mode.startsWith('hourglass') ? 'e.src=' + JSON.stringify('data:image/svg+xml;base64,' + Buffer.from(stockSvg).toString('base64')) + ';' : ''}
                });
                ${!integrated ? `s=document.createElement('style');s.id='dyn-animation-comparison';s.textContent=${JSON.stringify(mode === 'static-original' || mode.startsWith('hourglass') || mode.startsWith('pulse-static') ? candidate : pulse ? '' : 'img.working{-webkit-animation:loading_rotation .7s infinite linear!important;animation:loading_rotation .7s infinite linear!important;}')};document.head.appendChild(s);` : ''}
                return true;`);
            await cdp.sleep(1500);
            const context = await evaluate(`return {url:location.href,size:[innerWidth,innerHeight],scale:devicePixelRatio,visibility:document.visibilityState,empty:typeof model.systemIsEmpty==='function'?model.systemIsEmpty():null,working:Array.prototype.map.call(document.querySelectorAll('img.working'),function(e){var s=getComputedStyle(e),r=e.getBoundingClientRect();return {visible:!!e.getClientRects().length,animation:s.webkitAnimationName,rect:[r.left,r.top,r.width,r.height],complete:e.complete,width:e.naturalWidth};})};`);
            await evaluate(probe);
            const start = Date.now();
            while (Date.now() - start < duration) {
                await send('Input.dispatchMouseEvent', {type:'mouseMoved',x:Math.floor((Date.now() - start) / 150) % 2 ? 270 : 310,y:550});
                await cdp.sleep(150);
            }
            const metrics = await evaluate('return window.dynLatencyProbe.stop();');
            metrics.elapsedMs = Date.now() - start;
            metrics.over50Fraction = metrics.frames.over50ms / metrics.frames.n;
            result.push({mode, context, metrics});
            console.log(mode, JSON.stringify({...metrics,samples:undefined}));
            });
        }
    } finally {
        await cdp.evaluate(9881, scene, "var s=document.getElementById('dyn-animation-comparison');if(s)s.parentNode.removeChild(s);Array.prototype.forEach.call(document.querySelectorAll('img.working[data-dyn-original-src]'),function(e){e.src=e.getAttribute('data-dyn-original-src');e.removeAttribute('data-dyn-original-src');});return true;");
        fs.writeFileSync(path.join(__dirname, '../2026-11-09/animation-' + label + '.json'), JSON.stringify({date:new Date().toISOString(),scene,duration,result},null,2));
    }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
