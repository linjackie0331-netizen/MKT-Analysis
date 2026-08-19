# Business Decision Lab

跨產業行銷 P&L 決策訓練工具。6 個虛構產業案例，練習商業判斷與 P&L 分析能力。

## 架構說明（重要，請勿變更）

這個 repo 只有**一份合併好的 `index.html`**（單一檔案，內含所有 CSS 與 JS），
搭配一個極簡的 `Code.gs`（僅用於 Google Apps Script 部署，負責載入 index.html）。

- **不要**再拆成 `js/engine.js`、`js/cases.js`、`css/style.css` 等分散檔案。
- 之前的版本曾經拆分過，已於 2026-08 統一改回單一合併檔案，原因是：
  同一份 `index.html` 需要同時在 Claude Artifact 與 Google Apps Script 上
  原樣運行，拆分檔案會讓兩邊部署時的手動同步變得容易出錯、又麻煩。

## 三個部署位置

- Claude Artifact（與 Claude 討論/共同編輯用）
- Google Apps Script 網頁版（正式對外展示用）
  https://script.google.com/d/1yKQ8YTfBRs1ccxjs_gAtJ9ELxCgVBCXtXEpDdqXRPIiRYw8qeXs2eYsv/edit
- 本 GitHub repo（備份與版本紀錄）

## 更新流程

1. 在 Claude Artifact 討論並確認修改
2. 把最終的 `index.html` 貼到 Apps Script 編輯器 → Deploy → 更新現有部署
3. 把同一份 `index.html` 貼到這個 repo（用 github.dev，按「.」鍵開啟瀏覽器版編輯器即可，不需要在本機安裝任何東西）並 commit

詳細 SOP 見 Google Drive 專案資料夾內的「Business Decision Lab — 同步 SOP」文件。

## 免責聲明

所有案例、品牌、人物與財務數字皆為虛構／模擬情境，僅供練習使用，非任何真實公司之機密資料。
