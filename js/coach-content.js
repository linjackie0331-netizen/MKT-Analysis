/* =========================================================================
 * Business Decision Lab — Claude Coach 內容庫
 * -------------------------------------------------------------------------
 * 誠實說明（重要）：此頁面是純前端靜態網頁，沒有連接Claude API，因此
 * 「Claude Coach」在v1的實作方式是——
 *   1) 下方預先寫好的Socratic提示／挑戰問題庫，引導你在頁面上思考、記錄；
 *   2) 真正的動態追問、辯證與評分，建議你把此頁的P&L結果與假設，帶到與
 *      Claude的即時對話（例如本次建立這個系統的對話）中進行，再把
 *      Claude給你的挑戰、回饋與分數，記錄回「Review Mode」的表單裡——
 *      這樣所有紀錄仍會保存在同一份Session紀錄與Progress趨勢中。
 * 下一輪迭代的路線圖：串接Claude API，讓Challenge/Review Mode可以直接在
 * 頁面內即時對話與評分（需要後端或使用者自備API key，見README）。
 * ========================================================================= */

const RUBRIC = [
  { key: 'financialAccuracy', label: 'Financial Accuracy', labelZh: '財務準確度', weight: 20 },
  { key: 'commercialReasoning', label: 'Commercial Reasoning', labelZh: '商業判斷', weight: 20 },
  { key: 'assumptionQuality', label: 'Assumption Quality', labelZh: '假設品質', weight: 15 },
  { key: 'riskRecognition', label: 'Risk Recognition', labelZh: '風險辨識', weight: 15 },
  { key: 'apAllocation', label: 'A&P Allocation', labelZh: 'A&P配置判斷', weight: 15 },
  { key: 'executiveCommunication', label: 'Executive Communication', labelZh: '高階溝通', weight: 15 },
];

const MODE_INTRO = {
  case: 'Case Mode：這裡只顯示案例背景、資料與問題，不會提前顯示建議答案。請先閱讀左側Case Brief與Missing Information，再開始建立你的假設。',
  model: 'Model Mode：請在中央P&L輸入區調整數字，並在下方Assumption Log中，針對每個你修改過的假設寫下：數字來源、假設邏輯、風險、Confidence level。系統不會替你完成判斷。',
  challenge: 'Challenge Mode：角色會依序提出問題，一次只回答一題，主問題答完後可能還有追問。回答完每位角色的主問題後，可以點「顯示Claude參考回答」比較差異——建議先寫下自己的答案再點開，而不是直接看答案。',
  review: 'Review Mode：完成決策後，依照固定rubric為自己（或請Claude）評分。請誠實填寫，不要因為語氣流暢就給高分——評分依據應該是財務邏輯與商業判斷的品質。',
  portfolio: 'Portfolio Mode：把已完成的Session轉換成面試安全版本。系統會自動去識別化敏感欄位，你可再手動調整摘要文字。',
};

