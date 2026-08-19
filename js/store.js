/* =========================================================================
 * Business Decision Lab — Data Store
 * -------------------------------------------------------------------------
 * v1 儲存方式：瀏覽器 localStorage（隨裝置持久化，重新整理不會消失）＋
 * JSON Export／Import（可手動存進 Google Drive / Google Space 等雲端硬碟）。
 *
 * 對應規格第十三節的資料夾結構，在 v1 以 localStorage 的 key 模擬：
 *   /data/cases      → CASES（由 js/cases.js 提供，唯讀，不存在 localStorage）
 *   /data/sessions   → store.sessions
 *   /data/sources    → 各 case 內的 sources 陣列（唯讀）
 *   /data/benchmarks → store.benchmarks
 *   /models          → js/engine.js（財務引擎，程式碼本身，不是資料）
 *   /portfolio       → store.portfolioNotes（使用者對 portfolio 呈現的客製化備註）
 *
 * 未來若要接 Google Sheets／Supabase／SQLite／GitHub，請實作與這裡相同的
 * StoreAPI 介面（load / save / exportJSON / importJSON），並在 app.js 抽換
 * DataStore 實例即可，不需改動其他模組。
 * ========================================================================= */

const DataStore = (() => {
  const STORE_KEY = 'bdl_store_v1';
  const STORE_VERSION = '1.0.0';

  function defaultStore() {
    return {
      version: STORE_VERSION,
      lastSaved: null,
      sessions: [],       // 每次練習的完整紀錄（不覆蓋，只新增）
      assumptionLogs: {},  // { [caseId]: [ {text, confidence, ts} ] }
      workspaceDrafts: {}, // { [caseId]: { inputs, scenario, notes } } 暫存中的操作，避免中途消失
      portfolioNotes: {},  // { [sessionId]: { published: bool, editedSummary } }
      benchmarks: {},       // 保留給未來的產業 benchmark 資料
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return defaultStore();
      const parsed = JSON.parse(raw);
      return { ...defaultStore(), ...parsed };
    } catch (e) {
      console.error('[DataStore] load failed, falling back to default store', e);
      return defaultStore();
    }
  }

  function persist() {
    state.lastSaved = new Date().toISOString();
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('[DataStore] save failed (localStorage可能已滿或被封鎖)', e);
      alert('資料儲存失敗：瀏覽器localStorage無法寫入。請使用JSON Export手動備份。');
    }
    return state;
  }

  function get() { return state; }

  function addSession(session) {
    state.sessions.push(session);
    persist();
    return session;
  }

  function updateSession(sessionId, patch) {
    const idx = state.sessions.findIndex((s) => s.sessionId === sessionId);
    if (idx === -1) return null;
    state.sessions[idx] = { ...state.sessions[idx], ...patch };
    persist();
    return state.sessions[idx];
  }

  function getSessionsByCase(caseId) {
    return state.sessions.filter((s) => s.caseId === caseId);
  }

  function saveDraft(caseId, draft) {
    state.workspaceDrafts[caseId] = draft;
    persist();
  }

  function getDraft(caseId) {
    return state.workspaceDrafts[caseId] || null;
  }

  function addAssumptionLog(caseId, entry) {
    if (!state.assumptionLogs[caseId]) state.assumptionLogs[caseId] = [];
    state.assumptionLogs[caseId].push(entry);
    persist();
  }

  function getAssumptionLog(caseId) {
    return state.assumptionLogs[caseId] || [];
  }

  function setPortfolioPublished(sessionId, published, editedSummary) {
    state.portfolioNotes[sessionId] = { published, editedSummary: editedSummary || '' };
    persist();
  }

  function exportJSON() {
    const payload = { ...state, exportedAt: new Date().toISOString(), exportVersion: STORE_VERSION };
    return JSON.stringify(payload, null, 2);
  }

  function importJSON(jsonText) {
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      throw new Error('JSON格式錯誤，無法匯入：' + e.message);
    }
    if (!parsed || typeof parsed !== 'object') throw new Error('檔案內容不是有效的物件');
    state = { ...defaultStore(), ...parsed, version: STORE_VERSION };
    persist();
    return state;
  }

  function reset() {
    state = defaultStore();
    persist();
    return state;
  }

  function downloadExport() {
    const blob = new Blob([exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = url;
    a.download = `business-decision-lab_backup_${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    STORE_VERSION,
    get, persist,
    addSession, updateSession, getSessionsByCase,
    saveDraft, getDraft,
    addAssumptionLog, getAssumptionLog,
    setPortfolioPublished,
    exportJSON, importJSON, reset, downloadExport,
  };
})();
