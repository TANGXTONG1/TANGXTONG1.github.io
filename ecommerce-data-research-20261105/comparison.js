'use strict';
(() => {
  let comparison;
  const money = n => n == null ? '未核报价' : '$' + Number(n).toLocaleString('en-US',{maximumFractionDigits:3});
  const value = v => typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
  const priceCell = p => `<td><strong class="comparison-price">${text(p.price_label || money(p.price_usd_per_1000))}</strong><p class="sample-meta">${text(p.status)} · ${text(p.unit)}</p><p>${text(p.depth)}</p>${p.source?external(p.source,'官方来源'):''}</td>`;
  const caseLabel = r => ({taobao:'淘宝 / 天猫',jd:'京东',douyin:'抖音',xiaohongshu:'小红书'}[r.platform]||r.platform) + ' · ' + ({reviews:'商品评价',comments:r.platform==='taobao'||r.platform==='jd'?'商品评价':'内容评论',goods_comments:'商品评价 V1',comments_v2:'商品评价 V2'}[r.action]||r.action);
  function renderTrials(live) {
    $('#comparison-live-rows').innerHTML = live.cases.map(c=>{
      const runs=live.runs.filter(r=>c.run_ids.includes(r.evidence_id));
      const seconds=c.latency_seconds;
      const latency=seconds.length ? `${Math.min(...seconds).toFixed(1)}–${Math.max(...seconds).toFixed(1)}秒` : '未记录';
      const charge=c.vendor==='Qovia' ? `消耗${c.trial_calls_consumed}次试用；现金$0` : `试用金 $${Number(c.charge_usd).toFixed(6)}`;
      const textCount=c.field_counts.text?.nonempty ?? c.field_counts.content?.nonempty ?? 0;
      const fields=c.fields.map(f=>`${f}（非空${c.field_counts[f].nonempty}/${c.rows_returned}）`).join('、');
      const sample=runs.find(r=>r.samples.length);
      const details=sample ? `<details><summary>字段与样本</summary><p>${text(fields)}</p><p class="sample-meta">非空数量按返回行计，包含重复行；空字符串/数组/对象不计非空。字段存在不等于内容齐全。</p><pre>${text(JSON.stringify(sample.samples,null,2))}</pre></details>` : `<p>${text(runs.map(r=>r.error?.message||r.error?.title||r.billing_reason||'空结果').filter((v,i,a)=>a.indexOf(v)===i).join('；'))}</p>`;
      return `<tr><th scope="row">${text(c.vendor)}<p>${text(caseLabel(c))}</p></th><td><strong>${c.rows_returned} / ${c.unique_comment_ids} 条</strong><p>正文非空 ${textCount}/${c.rows_returned} 条（含重复）</p><p>${c.nonempty_requests}/${c.requests}次非空；跨次重复${c.duplicate_ids_across_requests}条</p><p class="sample-meta">HTTP：${text(c.http_statuses.map(s=>s??'UI未取状态码').join(' / '))}</p>${c.default_text_count?`<p>含${c.default_text_count}条默认评价</p>`:''}</td><td>${text(charge)}<p>${text(latency)}</p>${c.oldest_date_in_sample?`<p class="sample-meta">样本最早：${text(c.oldest_date_in_sample)}<br>仅抽样日期，非历史边界</p>`:''}</td><td>${details}</td></tr>`;
    }).join('');
  }
  function renderPrices() {
    const kind = $('#comparison-kind').value;
    const rows = comparison.coverage_rows.filter(r => !kind || (kind === '商品' ? /商品|买家|购后|本地生活|门店/.test(r.data_type) : /互动|笔记|视频|社媒|文章|帖子|回答|讨论/.test(r.data_type)));
    $('#comparison-price-rows').innerHTML = rows.map(r=>`<tr><th scope="row">${text(r.platform_label)}<p class="sample-meta">${text(r.data_type)}</p></th>${priceCell(r.everyinfra)}${priceCell(r.qovia)}</tr>`).join('');
  }
  function renderPlatforms() {
    const provider = $('#comparison-provider').value, query = $('#comparison-platform-search').value.trim().toLowerCase();
    const rows = comparison.all_platform_rows.filter(r => (!provider || r.vendor === provider) && (!query || `${r.platform} ${r.name}`.toLowerCase().includes(query)));
    $('#comparison-platform-count').textContent = `显示 ${rows.length} / ${comparison.all_platform_rows.length} 组供应商平台目录。能力数量与状态为供应商声明，未做逐端点验收。`;
    $('#comparison-platform-rows').innerHTML = rows.map(r=>`<tr><th scope="row">${text(r.vendor)}<p>${text(r.name || r.platform)}</p><span class="sample-meta">${text(r.platform)}</span></th><td>${text(r.catalog_count)}<p class="sample-meta">标可用 ${text(r.live_count)}</p></td><td>${r.min_usd_per_unit == null ? '未核报价' : money(r.min_usd_per_unit * 1000) + (r.max_usd_per_unit !== r.min_usd_per_unit ? ' – ' + money(r.max_usd_per_unit * 1000) : '')}</td><td>${text(r.unit_warning)}<p>${r.source?external(r.source,'价格目录'):''}</p></td></tr>`).join('');
  }
  fetch('data/trial-comparison.json').then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();}).then(data=>{
    comparison=data;
    $('#comparison-trial-status').textContent=`EveryInfra：${comparison.trial_status.everyinfra} Qovia：${comparison.trial_status.qovia}`;
    $('#comparison-conclusion').textContent=comparison.conclusion;
    $('#comparison-limit-rows').innerHTML=comparison.constraints_rows.map(r=>`<tr><th scope="row">${text(r.dimension)}<div class="api-source-links">${(r.sources||[]).map((s,i)=>external(typeof s==='string'?s:s.url,`来源 ${i+1}`)).join(' · ')}</div></th><td>${text(value(r.everyinfra))}</td><td>${text(value(r.qovia))}</td></tr>`).join('');
    renderPrices();renderPlatforms();
    $('#comparison-kind').addEventListener('change',renderPrices);
    $('#comparison-provider').addEventListener('change',renderPlatforms);
    $('#comparison-platform-search').addEventListener('input',renderPlatforms);
  }).catch(error=>{$('#comparison-conclusion').textContent=`对比资料载入失败：${error.message}，请刷新。`;});
  fetch('data/live-trials.json').then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();}).then(renderTrials).catch(error=>{$('#comparison-live-rows').innerHTML=`<tr><td colspan="4">实测记录载入失败：${text(error.message)}</td></tr>`;});
})();
