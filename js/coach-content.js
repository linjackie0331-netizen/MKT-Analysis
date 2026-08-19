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
  challenge: 'Challenge Mode：從下方選一位角色的問題開始（一次只回答一題）。建議把問題與你的回答帶到與Claude的對話中，讓Claude繼續追問，再回來記錄。',
  review: 'Review Mode：完成決策後，依照固定rubric為自己（或請Claude）評分。請誠實填寫，不要因為語氣流暢就給高分——評分依據應該是財務邏輯與商業判斷的品質。',
  portfolio: 'Portfolio Mode：把已完成的Session轉換成面試安全版本。系統會自動去識別化敏感欄位，你可再手動調整摘要文字。',
};

// 每個角色一次只問一個問題；answered後才會出現下一題（前端邏輯見 app.js）
const CHALLENGE_QUESTIONS = {
  'phai-001': [
    { persona: 'CFO', personaZh: 'CFO',
      question: 'NT$29,900的定價，加上8%上市折扣，你怎麼向我證明這個組合不是「用毛利換銷量」的短視決策？',
      followUps: [
        '如果我把折扣拿掉、只靠KOL/PR創造需求，你的銷量假設會掉多少？你有數據支持嗎？',
        '你的unit COGS假設如果被供應鏈報價高估10%，Operating Profit還會是正的嗎？',
      ] },
    { persona: 'GM', personaZh: 'GM（台灣總經理）',
      question: '通路要求28%的margin已經不低了，如果他們談到要33%，你打算漲價、砍A&P，還是放棄部分通路？請給我一個決定，不要三個都要。',
      followUps: [
        '如果你選擇漲價，消費者的discount sensitivity你怎麼驗證？如果選擇砍A&P，你怎麼確保銷量不會同步下滑？',
      ] },
    { persona: 'Regional HQ', personaZh: '區域總部',
      question: '你要求的首波A&P預算，跟其他市場的launch A&P%的比例相比，是偏高還是偏低？為什麼台灣需要不一樣的投入？',
      followUps: [
        '如果總部只批准你要求預算的70%，你的break-even銷量會延後多久？哪些A&P項目你會優先砍？',
      ] },
    { persona: 'Retail Partner', personaZh: '零售通路窗口',
      question: '我們願意給你端架陳列，但你要保證多少銷量與多少trade marketing資源？你怎麼算出這個數字是雙方都划算的？',
      followUps: [] },
    { persona: 'Supply Chain', personaZh: '供應鏈負責人',
      question: '你的退貨率假設是3%，但這是大型家電，物流與整新成本比小家電高很多——這個假設你是怎麼來的？如果實際是6%呢？',
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
