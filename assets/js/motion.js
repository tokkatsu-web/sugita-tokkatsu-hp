/* 見えたら一度だけ動かす。「動きを減らす」設定の人には動かさない（見本 v5〜v12） */
/* v5：見えたら一度だけ動かす。「動きを減らす」設定の人には動かさない */
(function(){
  var R=document.documentElement;
  if(!R.classList.contains('js'))return;
  var q=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  q('.sec h2,.val,.path-note,.legend,.shelf-note,.news li,.req>*').forEach(function(el){el.classList.add('rv')});
  q('.where>div:last-child>*').forEach(function(el,i){el.classList.add('rv');el.style.setProperty('--d',(i*.08)+'s')});
  q('.cover').forEach(function(el,i){el.classList.add('rv');el.style.setProperty('--i',i)});
  q('.path .step').forEach(function(el,i){el.style.setProperty('--i',i)});
  q('.tilemap g').forEach(function(g){var x=+g.querySelector('rect').getAttribute('x');g.querySelector('rect').style.setProperty('--d',(x/588*1.4+.2).toFixed(2)+'s')});
  /* 数字を0から数える（最後は元の数字） */
  var nums=q('.big em,.kinds li span:last-child').map(function(el){var m=el.textContent.match(/^(\d+)(.*)$/);return m&&{el:el,n:+m[1],u:m[2]}}).filter(Boolean);
  nums.forEach(function(o){o.el.setAttribute('aria-label',o.n+o.u)});
  function count(){var t0=performance.now();(function f(t){var k=Math.min(1,(t-t0)/1400),e=1-Math.pow(1-k,3);nums.forEach(function(o){o.el.textContent=Math.round(o.n*e)+o.u});if(k<1)requestAnimationFrame(f)})(t0)}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;e.target.classList.add('in');if(e.target.classList.contains('tilemap'))count();io.unobserve(e.target)})},{threshold:.18,rootMargin:'0px 0px -6% 0px'});
  q('.rv,.path,.tilemap').forEach(function(el){io.observe(el)});
  /* 飾りの TOKKATSU：少しだけ横に流れる */
  var wm=document.querySelector('.wordmark'),tick=false;
  if(!wm)return;   /* 飾りの TOKKATSU が無いページでは流さない */
  addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){var y=scrollY;if(y<1200)wm.style.transform='translateX('+(-y*.12)+'px)';tick=false})},{passive:true});
})();
(function(){if(!document.documentElement.classList.contains('js'))return;var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15});document.querySelectorAll('.t8-host').forEach(function(el){io.observe(el)})})();
(function(){if(!document.documentElement.classList.contains('js'))return;
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;e.target.classList.add('in');var m=e.target.querySelector('.t9-run animateMotion');if(m&&m.beginElement)m.beginElement();io.unobserve(e.target)})},{threshold:.3});
document.querySelectorAll('.t9-trail,.t9-abroad,.t12-cal,.t12-bars').forEach(function(el){io.observe(el)})})();
