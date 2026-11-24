/* Bloco "Curva de capital" (topo) com filtros Mês / Semana, ampliação ao clicar.
   Uso: TopCharts.render(rows) — rows = operações {data, valor, pontos, criado}. Precisa de <div id="tcchart">. */
(function(){
var G='stroke="#8884" stroke-width="1"',MES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],
    F={m:'',w:''},rows0=[],M=null,dlg=null;
function nf(v){return(Math.abs(v)>=100?v.toFixed(0):v.toFixed(2)).replace('.',',')}
function sg(v){return(v>0?'+':'')+v.toFixed(2).replace('.',',')}
function dmy(k){return k.slice(8)+'/'+k.slice(5,7)}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function addd(s,n){var q=s.split('-');return iso(new Date(+q[0],+q[1]-1,+q[2]+n))}
function wstart(s){var q=s.split('-');return addd(s,-new Date(+q[0],+q[1]-1,+q[2]).getDay())}
function un(){return'$'}
function model(){
  var r=rows0.filter(function(x){return(!F.m||x.data.slice(0,7)===F.m)&&(!F.w||wstart(x.data)===F.w)}).sort(function(a,b){return a.data<b.data?-1:a.data>b.data?1:(a.criado||0)-(b.criado||0)}),
      by={},w=0,l=0,gs=0,ls=0,bw=0,bl=0;
  r.forEach(function(x){var v=x.valor||0;by[x.data]=(by[x.data]||0)+v;if((x.valor||0)>0){w++;gs+=v;bw=Math.max(bw,v)}else{l++;ls-=v;bl=Math.min(bl,v)}});
  var ks=Object.keys(by).sort(),c=0,pk=0,dd=0,eq=[{l:'Início',v:0}];
  ks.forEach(function(k){c+=by[k];eq.push({l:dmy(k),v:c});pk=Math.max(pk,c);dd=Math.max(dd,pk-c)});
  return{n:r.length,w:w,l:l,gs:gs,ls:ls,bw:bw,bl:bl,ks:ks,eq:eq,tot:c,pk:pk,dd:dd};
}
function line(p,W,H,big){
  var L=big?58:46,a=p.map(function(x){return x.v}),mn=Math.min.apply(0,a),mx=Math.max.apply(0,a),pd=(mx-mn)*.1||1,n=p.length,t=big?6:4,s='',i,v;mn-=pd;mx+=pd;
  function X(i){return L+i/(n-1)*(W-L-14)}function Y(v){return 10+(1-(v-mn)/(mx-mn))*(H-36)}
  for(i=0;i<t;i++){v=mn+(mx-mn)*i/(t-1);s+='<line x1="'+L+'" x2="'+W+'" y1="'+Y(v)+'" y2="'+Y(v)+'" '+G+'/><text class="pv" x="2" y="'+(Y(v)+4)+'">'+v.toFixed(0)+'</text>'}
  s+='<polyline fill="none" stroke="#f0b93a" stroke-width="'+(big?3:2.5)+'" points="'+p.map(function(x,i){return X(i)+','+Y(x.v)}).join(' ')+'"/>';
  p.forEach(function(x,i){s+='<circle cx="'+X(i)+'" cy="'+Y(x.v)+'" r="'+(big?5:4)+'" fill="#f0b93a"><title>'+x.l+': '+sg(x.v)+' '+un()+'</title></circle>'});
  var st=big?Math.ceil(n/10):n;
  p.forEach(function(x,i){if(big?(i%st===0||i===n-1):(i===0||i===n-1))s+='<text x="'+X(i)+'" y="'+(H-6)+'" text-anchor="'+(big?'middle':i===n-1?'end':'start')+'">'+x.l+'</text>'});
  return'<svg viewBox="0 0 '+W+' '+H+'">'+s+'</svg>';
}
function opt(v,t,sel){return'<option value="'+v+'"'+(sel?' selected':'')+'>'+t+'</option>'}
function filters(){
  var ms={},wk={};rows0.forEach(function(r){ms[r.data.slice(0,7)]=1;if(F.m&&r.data.slice(0,7)===F.m)wk[wstart(r.data)]=1});
  var mk=Object.keys(ms).sort().reverse(),wkeys=Object.keys(wk).sort();if(mk.indexOf(F.m)<0)F.m='';if(wkeys.indexOf(F.w)<0)F.w='';
  return'<div class="tcf"><select id="tcm" aria-label="Mês">'+opt('','Todo o período',!F.m)+mk.map(function(k){var q=k.split('-');return opt(k,MES[+q[1]-1]+' de '+q[0],k===F.m)}).join('')+'</select>'+
   '<select id="tcw" aria-label="Semana"'+(F.m?'':' disabled')+'>'+opt('','Mês inteiro',!F.w)+wkeys.map(function(k){return opt(k,'Semana de '+dmy(k)+' a '+dmy(addd(k,4)),k===F.w)}).join('')+'</select></div>';
}
function draw(){
  var el=document.getElementById('tcchart');if(!el)return;M=model();
  el.innerHTML='<div class="tc" data-k="eq" tabindex="0" role="button" aria-label="Ampliar: Curva de capital"><div class="tt">Curva de capital</div>'+filters()+(M.ks.length?line(M.eq,600,240):'<div class="em">Sem dados neste filtro.</div>')+'</div>';
}
function stat(t,v,c){return'<div class="tcb'+(String(v).indexOf('$')>-1?' m':'')+'"><small>'+t+'</small><b class="'+(c||'')+'">'+v+'</b></div>'}
function open(){
  if(!M||!M.ks.length)return;var u=' '+un(),pc=Math.round(M.w/M.n*100);
  var s=stat('Resultado acumulado',sg(M.tot)+u,M.tot>=0?'pos':'neg')+stat('Pico acumulado',sg(M.pk)+u)+stat('Drawdown máximo','-'+nf(M.dd)+u,'neg')+stat('Dias operados',M.ks.length)+stat('Operações',M.n)+
    stat('GAINs',M.w+' ('+pc+'%)','pos')+stat('LOSSs',M.l+' ('+(100-pc)+'%)','neg')+stat('Maior GAIN',M.bw?'+'+nf(M.bw)+u:'—','pos')+stat('Maior LOSS',M.bl?nf(M.bl)+u:'—','neg')+stat('Profit Factor',M.ls?(M.gs/M.ls).toFixed(2):M.gs?'∞':'—');
  if(!dlg){dlg=document.createElement('dialog');dlg.className='tcm';
    dlg.innerHTML='<div class="tcmi"><div class="tcmh"><div class="tt" id="tcmt"></div><button type="button" class="ghost" id="tcmx" aria-label="Fechar">✕</button></div><div id="tcmb"></div><div class="tcs" id="tcms"></div></div>';
    document.body.appendChild(dlg);dlg.onclick=function(e){if(e.target===dlg)dlg.close()};dlg.querySelector('#tcmx').onclick=function(){dlg.close()}}
  dlg.querySelector('#tcmt').textContent='Curva de capital · '+(F.m?MES[+F.m.slice(5)-1]+' de '+F.m.slice(0,4):'todo o período')+(F.w?' · semana de '+dmy(F.w):'');
  dlg.querySelector('#tcmb').innerHTML=line(M.eq,900,400,1);dlg.querySelector('#tcms').innerHTML=s;if(!dlg.open)dlg.showModal();
}
document.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('.tc');if(c&&!e.target.closest('.tcf'))open()});
document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('tc')){e.preventDefault();open()}});
document.addEventListener('change',function(e){var i=e.target.id;if(i==='tcm'){F.m=e.target.value;F.w=''}else if(i==='tcw')F.w=e.target.value;else return;draw()});
// ---- calendários: ampliar (move o próprio bloco para uma janela e devolve ao fechar)
var cdlg=null,home=null,cur=null;
function openCal(a){
  if(!cdlg){cdlg=document.createElement('dialog');cdlg.className='tcm calm';
    cdlg.innerHTML='<div class="calbar"><button type="button" class="ghost" aria-label="Fechar">✕</button></div><div class="calslot"></div>';
    document.body.appendChild(cdlg);cdlg.onclick=function(e){if(e.target===cdlg)cdlg.close()};cdlg.querySelector('button').onclick=function(){cdlg.close()};
    cdlg.addEventListener('close',function(){if(cur){home.parentNode.insertBefore(cur,home);home.remove();cur.classList.remove('max');cur=null}})}
  home=document.createElement('span');home.style.display='none';a.parentNode.insertBefore(home,a);cur=a;a.classList.add('max');
  cdlg.querySelector('.calslot').appendChild(a);cdlg.showModal();
}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('.top3>.cal');if(a&&!e.target.closest('button')&&!e.target.closest('.cd[data-k]'))openCal(a)});
// ---- histórico de sequência (disciplina): semana só é pintada se nenhum dia foi quebrado
function streak(rows){
  var el=document.getElementById('rstreak');if(!el)return;
  var by={};rows.forEach(function(r){var d=by[r.data]||(by[r.data]={ok:0,bad:0});if(r.regra==='risco')d.bad++;else if(r.regra==='ok')d.ok++});
  var ds=Object.keys(by).filter(function(k){return by[k].ok||by[k].bad}).sort();
  if(!ds.length){el.innerHTML='';return}
  var run=0,best=0,i,w,k,j,wk=[];
  ds.forEach(function(k){if(by[k].bad)run=0;else{run++;best=Math.max(best,run)}});
  for(w=wstart(ds[0]);w<=wstart(ds[ds.length-1]);w=addd(w,7)){
    var days=[],bad=0,ok=0;for(j=0;j<5;j++){k=addd(w,j);var d=by[k];days.push(d&&!d.bad&&d.ok);if(d&&d.bad)bad++;else if(d&&d.ok)ok++}
    wk.push({w:w,days:days,st:bad?'bad':ok?'ok':'none'});
  }
  var ws=0;for(i=wk.length-1;i>=0;i--){if(wk[i].st==='bad')break;if(wk[i].st==='ok')ws++}
  el.innerHTML='<div class="stt">Histórico de sequência</div><div class="sk"><div><b>'+run+'</b><small>dias seguidos agora</small></div><div><b>'+best+'</b><small>recorde de dias</small></div><div><b>'+ws+'</b><small>semanas verdes seguidas</small></div></div><div class="sws">'+
    wk.map(function(x){return'<div class="sw sw-'+x.st+'" title="Semana de '+dmy(x.w)+(x.st==='bad'?': teve dia sem seguir as regras':x.st==='ok'?': todas as regras seguidas':': sem registro')+'"><small>'+dmy(x.w)+'</small><div class="sd">'+x.days.map(function(on){return'<i'+(x.st==='ok'&&on?' class="on"':'')+'></i>'}).join('')+'</div></div>'}).join('')+'</div><p class="mu2">Semana verde = nenhum dia quebrou as regras. Se algum dia não foi seguido, a semana inteira fica sem pintar.</p>';
}
window.TopCharts={render:function(rows){rows0=rows;draw();streak(rows)}};
})();
