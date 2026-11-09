// Runtime comparison in a running isolated Dynastiya host; no player profile.
const fs = require('node:fs');
const path = require('node:path');
const root = process.env.PA_WORKSPACE || path.resolve(__dirname, '../../../../../../..');
const cdp = require(path.join(root, 'docs/En/Modding/Debug/cdp.js'));
const port = Number(process.env.PA_UI_PORT || 9881);
const match = process.argv[2] || 'new_game/new_game.html';
const selector = process.argv[3] || '.btn_toggle:not(.live):not(.btn_toggle_disabled)';
async function session(target, run) {
 const socket = new WebSocket(target.webSocketDebuggerUrl);
 const pending = new Map();
 let id = 0;
 const timer = setTimeout(() => socket.close(), 20000);
 function send(method, params) {
  return new Promise((resolve, reject) => {
   pending.set(++id, {resolve, reject});
   socket.send(JSON.stringify({id, method, params}));
  });
 }
 socket.onmessage = event => {
  const message = JSON.parse(event.data), request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(Error(JSON.stringify(message.error)));
  else request.resolve(message.result);
 };
 socket.onclose = () => { for (const request of pending.values()) request.reject(Error('CDP closed')); };
 try {
  await new Promise((resolve, reject) => { socket.onopen=resolve; socket.onerror=reject; });
  return await run(send);
 } finally { clearTimeout(timer); socket.close(); }
}
async function main() {
 const target = await cdp.resolveTarget(port, match);
 const samples = await session(target, async send => {
  async function evaluate(body) {
   const r = await send('Runtime.evaluate', {expression: '(function(){' + body + '})()', returnByValue:true});
   if(r.wasThrown || r.exceptionDetails) throw Error(JSON.stringify(r));
   return r.result.value;
  }
  const setup = await evaluate('var e=document.querySelector('+JSON.stringify(selector)+');if(!e)throw Error("Missing control");var r=e.getBoundingClientRect();return JSON.stringify({x:r.left+r.width/2,y:r.top+r.height/2,url:location.href,size:[innerWidth,innerHeight],scale:api.settings.getSynchronous("ui","ui_scale")});');
  const point = JSON.parse(setup), results = [];
  if (point.x < 0 || point.y < 0 || point.x >= point.size[0] || point.y >= point.size[1]) {
   throw Error('Control is outside the active view; show the panel before testing');
  }
  const read = 'var e=document.querySelector('+JSON.stringify(selector)+'),s=getComputedStyle(e),r=e.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return JSON.stringify({duration:s.webkitTransitionDuration,delay:s.webkitTransitionDelay,property:s.webkitTransitionProperty,background:s.backgroundColor,shadow:s.boxShadow,pointerEvents:s.pointerEvents,disabled:e.disabled,cls:e.className,focused:document.activeElement===e,hit:hit===e||e.contains(hit)});';
  try {
   for(const mode of ['baseline','patched','baseline-restored','patched-final']) {
    const patched = mode.indexOf('patched')===0;
    await evaluate('Array.prototype.forEach.call(document.styleSheets,function(s){if((s.href||"").indexOf("dynastiya.control_feedback")>=0)s.disabled='+!patched+';});return true;');
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:point.x,y:point.y});
    await cdp.sleep(400);
    const hover = JSON.parse(await evaluate(read));
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
    const pressed = JSON.parse(await evaluate(read));
    // Release away from the control so the probe does not trigger its action.
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:1,y:1,button:'left',clickCount:1});
    const leave = JSON.parse(await evaluate(read));
    await cdp.sleep(400);
    const settled = JSON.parse(await evaluate(read));
    results.push({mode,hover,pressed,leave,settled});
   }
  } finally {
   await evaluate('Array.prototype.forEach.call(document.styleSheets,function(s){if((s.href||"").indexOf("dynastiya.control_feedback")>=0)s.disabled=false;});return true;');
  }
  return {setup:point,selector,results};
 });
 const out=path.resolve(__dirname,'../2026-11-09-control-feedback');fs.mkdirSync(out,{recursive:true});
 const filename=path.join(out,match.replace(/[^a-z0-9]/gi,'-')+'-'+Date.now()+'.json');
 fs.writeFileSync(filename,JSON.stringify(samples,null,2)+'\n');
 console.log(JSON.stringify({filename,samples}));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
