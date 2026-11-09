// Inject through CDP once, outside timing runs. Rectangles are not paint damage.
return {
    url:location.href,
    size:[innerWidth,innerHeight],
    animations:Array.prototype.map.call(document.querySelectorAll('*'),function(e){
        var s=getComputedStyle(e),r=e.getBoundingClientRect();
        if(s.webkitAnimationName==='none'&&s.webkitFilter==='none')return null;
        return {tag:e.tagName,id:e.id,classes:e.className,animation:s.webkitAnimationName,duration:s.webkitAnimationDuration,iterations:s.webkitAnimationIterationCount,playState:s.webkitAnimationPlayState,filter:s.webkitFilter,shadow:s.boxShadow,opacity:s.opacity,visibility:s.visibility,hasRect:!!e.getClientRects().length,rect:[r.left,r.top,r.width,r.height]};
    }).filter(function(e){return !!e;})
};
