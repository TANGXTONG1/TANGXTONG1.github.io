/* Review API comparison. All data is rendered as escaped text; no calls to vendor APIs. */
(() => {
  'use strict';
  const scriptURL = document.currentScript ? document.currentScript.src : location.href;
  const dataURL = new URL('data/overseas-tests.json', scriptURL);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const text = value => typeof value === 'string' ? value : JSON.stringify(value ?? null, null, 2);
  const short = (value, limit = 180) => { const s = text(value); return s.length > limit ? s.slice(0, limit) + '…' : s; };
  const safeURL = value => {
    try { const u = new URL(String(value)); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; }
    catch { return ''; }
  };
  const link = (url, label) => { const href = safeURL(url); return href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label); };
  const labels = {unauthenticated_probe: '无认证探测', public_demo: '公开演示调用', static_sample: '静态样例', documentation: '文档 / 元数据', authenticated_console_business: '认证控制台业务', authenticated_api_business: '直接认证 API 请求', authenticated_business: '认证业务（触发渠道未注明）', browser_observation: '官网 UI 观察'};
  const authCategories = ['authenticated_console_business', 'authenticated_api_business', 'authenticated_business'];
  const registrationLabels = {registration_pending: '注册待确认', logged_in_existing_account: '已登录已有账户', authenticated_account_available: '已有认证账户', registered_free_tier: '已注册免费账户'};
  const coverageLabels = {documented: '文档支持', partial: '部分 / 精选', restricted: '停用 / 有限制', unknown: '未核', authenticated_sample: '认证正文样本'};
  const isNumber = value => typeof value === 'number' && Number.isFinite(value);
  const dateText = value => value == null ? '未核' : typeof value === 'object' ? value.raw || value.utc || text(value) : String(value);
  let data, records = [], filtered = [];
  const openRows = new Set();

  function sourceLinks(sources) {
    return sources.length ? `<ul class="ot-sources">${sources.map(s => `<li>${link(typeof s === 'string' ? s : s.url, typeof s === 'string' ? s : s.title || s.url)}</li>`).join('')}</ul>` : '<p class="ot-muted">暂无额外来源链接。</p>';
  }

  function evidencePills(record) {
    return record.evidence_types.map(type => `<span class="ot-pill ot-evidence">${esc(labels[type] || type)}</span>`).join('');
  }

  function renderAttempt(a, index) {
    const status = a.http_status == null ? '未记录 HTTP' : `${a.http_status_scope || ''} HTTP ${a.http_status}`.trim();
    const elapsed = a.elapsed_seconds == null ? '耗时未记录' : `${a.elapsed_scope || 'HTTP 耗时'} ${a.elapsed_seconds} 秒`;
    const outcome = authCategories.includes(a.category) ? ` · ${businessLabel(a.summary || {})}` : '';
    return `<details class="ot-attempt"><summary><span>${esc(labels[a.category] || a.category)} · ${esc(a.platform)} · ${esc(status)}${esc(outcome)}</span><span class="ot-muted">${esc(elapsed)}</span></summary>
      <p class="ot-muted">${esc(a.timestamp || '时间未记录')} · ${esc(a.source_file)} · #${esc(index + 1)}</p>
      <p><code>${esc(a.method)} ${esc(a.endpoint)}</code></p>
      <p class="ot-note">以下为原始记录的脱敏摘要；可选短摘录单独展示，未公开完整响应、完整评论正文或评论者身份。</p>
      <pre>${esc(JSON.stringify({original_kind: a.original_kind, input_summary: a.input_summary, response_bytes: a.response_bytes, result_summary: a.summary}, null, 2))}</pre>
      ${sourceLinks(a.sources || [])}</details>`;
  }

  function businessLabel(summary) {
    if (summary.run_status === 'SUCCEEDED_WITH_FILTER_CAVEAT') return '已取得正文，但日期筛选失效';
    const known = {review_sample_received: '已取得认证正文样本', review_sample_with_errors: '取得部分正文，另有错误', parameter_validation_error: '参数校验错误，未采得正文', business_error_no_reviews: '业务错误，未采得正文', outcome_unconfirmed: '结果未确认', no_nonempty_review_text: '未取得非空正文'};
    if (known[summary.business_result]) return known[summary.business_result];
    if (summary.review_body_sample_verified === true) return '已取得认证正文样本';
    if (summary.business_error_message || summary.business_error || summary.business_error_code) return '业务错误，正文未验证';
    return summary.nonempty_text == null ? '结果未确认' : '未取得非空正文';
  }

  function authSummary(r) {
    return r.attempts.filter(a => authCategories.includes(a.category)).map(a => {
      const s = a.summary || {};
      const consoleRun = a.category === 'authenticated_console_business';
      const pieces = [consoleRun ? '认证控制台启动' : s.direct_api_trigger_verified === true ? '直接认证 API 请求已验证' : '直接 API 触发未验证'];
      if (s.nonempty_text != null) pieces.push(`非空正文 ${s.nonempty_text} 条`); else pieces.push('正文数量未核');
      if (s.returned_items != null) pieces.push(`响应记录 ${s.returned_items} 条`);
      if (s.unique_review_ids != null) pieces.push(`唯一评论 ID ${s.unique_review_ids} 条`);
      const trigger = s.trigger_http_status ?? a.trigger_http_status ?? (!consoleRun ? a.http_status : null);
      const exported = s.export_http_status ?? a.export_http_status;
      if (trigger != null) pieces.push(`触发/同步 HTTP ${trigger}`);
      if (exported != null) pieces.push(`${s.dataset_api_export_verified === true ? 'API 导出传输已验证' : '导出/下载'} HTTP ${exported}`);
      if (consoleRun) {
        const seconds = s.elapsed_seconds_console ?? a.elapsed_seconds;
        pieces.push(isNumber(seconds) ? `控制台运行 ${seconds} 秒` : '控制台运行耗时未核');
      } else {
        const seconds = s.elapsed_seconds_http ?? s.elapsed_seconds ?? a.elapsed_seconds;
        pieces.push(isNumber(seconds) ? `${trigger === 202 ? '触发' : '触发/同步'} HTTP 耗时 ${seconds} 秒` : '触发 HTTP 耗时未核');
        if (isNumber(s.collection_duration_ms)) pieces.push(`服务端采集 ${Number((s.collection_duration_ms / 1000).toFixed(3))} 秒`);
        else if (trigger === 202) pieces.push('异步采集总耗时未核');
      }
      const charge = s.charged_usd_console ?? s.charged_usd;
      pieces.push(isNumber(charge) ? `美元费用 $${charge}` : '美元费用未核');
      if (isNumber(s.credits_used_console)) pieces.push(`观察到扣减 ${s.credits_used_console} credits`);
      else if (s.max_credits != null || s.free_credits_before != null) pieces.push('实际 credits 扣减未核');
      const reason = s.business_error_message || s.business_error || s.error_code || s.business_error_code;
      return `<p><strong>${esc(a.platform)} · ${esc(businessLabel(s))}</strong><br><small>${esc(pieces.join(' · '))}</small>${reason ? `<br><small>错误原因：${esc(short(reason, 140))}</small>` : ''}${s.source_quality_note ? `<br><small><strong>数据限制：</strong>${esc(s.source_quality_note)}</small>` : ''}${s.permission_note ? `<br><small>权限：${esc(s.permission_note)}</small>` : ''}${s.free_plan_message ? `<br><small>${esc(s.free_plan_message)}</small>` : ''}</p>`;
    }).join('');
  }

  function accountDetails(r) {
    const observations = Array.isArray(r.account_observations) ? r.account_observations : [];
    if (!observations.length) return '';
    const keys = [['plan', '方案'], ['free_credits_total', '快照免费总额度（credits）'], ['free_credits_remaining', '快照剩余额度（credits）'], ['free_credits_used', '快照已用额度（credits）'], ['free_allowance_usd', '免费美元额度'], ['paid_topup_usd', '观察到的充值（USD）'], ['cash_balance_usd', '现金余额（USD）']];
    return `<h4 class="ot-subheading">账户与免费额度 · 公开观察摘要</h4><p class="ot-note">额度是观察时点的账户快照，不能代表本次实际扣减，也不能直接换算为美元费用。账户可用不等于评论采集成功。</p><div class="ot-endpoints">${observations.map(o => `<article class="ot-endpoint"><h4>${esc(o.provider || o.vendor || r.name)} · ${esc(registrationLabels[o.registration_status] || o.account_status || '账户观察')}</h4><p class="ot-muted">观察时间：${esc(o.observed_at || '未记录')}</p><dl class="ot-definition">${keys.filter(([key]) => Object.prototype.hasOwnProperty.call(o, key)).map(([key, label]) => `<dt>${esc(label)}</dt><dd>${esc(o[key] == null ? '未核' : o[key])}</dd>`).join('')}<dt>支付方式</dt><dd>${o.payment_method_added === false ? '未添加' : o.payment_method_added === true ? '已添加' : '未核'}</dd><dt>自动充值</dt><dd>${o.auto_recharge_enabled === false ? '未开启' : o.auto_recharge_enabled === true ? '已开启' : '未核'}</dd></dl>${o.notes ? `<p>${esc(text(o.notes))}</p>` : ''}${o.trial_limitations ? `<p>${esc(text(o.trial_limitations))}</p>` : ''}<details><summary>完整公开账户摘要</summary><pre>${esc(JSON.stringify(o, null, 2))}</pre></details></article>`).join('')}</div>`;
  }

  function authenticatedEvidence(r) {
    const attempts = r.attempts.filter(a => authCategories.includes(a.category));
    if (!attempts.length) return '';
    return `<h4 class="ot-subheading">认证结果的公开字段与短摘录</h4><p class="ot-note">字段名描述本次实际响应；错误响应字段不代表评论 schema。短摘录最多 8 个英文词，未公开完整正文或评论者身份。</p><div class="ot-endpoints">${attempts.map(a => {
      const s = a.summary || {};
      const sample = s.review_body_sample_verified === true && s.sample && typeof s.sample === 'object' ? s.sample : null;
      const words = sample && typeof sample.body_excerpt === 'string' ? sample.body_excerpt.trim().split(/\s+/).filter(Boolean) : [];
      const excerpt = short(words.slice(0, 8).join(' '), 220) + (words.length > 8 ? '…' : '');
      const fields = Array.isArray(s.fields) ? s.fields.filter(field => typeof field === 'string') : [];
      const scope = s.fields_scope || (s.review_body_sample_verified === true ? '实际响应字段；已核正文样本' : '实际响应字段；尚未验证评论正文');
      return `<article class="ot-endpoint"><h4>${esc(a.platform)} · ${esc(businessLabel(s))}</h4><p class="ot-note">${esc(a.timestamp || '时间未记录')} · ${esc(scope)}</p>${fields.length ? `<div class="field-list">${fields.map(field => `<code>${esc(field)}</code>`).join('')}</div>` : '<p class="ot-muted">暂无公开字段记录。</p>'}${sample && words.length ? `<div class="ot-demo-samples"><figure><figcaption>本次认证样本短摘录 · 评分 ${esc(sample.rating ?? '未核')} · ${esc(dateText(sample.date))} · 验证购买：${sample.verified_purchase === true ? '是' : sample.verified_purchase === false ? '否' : '未核'}</figcaption><blockquote>${esc(excerpt)}</blockquote></figure></div>` : '<p class="ot-note">未公开该次结果的正文摘录。</p>'}${s.notes || s.note ? `<p class="ot-note">${esc(text(s.notes || s.note))}</p>` : ''}</article>`;
    }).join('')}</div>`;
  }

  function renderEndpoint(e, index) {
    return `<article class="ot-endpoint"><h4>${esc(e.platform)} <span class="ot-muted">/ ${esc(index + 1)}</span></h4>
      <p class="ot-path"><code>${esc(e.endpoint)}</code></p>
      <dl class="ot-definition"><dt>认证</dt><dd>${esc(e.authentication)}</dd><dt>参数</dt><dd>${esc(e.parameters)}</dd><dt>字段证据</dt><dd>${esc(e.fields)}</dd><dt>分页 / 历史</dt><dd>${esc(e.pagination)}</dd><dt>费用单位</dt><dd>${esc(e.pricing)}</dd></dl>
      <details><summary>请求模板（仅占位符，不会执行）</summary><pre>${esc(JSON.stringify(e.request_template, null, 2))}</pre></details>
      ${sourceLinks(e.sources || [])}</article>`;
  }

  function rowDetails(r) {
    return `<div class="ot-detail-panel"><div class="ot-detail-heading"><div><span class="ot-eyebrow">接入与证据</span><h3>${esc(r.name)}</h3></div><span class="ot-status">${esc(r.test_status_label)}</span></div>
      <p>${esc(r.summary)}</p>${authSummary(r)}<p class="ot-next"><strong>下一步：</strong>${esc(r.next_gate)}</p>${accountDetails(r)}${authenticatedEvidence(r)}
      <div class="ot-detail-grid"><div><h4>逐平台覆盖</h4><dl class="ot-coverage-details">${r.coverage.map(c => `<dt>${esc(c.platform)} <span class="ot-pill ot-c-${esc(c.status)}">${esc(coverageLabels[c.status] || c.status)}</span></dt><dd>${esc(c.detail)}</dd>`).join('')}</dl></div>
      <div><h4>计费与限制</h4><p>${esc(r.pricing)}</p><p>${esc(r.limits)}</p><p>${esc(r.selection_note || '')}</p><p class="ot-note">“按请求 / 按页面 / 按交付记录 / 按评论”的单位不能互换；详情里的字段与额度来自文档，实测字段请看尝试记录。</p>
      ${r.specialist_details ? `<details><summary>专项核验摘要</summary><pre>${esc(JSON.stringify(r.specialist_details, null, 2))}</pre></details>` : ''}</div></div>
      <h4 class="ot-subheading">端点、认证、参数与字段</h4><div class="ot-endpoints">${r.endpoints.length ? r.endpoints.map(renderEndpoint).join('') : '<p class="ot-muted">当前未核到可直接复现的专用评论端点，需供应商提供接口与样本。</p>'}</div>
      <h4 class="ot-subheading">实际尝试 / 读取记录 <span class="ot-muted">${esc(r.attempts.length)} 条</span></h4>${r.attempts.length ? r.attempts.map(renderAttempt).join('') : '<p class="ot-muted">本轮暂无可公开的尝试记录；不能据此判断接口成败。</p>'}
      ${r.public_demo_samples ? `<h4 class="ot-subheading">官方 demo 短摘录 · 非生产认证采集</h4><p class="ot-note">demo=true；数据新鲜度未核。${esc(r.public_demo_samples.notes)}</p><div class="ot-demo-samples">${r.public_demo_samples.samples.map(s => `<figure><figcaption>评分 ${esc(s.rating)} · ${esc(dateText(s.date))} · 验证购买：${s.verified_purchase === true ? '是' : s.verified_purchase === false ? '否' : '未核'}</figcaption><blockquote>${esc(s.body_excerpt)}</blockquote></figure>`).join('')}</div>` : ''}
      <h4 class="ot-subheading">官网 UI 观察</h4>${r.browser_observations.length ? r.browser_observations.map(o => `<div class="ot-browser">${o.historical_observation ? '<p class="ot-note">历史观察：后续认证实测已更新当前账户状态。</p>' : ''}<p>${esc(o.observed || o.summary || o.conclusion || o.status || '详见记录')}</p><pre>${esc(JSON.stringify(o, null, 2))}</pre></div>`).join('') : '<p class="ot-muted">暂无浏览器观察记录。</p>'}
      ${(r.documentary_observations || []).length ? `<h4 class="ot-subheading">文档 / 静态样例观察（不计业务调用）</h4>${r.documentary_observations.map(o => `<div class="ot-browser"><p>${esc(o.observed || o.status)}</p><p class="ot-note">${esc(o.status)}</p>${sourceLinks([o.source].filter(Boolean))}</div>`).join('')}` : ''}
      <h4 class="ot-subheading">官方来源</h4>${sourceLinks(r.sources)}
      <button type="button" class="ot-small-button" data-toggle="${esc(r.id)}">收起 ${esc(r.name)}</button></div>`;
  }

  function renderRow(r, index) {
    const expanded = openRows.has(r.id);
    const detailID = `ot-detail-${r.id.replace(/[^a-z0-9-]/gi, '')}`;
    const documented = r.coverage.filter(c => c.status !== 'unknown');
    const attempts = r.attempts.reduce((all, a) => { all[a.category] = (all[a.category] || 0) + 1; return all; }, {});
    const gate = registrationLabels[r.registration_status] ? `<span class="ot-pill ${r.registration_status === 'registration_pending' ? 'ot-registration' : 'ot-c-documented'}">${esc(registrationLabels[r.registration_status])}</span>` : '';
    return `<tr class="ot-main-row"><th scope="row"><span class="ot-row-number">${esc(String(index + 1).padStart(2, '0'))}</span><strong>${esc(r.name)}</strong><small>${esc(r.supplier)}</small><div class="ot-links">${link(r.official_url, '官网 ↗')}${link(r.trial_url, '试用 / 咨询 ↗')}</div></th>
      <td><div class="ot-coverage-pills">${documented.length ? documented.map(c => `<span class="ot-pill ot-c-${esc(c.status)}" title="${esc(c.detail)}">${esc(c.platform)} · ${esc(coverageLabels[c.status] || c.status)}</span>`).join('') : '<span class="ot-muted">逐站原文评论覆盖待核</span>'}</div><p>${esc(short(r.summary, 150))}</p><small class="ot-muted">未列平台：展开查看未核项</small></td>
      <td>${r.endpoints.slice(0, 2).map(e => `<div class="ot-cell-endpoint"><strong>${esc(e.platform)}</strong><code>${esc(short(e.endpoint, 120))}</code><small>${esc(short(e.authentication, 100))}</small></div>`).join('') || '<span class="ot-muted">专用端点待确认</span>'}${r.endpoints.length > 2 ? `<small class="ot-muted">另有 ${esc(r.endpoints.length - 2)} 项，展开查看</small>` : ''}</td>
      <td>${r.endpoints.slice(0, 1).map(e => `<p><strong>字段：</strong>${esc(short(e.fields, 150))}</p><p><strong>分页：</strong>${esc(short(e.pagination, 160))}</p>`).join('') || esc(short(r.limits, 250))}</td>
      <td>${esc(short(r.pricing, 260))}</td><td><span class="ot-status">${esc(r.test_status_label)}</span>${gate}${authSummary(r)}${r.specialist_status ? `<p><strong>${esc(r.specialist_status)}</strong></p>` : ''}<div class="ot-evidence-list">${Object.entries(attempts).map(([k, n]) => `<span>${esc(labels[k] || k)}：${esc(n)} 次</span>`).join('') || '<span>暂无 HTTP 尝试</span>'}</div>${r.browser_observations.length ? `<small>官网 UI：${esc(r.browser_observations.length)} 条观察</small>` : ''}<p class="ot-muted">${esc(short(r.next_gate, 120))}</p></td>
      <td><button class="ot-expand" type="button" data-toggle="${esc(r.id)}" aria-expanded="${expanded}" aria-controls="${esc(detailID)}" aria-label="${expanded ? '收起' : '展开'} ${esc(r.name)} 详情">${expanded ? '收起 −' : '展开 +'}</button></td></tr>
      <tr class="ot-detail-row" id="${esc(detailID)}" ${expanded ? '' : 'hidden'}><td colspan="7">${expanded ? rowDetails(r) : ''}</td></tr>`;
  }

  function filterRecords(root) {
    const q = root.querySelector('[name="ot-search"]').value.trim().toLowerCase();
    const supplier = root.querySelector('[name="ot-supplier"]').value;
    const platform = root.querySelector('[name="ot-platform"]').value;
    const status = root.querySelector('[name="ot-status"]').value;
    filtered = records.filter(r => (!q || JSON.stringify(r).toLowerCase().includes(q)) && (!supplier || r.supplier === supplier) &&
      (!platform || r.coverage.some(c => c.platform === platform && c.status !== 'unknown')) &&
      (!status || r.test_status === status || r.registration_status === status || r.evidence_types.includes(status)));
    root.querySelector('.ot-count').textContent = `显示 ${filtered.length} / ${records.length} 个产品线`;
    root.querySelector('.ot-table-body').innerHTML = filtered.length ? filtered.map(renderRow).join('') : '<tr><td colspan="7" class="ot-empty">没有匹配项。可清除筛选后重新选择。</td></tr>';
    root.querySelector('.ot-export').disabled = !filtered.length;
  }

  function render(root) {
    const counts = data.evidence_counts;
    const pending = data.source_files.filter(f => !f.present).map(f => f.name);
    const sampleCount = data.authenticated_sample_test_count || 0;
    const authCount = authCategories.reduce((sum, category) => sum + (counts[category] || 0), 0);
    const boundary = sampleCount ? `已获得 ${sampleCount} 次认证正文样本。` : authCount ? '已进行认证尝试，正文样本待验证。' : '尚未获得认证正文样本。';
    root.classList.add('ot-root');
    root.innerHTML = `<div class="ot-header"><div><span class="ot-eyebrow">海外电商 · 原始评论接口</span><h2>16 个产品线，一张实测清单</h2><p>${esc(data.scope)}</p></div><button class="ot-export" type="button">导出当前筛选 JSON ↓</button></div>
      <div class="ot-metrics" aria-label="证据分组"><div><strong>${esc(records.length)}</strong><span>供应商 / 产品线</span></div><div><strong>${esc(counts.unauthenticated_probe || 0)}</strong><span>无认证 HTTP 探测</span></div><div><strong>${esc(counts.public_demo || 0)}</strong><span>公开演示 HTTP 尝试</span></div><div><strong>${esc(counts.authenticated_console_business || 0)}</strong><span>认证控制台业务尝试</span></div><div><strong>${esc(counts.authenticated_api_business || 0)}</strong><span>直接认证 API 请求</span></div></div>
      <p class="ot-note">已验证 API 导出：${esc(data.dataset_api_export_verified_count || 0)} 次 · 官网 UI 观察：${esc(data.browser_observation_count || 0)} 条${counts.authenticated_business ? ` · 认证业务（触发渠道未注明）：${esc(counts.authenticated_business)} 次` : ''}</p>
      <div class="ot-boundary"><strong>${esc(boundary)}</strong> 控制台启动、直接 API 触发和 API 导出分别核验；公开演示与无认证探测不混算，不计算跨供应商成功率。小样本、HTTP 200 或注册页可达都不等于完整历史已验证。
      <details><summary>阅读口径与更新状态</summary><ul>${data.interpretive_rules.map(rule => `<li>${esc(rule)}</li>`).join('')}</ul><p>生成时间：${esc(data.generated_at)}${pending.length ? `；尚待合并：${esc(pending.join('、'))}` : '；全部汇总源已合并'}</p><p>静态样例与文档元数据只作为字段证据，不与业务调用合并统计；注册入口的条款确认与账户创建状态以官网 UI 观察为准。</p></details></div>
      <form class="ot-filters" role="search"><label class="ot-search-label">搜索供应商、端点或字段<input name="ot-search" type="search" placeholder="例如：review_text、Shopee、分页" autocomplete="off"></label><label>供应商<select name="ot-supplier"><option value="">全部供应商</option>${[...new Set(records.map(r => r.supplier))].map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select></label>
      <label>有覆盖证据的平台<select name="ot-platform"><option value="">全部平台</option>${data.marketplaces.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join('')}</select></label><label>测试状态 / 证据<select name="ot-status"><option value="">全部状态</option><option value="pending_authenticated">待认证实测</option><option value="authenticated_sample_received">已获认证正文样本</option><option value="authenticated_attempted">已认证尝试，正文待核</option><option value="registration_pending">注册待确认</option><option value="logged_in_existing_account">已登录已有账户</option><option value="registered_free_tier">已注册免费账户</option>${Object.entries(labels).map(([k,v]) => `<option value="${esc(k)}">${esc(v)}</option>`).join('')}</select></label><button type="reset" class="ot-reset">清除筛选</button></form>
      <div class="ot-table-meta"><span class="ot-count" aria-live="polite"></span><span>文档覆盖与认证样本分别标注；样本不等于完整历史 · 宽表可左右滚动</span></div>
      <div class="ot-table-wrap" tabindex="0" role="region" aria-label="供应商实测比较表，可左右滚动"><table class="ot-table"><caption class="ot-sr-only">16 个电商评论 API 产品线的文档覆盖、端点、费用与实测记录</caption><colgroup><col class="ot-col-vendor"><col class="ot-col-coverage"><col class="ot-col-endpoint"><col class="ot-col-fields"><col class="ot-col-cost"><col class="ot-col-test"><col class="ot-col-action"></colgroup><thead><tr><th scope="col">供应商 / 入口</th><th scope="col">逐平台覆盖与结论</th><th scope="col">Endpoint / 认证</th><th scope="col">字段 / 分页</th><th scope="col">费用 / 试用单位</th><th scope="col">实际尝试 / 当前门槛</th><th scope="col">详情</th></tr></thead><tbody class="ot-table-body"></tbody></table></div>`;
    root.querySelector('form').addEventListener('submit', e => e.preventDefault());
    root.querySelector('form').addEventListener('input', () => filterRecords(root));
    root.querySelector('form').addEventListener('change', () => filterRecords(root));
    root.querySelector('form').addEventListener('reset', () => { setTimeout(() => filterRecords(root), 0); });
    root.addEventListener('click', e => {
      const button = e.target.closest('[data-toggle]');
      if (!button || !root.contains(button)) return;
      const id = button.dataset.toggle;
      if (openRows.has(id)) openRows.delete(id); else openRows.add(id);
      filterRecords(root);
      const rowButton = [...root.querySelectorAll('.ot-expand')].find(b => b.dataset.toggle === id);
      if (rowButton) rowButton.focus({preventScroll: true});
    });
    root.querySelector('.ot-export').addEventListener('click', () => {
      const output = {...data, record_count: filtered.length, records: filtered, export_scope: '当前筛选；evidence_counts 为完整清单统计'};
      const blob = new Blob([JSON.stringify(output, null, 2) + '\n'], {type: 'application/json;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'overseas-review-api-tests.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    filterRecords(root);
  }

  async function start() {
    const root = document.getElementById('overseas-tests');
    if (!root) return;
    root.innerHTML = '<p class="ot-loading" role="status">正在加载海外评论 API 实测清单…</p>';
    try {
      const response = await fetch(dataURL, {cache: 'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
      if (data.schema_version !== 1 || !Array.isArray(data.records)) throw new Error('数据 schema 不兼容');
      records = data.records; render(root);
    } catch (error) {
      root.innerHTML = `<p class="ot-error" role="alert">实测清单暂未加载：${esc(error.message)}。请运行数据生成脚本，并通过本地 HTTP 预览页面。</p>`;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true}); else start();
})();
