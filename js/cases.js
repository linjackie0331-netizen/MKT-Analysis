/* =========================================================================
 * Business Decision Lab — Case Data
 * -------------------------------------------------------------------------
 * 資料來源標示規則（每個重要數字都要有一個 tag）：
 *   'public'     Publicly sourced  — 附 source id（見 case.sources）
 *   'case'       Case-provided     — 由使用者於本指令中直接給定
 *   'user'       User input        — 練習過程中使用者自己輸入／覆蓋的數字
 *   'assumption' Claude assumption — Claude基於產業常識建立的假設，非真實引用
 *
 * ⚠️ 誠實揭露：本案例為「Cirrus Robotics」之虛構品牌，非任何真實公司之
 * 機密資料。凡標示 assumption 的數字，皆為求案例可操作而設定的合理估計，
 * 使用時應視為練習素材，不可作為真實商業決策依據。
 * ========================================================================= */

const INDUSTRIES = [
  { id: 'premium-home-appliance', label: 'Premium Home Appliance', labelZh: '高階家電',
    topics: ['Premium pricing', 'Retail margin', 'E-commerce discount', 'Warranty cost', 'Return rate', 'Logistics', 'Product launch A&P', 'KOL與paid media配置', 'Break-even volume'] },
  { id: 'alcohol-spirits', label: 'Alcohol / Spirits', labelZh: '酒類／烈酒',
    topics: ['Distributor margin', 'Retail與on-trade economics', 'Excise tax', 'Brand-building investment', 'Sponsorship', 'Sampling', 'Premiumization', 'Volume versus price mix'] },
  { id: 'vision-care', label: 'Vision Care / Medical Consumer', labelZh: '視光／醫療消費品',
    topics: ['B2B2C', 'Distributor與optical shop margin', 'Professional recommendation', 'Trial conversion', 'Repeat purchase', 'Consumer education', 'Portfolio mix', 'Regulatory constraints'] },
  { id: 'fmcg', label: 'FMCG', labelZh: '快消品',
    topics: ['Listing fee', 'Trade promotion', 'Consumer promotion', 'Retail margin', 'Promotional volume', 'Cannibalization', 'Distribution expansion', 'Gross-to-net'] },
  { id: 'ecommerce-marketplace', label: 'E-commerce / Marketplace', labelZh: '電商／平台',
    topics: ['Take rate', 'Platform subsidy', 'Fulfillment cost', 'Customer acquisition', 'Repeat purchase', 'Free shipping', 'Seller incentives', 'Contribution margin'] },
  { id: 'saas-subscription', label: 'SaaS Subscription', labelZh: 'SaaS訂閱',
    topics: ['MRR', 'ARR', 'CAC', 'LTV', 'Churn', 'Gross margin', 'Payback period', 'Free trial conversion', 'Sales and marketing efficiency'] },
];

const CASES = [];

/* -------------------------------------------------------------------------
 * CASE 1（完整）：高階掃拖機器人台灣上市決策 — Premium Home Appliance
 * ---------------------------------------------------------------------- */
