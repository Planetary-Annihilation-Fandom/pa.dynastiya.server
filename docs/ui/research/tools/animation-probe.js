// Diagnostic only. Keep raw timestamps: Coherent rAF timestamps may differ from callback time.
(function () {
    if(window.dynLatencyProbe) window.dynLatencyProbe.stop();
    var samples=[], active=true, raf;
    function frame(t) {
        if(!active)return;
        samples.push([t,performance.now(),Date.now()]);
        raf=requestAnimationFrame(frame);
    }
    function stats(a) {
        var sorted=a.slice().sort(function(a,b){return a-b;});
        return {n:a.length,median:sorted[Math.floor(a.length*.5)],p95:sorted[Math.floor(a.length*.95)],max:sorted[a.length-1],min:sorted[0],over50ms:a.filter(function(x){return x>50;}).length};
    }
    function deltas(index) {
        return samples.slice(1).map(function(s,i){return s[index]-samples[i][index];});
    }
    raf=requestAnimationFrame(frame);
    window.dynLatencyProbe={stop:function(){
        active=false;cancelAnimationFrame(raf);
        return {frames:stats(deltas(0)),callbackIntervals:stats(deltas(1)),wallIntervals:stats(deltas(2)),samples:samples,visibility:document.visibilityState};
    }};
    return true;
}());
