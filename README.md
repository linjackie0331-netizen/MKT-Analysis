# Business Decision Lab（跨產業行銷 P&L 決策分析）

> Turn Marketing Decisions into Commercial Outcomes

純前端、無建置流程的靜態網頁系統，開啟 `index.html` 即可使用（或以任何靜態網頁伺服器／GitHub Pages 部署）。

## 快速開始

```bash
python3 -m http.server 8080
# 開瀏覽器 http://localhost:8080/index.html
```

## 檔案結構

```
index.html            App shell、tab導覽
css/style.css         視覺系統（White / Dark Grey / Navy / Black / Light Grey）
js/engine.js           固定財務引擎：computePnL / sensitivityAnalysis / solveThreshold / FORMULA_GLOSSARY
js/store.js            DataStore：localStorage持久化、JSON Export/Import、sessions/assumptionLogs/portfolioNotes
js/cases.js             INDUSTRIES（6個產業）＋ CASES（case資料，含1個完整案例＋5個coming-soon骨架）
js/coach-content.js     RUBRIC、CHALLENGE_QUESTIONS、MODE_INTRO、MISTAKE_TAGS（Claude Coach的靜態內容庫）
js/app.js               路由與畫面渲染（Dashboard／Library／Workspace／Progress／Portfolio／資料管理）
```

對應規格書第十三節的資料夾概念，在v1以程式碼／localStorage模擬：

| 規格資料夾 | v1實作位置 |
|---|---|
| `/data/cases` | `js/cases.js`（唯讀） |
| `/data/sessions` | `DataStore` → `localStorage['bdl_store_v1'].sessions` |
| `/data/sources` | 每個case物件內的 `sources` 陣列（唯讀） |
| `/data/benchmarks` | `DataStore` → `.benchmarks`（保留欄位，尚未使用） |
| `/models` | `js/engine.js`（固定財務引擎程式碼） |
| `/portfolio` | `DataStore` → `.portfolioNotes` ＋ `js/app.js` 的 `renderPortfolioWriteup()` |

## 目前的已知設計限制（誠實揭露）

1. **Claude Coach 是靜態內容，不是即時LLM。** 這是純前端頁面，沒有連接Claude API，因此Challenge/Review模式提供的是預寫的Socratic提示與結構化評分表，不會自動幫你追問或評分。建議把頁面上的P&L結果與假設帶到與Claude的真實對話中，取得動態挑戰與評分後，再回填到Review Mode表單——這樣紀錄仍會完整保存在Session history與Progress趨勢中。
2. **儲存僅在本機瀏覽器（localStorage）。** 不會自動同步到Google Drive/Sheets（需要OAuth與後端，非靜態頁面能做到）。請定期使用「資料管理」頁的Export，把JSON檔手動存進Google雲端硬碟／Google Space。
3. **只有1個完整案例。** 六個產業分類已建立，但目前僅「高階掃拖機器人台灣上市決策」（Premium Home Appliance）有完整B–F區塊、財務欄位與三種情境；其餘5個為Case Identity骨架，於Case Library中標示「尚未開放」。
4. **Progress頁的「各項能力」對應規格原文的六項技能是近似映射**（P&L Accuracy≈Financial Accuracy、A&P Allocation Skill≈A&P Allocation、Executive Recommendation≈Executive Communication；Pricing／Channel Economics／Sensitivity Analysis則綜合觀察Commercial Reasoning、Assumption Quality、Risk Recognition），已在頁面上以文字說明清楚，非隱藏假設。

## 財務引擎的兩個易錯定義（已在 `FORMULA_GLOSSARY` 中標示 ⚠️）

- **Fixed Launch Investment**（一次性上市投資，用於Break-even Units）與 **Allocated Fixed Cost**（每期經常性overhead，用於Operating Profit）是兩個不同數字，不可混用。
- **ROAS** 只計算歸因營收、未扣成本，不能當獲利指標；判斷A&P是否合理請用 **ROMI**（分子必須是Incremental Gross Profit，不是Incremental Revenue）。

## 下一輪迭代路線圖

1. 依同一標準補完5個產業的完整案例（Alcohol/Spirits、Vision Care、FMCG、E-commerce、SaaS Subscription）。
2. 串接Claude API，讓Challenge/Review Mode可在頁面內即時對話與評分（需要後端代理或使用者自備API key）。
3. 接上Google Sheets／Drive、Supabase、SQLite或GitHub repository其中一種作為雲端資料層（`DataStore`已抽象成 `load/save/exportJSON/importJSON` 介面，替換實作即可）。
4. 每日Micro Case、每週Deep-dive Case、每月Executive Learning Report的自動產生流程。
5. HBP公開案例目錄的即時檢索與來源標註（目前案例資料為Claude assumption，尚未串接即時網路檢索）。