CASES.push({
  id: 'phai-001',
  title: '高階掃拖機器人台灣上市決策',
  titleEn: 'Cirrus X1 Pro — Taiwan Launch Decision',
  industry: 'premium-home-appliance',
  difficulty: 'Advanced',
  mainSkill: 'Pricing & Break-even Analysis',
  secondarySkills: ['Channel Economics', 'A&P Allocation', 'Sensitivity Analysis', 'Executive Recommendation'],
  version: 'v1.0',
  createdDate: '2026-08-18',
  updatedDate: '2026-08-18',
  status: 'Public',
  origin: 'Original',
  originNote: '本模擬案例僅參考公開市場常識與產業一般結構，並非Harvard Business Publishing原始案例的重製或摘要，亦非任何真實公司之機密資料。',

  background: {
    companyProfile: 'Cirrus Robotics 是一家虛構的中型家電新創品牌，總部設於新加坡，主力產品為高階掃地機器人與清潔小家電，目前於東南亞三個市場銷售，尚未進入台灣。',
    productService: 'Cirrus X1 Pro：掃拖合一機器人，具備雷射導航、自動集塵、熱風烘乾拖布等旗艦功能，定位對標市場上的高階掃拖機種。',
    marketSituation: '台灣掃地機器人市場已有多個國際與中國品牌競爭，消費者對「掃拖合一＋自動清潔基站」的高階機種接受度逐年提升，電商平台（雙11、618）與3C實體通路是主要銷售場域。',
    customer: '雙薪家庭、有寵物或長輩同住的家庭、重視居家清潔效率與科技感的25–45歲消費者，願意為「省時間」與「免手洗拖布」等痛點付費。',
    competitors: '市場上已有多個國際品牌（含歐美與中系品牌）在NT$20,000–NT$35,000價格帶競爭，功能與行銷投入都相當積極。',
    channelStructure: '規劃通路組合：官網／電商旗艦店（蝦皮、momo、PChome）＋3C連鎖零售（如燦坤、全國電子型態通路）＋少量家電專賣店。各通路要求的margin不同，電商平台另有平台抽成與行銷資源要求。',
    strategicChallenge: 'Cirrus Robotics 需要在12週內決定是否、以及如何進入台灣市場。品牌尚無台灣知名度，必須同時控制上市風險與建立長期市佔基礎，而不是單純追求短期銷量。',
  },

  managementDecision: '公司是否應在台灣上市 Cirrus X1 Pro？若上市，應以什麼定價與投資組合進行，才能在合理時間內達成損益兩平並建立永續獲利的商業模式？',
  decisionSubQuestions: [
    '是否應以 NT$29,900 上市？',
    '是否應在上市期提供 8% 折扣？',
    '通路 margin 為 28% 時是否仍可獲利？',
    '首波 A&P 應投入多少？',
    '需要達到多少銷量才能 break-even？',
    '如果通路要求再增加 5 個百分點 margin，應漲價、減少 A&P，還是放棄部分通路？',
  ],

  // 固定欄位鍵值需與 js/engine.js computePnL() 的 inputs 對應一致
  financialInputs: {
    currency: 'TWD',
    fields: [
      { key: 'listPrice', label: '建議售價 List Price', unit: 'NT$/台', group: '定價與銷量', tag: 'case', note: '公司內部提出的上市定價方案。', editable: true, default: 29900 },
      { key: 'units', label: '首年目標銷量 Units', unit: '台', group: '定價與銷量', tag: 'assumption', note: '參考台灣高階掃拖機種的合理新品牌切入規模所建立的假設，非真實市調數字，使用前應以實際通路铺货與媒體排期驗證。', editable: true, default: 6000 },
      { key: 'discountRate', label: '消費者折扣 Discount Rate', unit: '%', group: '定價與銷量', tag: 'case', note: '上市期促銷折扣方案。', editable: true, default: 8 },
      { key: 'returnRate', label: '退貨率 Return Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: '參考高單價家電／電商通路一般退貨率區間所設的假設（實際應向通路與客服部門索取歷史數據）。', editable: true, default: 3 },

      { key: 'channelMarginRate', label: '通路 Margin Rate', unit: '%', group: '通路經濟', tag: 'case', note: '電商＋3C零售的加權平均通路margin方案。', editable: true, default: 28 },
      { key: 'rebateRate', label: 'Rebate Rate（通路年度回饋）', unit: '%（以Net Consumer Sales計）', group: '通路經濟', tag: 'assumption', note: '假設給主要零售夥伴的年度達標回饋，需向業務與財務確認實際合約條件。', editable: true, default: 2 },

      { key: 'unitCOGS', label: '單位製造成本 Unit COGS', unit: 'NT$/台', group: '成本結構', tag: 'assumption', note: '假設COGS約為List Price的三成左右，屬合理高階家電成本結構估計，需向供應鏈確認實際報價。', editable: true, default: 9500 },
      { key: 'logisticsPerUnit', label: '物流／倉儲成本', unit: 'NT$/台', group: '成本結構', tag: 'assumption', note: '大型家電最後一哩配送、倉儲與退貨整新的估計成本。', editable: true, default: 450 },
      { key: 'otherVariablePerUnit', label: '其他變動成本（保固／客服／金流）', unit: 'NT$/台', group: '成本結構', tag: 'assumption', note: '涵蓋保固維修準備金、客服成本與金流手續費的估計。', editable: true, default: 300 },

      { key: 'paidMedia', label: 'Paid Media', unit: 'NT$（上市季）', group: 'A&P投資', tag: 'assumption', note: '數位廣告（社群、搜尋、電商站內廣告）上市季預算假設。', editable: true, default: 3000000 },
      { key: 'kolPR', label: 'KOL／PR', unit: 'NT$（上市季）', group: 'A&P投資', tag: 'assumption', note: '參考業界常見的多層級KOL合作規模（旗艦＋腰部＋micro）所設的預算假設。', editable: true, default: 1800000 },
      { key: 'creativeProduction', label: 'Creative Production', unit: 'NT$（上市季）', group: 'A&P投資', tag: 'assumption', note: '產品攝影、影片、關鍵視覺與素材製作預算假設。', editable: true, default: 600000 },
      { key: 'sponsorship', label: 'Sponsorship', unit: 'NT$（上市季）', group: 'A&P投資', tag: 'assumption', note: '家庭／居家生活相關活動或媒體合作贊助預算假設。', editable: true, default: 400000 },
      { key: 'otherBrandInvestment', label: 'Other Brand Investment', unit: 'NT$（上市季）', group: 'A&P投資', tag: 'assumption', note: '公關活動、快閃體驗、媒體公關等其他品牌投資假設。', editable: true, default: 300000 },

      { key: 'tradeMarketing', label: 'Trade Marketing（通路端促銷資源）', unit: 'NT$（上市季）', group: '通路投資', tag: 'assumption', note: '端架陳列、平台首頁曝光、聯合促銷等給通路的資源假設，與A&P（品牌端）分開計算。', editable: true, default: 1200000 },

      { key: 'fixedLaunchInvestment', label: 'Fixed Launch Investment（一次性上市投資，用於break-even）', unit: 'NT$', group: '固定投資', tag: 'assumption', note: '⚠️ 定義：此為break-even計算專用的「一次性」上市投資總額，預設＝Total A&P＋Trade Marketing（7,300,000），可依實際上市計畫調整，不等於下方的Allocated Fixed Cost。', editable: true, default: 7300000 },
      { key: 'allocatedFixedCost', label: 'Allocated Fixed Cost（每期經常性overhead分攤）', unit: 'NT$（每季）', group: '固定投資', tag: 'assumption', note: '團隊人事、辦公室、系統等經常性費用分攤至此產品線的估計，用於Operating Profit計算，與上列一次性投資不同。', editable: true, default: 800000 },

      { key: 'attributedRevenue', label: 'Attributed Revenue（Paid Media歸因營收）', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設Paid Media可歸因約35%的Gross Sales，用於計算ROAS；非真實MMM/歸因模型結果。', editable: true, default: 62790000 },
      { key: 'incrementalRevenue', label: 'Incremental Revenue（行銷帶來的增量營收）', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設扣除自然銷售基期後，行銷投資帶來的增量營收約為Gross Sales的15%，用於ROMI計算。', editable: true, default: 26910000 },
      { key: 'incrementalGrossMarginRate', label: 'Incremental Gross Margin %', unit: '%', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設增量銷售的毛利率與整體毛利率相近。', editable: true, default: 45 },
    ],
  },

  missingInformation: [
    { item: '通路實際簽約margin與各平台個別條件（非加權平均）', why: '目前用單一加權平均28%簡化多通路差異，可能掩蓋單一通路虧損。', confidence: 'Low' },
    { item: '競品實際上市促銷節奏與投入規模', why: '會直接影響Cirrus X1 Pro的share of voice與所需A&P規模。', confidence: 'Low' },
    { item: '實際保固與退貨歷史數據（同集團其他市場）', why: '目前returnRate與otherVariablePerUnit為假設值，需以實際數據校正。', confidence: 'Medium' },
    { item: 'HQ對台灣市場的資源上限與是否有集團採購成本優勢', why: '會影響unitCOGS與可動用的A&P總額。', confidence: 'Low' },
    { item: '消費者對此價格帶的實際支付意願（WTP）研究', why: '目前定價假設未經在地定量調查驗證。', confidence: 'Medium' },
  ],

  decisionQuestions: [
    '核心商業問題是什麼？',
    '哪三個假設最影響結果？',
    '建議採取什麼行動？',
    '如果最關鍵變數惡化，決策是否改變？',
    '如何用三句話向GM或CFO提出建議？',
  ],
  // 參考答案：以Base情境數字為示範計算，非唯一標準答案。建議先寫下自己的答案，再點開比較差異。
  referenceAnswers: [
    '這不是單純的「要不要用NT$29,900上市」的定價題，而是：在品牌於台灣完全沒有知名度、通路要求至少28%margin、且退貨與物流成本都不確定的情況下，能不能用一個「定價＋折扣＋A&P」的組合，同時做到（a）建立長期市佔基礎、（b）不淪為用毛利換銷量的短視操作。核心張力在於：把價格壓低或折扣加深可以更快衝量，但會侵蝕本來就不厚的毛利（Base情境Gross Margin約49.0%）與Operating Margin（Base情境約37.7%）；把價格與毛利守住，則要靠更精準的A&P與通路談判去補銷量，時間風險更高。',
    '1) 首年目標銷量6,000台——這是Claude assumption，沒有實地市調驗證，一旦高估，break-even以外的所有獲利結論都會落空。2) 通路margin是否能長期維持在28%——這是通路關係的核心變數，本案例第六個決策已經預告通路可能要求再加5個百分點，敏感度分析顯示這是影響Operating Profit最大的變數之一。3) 退貨率3%與物流成本假設——大型家電的退貨處理成本經常被低估，一旦上升到6%，會同時侵蝕Net Consumer Sales與Variable Operating Cost兩處，是雙重打擊。',
    '在Base情境的假設下，建議上市，但不要把8%折扣當成常態——把它當成上市期的「流量觸發器」，同時把A&P配置向KOL／PR與paid media傾斜（而非單純加深折扣）。Contribution per Unit（約NT$8,378／台）在28%通路margin下仍為正，Break-even只需約871台，遠低於6,000台目標，代表下行風險可控；但必須同步啟動退貨率與通路實際簽約條件的驗證，因為這兩個假設一旦錯誤，會直接吃掉37.7%的Operating Margin緩衝。',
    '如果通路margin從28%被迫調整到33%（Conservative情境），Operating Profit會明顯壓縮；這時決策應該改變——不是硬撐原定價，而是三選一：(a) 溫和調漲List Price、(b) 下修A&P但保留KOL/PR這類轉換效率較高的項目、(c) 針對margin要求最高的單一通路，考慮縮小合作規模、把資源集中在margin較合理的通路。單純「降價衝量」或「無限加深折扣」都不是好選項，因為那會同時吃掉毛利與Operating Profit兩層緩衝。',
    '第一句（問題）：Cirrus X1 Pro在台灣的上市決策，核心風險不是定價本身，而是通路margin與實際銷量兩個尚未驗證的假設。第二句（建議）：在通路margin維持28%的前提下，建議以NT$29,900、8%上市折扣執行，Break-even僅約871台，相對6,000台目標有安全邊際，可以上市。第三句（但書）：但若通路margin被迫上修至33%或退貨率超過6%，需要重新檢視定價與A&P配置，而非直接吸收在Operating Profit上——建議一個月內完成通路合約與退貨數據驗證，作為正式拍板前的checkpoint。',
  ],

  scenarios: {
    conservative: {
      label: 'Conservative', labelZh: '保守情境',
      desc: '通路要求更高margin、消費者需要更深折扣才願意買單，銷量成長較慢。',
      overrides: { units: 4000, discountRate: 12, channelMarginRate: 33, paidMedia: 2400000, kolPR: 1440000 },
    },
    base: {
      label: 'Base', labelZh: '基準情境',
      desc: '依目前上市計畫的假設執行。',
      overrides: {},
    },
    aggressive: {
      label: 'Aggressive', labelZh: '積極情境',
      desc: '加碼A&P搶市佔，通路關係穩定在28%，銷量顯著提升。',
      overrides: { units: 9000, discountRate: 5, paidMedia: 3900000, kolPR: 2340000, tradeMarketing: 1560000 },
    },
  },

  sources: [
    {
      title: '（本案例未使用付費HBP案例全文）',
      publisher: 'Business Decision Lab（Claude assumption）',
      url: '',
      pubDate: '',
      accessDate: '2026-08-18',
      dataPoint: '案例架構參考一般GTM launch與premium home appliance定價／通路訓練主題自建，數字為Claude assumption，非真實市場調查或財報數字。',
      tag: 'assumption',
    },
  ],
});

/* -------------------------------------------------------------------------
 * CASE 2–6（骨架 / 尚未建立完整內容）
 * 依規格「先建立六個產業分類」的要求，以下五個產業先建立Case Identity骨架，
 * 標示為 comingSoon，於Case Library中會以「尚未開放」狀態呈現，不會誤導為
 * 可操作的完整案例。下一輪迭代將依相同標準逐一補完 B–F 區塊與財務引擎欄位。
 * ---------------------------------------------------------------------- */
const COMING_SOON_META = [
  { id: 'alcohol-001', industry: 'alcohol-spirits', title: '高階威士忌台灣通路擴張決策', mainSkill: 'Channel Economics & Premiumization' },
  { id: 'vision-001', industry: 'vision-care', title: '新型日拋隱形眼鏡通路教育投資決策', mainSkill: 'B2B2C Trial Conversion' },
  { id: 'fmcg-001', industry: 'fmcg', title: '機能飲料通路促銷與cannibalization決策', mainSkill: 'Trade Promotion & Gross-to-Net' },
  { id: 'ecom-001', industry: 'ecommerce-marketplace', title: '電商平台免運補貼與獲客效率決策', mainSkill: 'Contribution Margin & CAC' },
  { id: 'saas-001', industry: 'saas-subscription', title: 'SaaS免費試用轉換與CAC回收期決策', mainSkill: 'CAC, LTV & Payback Period' },
];

COMING_SOON_META.forEach((meta) => {
  CASES.push({
    id: meta.id,
    title: meta.title,
    industry: meta.industry,
    difficulty: 'TBD',
    mainSkill: meta.mainSkill,
    secondarySkills: [],
    version: 'v0.0-draft',
    createdDate: '2026-08-18',
    updatedDate: '2026-08-18',
    status: 'Private',
    origin: 'Original',
    comingSoon: true,
  });
});

function getCaseById(id) { return CASES.find((c) => c.id === id); }
function getCasesByIndustry(industryId) { return CASES.filter((c) => c.industry === industryId); }
function getIndustry(id) { return INDUSTRIES.find((i) => i.id === id); }
