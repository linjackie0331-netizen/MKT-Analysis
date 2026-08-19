/* =========================================================================
 * Business Decision Lab — App Controller / Renderer
 * 純前端 vanilla JS，無框架、無建置流程，方便直接以靜態網站部署。
 * ========================================================================= */

const App = (() => {
  const root = () => document.getElementById('appRoot');

  // ---------------------------------------------------------------- utils
  const fmt = (n) => Math.round(n || 0).toLocaleString('zh-Hant-TW');
  const fmtMoney = (n) => 'NT$' + fmt(n);
  const fmtPct = (n, d = 1) => (isFinite(n) ? (n * 100).toFixed(d) : '0.0') + '%';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fieldGroups = ['定價與銷量', '通路經濟', '成本結構', 'A&P投資', '通路投資', '固定投資', '行銷效率（ROAS／ROMI）'];

  // ---------------------------------------------------------------- router
  function parseHash() {
    const h = (location.hash || '#dashboard').slice(1);
    const [route, param] = h.split('/');
    return { route: route || 'dashboard', param };
  }
  function navigate(route, param) {
    location.hash = param ? `${route}/${param}` : route;
  }
  function onHashChange() { render(); }

  function render() {
    const { route, param } = parseHash();
    document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.route === route));
    updateSaveIndicator();
    if (route === 'dashboard') return renderDashboard();
    if (route === 'library') return renderLibrary();
    if (route === 'workspace') return renderWorkspaceEntry(param);
    if (route === 'progress') return renderProgress();
    if (route === 'portfolio') return renderPortfolio();
    if (route === 'data') return renderDataPanel();
    root().innerHTML = '<div class="card">找不到頁面。</div>';
  }

  function updateSaveIndicator() {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    const last = DataStore.get().lastSaved;
    el.textContent = last ? `已儲存於本機 · ${new Date(last).toLocaleString('zh-Hant-TW')}` : '尚未儲存任何紀錄';
  }

  // ============================================================ DASHBOARD
  function monthKey(d) { const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`; }
  function average(arr) { const a = arr.filter((x) => typeof x === 'number' && isFinite(x)); return a.length ? a.reduce((s, x) => s + x, 0) / a.length : null; }

  function dashboardStats() {
    const sessions = DataStore.get().sessions;
    const now = new Date();
    const thisMK = monthKey(now);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMK = monthKey(prevDate);
    const thisMonthSessions = sessions.filter((s) => monthKey(s.date) === thisMK);
    const prevMonthSessions = sessions.filter((s) => monthKey(s.date) === prevMK);
    const thisAvg = average(thisMonthSessions.map((s) => s.finalScore?.total));
    const prevAvg = average(prevMonthSessions.map((s) => s.finalScore?.total));
    const overallAvg = average(sessions.map((s) => s.finalScore?.total));
    const lastSession = sessions[sessions.length - 1] || null;
    const mistakeCounts = {};
    sessions.forEach((s) => (s.mistakeTags || []).forEach((t) => (mistakeCounts[t] = (mistakeCounts[t] || 0) + 1)));
    const topMistakes = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const attempted = new Set(sessions.map((s) => s.caseId));
    const nextCase = CASES.find((c) => !c.comingSoon && !attempted.has(c.id));
    return { completedThisMonth: thisMonthSessions.length, overallAvg, thisAvg, prevAvg, lastSession, topMistakes, nextCase, totalSessions: sessions.length };
  }

  function renderDashboard() {
    const st = dashboardStats();
    const delta = (st.thisAvg != null && st.prevAvg != null) ? st.thisAvg - st.prevAvg : null;
    root().innerHTML = `
      <h1 class="page-title">Dashboard</h1>
      <p class="page-desc">跨產業行銷P&amp;L決策分析 — 你的商業判斷訓練總覽</p>
      <div class="kpi-row">
        <div class="kpi-tile"><div class="v">${st.completedThisMonth}</div><div class="l">本月完成案例次數</div></div>
        <div class="kpi-tile alt"><div class="v">${st.overallAvg != null ? st.overallAvg.toFixed(1) : '—'}</div><div class="l">歷史平均分數（Final Score）</div></div>
        <div class="kpi-tile ${delta == null ? 'alt' : delta >= 0 ? 'pos' : 'neg'}"><div class="v">${delta == null ? '—' : (delta >= 0 ? '+' : '') + delta.toFixed(1)}</div><div class="l">本月 vs 上月 分數變化</div></div>
        <div class="kpi-tile alt"><div class="v">${st.totalSessions}</div><div class="l">累計練習Session數</div></div>
      </div>

      <div class="grid grid-2" style="margin-top:16px;">
        <div class="card">
          <h3>最近一次練習</h3>
          ${st.lastSession ? `
            <p><b>${esc(getCaseById(st.lastSession.caseId)?.title || st.lastSession.caseId)}</b><br/>
            <span class="muted small">${new Date(st.lastSession.date).toLocaleString('zh-Hant-TW')} · Final Score ${st.lastSession.finalScore?.total ?? '—'}</span></p>
            <button class="btn secondary small" onclick="App.navigate('progress')">查看完整紀錄</button>
          ` : `<p class="muted">尚未完成任何練習。從下方建議案例開始你的第一次練習。</p>`}
        </div>
        <div class="card">
          <h3>建議下一個Case</h3>
          ${st.nextCase ? `
            <p><b>${esc(st.nextCase.title)}</b><br/><span class="muted small">${esc(getIndustry(st.nextCase.industry)?.labelZh || '')} · ${esc(st.nextCase.mainSkill)}</span></p>
            <button class="btn small" onclick="App.navigate('workspace','${st.nextCase.id}')">開始練習</button>
          ` : `<p class="muted">目前公開的完整案例已全部練習過，請留意後續新增的產業案例。</p>`}
        </div>
      </div>

      <div class="card">
        <h3>最常犯的三個錯誤</h3>
        ${st.topMistakes.length ? `
          <ol>${st.topMistakes.map(([tag, count]) => `<li>${esc(MISTAKE_TAG_LABELS[tag] || tag)} <span class="muted small">（出現 ${count} 次）</span></li>`).join('')}</ol>
        ` : `<p class="muted">尚無足夠資料，完成Review Mode評分後會自動累積統計。</p>`}
      </div>

      <div class="card">
        <h3>六大產業分類</h3>
        <div class="grid grid-4">
          ${INDUSTRIES.map((ind) => {
            const cs = getCasesByIndustry(ind.id);
            const full = cs.filter((c) => !c.comingSoon).length;
            return `<div class="case-card">
              <div class="industry">${esc(ind.label)}</div>
              <div class="title" style="font-size:13px;">${esc(ind.labelZh)}</div>
              <div class="skills">${cs.length} 個案例（${full} 個已開放）</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ============================================================ LIBRARY
  let libraryFilters = { industry: 'all', difficulty: 'all', status: 'all', origin: 'all' };

  function renderLibrary() {
    const industries = ['all', ...INDUSTRIES.map((i) => i.id)];
    const difficulties = ['all', ...Array.from(new Set(CASES.map((c) => c.difficulty)))];
    let list = CASES.filter((c) => {
      if (libraryFilters.industry !== 'all' && c.industry !== libraryFilters.industry) return false;
      if (libraryFilters.difficulty !== 'all' && c.difficulty !== libraryFilters.difficulty) return false;
      if (libraryFilters.status !== 'all' && (c.status || 'Private') !== libraryFilters.status) return false;
      if (libraryFilters.origin !== 'all' && c.origin !== libraryFilters.origin) return false;
      return true;
    });
    const sessions = DataStore.get().sessions;

    root().innerHTML = `
      <h1 class="page-title">Case Library</h1>
      <p class="page-desc">跨六大產業的Business Case練習庫</p>
      <div class="filter-bar">
        <select onchange="App.setLibraryFilter('industry', this.value)">
          ${industries.map((i) => `<option value="${i}" ${libraryFilters.industry === i ? 'selected' : ''}>${i === 'all' ? '全部產業' : esc(getIndustry(i)?.labelZh)}</option>`).join('')}
        </select>
        <select onchange="App.setLibraryFilter('difficulty', this.value)">
          ${difficulties.map((d) => `<option value="${d}" ${libraryFilters.difficulty === d ? 'selected' : ''}>${d === 'all' ? '全部難度' : esc(d)}</option>`).join('')}
        </select>
        <select onchange="App.setLibraryFilter('status', this.value)">
          <option value="all" ${libraryFilters.status === 'all' ? 'selected' : ''}>Public／Private 全部</option>
          <option value="Public" ${libraryFilters.status === 'Public' ? 'selected' : ''}>Public</option>
          <option value="Private" ${libraryFilters.status === 'Private' ? 'selected' : ''}>Private</option>
        </select>
        <select onchange="App.setLibraryFilter('origin', this.value)">
          <option value="all" ${libraryFilters.origin === 'all' ? 'selected' : ''}>HBP-inspired／Original 全部</option>
          <option value="Original" ${libraryFilters.origin === 'Original' ? 'selected' : ''}>Original</option>
          <option value="HBP-inspired" ${libraryFilters.origin === 'HBP-inspired' ? 'selected' : ''}>HBP-inspired</option>
        </select>
      </div>
      <div class="grid grid-4">
        ${list.map((c) => {
          const done = sessions.some((s) => s.caseId === c.id);
          if (c.comingSoon) {
            return `<div class="case-card" style="opacity:0.6;">
              <div class="industry">${esc(getIndustry(c.industry)?.label)}</div>
              <div class="title">${esc(c.title)}</div>
              <div class="skills">${esc(c.mainSkill)}</div>
              <div class="badges"><span class="badge locked">尚未開放</span></div>
            </div>`;
          }
          return `<div class="case-card" style="cursor:pointer;" onclick="App.navigate('workspace','${c.id}')">
            <div class="industry">${esc(getIndustry(c.industry)?.label)}</div>
            <div class="title">${esc(c.title)}</div>
            <div class="skills">${esc(c.mainSkill)}</div>
            <div class="badges">
              <span class="badge">${esc(c.difficulty)}</span>
              <span class="badge">${esc(c.status)}</span>
              <span class="badge">${esc(c.origin)}</span>
              ${done ? '<span class="badge" style="color:#1f6f43;border-color:#1f6f43;">已練習過</span>' : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  }
  function setLibraryFilter(k, v) { libraryFilters[k] = v; renderLibrary(); }

  // ============================================================ WORKSPACE
  let WS = null;

  function defaultWorkspace(c) {
    const inputs = {};
    c.financialInputs.fields.forEach((f) => (inputs[f.key] = f.default));
    return {
      caseId: c.id, scenarioKey: 'base', inputs,
      coachMode: 'case',
      initialDecisionText: '', initialScoreEstimate: '',
      initialSnapshot: null,
      challengeAnswers: {},
      decisionAnswers: {},
      corrections: '',
      finalDecision: '',
      rubric: {}, mistakeTags: [],
      confidenceBefore: 5, confidenceAfter: 5,
      skillsDemonstrated: '', skillsToImprove: '', blindSpot: '', transferableLesson: '',
    };
  }
  function persistWS() { DataStore.saveDraft(WS.caseId, WS); updateSaveIndicator(); }

  function renderWorkspaceEntry(caseId) {
    const c = getCaseById(caseId);
    if (!c) { root().innerHTML = '<div class="card">找不到這個案例。</div>'; return; }
    if (c.comingSoon) {
      root().innerHTML = `
        <button class="btn secondary small" onclick="App.navigate('library')">← 返回Case Library</button>
        <div class="card locked-panel" style="margin-top:14px;">
          <h3 style="border:none;">${esc(c.title)}</h3>
          <p class="muted">Industry：${esc(getIndustry(c.industry)?.labelZh)} ／ Main skill：${esc(c.mainSkill)}</p>
          <p>此產業案例目前僅建立Case Identity骨架，尚未完成完整B–F區塊與財務引擎欄位。<br/>
          下一輪迭代將依照與「高階掃拖機器人台灣上市決策」相同的標準（Business Background、Management Decision、Financial Inputs、Missing Information、Decision Questions、三種情境）逐一補完。</p>
        </div>`;
      return;
    }
    const draft = DataStore.getDraft(caseId);
    WS = draft && draft.caseId === caseId ? draft : defaultWorkspace(c);
    renderWorkspaceFull();
  }

  function renderWorkspaceFull() {
    const c = getCaseById(WS.caseId);
    root().innerHTML = `
      <button class="btn secondary small" onclick="App.navigate('library')">← 返回Case Library</button>
      <div class="flex-between" style="margin-top:10px;">
        <div>
          <h1 class="page-title" style="margin-bottom:2px;">${esc(c.title)}</h1>
          <p class="page-desc" style="margin-bottom:0;">${esc(getIndustry(c.industry)?.labelZh)} · ${esc(c.mainSkill)} · ${esc(c.difficulty)} · ${esc(c.version)}</p>
        </div>
      </div>
      <div class="disclosure">${esc(c.originNote || '')}</div>

      <div class="grid grid-3">
        <div id="wsLeft"></div>
        <div id="wsCenter"></div>
        <div id="wsRight"></div>
      </div>
    `;
    renderWorkspaceLeft(c);
    renderWorkspaceCenter(c);
    renderWorkspaceRight(c);
  }

  function renderWorkspaceLeft(c) {
    const b = c.background;
    document.getElementById('wsLeft').innerHTML = `
      <div class="card">
        <h3>Case Brief</h3>
        <h4>Company Profile</h4><p class="small">${esc(b.companyProfile)}</p>
        <h4>Product / Service</h4><p class="small">${esc(b.productService)}</p>
        <h4>Market Situation</h4><p class="small">${esc(b.marketSituation)}</p>
        <h4>Customer</h4><p class="small">${esc(b.customer)}</p>
        <h4>Competitors</h4><p class="small">${esc(b.competitors)}</p>
        <h4>Channel Structure</h4><p class="small">${esc(b.channelStructure)}</p>
        <h4>Strategic Challenge</h4><p class="small">${esc(b.strategicChallenge)}</p>
      </div>
      <div class="card">
        <h3>Management Decision</h3>
        <p class="small"><b>${esc(c.managementDecision)}</b></p>
        <ul class="small">${c.decisionSubQuestions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <h3>Missing Information</h3>
        ${c.missingInformation.map((m) => `
          <div style="margin-bottom:8px;">
            <div class="small"><b>${esc(m.item)}</b></div>
            <div class="small muted">${esc(m.why)}</div>
            <div class="small confidence-badge ${m.confidence}">建議Confidence：${m.confidence}</div>
          </div>`).join('')}
      </div>
      <div class="card">
        <h3>Sources</h3>
        ${c.sources.map((s) => `
          <div class="source-box">
            <div><span class="tag ${s.tag}">${s.tag === 'public' ? 'Publicly sourced' : s.tag === 'case' ? 'Case-provided' : s.tag === 'user' ? 'User input' : 'Claude assumption'}</span></div>
            <div style="margin-top:4px;">${esc(s.title)}${s.publisher ? ' — ' + esc(s.publisher) : ''}</div>
            ${s.url ? `<div><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a></div>` : ''}
            <div class="muted">${s.pubDate ? 'Published: ' + esc(s.pubDate) + ' · ' : ''}Accessed: ${esc(s.accessDate)}</div>
            <div style="margin-top:2px;">${esc(s.dataPoint)}</div>
          </div>`).join('')}
      </div>
    `;
  }

  function tagLabel(t) { return { case: 'Case-provided', assumption: 'Claude assumption', user: 'User input', public: 'Publicly sourced' }[t] || t; }

  function renderWorkspaceCenter(c) {
    const pnl = Engine.computePnL(WS.inputs);
    document.getElementById('wsCenter').innerHTML = `
      <div class="card">
        <h3>Scenario</h3>
        <div class="scenario-pills">
          ${['conservative', 'base', 'aggressive'].map((k) => {
            const sc = c.scenarios[k];
            return `<button class="scenario-pill ${WS.scenarioKey === k ? 'active' : ''}" onclick="App.applyScenario('${k}')">${esc(sc.labelZh)}</button>`;
          }).join('')}
          <button class="scenario-pill ${WS.scenarioKey === 'custom' ? 'active' : ''}" disabled>自訂 Custom</button>
        </div>
        <p class="small muted">${esc(c.scenarios[WS.scenarioKey]?.desc || '你已手動調整輸入值，目前為自訂情境。')}</p>
      </div>

      <div class="card">
        <div class="flex-between"><h3 style="border:none;margin:0;">Financial Inputs</h3>
          <button class="btn secondary small" onclick="App.toggleGlossary()">公式小抄 ?</button>
        </div>
        <div id="glossaryBox" style="display:none;"></div>
        ${fieldGroups.map((g) => {
          const fields = c.financialInputs.fields.filter((f) => f.group === g);
          if (!fields.length) return '';
          return `<h4>${esc(g)}</h4>${fields.map((f) => `
            <div class="field">
              <label>${esc(f.label)} <span class="tag ${f.tag}">${tagLabel(f.tag)}</span></label>
              <input type="number" step="any" value="${esc(WS.inputs[f.key])}" oninput="App.onInputChange('${f.key}', this.value)" />
              <div class="note">單位：${esc(f.unit)}　${esc(f.note)}</div>
            </div>`).join('')}`;
        }).join('')}
      </div>

      <div id="pnlOutput"></div>

      <div class="card">
        <h3>Decision Questions</h3>
        ${c.decisionQuestions.map((q, i) => `
          <div class="field">
            <label>${i + 1}. ${esc(q)}</label>
            <textarea onchange="App.onDecisionAnswerChange(${i}, this.value)">${esc(WS.decisionAnswers[i] || '')}</textarea>
          </div>`).join('')}
      </div>
    `;
    renderGlossary();
    renderPnlOutputs(pnl, c);
  }

  function renderGlossary() {
    const box = document.getElementById('glossaryBox');
    if (!box) return;
    box.innerHTML = Engine.FORMULA_GLOSSARY.map((g) => `
      <details class="glossary-item">
        <summary>${esc(g.name)}（${esc(g.zh)}）</summary>
        <div class="row"><b>計算方式：</b>${esc(g.formula)}</div>
        <div class="row"><b>定義：</b>${esc(g.definition)}</div>
        <div class="row"><b>商業意義：</b>${esc(g.meaning)}</div>
        <div class="row"><b>常見錯誤：</b>${esc(g.mistake)}</div>
        <div class="row"><b>適用產業：</b>${esc(g.industry)}</div>
        <div class="row"><b>使用者可調整：</b>${g.adjustable ? '是' : '否（自動計算）'}</div>
      </details>`).join('');
  }
  function toggleGlossary() {
    const box = document.getElementById('glossaryBox');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }

  function renderPnlOutputs(pnl, c) {
    const sens = Engine.sensitivityAnalysis(WS.inputs);
    const thresholds = computeThresholds();
    const opClass = pnl.operatingProfit >= 0 ? 'pos' : 'neg';
    document.getElementById('pnlOutput').innerHTML = `
      <div class="card">
        <h3>即時 P&amp;L 結果</h3>
        <div class="kpi-row">
          <div class="kpi-tile alt"><div class="v">${fmtMoney(pnl.companyNetRevenue)}</div><div class="l">Company Net Revenue</div></div>
          <div class="kpi-tile alt"><div class="v">${fmtMoney(pnl.grossProfit)}</div><div class="l">Gross Profit（${fmtPct(pnl.grossMarginPct)}）</div></div>
          <div class="kpi-tile ${opClass}"><div class="v">${fmtMoney(pnl.operatingProfit)}</div><div class="l">Operating Profit（${fmtPct(pnl.operatingMarginPct)}）</div></div>
          <div class="kpi-tile alt"><div class="v">${isFinite(pnl.breakEvenUnits) ? fmt(pnl.breakEvenUnits) + ' 台' : '無法回本'}</div><div class="l">Break-even Units</div></div>
        </div>

        <div class="table-wrap" style="margin-top:14px;">
          <table>
            <thead><tr><th>P&amp;L 項目（小抄見上方「公式小抄」）</th><th>金額</th></tr></thead>
            <tbody>
              <tr><td>Gross Sales</td><td class="val">${fmtMoney(pnl.grossSales)}</td></tr>
              <tr><td>(-) Consumer Discount</td><td class="val negative">-${fmtMoney(pnl.consumerDiscount)}</td></tr>
              <tr><td>(-) Returns</td><td class="val negative">-${fmtMoney(pnl.returns)}</td></tr>
              <tr class="subtotal"><td>= Net Consumer Sales</td><td class="val">${fmtMoney(pnl.netConsumerSales)}</td></tr>
              <tr><td>(-) Channel Margin</td><td class="val negative">-${fmtMoney(pnl.channelMargin)}</td></tr>
              <tr><td>(-) Rebates</td><td class="val negative">-${fmtMoney(pnl.rebates)}</td></tr>
              <tr class="subtotal"><td>= Company Net Revenue</td><td class="val">${fmtMoney(pnl.companyNetRevenue)}</td></tr>
              <tr><td>(-) COGS</td><td class="val negative">-${fmtMoney(pnl.cogs)}</td></tr>
              <tr class="subtotal"><td>= Gross Profit（Gross Margin ${fmtPct(pnl.grossMarginPct)}）</td><td class="val">${fmtMoney(pnl.grossProfit)}</td></tr>
              <tr><td>(-) Total A&amp;P</td><td class="val negative">-${fmtMoney(pnl.totalAP)}</td></tr>
              <tr><td>(-) Trade Marketing</td><td class="val negative">-${fmtMoney(pnl.tradeMarketing)}</td></tr>
              <tr><td>(-) Variable Operating Cost</td><td class="val negative">-${fmtMoney(pnl.variableOperatingCost)}</td></tr>
              <tr class="subtotal"><td>= Contribution Profit</td><td class="val">${fmtMoney(pnl.contributionProfit)}</td></tr>
              <tr><td>(-) Allocated Fixed Cost</td><td class="val negative">-${fmtMoney(pnl.allocatedFixedCost)}</td></tr>
              <tr class="final"><td>= Operating Profit（Operating Margin ${fmtPct(pnl.operatingMarginPct)}）</td><td class="val">${fmtMoney(pnl.operatingProfit)}</td></tr>
            </tbody>
          </table>
        </div>

        <h4>Break-even &amp; 單位經濟</h4>
        <div class="table-wrap"><table><tbody>
          <tr><td>Contribution per Unit</td><td class="val">${fmtMoney(pnl.contributionPerUnit)}</td></tr>
          <tr><td>Fixed Launch Investment（一次性上市投資）</td><td class="val">${fmtMoney(pnl.fixedLaunchInvestment)}</td></tr>
          <tr><td>Break-even Units</td><td class="val">${isFinite(pnl.breakEvenUnits) ? fmt(pnl.breakEvenUnits) + ' 台' : '此單位經濟無法回本'}</td></tr>
          <tr><td>A&amp;P as % of Revenue</td><td class="val">${fmtPct(pnl.apPctOfRevenue)}</td></tr>
        </tbody></table></div>

        <h4>行銷效率（獨立假設，非核心P&amp;L）</h4>
        <div class="table-wrap"><table><tbody>
          <tr><td>ROAS = Attributed Revenue ÷ Paid Media</td><td class="val">${pnl.roas.toFixed(2)}x</td></tr>
          <tr><td>Incremental Gross Profit</td><td class="val">${fmtMoney(pnl.incrementalGrossProfit)}</td></tr>
          <tr><td>ROMI</td><td class="val">${fmtPct(pnl.romi)}</td></tr>
        </tbody></table></div>
        <p class="small muted">⚠️ ROAS高不代表獲利高：ROAS只計算歸因營收、未扣成本；判斷A&amp;P是否合理請以ROMI（用incremental gross profit）為準。</p>
      </div>

      <div class="card">
        <h3>Sensitivity Analysis</h3>
        <p class="small muted">最影響 Operating Profit 的三個變數（±10% 變動的影響金額，由大到小排序）：</p>
        ${sens.top3.map((r) => {
          const v10 = r.impacts[0.10], vNeg10 = r.impacts[-0.10];
          const maxAbs = Math.max(Math.abs(v10), Math.abs(vNeg10), 1);
          const widthPos = Math.min(100, Math.abs(v10) / sens.maxSwing * 100);
          return `<div class="sens-row">
            <div class="sens-label">${esc(r.label)}</div>
            <div class="sens-track"><div class="sens-bar ${v10 < 0 ? 'neg' : ''}" style="left:50%;width:${widthPos / 2}%;"></div></div>
            <div class="sens-val">+10%: ${v10 >= 0 ? '+' : ''}${fmtMoney(v10)}</div>
          </div>`;
        }).join('')}
        <div class="table-wrap" style="margin-top:10px;">
          <table>
            <thead><tr><th>變數</th><th>-10%</th><th>-5%</th><th>-1%</th><th>+1%</th><th>+5%</th><th>+10%</th></tr></thead>
            <tbody>
              ${sens.rows.map((r) => `<tr><td>${esc(r.label)}</td>${[-0.10, -0.05, -0.01, 0.01, 0.05, 0.10].map((s) => `<td class="val ${r.impacts[s] < 0 ? 'negative' : ''}">${r.impacts[s] >= 0 ? '+' : ''}${fmtMoney(r.impacts[s])}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
        <h4>決策失效門檻（Break-point）</h4>
        <ul class="small">
          ${thresholds.map((t) => `<li>${t.text}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function computeThresholds() {
    const inputs = WS.inputs;
    const out = [];
    const cmr = Engine.solveThreshold(inputs, 'channelMarginRate', 0, 95);
    out.push({ text: cmr != null ? `若 <b>通路Margin</b> 超過 <b>${cmr.toFixed(1)}%</b>（目前 ${inputs.channelMarginRate}%），Operating Profit 將歸零，原上市決策不再成立。` : '在 0–95% 範圍內，通路Margin未使Operating Profit歸零，決策對此變數相對穩健。' });
    const lp = Engine.solveThreshold(inputs, 'listPrice', Number(inputs.listPrice) * 0.4, Number(inputs.listPrice) * 1.3);
    out.push({ text: lp != null ? `若 <b>售價</b> 低於 <b>${fmtMoney(lp)}</b>（目前 ${fmtMoney(inputs.listPrice)}），Operating Profit 將轉為虧損。` : '在合理售價區間內，售價下修未使Operating Profit歸零。' });
    const dr = Engine.solveThreshold(inputs, 'discountRate', 0, 70);
    out.push({ text: dr != null ? `若 <b>消費者折扣</b> 超過 <b>${dr.toFixed(1)}%</b>（目前 ${inputs.discountRate}%），Operating Profit 將歸零。` : '在 0–70% 範圍內，折扣加深未使Operating Profit歸零。' });
    const un = Engine.solveThreshold(inputs, 'units', 100, Number(inputs.units) * 5 || 50000);
    out.push({ text: un != null ? `銷量低於 <b>${fmt(un)} 台</b> 時，Operating Profit 將轉為虧損（即Break-even附近）。` : '在測試範圍內未找到銷量門檻，請檢查Contribution per Unit是否為正。' });
    return out;
  }

  function onInputChange(key, value) {
    WS.inputs[key] = value;
    WS.scenarioKey = 'custom';
    persistWS();
    document.querySelectorAll('.scenario-pill').forEach((b) => b.classList.remove('active'));
    const pnl = Engine.computePnL(WS.inputs);
    const c = getCaseById(WS.caseId);
    renderPnlOutputs(pnl, c);
  }
  function applyScenario(key) {
    const c = getCaseById(WS.caseId);
    const defaults = {};
    c.financialInputs.fields.forEach((f) => (defaults[f.key] = f.default));
    WS.inputs = { ...defaults, ...(c.scenarios[key].overrides || {}) };
    WS.scenarioKey = key;
    persistWS();
    renderWorkspaceCenter(c);
  }
  function onDecisionAnswerChange(i, v) { WS.decisionAnswers[i] = v; persistWS(); }

  // -------------------------------------------------------- Coach Panel
  function renderWorkspaceRight(c) {
    document.getElementById('wsRight').innerHTML = `
      <div class="card">
        <h3>Claude Coach</h3>
        <div class="coach-mode-tabs">
          ${['case', 'model', 'challenge', 'review', 'portfolio'].map((m) => `<button class="${WS.coachMode === m ? 'active' : ''}" onclick="App.setCoachMode('${m}')">${m === 'case' ? 'Case' : m === 'model' ? 'Model' : m === 'challenge' ? 'Challenge' : m === 'review' ? 'Review' : 'Portfolio'}</button>`).join('')}
        </div>
        <div id="coachBody"></div>
      </div>
    `;
    renderCoachBody(c);
  }
  function setCoachMode(m) { WS.coachMode = m; persistWS(); document.querySelectorAll('.coach-mode-tabs button').forEach((b) => b.classList.remove('active')); renderWorkspaceRight(getCaseById(WS.caseId)); }

  function renderCoachBody(c) {
    const box = document.getElementById('coachBody');
    if (WS.coachMode === 'case') {
      box.innerHTML = `<div class="mode-intro">${esc(MODE_INTRO.case)}</div>
        <p class="small">提醒：本模式刻意不顯示建議答案，請先完整閱讀左側Case Brief與Missing Information。</p>`;
      return;
    }
    if (WS.coachMode === 'model') {
      const log = DataStore.getAssumptionLog(c.id);
      box.innerHTML = `<div class="mode-intro">${esc(MODE_INTRO.model)}</div>
        <div class="field"><label>你的初步決策 Initial Decision</label>
          <textarea onchange="App.onInitialDecisionChange(this.value)">${esc(WS.initialDecisionText)}</textarea></div>
        <div class="field"><label>初步自評總分（選填，0–100，作為Initial Score）</label>
          <input type="number" min="0" max="100" value="${esc(WS.initialScoreEstimate)}" oninput="App.onInitialScoreChange(this.value)" /></div>
        <button class="btn small" onclick="App.snapshotInitial()">鎖定為期初結果 (Initial Snapshot)</button>
        ${WS.initialSnapshot ? `<p class="small muted">已鎖定：${new Date(WS.initialSnapshot.timestamp).toLocaleString('zh-Hant-TW')} · Operating Profit ${fmtMoney(WS.initialSnapshot.pnl.operatingProfit)}</p>` : ''}
        <hr class="sep"/>
        <h4>Assumption Log</h4>
        <div class="field"><label>新增假設紀錄</label>
          <textarea id="assumeText" placeholder="你調整了什麼數字？來源／邏輯是什麼？"></textarea></div>
        <div class="field"><label>Confidence Level</label>
          <select id="assumeConf"><option>High</option><option selected>Medium</option><option>Low</option></select></div>
        <button class="btn small" onclick="App.addAssumptionEntry()">新增紀錄</button>
        <div style="margin-top:10px;">
          ${log.map((a) => `<div class="assumption-entry"><b class="confidence-badge ${a.confidence}">[${a.confidence}]</b> ${esc(a.text)}<div class="muted small">${new Date(a.ts).toLocaleString('zh-Hant-TW')}</div></div>`).join('') || '<p class="muted small">尚無紀錄。</p>'}
        </div>`;
      return;
    }
    if (WS.coachMode === 'challenge') {
      const qs = CHALLENGE_QUESTIONS[c.id] || [];
      const answeredCount = Object.keys(WS.challengeAnswers).length;
      const current = qs[answeredCount];
      box.innerHTML = `<div class="mode-intro">${esc(MODE_INTRO.challenge)}</div>
        ${current ? `
          <div class="challenge-card">
            <div class="persona">${esc(current.personaZh)}</div>
            <div class="q">${esc(current.question)}</div>
            <textarea id="challengeAnswerBox" placeholder="輸入你的回答..."></textarea>
            <button class="btn small" style="margin-top:6px;" onclick="App.answerChallenge('${current.persona}')">回答並記錄</button>
          </div>` : `<p class="small muted">此案例的Challenge問題已全部回答完畢。</p>`}
        <h4>已回答紀錄</h4>
        ${Object.entries(WS.challengeAnswers).map(([p, a]) => `<div class="challenge-card"><div class="persona">${esc(p)}</div><div class="q small">${esc(a.question)}</div><div class="small">→ ${esc(a.answer)}</div></div>`).join('') || '<p class="muted small">尚無紀錄。</p>'}
        <div class="field"><label>挑戰後你修正了哪些假設或數字？（Corrections）</label>
          <textarea onchange="App.onCorrectionsChange(this.value)">${esc(WS.corrections)}</textarea></div>`;
      return;
    }
    if (WS.coachMode === 'review') {
      box.innerHTML = renderReviewMode(c);
      return;
    }
    if (WS.coachMode === 'portfolio') {
      box.innerHTML = `<div class="mode-intro">${esc(MODE_INTRO.portfolio)}</div>
        <p class="small">完成Review Mode並存檔後，此Session會出現在 <a href="#" onclick="App.navigate('portfolio');return false;">Portfolio</a> 頁面，可再切換去識別化與Index呈現。</p>`;
      return;
    }
  }

  function onInitialDecisionChange(v) { WS.initialDecisionText = v; persistWS(); }
  function onInitialScoreChange(v) { WS.initialScoreEstimate = v; persistWS(); }
  function snapshotInitial() {
    WS.initialSnapshot = { inputs: { ...WS.inputs }, pnl: Engine.computePnL(WS.inputs), decision: WS.initialDecisionText, timestamp: new Date().toISOString() };
    persistWS();
    renderCoachBody(getCaseById(WS.caseId));
  }
  function addAssumptionEntry() {
    const text = document.getElementById('assumeText').value.trim();
    const confidence = document.getElementById('assumeConf').value;
    if (!text) return;
    DataStore.addAssumptionLog(WS.caseId, { text, confidence, ts: new Date().toISOString() });
    renderCoachBody(getCaseById(WS.caseId));
  }
  function answerChallenge(persona) {
    const qs = CHALLENGE_QUESTIONS[WS.caseId] || [];
    const q = qs.find((x) => x.persona === persona);
    const answer = document.getElementById('challengeAnswerBox').value.trim();
    if (!answer) return;
    WS.challengeAnswers[persona] = { question: q.question, answer };
    persistWS();
    renderCoachBody(getCaseById(WS.caseId));
  }
  function onCorrectionsChange(v) { WS.corrections = v; persistWS(); }

  function renderReviewMode(c) {
    const total = computeRubricTotal();
    return `<div class="mode-intro">${esc(MODE_INTRO.review)}</div>
      ${RUBRIC.map((r) => `
        <div class="rubric-row">
          <div>
            <div class="rlabel">${esc(r.labelZh)} <span class="rweight">(${r.weight}%)</span></div>
            <textarea placeholder="評分理由 / 做得好的地方 / 具體錯誤或不足 / 下次應改善的行為" onchange="App.onRubricNoteChange('${r.key}', this.value)">${esc(WS.rubric[r.key]?.note || '')}</textarea>
          </div>
          <input type="number" min="0" max="100" value="${esc(WS.rubric[r.key]?.score ?? '')}" oninput="App.onRubricScoreChange('${r.key}', this.value)" />
        </div>`).join('')}
      <div class="flex-between"><span class="small muted">加權總分（Final Score）</span><span class="score-total">${total.toFixed(1)}</span></div>
      <hr class="sep"/>
      <h4>常見錯誤自我檢核</h4>
      <div class="checklist">
        ${MISTAKE_TAGS.map((t) => `<label><input type="checkbox" ${WS.mistakeTags.includes(t) ? 'checked' : ''} onchange="App.toggleMistakeTag('${t}', this.checked)" />${esc(MISTAKE_TAG_LABELS[t])}</label>`).join('')}
      </div>
      <hr class="sep"/>
      <div class="field"><label>你的最終建議（Final Decision）</label>
        <textarea onchange="App.onFinalDecisionChange(this.value)">${esc(WS.finalDecision)}</textarea></div>
      <div class="grid grid-2">
        <div class="field"><label>Confidence Before（1–10）</label><input type="number" min="1" max="10" value="${WS.confidenceBefore}" oninput="App.onConfChange('confidenceBefore', this.value)"/></div>
        <div class="field"><label>Confidence After（1–10）</label><input type="number" min="1" max="10" value="${WS.confidenceAfter}" oninput="App.onConfChange('confidenceAfter', this.value)"/></div>
      </div>
      <div class="field"><label>Skills Demonstrated</label><textarea onchange="App.onMetaChange('skillsDemonstrated', this.value)">${esc(WS.skillsDemonstrated)}</textarea></div>
      <div class="field"><label>Skills Requiring Improvement</label><textarea onchange="App.onMetaChange('skillsToImprove', this.value)">${esc(WS.skillsToImprove)}</textarea></div>
      <div class="field"><label>Biggest Blind Spot</label><textarea onchange="App.onMetaChange('blindSpot', this.value)">${esc(WS.blindSpot)}</textarea></div>
      <div class="field"><label>One Transferable Lesson</label><textarea onchange="App.onMetaChange('transferableLesson', this.value)">${esc(WS.transferableLesson)}</textarea></div>
      <button class="btn" onclick="App.finalizeSession()">完成本次練習並存檔</button>`;
  }
  function computeRubricTotal() {
    let total = 0;
    RUBRIC.forEach((r) => { const s = Number(WS.rubric[r.key]?.score) || 0; total += s * (r.weight / 100); });
    return total;
  }
  function onRubricScoreChange(key, v) { WS.rubric[key] = { ...(WS.rubric[key] || {}), score: v }; persistWS(); document.querySelector('.score-total').textContent = computeRubricTotal().toFixed(1); }
  function onRubricNoteChange(key, v) { WS.rubric[key] = { ...(WS.rubric[key] || {}), note: v }; persistWS(); }
  function toggleMistakeTag(t, checked) { WS.mistakeTags = checked ? [...new Set([...WS.mistakeTags, t])] : WS.mistakeTags.filter((x) => x !== t); persistWS(); }
  function onFinalDecisionChange(v) { WS.finalDecision = v; persistWS(); }
  function onConfChange(k, v) { WS[k] = Number(v); persistWS(); }
  function onMetaChange(k, v) { WS[k] = v; persistWS(); }

  function finalizeSession() {
    const c = getCaseById(WS.caseId);
    const finalPnl = Engine.computePnL(WS.inputs);
    const finalTotal = computeRubricTotal();
    const sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const session = {
      sessionId,
      date: new Date().toISOString(),
      caseId: c.id,
      industry: c.industry,
      initialDecision: WS.initialDecisionText,
      decisionAnswers: { ...WS.decisionAnswers },
      initialAssumptions: DataStore.getAssumptionLog(c.id).map((a) => `[${a.confidence}] ${a.text}`),
      initialPnlResult: WS.initialSnapshot ? WS.initialSnapshot.pnl : null,
      challengeTranscript: Object.entries(WS.challengeAnswers).map(([persona, a]) => ({ persona, question: a.question, answer: a.answer })),
      questionsAskedByClaude: Object.values(WS.challengeAnswers).map((a) => a.question),
      userAnswers: Object.values(WS.challengeAnswers).map((a) => a.answer),
      corrections: WS.corrections,
      finalDecision: WS.finalDecision,
      finalPnlResult: finalPnl,
      initialScore: WS.initialScoreEstimate === '' ? null : Number(WS.initialScoreEstimate),
      finalScore: { total: Math.round(finalTotal * 10) / 10, byCategory: RUBRIC.reduce((acc, r) => { acc[r.key] = { score: Number(WS.rubric[r.key]?.score) || 0, note: WS.rubric[r.key]?.note || '' }; return acc; }, {}) },
      skillsDemonstrated: WS.skillsDemonstrated,
      skillsRequiringImprovement: WS.skillsToImprove,
      biggestBlindSpot: WS.blindSpot,
      transferableLesson: WS.transferableLesson,
      confidenceBefore: WS.confidenceBefore,
      confidenceAfter: WS.confidenceAfter,
      mistakeTags: WS.mistakeTags,
    };
    DataStore.addSession(session);
    alert('已存檔本次Session紀錄！可至Progress與Portfolio頁面查看。');
    navigate('progress');
  }

  // ============================================================ PROGRESS
  function renderProgress() {
    const sessions = DataStore.get().sessions;
    const completedCases = new Set(sessions.map((s) => s.caseId)).size;
    const avgScore = average(sessions.map((s) => s.finalScore?.total));
    const avgInitial = average(sessions.map((s) => s.initialScore));
    const byIndustry = {};
    sessions.forEach((s) => (byIndustry[s.industry] = (byIndustry[s.industry] || 0) + 1));
    const byMonth = {};
    sessions.forEach((s) => { const mk = monthKey(s.date); if (!byMonth[mk]) byMonth[mk] = []; byMonth[mk].push(s.finalScore?.total || 0); });
    const monthRows = Object.entries(byMonth).sort().map(([mk, arr]) => ({ mk, avg: average(arr) }));
    const rubricAvg = {};
    RUBRIC.forEach((r) => { rubricAvg[r.key] = average(sessions.map((s) => s.finalScore?.byCategory?.[r.key]?.score)); });
    const mistakeCounts = {};
    sessions.forEach((s) => (s.mistakeTags || []).forEach((t) => (mistakeCounts[t] = (mistakeCounts[t] || 0) + 1)));
    const topMistakes = Object.entries(mistakeCounts).sort((a, b) => b[1] - a[1]);
    const maxIndustryCount = Math.max(1, ...Object.values(byIndustry));
    const maxRubric = 100;

    root().innerHTML = `
      <h1 class="page-title">Progress</h1>
      <p class="page-desc">個人能力成長趨勢 — 不只看總分，保留每一次評分的理由與證據</p>
      <div class="kpi-row">
        <div class="kpi-tile"><div class="v">${completedCases}</div><div class="l">Completed Cases</div></div>
        <div class="kpi-tile alt"><div class="v">${sessions.length}</div><div class="l">Total Practice Sessions</div></div>
        <div class="kpi-tile alt"><div class="v">${avgScore != null ? avgScore.toFixed(1) : '—'}</div><div class="l">Average Score</div></div>
        <div class="kpi-tile alt"><div class="v">${avgInitial != null ? avgInitial.toFixed(1) : '—'} → ${avgScore != null ? avgScore.toFixed(1) : '—'}</div><div class="l">Initial vs Final Score</div></div>
      </div>

      <div class="grid grid-2" style="margin-top:16px;">
        <div class="card">
          <h3>Cases by Industry</h3>
          ${Object.keys(byIndustry).length ? Object.entries(byIndustry).map(([ind, n]) => `
            <div class="sens-row"><div class="sens-label">${esc(getIndustry(ind)?.labelZh || ind)}</div>
              <div class="sens-track"><div class="sens-bar" style="left:0;width:${(n / maxIndustryCount) * 100}%;"></div></div>
              <div class="sens-val">${n}</div></div>`).join('') : '<p class="muted small">尚無資料。</p>'}
        </div>
        <div class="card">
          <h3>各項能力分數（Rubric平均）</h3>
          <p class="small muted">對應規格能力：P&amp;L Accuracy≈Financial Accuracy、A&amp;P Allocation Skill≈A&amp;P Allocation、Executive Recommendation≈Executive Communication；Pricing／Channel Economics／Sensitivity Analysis能力可由Commercial Reasoning、Assumption Quality、Risk Recognition綜合觀察。</p>
          ${RUBRIC.map((r) => `
            <div class="sens-row"><div class="sens-label">${esc(r.labelZh)}</div>
              <div class="sens-track"><div class="sens-bar" style="left:0;width:${rubricAvg[r.key] != null ? (rubricAvg[r.key] / maxRubric) * 100 : 0}%;"></div></div>
              <div class="sens-val">${rubricAvg[r.key] != null ? rubricAvg[r.key].toFixed(1) : '—'}</div></div>`).join('')}
        </div>
      </div>

      <div class="card">
        <h3>Monthly Score Trend</h3>
        ${monthRows.length ? `<div class="table-wrap"><table><thead><tr><th>月份</th><th>平均分數</th></tr></thead><tbody>
          ${monthRows.map((r) => `<tr><td>${r.mk}</td><td class="val">${r.avg.toFixed(1)}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted small">尚無資料。</p>'}
      </div>

      <div class="card">
        <h3>Most Frequent Mistakes</h3>
        ${topMistakes.length ? `<ol>${topMistakes.map(([t, n]) => `<li>${esc(MISTAKE_TAG_LABELS[t] || t)}（${n}次）</li>`).join('')}</ol>` : '<p class="muted small">尚無資料。</p>'}
      </div>

      <div class="card">
        <h3>所有Session紀錄（含評分理由與證據）</h3>
        ${sessions.length ? sessions.slice().reverse().map((s) => `
          <details class="glossary-item">
            <summary>${new Date(s.date).toLocaleString('zh-Hant-TW')} · ${esc(getCaseById(s.caseId)?.title || s.caseId)} · Final Score ${s.finalScore?.total ?? '—'}</summary>
            <div class="row"><b>Initial Decision：</b>${esc(s.initialDecision) || '—'}</div>
            <div class="row"><b>Final Decision：</b>${esc(s.finalDecision) || '—'}</div>
            <div class="row"><b>Operating Profit（Final）：</b>${fmtMoney(s.finalPnlResult?.operatingProfit || 0)}</div>
            ${RUBRIC.map((r) => `<div class="row"><b>${esc(r.labelZh)}（${s.finalScore?.byCategory?.[r.key]?.score ?? 0}分）：</b>${esc(s.finalScore?.byCategory?.[r.key]?.note) || '（未填寫理由）'}</div>`).join('')}
            <div class="row"><b>Biggest Blind Spot：</b>${esc(s.biggestBlindSpot) || '—'}</div>
            <div class="row"><b>Transferable Lesson：</b>${esc(s.transferableLesson) || '—'}</div>
          </details>`).join('') : '<p class="muted small">尚無紀錄。</p>'}
      </div>
    `;
  }

  // ============================================================ PORTFOLIO
  function renderPortfolio() {
    const sessions = DataStore.get().sessions;
    const notes = DataStore.get().portfolioNotes;
    const published = sessions.filter((s) => notes[s.sessionId]?.published);
    const unpublished = sessions.filter((s) => !notes[s.sessionId]?.published);
    root().innerHTML = `
      <h1 class="page-title">Portfolio</h1>
      <p class="page-desc">面試安全版本的案例研究 — 去識別化、可公開展示的商業判斷成果</p>
      <div class="card">
        <h3>系統方法論</h3>
        <p class="small">Business Decision Lab 以固定財務引擎（見案例Workspace的「公式小抄」）計算每次練習的P&amp;L，
        並透過Case／Model／Challenge／Review四種模式，訓練將行銷決策連結到Revenue、Gross Profit與Operating Profit的判斷力。
        下方每一份案例研究皆為去識別化之模擬練習成果，不代表任何真實公司之機密資料或真實財務數字。</p>
      </div>

      ${published.length ? published.slice().reverse().map((s) => {
        const c = getCaseById(s.caseId);
        return `<div class="case-study">
          ${renderPortfolioWriteup(s, c)}
          <div class="cs-toggle-row"><span class="small muted">已加入Portfolio展示</span>
            <button class="btn secondary small" onclick="App.togglePortfolioPublish('${s.sessionId}')">從Portfolio移除</button></div>
        </div>`;
      }).join('') : ''}

      ${unpublished.length ? `<div class="card">
        <h3>尚未加入Portfolio的Session</h3>
        ${unpublished.slice().reverse().map((s) => {
          const c = getCaseById(s.caseId);
          return `<div class="flex-between" style="padding:8px 0;border-bottom:1px solid var(--line);">
            <span class="small">${esc(c?.title || s.caseId)} <span class="muted">· ${new Date(s.date).toLocaleDateString('zh-Hant-TW')} · Final Score ${s.finalScore?.total ?? '—'}</span></span>
            <button class="btn small" onclick="App.togglePortfolioPublish('${s.sessionId}')">加入Portfolio</button>
          </div>`;
        }).join('')}
      </div>` : ''}

      ${!sessions.length ? '<div class="card"><p class="muted">完成Review Mode並存檔後，Session會出現在這裡供你選擇是否加入Portfolio。</p></div>' : ''}
    `;
  }
  function togglePortfolioPublish(sessionId) {
    const cur = DataStore.get().portfolioNotes[sessionId]?.published || false;
    DataStore.setPortfolioPublished(sessionId, !cur);
    renderPortfolio();
  }
  function renderPortfolioWriteup(s, c) {
    const pnl = s.finalPnlResult || {};
    const toIndex = (v) => pnl.companyNetRevenue ? Math.round((v / pnl.companyNetRevenue) * 100) : 0;
    const transcript = s.challengeTranscript && s.challengeTranscript.length
      ? s.challengeTranscript
      : (s.questionsAskedByClaude || []).map((q, i) => ({ persona: '', question: q, answer: (s.userAnswers || [])[i] || '' }));
    const finalRecommendation = s.decisionAnswers && s.decisionAnswers[4] ? s.decisionAnswers[4] : s.finalDecision;

    const section = (num, title, bodyHtml) => `
      <div class="cs-section">
        <div class="cs-num">${num}</div>
        <div><h4>${esc(title)}</h4>${bodyHtml}</div>
      </div>`;

    return `
      <div class="cs-header">
        <div class="cs-eyebrow">Simulated Business Case · Portfolio</div>
        <div class="cs-title">${esc(c?.title || s.caseId)}</div>
        <div class="cs-meta">
          <span>${esc(getIndustry(c?.industry)?.labelZh || '')}</span>
          <span>${esc(c?.mainSkill || '')}</span>
          <span>${new Date(s.date).toLocaleDateString('zh-Hant-TW')}</span>
          <span>Final Score ${s.finalScore?.total ?? '—'} / 100</span>
        </div>
      </div>
      <div class="cs-body">
        ${section('01', 'Business Challenge', `<p>${esc(c?.managementDecision)}</p>`)}
        ${section('02', 'Data and Assumptions', (s.initialAssumptions || []).length
          ? `<ul>${s.initialAssumptions.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>`
          : `<p class="muted">假設請見案例Financial Inputs中標示為Claude assumption的欄位。</p>`)}
        ${section('03', 'Financial Model', `
          <p class="muted small" style="margin-top:-4px;">以Company Net Revenue為基準（Index = 100）呈現，實際金額已去識別化。</p>
          <div class="cs-stats">
            <div class="cs-stat"><div class="n">100</div><div class="l">Net Revenue Index</div></div>
            <div class="cs-stat"><div class="n">${toIndex(pnl.grossProfit)}</div><div class="l">Gross Profit Index</div></div>
            <div class="cs-stat"><div class="n">${toIndex(pnl.operatingProfit)}</div><div class="l">Operating Profit Index</div></div>
            <div class="cs-stat"><div class="n">${fmtPct(pnl.operatingMarginPct || 0)}</div><div class="l">Operating Margin</div></div>
          </div>`)}
        ${section('04', 'Strategic Options', `<ul>${(c?.decisionSubQuestions || []).map((q) => `<li>${esc(q)}</li>`).join('')}</ul>`)}
        ${section('05', 'Decision', `<div class="cs-recommend">${esc(s.finalDecision) || '—'}</div>`)}
        ${section('06', 'Sensitivity Analysis', `<p>此決策已針對售價、銷量、通路margin、成本與A&amp;P投入進行±1%／5%／10%敏感度分析，並找出使Operating Profit轉為虧損的關鍵門檻，確認建議在合理情境範圍內仍然成立。</p>`)}
        ${section('07', 'Claude Challenge', transcript.length ? transcript.map((t) => `
          <div class="cs-qa">
            ${t.persona ? `<div class="persona">${esc(t.persona)}</div>` : ''}
            <div class="q">"${esc(t.question)}"</div>
            <div class="a">${esc(t.answer) || '—'}</div>
          </div>`).join('') : '<p class="muted">—</p>')}
        ${section('08', 'Final Recommendation', `<div class="cs-recommend">${esc(finalRecommendation) || '—'}</div>`)}
        ${section('09', 'Key Learning', `<p>${esc(s.transferableLesson) || '—'}</p>`)}
        ${section('10', 'Transferable Application', `<p>${esc(s.skillsDemonstrated) || '—'}</p>`)}
      </div>
      <div class="cs-disclosure">此為模擬練習成果，品牌、人物與數字皆為虛構／去識別化假設情境，僅供商業判斷能力展示，非任何真實公司之機密資料。</div>
    `;
  }

  // ============================================================ DATA PANEL
  function renderDataPanel() {
    const store = DataStore.get();
    root().innerHTML = `
      <h1 class="page-title">資料管理</h1>
      <p class="page-desc">Version ${esc(DataStore.STORE_VERSION)} · Last saved: ${store.lastSaved ? new Date(store.lastSaved).toLocaleString('zh-Hant-TW') : '—'}</p>
      <div class="disclosure">
        v1 儲存方式：瀏覽器localStorage（重新整理／關閉頁面後紀錄不會消失，但僅存在於這一台裝置與這個瀏覽器）＋ JSON Export／Import。
        建議定期「匯出JSON」並手動上傳到Google雲端硬碟／Google Space保存，作為跨裝置備份。
        直接串接Google Sheets／Drive、Supabase、SQLite或GitHub repository需要OAuth或後端服務，屬於下一輪迭代規劃（見頁尾Roadmap）。
      </div>
      <div class="card">
        <h3>Export / Import / Reset</h3>
        <button class="btn" onclick="DataStore.downloadExport()">匯出 JSON（下載備份）</button>
        <button class="btn secondary" onclick="document.getElementById('importFile').click()">匯入 JSON</button>
        <input type="file" id="importFile" accept="application/json" style="display:none;" onchange="App.handleImportFile(this.files[0])" />
        <button class="btn danger" onclick="App.handleReset()">Reset（清除所有本機紀錄）</button>
        <p class="small muted" style="margin-top:10px;">Sessions：${store.sessions.length} 筆 ／ Assumption logs：${Object.values(store.assumptionLogs).reduce((a, b) => a + b.length, 0)} 筆</p>
      </div>
    `;
  }
  function handleImportFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (!confirm('匯入將會覆蓋目前本機的所有紀錄，確定要繼續嗎？')) return;
        DataStore.importJSON(reader.result);
        alert('匯入成功！');
        render();
      } catch (e) { alert('匯入失敗：' + e.message); }
    };
    reader.readAsText(file);
  }
  function handleReset() {
    if (!confirm('確定要清除所有練習紀錄嗎？此動作無法復原，建議先匯出JSON備份。')) return;
    if (!confirm('再次確認：這將刪除所有Session、Assumption Log與草稿資料。')) return;
    DataStore.reset();
    render();
  }

  // ============================================================ init
  function init() {
    window.addEventListener('hashchange', onHashChange);
    render();
  }

  return {
    init, navigate,
    setLibraryFilter,
    onInputChange, applyScenario, onDecisionAnswerChange,
    toggleGlossary,
    setCoachMode,
    onInitialDecisionChange, onInitialScoreChange, snapshotInitial, addAssumptionEntry,
    answerChallenge, onCorrectionsChange,
    onRubricScoreChange, onRubricNoteChange, toggleMistakeTag, onFinalDecisionChange, onConfChange, onMetaChange,
    finalizeSession,
    togglePortfolioPublish,
    handleImportFile, handleReset,
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