// 每個角色的問題會依序（含follow-up）逐一提出；主問題回答後可選擇顯示參考回答再繼續（前端邏輯見 app.js）
// referenceAnswer 為Base情境下的示範計算，非唯一標準答案，用來讓使用者比對自己的回答，而非取代自己的判斷。
const CHALLENGE_QUESTIONS = {
  'phai-001': [
    { persona: 'CFO', personaZh: 'CFO',
      question: 'NT$29,900的定價，加上8%上市折扣，你怎麼向我證明這個組合不是「用毛利換銷量」的短視決策？',
      referenceAnswer: '因為毛利結構還在：即使有8%折扣與3%退貨，Net Consumer Sales仍有Gross Sales的約89%，扣除28%通路margin與2%rebate後，Company Net Revenue的Gross Margin仍有約49.0%——代表折扣沒有把毛利打穿，只是把消費者最終付出的價格往下調整，用來換取上市初期的曝光與試用。真正該檢驗「是否用毛利換銷量」的指標不是折扣本身，而是Operating Margin有沒有守住（Base情境約37.7%，仍屬健康水準）；若折扣換來的銷量成長無法轉換成Operating Profit的正貢獻（用ROMI而非ROAS檢驗），那才是真正的短視操作。',
      followUps: [
        '如果我把折扣拿掉、只靠KOL/PR創造需求，你的銷量假設會掉多少？你有數據支持嗎？',
        '你的unit COGS假設如果被供應鏈報價高估10%，Operating Profit還會是正的嗎？',
      ] },
    { persona: 'GM', personaZh: 'GM（台灣總經理）',
      question: '通路要求28%的margin已經不低了，如果他們談到要33%，你打算漲價、砍A&P，還是放棄部分通路？請給我一個決定，不要三個都要。',
      referenceAnswer: '我會選擇溫和調漲List Price（例如上調3–5%），而不是砍A&P或放棄通路。理由：A&P是建立品牌知名度的關鍵武器，在一個完全沒有知名度的新市場砍A&P，風險是銷量假設直接落空，那反而讓通路margin的問題變得無關緊要，因為連基本量都達不到；放棄通路則會直接犧牲鋪貨覆蓋率，在上市初期更是致命。漲價的風險是消費者對價格帶的敏感度，需要先用敏感度分析確認售價的安全區間，同時我會要求通路用更好的陳列位置或曝光資源作為交換，而不是單方面吸收margin壓力。',
      followUps: [
        '如果你選擇漲價，消費者的discount sensitivity你怎麼驗證？如果選擇砍A&P，你怎麼確保銷量不會同步下滑？',
      ] },
    { persona: 'Regional HQ', personaZh: '區域總部',
      question: '你要求的首波A&P預算，跟其他市場的launch A&P%的比例相比，是偏高還是偏低？為什麼台灣需要不一樣的投入？',
      referenceAnswer: '以Base情境計算，Total A&P約佔Company Net Revenue的5.5%，若把Trade Marketing也算進廣義行銷投資，比例約6.5%。這個比例本身無法脫離benchmark單獨判斷合理性，但台灣的特殊性在於：品牌完全沒有既有知名度，需要更高的KOL/PR比重去建立信任感，而非只靠paid media衝流量，這也是為什麼本案KOL/PR預算高於Creative Production與Sponsorship的總和。如果總部要求對齊其他市場的比例，我會建議優先保留KOL/PR的絕對投資，從Sponsorship或Other Brand Investment這類效益較難衡量的項目縮減。',
      followUps: [
        '如果總部只批准你要求預算的70%，你的break-even銷量會延後多久？哪些A&P項目你會優先砍？',
      ] },
    { persona: 'Retail Partner', personaZh: '零售通路窗口',
      question: '我們願意給你端架陳列，但你要保證多少銷量與多少trade marketing資源？你怎麼算出這個數字是雙方都划算的？',
      referenceAnswer: '基準情境下Trade Marketing預算約NT$1.2M；只要端架陳列帶來的增量銷量，其Contribution per Unit（約NT$8,378／台）累積起來能打平這筆投資，這筆交易就划算——換算下來大約只需要140幾台的增量銷量，門檻其實不高。但我不會用「總銷量」去承諾，而是用「可歸因的增量銷量」去承諾，避免把本來就會自然發生的銷量算成陳列的功勞。',
      followUps: [] },
    { persona: 'Supply Chain', personaZh: '供應鏈負責人',
      question: '你的退貨率假設是3%，但這是大型家電，物流與整新成本比小家電高很多——這個假設你是怎麼來的？如果實際是6%呢？',
      referenceAnswer: '3%是Claude assumption，參考高單價家電、電商通路的一般退貨率區間，並非本集團在台灣或類似市場的實際歷史數據——這正是案例Missing Information中明確列為Low confidence的一項，需要在正式決策前向供應鏈與客服部門索取真實數字校正。如果退貨率實際是6%，影響是雙重的：一是Returns（Gross Sales × Return Rate）會多損失一倍金額，直接侵蝕Net Consumer Sales；二是退貨品的整新、二次配送等成本，理論上也該反映在Variable Operating Cost，代表目前的Operating Profit可能被高估——這是上市前必須驗證的checkpoint之一。',
      followUps: [] },
  ],
};

// Portfolio Mode 固定輸出結構（10節）
const PORTFOLIO_STRUCTURE = [
  { key: 'businessChallenge', label: '1. Business Challenge' },
  { key: 'dataAssumptions', label: '2. Data and Assumptions' },
  { key: 'financialModel', label: '3. Financial Model' },
  { key: 'strategicOptions', label: '4. Strategic Options' },
  { key: 'decision', label: '5. Decision' },
  { key: 'sensitivityAnalysis', label: '6. Sensitivity Analysis' },
  { key: 'claudeChallenge', label: '7. Claude Challenge' },
  { key: 'finalRecommendation', label: '8. Final Recommendation' },
  { key: 'keyLearning', label: '9. Key Learning' },
  { key: 'transferableApplication', label: '10. Transferable Application' },
];

// Review Mode 常見錯誤自我檢核清單（用於Dashboard「最常犯的三個錯誤」統計）
const MISTAKE_TAGS = [
  'consumer_discount_vs_channel_margin',
  'roas_treated_as_profit',
  'romi_used_total_not_incremental_revenue',
  'fixed_launch_investment_vs_allocated_fixed_cost_confused',
  'return_rate_ignored',
  'variable_cost_missing_in_contribution',
  'rebate_double_counted_with_channel_margin',
  'no_sensitivity_before_recommendation',
  'revenue_growth_used_as_proxy_for_profit',
];
const MISTAKE_TAG_LABELS = {
  consumer_discount_vs_channel_margin: '把消費者折扣與通路margin混算',
  roas_treated_as_profit: '把ROAS當成獲利指標使用',
  romi_used_total_not_incremental_revenue: 'ROMI用total revenue而非incremental revenue計算',
  fixed_launch_investment_vs_allocated_fixed_cost_confused: '混用Fixed Launch Investment與Allocated Fixed Cost',
  return_rate_ignored: '忽略退貨率對淨銷售的影響',
  variable_cost_missing_in_contribution: '計算Contribution Profit時漏算Variable Operating Cost',
  rebate_double_counted_with_channel_margin: 'Rebate與Channel Margin重複計算',
  no_sensitivity_before_recommendation: '未做敏感度分析就提出建議',
  revenue_growth_used_as_proxy_for_profit: '把營收成長當成利潤成長的證據',
};

// Model Mode：每個可調整欄位都建議使用者填寫的四個提示
const ASSUMPTION_PROMPT_FIELDS = [
  { key: 'rationale', label: '數字來源／假設邏輯' },
  { key: 'risk', label: '風險' },
  { key: 'confidence', label: 'Confidence Level', type: 'select', options: ['High', 'Medium', 'Low'] },
];
