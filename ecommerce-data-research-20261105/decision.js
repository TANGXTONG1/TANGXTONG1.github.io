(function(root){
  'use strict';
  const plans={Starter:{fee:19,credit:19},Scale:{fee:199,credit:199},Business:{fee:999,credit:999}};
  function calculate(rows,opts={}){
    const qovia=[],apify=[];
    for(const r of rows.filter(r=>r.included)){
      if(!Number.isFinite(r.target)||r.target<0) throw Error('评论目标必须是非负数');
      if(r.provider==='Qovia'){
        if(!(r.yield>0))throw Error('每次请求有效正文数必须大于 0');
        const requests=Math.ceil(r.target/r.yield);
        qovia.push({...r,requests,cost:requests*r.requestPrice});
      }else{
        if(!(r.validPercent>0&&r.validPercent<=100))throw Error('有效正文比例须大于 0 且不超过 100%');
        apify.push({...r,items:Math.ceil(r.target/(r.validPercent/100))});
      }
    }
    const planResults=Object.entries(plans).map(([name,p])=>{
      const costs=apify.map(r=>({...r,cost:r.items*r.prices[name]/1000+(r.target>0?(opts.runs??100)*(r.starts[name]||0):0)+(r.id==='amazon'&&r.target>0?(opts.dateEvents||0)*({Starter:.001,Scale:.0008,Business:.0006}[name]):0)}));
      const usage=costs.reduce((s,r)=>s+r.cost,0)+(apify.length?(opts.otherUsage||0):0);
      return {name,usage,cash:apify.length?p.fee+Math.max(0,usage-p.credit):0,rows:costs};
    });
    const best=[...planResults].sort((a,b)=>a.cash-b.cash)[0];
    const selected=opts.plan&&opts.plan!=='auto'?planResults.find(p=>p.name===opts.plan):best;
    const qUsage=qovia.reduce((s,r)=>s+r.cost,0);
    const qTopup=qUsage>0?Math.max(10,Math.ceil(qUsage*100-1e-8)/100):0;
    // Estimate from the logged-in checkout quotes: $10 -> $10.78, $50 -> $52.62.
    // Stripe fees are grossed up; final checkout remains authoritative.
    const qCash=qUsage>0&&opts.topupFees?Math.ceil((qTopup+.30)/.956*100-1e-8)/100:qUsage;
    return {qovia,qUsage,qTopup,qCash,planResults,best,selected,total:qCash+selected.cash,conditional:apify.some(r=>r.conditional)};
  }
  root.DecisionBudget={calculate,plans};
  if(typeof module!=='undefined')module.exports={calculate,plans};
  if(typeof document==='undefined')return;
  const data=JSON.parse(document.getElementById('decision-data').textContent);
  const $=id=>document.getElementById(id);
  const money=n=>'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const stateRows=()=>data.budgetRows.map(r=>({...r,included:$('use-'+r.id).checked,target:Number($('volume-'+r.id).value),yield:r.provider==='Qovia'?Number($('yield-'+r.id).value):null,validPercent:r.provider==='Apify'?Number($('yield-'+r.id).value):null}));
  function opts(){return {runs:Number($('runs').value),dateEvents:Number($('date-events').value),otherUsage:Number($('other-usage').value),plan:$('plan').value,topupFees:$('topup-fees').checked};}
  function update(){
    try{
      const fx=Number($('fx').value),o=opts();
      if(!(fx>0)||[o.runs,o.dateEvents,o.otherUsage].some(x=>!Number.isFinite(x)||x<0))throw Error('汇率须大于 0；运行次数、事件和其他用量须为非负数');
      const rows=stateRows(),r=calculate(rows,o);
      $('calc-error').hidden=true;
      $('q-total').textContent=money(r.qCash);$('a-total').textContent=money(r.selected.cash);$('total').textContent=money(r.total);
      $('cny-total').textContent='预算换算约 ¥'+(r.total*fx).toLocaleString('zh-CN',{maximumFractionDigits:2})+'；非实时汇率';
      $('q-caption').textContent='Qovia 用量 '+money(r.qUsage)+(o.topupFees?'；一次充值到账 '+money(r.qTopup)+'，含手续费估算，最终以付款页为准':'；未含充值手续费');
      $('a-caption').textContent=r.selected.name+' 月计划；Actor 用量 '+money(r.selected.usage)+'，账户共用内含额度';
      const count=rows.filter(x=>x.included).length;
      const conditionalNames=rows.filter(x=>x.included&&x.conditional).map(x=>x.name).join('、');
      $('coverage-caption').textContent='仅含勾选的 '+count+'/10 个平台'+(r.conditional?'，包含 '+conditionalNames+' 待验收假设':'')+'；其余未计入，不按 $0 计。';
      $('plan-list').innerHTML=r.planResults.map(p=>'<span class="plan-item '+(p.name===r.best.name?'best':'')+'">'+p.name+' '+money(p.cash)+(p.name===r.best.name?' · 当前较低':'')+'</span>').join('');
      for(const row of rows){const cost=[...r.qovia,...r.selected.rows].find(x=>x.id===row.id);$('cost-'+row.id).textContent=cost?money(cost.cost):'未计入';$('count-'+row.id).textContent=cost?(cost.provider==='Qovia'?cost.requests.toLocaleString()+' 次计费请求':cost.items.toLocaleString()+' 个计费结果行'):'—';}
      const notes='月账单 = 月费 + max(0,账户总用量 − 内含额度)。本页只比较月付 Starter / Scale / Business，不代表已开通或购买。';
      $('plan-note').textContent=notes;
    }catch(e){$('calc-error').textContent=e.message+'；当前数值无效，以下结果保留上次有效输入。';$('calc-error').hidden=false;}
  }
  $('calculator').addEventListener('input',update);
  $('calculator').addEventListener('change',update);
  for(const b of document.querySelectorAll('[data-volume]'))b.addEventListener('click',()=>{
    const n=Number(b.dataset.volume);$('target').value=n;
    for(const r of data.budgetRows)$('volume-'+r.id).value=n;
    for(const x of document.querySelectorAll('[data-volume]'))x.setAttribute('aria-pressed',String(x===b));
    update();
  });
  $('target').addEventListener('input',()=>{for(const r of data.budgetRows)$('volume-'+r.id).value=$('target').value;for(const b of document.querySelectorAll('[data-volume]'))b.setAttribute('aria-pressed','false');update();});
  function openHash(){const node=document.getElementById(location.hash.slice(1));if(node&&node.tagName==='DETAILS')node.open=true;}
  addEventListener('hashchange',openHash);openHash();
  for(const a of document.querySelectorAll('a[href^="#detail-"]'))a.addEventListener('click',()=>{const d=document.getElementById(a.hash.slice(1));if(d)d.open=true;});
  $('print-page').addEventListener('click',()=>window.print());
  update();
})(typeof globalThis!=='undefined'?globalThis:this);
