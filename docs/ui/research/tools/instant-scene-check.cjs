const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const file=path.resolve(__dirname,'../../../../../client/ui/mods/dynastiya.control_feedback/main.js');
const source=fs.readFileSync(file,'utf8');
function check(dev,played,gw){
 const calls=[];
 function observable(value){return function(next){if(arguments.length)value=next;return value;};}
 const model={splashHidden:false,hasPlayedIntroOnce:()=>played,playIntroVideo:()=>calls.push('intro'),showPlayer:observable(true),playerUrl:observable('video'),markIntroAsPlayed:()=>calls.push('mark'),isPlayingGWIntro:observable(gw),showGame:()=>calls.push('showGame')};
 const context={model,DEV_MODE:dev,$:s=>({hide:()=>calls.push('hide:'+s),removeClass:()=>calls.push('clear:'+s)}),setLayoutMode:x=>calls.push('layout:'+x),api:{panels:{player:{blur:()=>calls.push('blur')}}},UIMediaUtility:{startMusic:()=>calls.push('music')}};
 vm.runInNewContext(source,context);
 model.hideSplash();
 assert.equal(calls.includes('layout:true'),dev||played);
 assert.equal(calls.includes('intro'),!dev&&!played);
 const n=calls.length;model.hideSplash();assert.equal(calls.length,n);
 model.finishVideo();
 assert.equal(model.showPlayer(),false);assert.equal(model.playerUrl(),'');
 assert.equal(model.isPlayingGWIntro(),false);assert.equal(calls.at(-1),'showGame');
 assert.equal(calls.includes('music'),!gw);assert(calls.includes('mark'));
 const end=calls.length;model.finishVideo();assert.equal(calls.length,end);
 return {dev,played,gw,calls};
}
console.log(JSON.stringify([check(true,false,false),check(false,true,false),check(false,false,true)],null,2));
