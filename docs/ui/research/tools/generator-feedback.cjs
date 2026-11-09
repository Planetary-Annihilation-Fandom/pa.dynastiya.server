const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.env.PA_WORKSPACE||path.resolve(__dirname,'../../../../../../..');
const cdp=require(path.join(root,'docs/En/Modding/Debug/cdp.js'));
const port=Number(process.env.PA_UI_PORT||9881),target='new_game/new_game.html';
async function read(body){return JSON.parse(await cdp.evaluate(port,target,body));}
async function main(){
 const results=[];
 try {
  results.push(await read('window.savedGenerateSystem=generateSystem;window.feedbackCalls=0;window.feedbackDeferred=$.Deferred();generateSystem=function(){window.feedbackCalls++;return window.feedbackDeferred.promise();};generate();generate();return {pending:generationPending(),disabled:document.querySelector("button.generate").disabled,busy:document.querySelector("button.generate").getAttribute("aria-busy"),label:document.querySelector("button.generate label").textContent};'));
  assert.equal(results[0].pending,true);assert.equal(results[0].disabled,true);assert.equal(results[0].busy,'true');
  await cdp.waitFor(port,target,'return window.feedbackCalls===1;',10,100);
  results.push(await read('window.feedbackDeferred.reject("test rejection");return {calls:feedbackCalls,pending:generationPending(),error:generationError(),disabled:document.querySelector("button.generate").disabled};'));
  assert.equal(results[1].calls,1);assert.equal(results[1].pending,false);assert.ok(results[1].error);assert.equal(results[1].disabled,false);
  await read('window.feedbackDeferred=$.Deferred();generate();return true;');
  await cdp.waitFor(port,target,'return window.feedbackCalls===2;',10,100);
  results.push(await read('window.feedbackDeferred.resolve();return {pending:generationPending(),error:generationError()};'));
  assert.equal(results[2].pending,false);assert.equal(results[2].error,'');
  await read('generateSystem=function(){throw Error("test synchronous failure")};generate();return true;');
  await cdp.waitFor(port,target,'return !generationPending();',10,100);
  results.push(await read('return {pending:generationPending(),error:generationError()};'));
  assert.ok(results[3].error);
 } finally {
  await cdp.evaluate(port,target,'if(window.savedGenerateSystem)generateSystem=window.savedGenerateSystem;generationPending(false);generationError("");return true;');
 }
 const out=path.resolve(__dirname,'../2026-11-09-control-feedback');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'generator-feedback.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
