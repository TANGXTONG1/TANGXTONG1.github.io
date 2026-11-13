'use strict';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = value => escapeHTML(String(value ?? '').replace(/\*\*/g, ''));
const safeURL = value => {
  try { const u = new URL(value, location.href); return /^(https?:)$/.test(u.protocol) ? escapeHTML(u.href) : '#'; }
  catch { return '#'; }
};
const external = (url, label) => `<a href="${safeURL(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label || url)}</a>`;
const list = values => `<ul>${(values || []).map(v => `<li>${text(v)}</li>`).join('')}</ul>`;
const statusMap = {
  login_required:['login','需登录'], registration_required:['login','需注册'], sales_required:['sales','需商务开通'],
  merchant_setup_required:['sales','需商家配置'], credentials_required:['sales','需接口凭证'], mobile_required:['sales','需移动端'],
  ui_verification_incomplete:['incomplete','浏览器核验未完成'], public_preview:['preview','公开网页预览'],
  public_preview_export_blocked:['preview','可预览，导出受阻'], not_tested:['document','尚未完成浏览器测试']
};
let catalog = [], samples = {}, documents = [], credibility = {records:[],shortlist_ids:[]}, reviews = new Map(), unifiedAPI = {records:[],primary_ids:[]}, apiReviews = new Map(), reviewAPI = {records:[],trial_ids:[]}, reviewAPIs = new Map(), lastFocused = null;
const reviewChannelLabels={taobao_tmall:'淘宝 / 天猫',jd:'京东',pdd:'拼多多',meituan:'美团',douyin:'抖音商品评价'};
function renderReviewAPIDetail() {
  const r=reviewAPIs.get($('#review-api-candidate').value);if(!r)return;
  const endpointBlocks=(r.endpoints||[]).map(e=>`<details><summary>${text(e.platform||e.name||'接口')} · ${text(e.method||'')} ${text(e.endpoint||e.path||'查看文档字段')}</summary><p>${text(e.status||'文档记录，未实调')}</p>${e.request_fields?`<h4>请求参数</h4>${list(Array.isArray(e.request_fields)?e.request_fields:Object.entries(e.request_fields).map(([k,v])=>`${k}: ${v}`))}`:''}${e.response_fields?`<h4>文档返回字段</h4><div class="field-list">${e.response_fields.map(f=>`<code>${text(f)}</code>`).join('')}</div>`:''}${e.pagination?`<h4>分页与数量</h4><pre>${escapeHTML(JSON.stringify(e.pagination,null,2))}</pre>`:''}${e.limits?`<p>${text(e.limits)}</p>`:''}${e.source?external(e.source,'官方接口文档'):(e.source_urls||[]).map((u,i)=>external(u,`来源 ${i+1}`)).join(' · ')}</details>`).join('');
  $('#review-api-detail').innerHTML=`<article class="api-detail-card"><span class="card-focus">${text(r.group)}</span><h3>${text(r.name)}</h3><p><strong>${text(r.verdict)}</strong></p><p>${text(r.summary)}</p><div class="api-matrices"><div><h4>逐条评论的渠道覆盖</h4><div class="api-table-wrap"><table class="api-table"><thead><tr><th>渠道</th><th>实际证据边界</th></tr></thead><tbody>${Object.entries(r.coverage).map(([k,v])=>`<tr><th scope="row">${text(reviewChannelLabels[k]||k)}</th><td>${text(v)}</td></tr>`).join('')}</tbody></table></div></div><div><h4>接入与可取深度</h4><dl class="review-facts"><dt>交付</dt><dd>${text(r.delivery)}</dd><dt>评论字段</dt><dd>${text(r.fields_summary)}</dd><dt>分页 / 历史深度</dt><dd>${text(r.depth)}</dd><dt>维护证据</dt><dd>${text(r.maintenance_summary)}</dd><dt>信誉</dt><dd>${text(r.credibility_summary)}</dd></dl></div></div>${endpointBlocks}<h4>核验来源</h4><ul class="evidence-list">${(r.sources||[]).map(s=>`<li>${external(s.url,s.title)}</li>`).join('')}</ul><p class="sample-meta">以下为试用前的文档核验存档；最新鉴权实测见“两家试用与报价”。</p><details><summary>完整结构化复核记录</summary><pre>${escapeHTML(JSON.stringify(r.detail||r,null,2))}</pre></details></article>`;
}
function renderReviewAPI() {
  $('#review-api-conclusion').textContent=reviewAPI.conclusion;
  $('#review-api-trials').innerHTML=reviewAPI.trial_ids.map(id=>{const r=reviewAPIs.get(id);return `<article class="shortlist-card"><span class="card-focus">试用前文档存档 · 最新实测见对比页</span><h3>${text(r.name)}</h3><p>${text(r.summary)}</p><dl><dt>原文字段</dt><dd>${text(r.fields_summary)}</dd><dt>可取深度</dt><dd>${text(r.depth)}</dd><dt>采购缺口</dt><dd>${text(r.credibility_summary)}</dd></dl><button class="open-detail" data-review-api="${text(id)}">查看端点、字段与限制 →</button></article>`;}).join('');
  $('#review-api-candidate').innerHTML=reviewAPI.records.map(r=>`<option value="${text(r.id)}">${text(r.name)} · ${text(r.group)}</option>`).join('');
  renderReviewAPIDetail();
}
const apiLabels={taobao:'淘宝 / 天猫',jd:'京东',pdd:'拼多多',meituan:'美团',douyin:'抖音',sales:'销量',price:'商品与价格',reviews:'评价原文',marketing:'营销',owned:'自营后台',competitor:'竞品'};
function coverageTable(coverage,title) {
  return `<div><h4>${text(title)}</h4><div class="api-table-wrap"><table class="api-table"><thead><tr><th>项目</th><th>依据与边界</th></tr></thead><tbody>${Object.entries(coverage).map(([key,value])=>`<tr><th scope="row">${text(apiLabels[key]||key)}</th><td><span class="status document">${text(value.status)}</span><p>${text(value.detail)}</p><div class="api-source-links">${(value.urls||[]).map((u,i)=>external(u,`来源 ${i+1}`)).join(' · ')}</div></td></tr>`).join('')}</tbody></table></div></div>`;
}
function renderAPIDetail() {
  const r=apiReviews.get($('#api-candidate').value); if(!r)return;
  $('#api-detail').innerHTML=`<article class="api-detail-card"><span class="card-focus">${text(r.selection_group)}</span><h3>${text(r.name)}</h3><p><strong>${text(r.verdict)}</strong></p><p>${text(r.delivery_model)}</p><div class="api-matrices">${coverageTable(r.platform_coverage,'渠道覆盖')}${coverageTable(r.data_categories,'数据类别')}</div><h4>接入证据</h4><ul class="evidence-list">${r.unified_api_evidence.map(e=>`<li>${external(e.url,e.claim)}</li>`).join('')}</ul><h4>仍需解决</h4>${list(r.gaps)}<h4>要求供应商提供的验收材料</h4>${list(r.next_verification)}${r.json_api_fields?`<details><summary>查看已核 JSON 传输字段</summary><p>${text(r.json_api_fields.scope)}</p><pre>${escapeHTML(JSON.stringify({request:r.json_api_fields.request,response:r.json_api_fields.response},null,2))}</pre>${external(r.json_api_fields.source_url,'字段来源')}</details>`:''}<button class="open-detail" data-platform="${escapeHTML(r.id)}">查看原始字段字典、客户案例与信誉证据 →</button></article>`;
}
function renderUnifiedAPI() {
  $('#api-conclusion').textContent='本页记录销量、价格、营销等较广范围的企业交付线索；此前三家主评估已撤下，不能视为评论 API 推荐。';
  $('#api-primary').innerHTML='';
  const ordered=[...unifiedAPI.primary_ids,...unifiedAPI.records.filter(r=>!unifiedAPI.primary_ids.includes(r.id)).map(r=>r.id)];
  $('#api-candidate').innerHTML=ordered.map(id=>`<option value="${escapeHTML(id)}">${text(apiReviews.get(id).name)} · ${text(apiReviews.get(id).selection_group)}</option>`).join('');
  $('#api-requirements').innerHTML=`<ul>${unifiedAPI.requirements.map(r=>`<li><strong>${text(r.name)}</strong>：${text(r.detail)}</li>`).join('')}</ul><p>以下是建议验收字段，不是厂商已实现的 API 定义。</p><div class="api-field-grid">${unifiedAPI.acceptance_fields.map(f=>`<div><h4>${text(f.category)}</h4><div class="field-list">${f.fields.map(v=>`<code>${escapeHTML(v)}</code>`).join('')}</div><p>${text(f.meaning)}</p></div>`).join('')}</div>`;
  $('#api-changes').innerHTML=`<ul>${unifiedAPI.changes.map(c=>`<li><strong>${text(c.name)}</strong>：${text(c.now)}</li>`).join('')}</ul>`;
  const s=unifiedAPI.catalog_sample;
  $('#api-catalog-sample').innerHTML=`<h3>新增实际取样：${text(s.title)}</h3><p>${text(s.description)}</p><div class="sample-links">${external(s.source,'目录来源')}<a href="${safeURL(s.raw_url)}" download>下载原始目录 JSON</a><a href="${safeURL(s.verification_url)}" download>下载验证记录</a><a href="${safeURL(s.explanation_url)}" download>下载字段差异说明</a></div>`;
  renderAPIDetail();
}
const sourceLabels = {vendor_named_case:'供应商具名案例',partner_publication:'合作方发布',issuer_filing_citation:'上市披露中的引用',vendor_anonymous_case:'供应商匿名案例',partner_technical_documentation:'合作方技术资料',vendor_product_documentation:'供应商产品文档',government_procurement:'政府采购公告',government_hosted_report_citation:'政府网站托管报告引用'};
const verdictTag = review => review ? `<span class="verdict verdict-${review.verdict === '精选' ? 'primary' : review.verdict === '补证' ? 'pending' : 'other'}">${text(review.verdict === '精选' ? '历史信誉 · 精选' : review.verdict === '补证' ? '待补证' : review.verdict)}</span>` : '';
function evidenceHTML(review, compact=false) {
  return `<ul class="evidence-list">${(review.credibility_evidence || []).slice(0,compact?2:undefined).map(e => `<li><span class="evidence-type">${text(sourceLabels[e.source_type] || e.source_type)}</span> ${external(e.url,e.claim)}${compact ? '' : `<p>${text(e.scope)}${e.date ? ` · ${text(e.date)}` : ''}</p>`}</li>`).join('')}</ul>`;
}
function renderShortlist() {
  $('#review-summary').innerHTML = Object.entries(credibility.counts).sort((a,b)=>['精选','备选','补证','外围用途'].indexOf(a[0])-['精选','备选','补证','外围用途'].indexOf(b[0])).map(([key,value])=>`<span><b>${value}</b> ${text(key === '补证' ? '待补证' : key)}</span>`).join('');
  $('#criteria-content').innerHTML = list(credibility.criteria);
  $('#shortlist-cards').innerHTML = credibility.shortlist_ids.map(id => {
    const r=reviews.get(id); return `<article class="shortlist-card"><span class="card-focus">${text(r.focus)}</span><h3><button class="platform-button" data-platform="${escapeHTML(id)}">${text(r.name)}</button></h3><p class="card-fit">${text(r.fit)}</p><h4>为什么保留</h4>${evidenceHTML(r,true)}<dl><dt>接入路线</dt><dd>${text(r.delivery)}</dd><dt>仍待确认</dt><dd>${text(r.next_check)}</dd></dl><button class="open-detail" data-platform="${escapeHTML(id)}">查看案例、字段与全部证据 →</button></article>`;
  }).join('');
}
function getStatus(row) { return statusMap[row.ui_test_status] || ['document','仅文档核验']; }
function statusTag(row) { const [group,label] = getStatus(row); return `<span class="status ${group}">${label}</span>`; }
function renderRows() {
  const query = $('#search').value.trim().toLowerCase(), channel = $('#channel').value, category = $('#category').value, status = $('#status').value, verdict = $('#verdict').value;
  const patterns = {'淘宝/天猫':/淘宝|天猫|淘系|阿里/, '京东':/京东|\bJD\b/i, '拼多多':/拼多多|\bPDD\b/i, '美团':/美团/, '抖音':/抖音|抖店|抖快|千川/, '快手':/快手|抖快/, '小红书':/小红书|红薯/, '1688':/1688/};
  const rows = catalog.filter(row => {
    const review = reviews.get(row.id);
    if (verdict && review?.verdict !== verdict) return false;
    if (category && row.evidence_group !== category) return false;
    if (channel && !patterns[channel].test(row.channels.join(' '))) return false;
    if (status && !(status === 'preview' ? getStatus(row)[0] === 'preview' || row.public_http_sample : getStatus(row)[0] === status)) return false;
    return !query || [row.name, ...row.channels, row.access, ...row.response_fields, ...row.limitations, ...row.endpoint_examples, row.ui_test_summary, review?.reason, ...(review?.customer_cases || []).map(c=>c.customer)].join(' ').toLowerCase().includes(query);
  });
  $('#count').textContent = `显示 ${rows.length} / ${catalog.length} 组平台`;
  $('#empty').hidden = rows.length > 0;
  $('#rows').innerHTML = rows.map(row => `<tr>
    <td><button class="platform-button" data-platform="${escapeHTML(row.id)}">${text(row.name)}</button><div class="platform-group">${text(row.evidence_group)}</div>${verdictTag(reviews.get(row.id))}<p class="review-reason">${text(reviews.get(row.id)?.reason)}</p><button class="open-detail" data-platform="${escapeHTML(row.id)}">信誉、字段与来源</button></td>
    <td>${text(row.summary.channels)}</td><td>${text(row.summary.access)}</td><td>${text(row.summary.fields)}</td>
    <td>${statusTag(row)}<p class="row-text">${text(row.summary.ui || row.ui_test_summary)}</p>${row.public_http_sample ? '<p class="row-text"><a href="#samples">另取得公开 HTTP 样本</a></p>' : ''}</td>
  </tr>`).join('');
}
function openDetail(id) {
  const row = catalog.find(x => x.id === id); if (!row) return;
  lastFocused = document.activeElement;
  const observed = row.ui_record;
  const review = reviews.get(id);
  const apiReview = apiReviews.get(id);
  const rawReview = reviewAPIs.get(id);
  $('#detail-body').innerHTML = `<h2 id="detail-title">${text(row.name)}</h2><p class="sample-meta">${text(row.evidence_group)} · 核验于 ${text(row.checked_on)}</p>${statusTag(row)}
    ${rawReview?`<div class="quality"><strong>当前评论 API 结论：${text(rawReview.group)}</strong><p>${text(rawReview.verdict)}</p><p>${text(rawReview.depth)}</p><a href="#review-api" data-close>查看评论 API 复核</a></div>`:'<p class="sample-meta">未进入本轮评论 API 技术试验名单；以下为历史档案。</p>'}
    ${apiReview ? `<details><summary>前轮企业 API 研究记录</summary><p>${text(apiReview.verdict)}</p><p>${text(apiReview.delivery_model)}</p><a href="#integration" data-close>查看历史覆盖矩阵</a></details>` : ''}
    ${review ? `<section class="credibility-detail"><h3>本轮筛选判断</h3>${verdictTag(review)}<p>${text(review.reason)}</p><h4>信誉与影响力依据</h4>${evidenceHTML(review)}<h4>具名客户案例</h4>${review.customer_cases.length ? `<ul class="evidence-list">${review.customer_cases.map(c=>`<li><strong>${text(c.customer)}</strong> · <span class="evidence-type">${c.customer_side?'客户 / 采购方证据':'供应商发布，未独立确认'}</span><p>${text(c.description)} ${external(c.url,'查看来源')}</p></li>`).join('')}</ul>` : '<p>本轮未取得可归属到具体项目的具名案例；数据引用、合作方材料见上，不能自动当作付费客户。</p>'}<h4>接入证据</h4><ul>${review.integration_evidence.map(e=>`<li>${external(e.url,e.claim)}</li>`).join('')}</ul><h4>筛选仍保留的限制</h4>${list(review.limitations)}</section>` : ''}
    <div class="detail-observation"><strong>本次实际操作</strong>${observed ? `<p>${text(observed.action)}</p><p>${text(observed.result)}</p><p class="sample-meta">${text(observed.execution_limit)}</p>` : '<p>尚未完成浏览器测试。以下覆盖和字段以公开文档为依据。</p>'}${row.public_http_sample ? '<p>另通过公开 HTTP 获取 3 件活动商品；<a href="#samples" data-close>查看样本与质量问题</a>。</p>' : ''}</div>
    <h3>覆盖渠道</h3>${list(row.channels)}<h3>接入与导出方式</h3><p>${text(row.access)}</p>
    <h3>接口或工具名称</h3><div class="detail-fields">${(row.endpoint_examples || []).map(escapeHTML).join('\n\n') || '未公开核实'}</div>
    <h3>请求字段</h3><div class="detail-fields">${(row.request_fields || []).map(escapeHTML).join('\n\n') || '未公开核实'}</div>
    <h3>返回字段 / 导出列 / 产品指标</h3><p class="sample-meta">具体证据类型见每项说明；产品指标不自动等同于可调用的 API 字段。</p><div class="detail-fields">${(row.response_fields || []).map(escapeHTML).join('\n\n') || '未公开核实'}</div>
    <h3>限制与未确认事项</h3>${list(row.limitations)}
    <h3>证据来源</h3><ul class="source-list">${row.sources.map(url => `<li>${external(url)}</li>`).join('')}</ul>
    ${row.documentation_markdown ? `<details><summary>查看该平台完整调研记录</summary><pre>${escapeHTML(row.documentation_markdown)}</pre></details>` : ''}
    ${row.detailed_documentation_markdown ? `<details><summary>展开自营接口详细字段字典</summary><pre>${escapeHTML(row.detailed_documentation_markdown)}</pre></details>` : ''}`;
  $('#detail').showModal();
  $('#detail').scrollTop = 0;
  $('#close-detail').focus();
}
function closeDetail() { $('#detail').close(); lastFocused?.focus(); }
function renderSamples() {
  $('#sample-content').innerHTML = (samples.samples || []).map(s => {
    const real = s.kind === 'real_http';
    const recordTable = real ? `<div class="sample-table-wrap"><table class="sample-table"><thead><tr><th>商品 ID</th><th>商品 / 店铺</th><th>itemprice</th><th>itemendprice</th><th>itemsale</th><th>todaysale</th><th>couponmoney</th></tr></thead><tbody>${s.records.map(r => `<tr><td>${text(r.itemid)}</td><td>${text(r.itemtitle)}<br><span class="sample-meta">${text(r.shopname)}</span></td><td>${text(r.itemprice)}</td><td>${text(r.itemendprice)}</td><td>${text(r.itemsale)}</td><td>${text(r.todaysale)}</td><td>${text(r.couponmoney)}</td></tr>`).join('')}</tbody></table></div><p class="sample-meta">按原始字段和值展示。销量字段未以交易流水核验；价格取决于优惠条件。展开下方可查看全部 41 个字段。</p>` : renderObservationTable(s);
    return `<article class="sample" id="sample-${escapeHTML(s.id)}"><div class="sample-top"><div><span class="status ${real?'preview':'document'}">${text(s.label)}</span><h3>${text(s.name)}</h3></div>${external(s.source.url,'来源页面')}</div>
      <p>${text(s.observation || '实际读取官网公开活动数据源，未使用账号、API Key 或 Cookie。完整原始响应已保留。')}</p>
      <p class="sample-meta">${real ? `取得时间：${text(new Date(s.source.retrieved_at).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}))}（北京时间） · HTTP ${text(s.source.http_status)}` : `观察日期：${text(s.source.observed_on)}${s.data_period ? ` · 页面数据期：${text(s.data_period)}` : ''}`}</p>
      ${recordTable}
      ${(s.quality_issues || []).length ? `<div class="quality"><strong>实际发现的质量问题</strong><ul>${s.quality_issues.map(q => `<li>${text(q.message)}</li>`).join('')}</ul></div>` : ''}
      <h4>使用边界</h4>${list(s.limitations)}
      ${(s.fields || []).length ? `<details><summary>查看 ${s.field_count || s.fields.length} 个${real ? '返回字段' : '观察字段'}</summary><div class="field-list">${s.fields.map(f => `<code>${escapeHTML(f)}</code>`).join('')}</div></details>` : ''}
      ${(s.records || []).length ? `<details><summary>${real ? '查看原始商品对象' : '查看整理后的观察记录'}</summary><p class="sample-meta">${text(s.records_are || '从页面可见文字整理，不是供应商导出。')}</p><pre>${escapeHTML(JSON.stringify(s.records,null,2))}</pre></details>` : ''}
      <div class="sample-links">${Object.entries(s.download_urls || {}).map(([key,url]) => `<a href="${safeURL(url)}" download>${text(({raw_http_response:'下载原始 JSON',verification_record:'下载验证记录',sample_explanation:'下载样本说明',ui_observation_transcript:'下载 UI 观察转录',sample_download_guide:'下载样本说明'})[key] || '下载观察记录')}</a>`).join('')}</div>
    </article>`;
  }).join('') + `<p class="footnote">文档中的示例数字仅用于说明格式，未混入以上实际商品记录。已核到的接口字段和完整供应商文档见平台总表与资料库。</p>`;
}
function renderObservationTable(s) {
  if ((s.records || []).length) {
    const keys = [...new Set(s.records.flatMap(r => Object.keys(r)))];
    return `<div class="sample-table-wrap"><table class="sample-table"><thead><tr>${keys.map(k=>`<th>${text(k)}</th>`).join('')}</tr></thead><tbody>${s.records.map(r=>`<tr>${keys.map(k=>`<td>${text(typeof r[k] === 'object' && r[k] !== null ? JSON.stringify(r[k]) : r[k] ?? '未记录')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  return `<div class="field-list">${(s.field_observations || []).map(o => `<code>${text(o.field)}${o.display_state === 'masked' ? '（遮蔽）' : o.display_state === 'range' ? '（区间）' : ''}</code>`).join('')}</div>`;
}
function renderDocuments() {
  $('#documents').innerHTML = [...documents].sort((a,b)=>(['海外电商实测','海外电商API','双平台试用对比','评论API复核'].indexOf(a.group)+1||99)-(['海外电商实测','海外电商API','双平台试用对比','评论API复核'].indexOf(b.group)+1||99)).map(d => `<article class="document-row"><div><h3>${text(d.title)}</h3><p>${text(d.group)} · ${text(d.format.toUpperCase())} · ${text(Math.ceil(d.bytes/1024))} KB</p></div><div class="document-actions">${d.read_url ? `<a href="${safeURL(d.read_url)}" target="_blank" rel="noopener">在线阅读</a>` : ''}<a href="${safeURL(d.download_url)}" download>下载原文件</a></div></article>`).join('');
}
function route() {
  const view = location.hash.slice(1).split('?')[0] || 'comparison';
  const active = ['overseas-tests','overseas','comparison','review-api','integration','shortlist','catalog','samples','library'].includes(view) ? view : 'comparison';
  document.querySelectorAll('.view').forEach(el => el.hidden = el.id !== active);
  document.querySelectorAll('[data-view]').forEach(el => el.dataset.view === active ? el.setAttribute('aria-current','page') : el.removeAttribute('aria-current'));
  if ($('#detail').open) closeDetail();
}
$('#filters').addEventListener('submit', e => e.preventDefault());
$('#filters').addEventListener('input',renderRows);
$('#filters').addEventListener('change',renderRows);
$('#filters').addEventListener('reset', () => setTimeout(renderRows,0));
$('#rows').addEventListener('click', e => { const target = e.target.closest('[data-platform]'); if(target) openDetail(target.dataset.platform); });
$('#shortlist-cards').addEventListener('click', e => { const target = e.target.closest('[data-platform]'); if(target) openDetail(target.dataset.platform); });
$('#api-detail').addEventListener('click', e => {const target=e.target.closest('[data-platform]');if(target)openDetail(target.dataset.platform);});
$('#api-primary').addEventListener('click',e=>{const target=e.target.closest('[data-api]');if(target){$('#api-candidate').value=target.dataset.api;renderAPIDetail();$('#api-candidate').scrollIntoView({block:'start'});$('#api-candidate').focus({preventScroll:true});}});
$('#api-candidate').addEventListener('change',renderAPIDetail);
$('#review-api-candidate').addEventListener('change',renderReviewAPIDetail);
$('#review-api-trials').addEventListener('click',e=>{const target=e.target.closest('[data-review-api]');if(target){$('#review-api-candidate').value=target.dataset.reviewApi;renderReviewAPIDetail();$('#review-api-candidate').scrollIntoView({block:'start'});$('#review-api-candidate').focus({preventScroll:true});}});
$('#close-detail').addEventListener('click',closeDetail);
$('#detail').addEventListener('click',e=>{if(e.target===$('#detail'))closeDetail();});
$('#detail').addEventListener('cancel',()=>lastFocused?.focus());
window.addEventListener('hashchange',route);
route();
Promise.all(['catalog','samples','documents','credibility','unified-api','review-api'].map(name => fetch(`data/${name}.json`).then(r => {if(!r.ok)throw new Error(`${name}: HTTP ${r.status}`);return r.json();})))
  .then(([c,s,d,v,a,r]) => {
    catalog=c; samples=s; documents=d; credibility=v; reviews=new Map(v.records.map(r=>[r.id,r])); unifiedAPI=a;apiReviews=new Map(a.records.map(r=>[r.id,r]));
    reviewAPI=r;reviewAPIs=new Map(r.records.map(x=>[x.id,x]));
    for(const group of [...new Set(catalog.map(r=>r.evidence_group))]) { const option=document.createElement('option');option.value=group;option.textContent=group;$('#category').append(option); }
    renderRows();renderSamples();renderDocuments();renderShortlist();renderUnifiedAPI();renderReviewAPI();
  }).catch(error => {$('#error').hidden=false;$('#error').textContent=`资料载入失败，请刷新页面重试。${error.message}`;$('#count').textContent='资料尚未载入';});
