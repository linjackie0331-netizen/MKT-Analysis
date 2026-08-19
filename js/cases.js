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

// 每個case的Decision Questions固定用同一組五題（規格第八節F區塊的通用模板）
const STANDARD_DECISION_QUESTIONS = [
  '核心商業問題是什麼？',
  '哪三個假設最影響結果？',
  '建議採取什麼行動？',
  '如果最關鍵變數惡化，決策是否改變？',
  '如何用三句話向GM或CFO提出建議？',
];

/* -------------------------------------------------------------------------
 * CASE 2：高階威士忌台灣通路擴張決策 — Alcohol / Spirits
 * ---------------------------------------------------------------------- */
CASES.push({
  id: 'alcohol-001',
  title: '高階威士忌台灣通路擴張決策',
  titleEn: 'Glenmere Single Malt — On-Trade Expansion Decision',
  industry: 'alcohol-spirits',
  difficulty: 'Advanced',
  mainSkill: 'Channel Economics & Premiumization',
  secondarySkills: ['Excise Tax Treatment', 'Sponsorship ROI', 'Volume vs. Price Mix'],
  version: 'v1.0',
  createdDate: '2026-08-19',
  updatedDate: '2026-08-19',
  status: 'Public',
  origin: 'Original',
  originNote: '本模擬案例僅參考公開市場常識與產業一般結構，並非Harvard Business Publishing原始案例的重製或摘要，亦非任何真實公司之機密資料。',
  background: {
    companyProfile: 'Glenmere Distillery 是一家虛構的蘇格蘭風格單一麥芽威士忌品牌，由台灣總代理獨家進口，目前以off-trade（量販、超市、電商）為主要銷售通路，尚未系統性經營on-trade（餐廳、酒吧）通路。',
    productService: 'Glenmere 12 Year：700ml單一麥芽威士忌，定位中高階威士忌品飲市場。',
    marketSituation: '台灣威士忌市場近年品飲文化興起，餐酒搭配與威士忌吧數量成長，消費者對「故事性」與「稀缺性」的premium品牌有較高的付費意願，但on-trade通路的鋪貨與教育成本遠高於off-trade。',
    customer: '35–55歲、有品飲習慣、願意在餐廳／酒吧點單杯威士忌或收藏整瓶的中高收入消費者。',
    competitors: '市場上已有多個國際威士忌品牌長期經營on-trade關係，部分品牌有專屬品牌大使（brand ambassador）進駐重點酒吧。',
    channelStructure: '現有：量販／超市／電商（off-trade）＋少量餐飲通路。規劃擴張：簽約重點城市of 50–80家餐廳／酒吧（on-trade），並搭配品飲活動與侍酒師培訓。',
    strategicChallenge: 'On-trade通路能建立品牌形象與長期溢價能力，但margin結構更複雜（含菸酒稅、on-trade通路的高margin要求、以及品飲贊助的沉沒成本），短期投資報酬不如off-trade直接。',
  },
  managementDecision: '品牌是否應該將明年度的成長重心從off-trade轉向on-trade通路，並加碼品飲贊助與KOL試飲，以建立更高的品牌溢價與長期定價權？',
  decisionSubQuestions: [
    '是否應以NT$2,480的單瓶建議售價維持現有定位？',
    '是否應在通路開瓶活動期提供10%折扣？',
    '通路（含on-trade）加權margin達35%時，是否仍可獲利？',
    '品飲贊助與試飲（sampling）預算應投入多少才合理？',
    '需要達到多少銷量才能break-even？',
    '如果主力on-trade通路要求margin再提高5個百分點，應該調漲價格、縮減贊助預算，還是把資源集中在margin較低的off-trade通路？',
  ],
  financialInputs: {
    currency: 'TWD',
    fields: [
      { key: 'listPrice', label: '建議售價 List Price（每瓶700ml）', unit: 'NT$/瓶', group: '定價與銷量', tag: 'assumption', note: '對標市場中高階單一麥芽威士忌的定價帶所設之假設。', editable: true, default: 2480 },
      { key: 'units', label: '首年目標銷量 Units', unit: '瓶', group: '定價與銷量', tag: 'assumption', note: 'off-trade現有基礎加上on-trade新增鋪貨的合理估計，非真實市調數字。', editable: true, default: 15000 },
      { key: 'discountRate', label: '開瓶活動折扣 Discount Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: '新通路開瓶期的消費者／通路促銷折扣假設。', editable: true, default: 10 },
      { key: 'returnRate', label: '報廢／退貨率 Return Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: '酒類退貨率通常低，但需考慮破損與長期庫存報廢。', editable: true, default: 1 },
      { key: 'channelMarginRate', label: '通路 Margin Rate（off-trade＋on-trade加權）', unit: '%', group: '通路經濟', tag: 'assumption', note: 'on-trade通路（餐廳／酒吧）要求的margin通常高於off-trade，此為加權平均假設。', editable: true, default: 35 },
      { key: 'rebateRate', label: 'Rebate Rate（通路年度回饋）', unit: '%（以Net Consumer Sales計）', group: '通路經濟', tag: 'assumption', note: '假設給重點通路的年度達標回饋。', editable: true, default: 3 },
      { key: 'unitCOGS', label: '單瓶進口成本 Unit COGS（含關稅）', unit: 'NT$/瓶', group: '成本結構', tag: 'assumption', note: '含國外採購成本與進口關稅，不含菸酒稅（菸酒稅另計於Other Variable Cost）。', editable: true, default: 650 },
      { key: 'logisticsPerUnit', label: '倉儲物流成本', unit: 'NT$/瓶', group: '成本結構', tag: 'assumption', note: '酒類需符合特定倉儲條件，成本略高於一般消費品。', editable: true, default: 40 },
      { key: 'otherVariablePerUnit', label: '菸酒稅＋推廣費（Other Variable Cost）', unit: 'NT$/瓶', group: '成本結構', tag: 'assumption', note: '⚠️ 產業特殊性：台灣菸酒稅按量課徵、隨每瓶銷售同步發生，屬於變動成本而非固定費用，因此計入Variable Cost而非COGS，此為酒類產業特有的accounting treatment，與家電／FMCG不同。', editable: true, default: 185 },
      { key: 'paidMedia', label: 'Paid Media', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '數位廣告與品牌內容投放假設。', editable: true, default: 800000 },
      { key: 'kolPR', label: 'KOL／PR（侍酒師與品飲意見領袖）', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '威士忌品飲圈意見領袖合作預算假設。', editable: true, default: 600000 },
      { key: 'creativeProduction', label: 'Creative Production', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '品牌形象素材製作預算假設。', editable: true, default: 300000 },
      { key: 'sponsorship', label: 'Sponsorship（品飲活動／餐酒會）', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '酒類品牌常見的體驗式行銷投資假設。', editable: true, default: 700000 },
      { key: 'otherBrandInvestment', label: 'Other Brand Investment', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '公關與其他品牌活動預算假設。', editable: true, default: 200000 },
      { key: 'tradeMarketing', label: 'Trade Marketing（on-trade試飲／POSM）', unit: 'NT$（年度）', group: '通路投資', tag: 'assumption', note: '給on-trade通路的試飲活動、店頭陳列與侍酒師培訓資源，與品牌端A&P分開計算——這正是本案例核心決策的投資項目。', editable: true, default: 900000 },
      { key: 'fixedLaunchInvestment', label: 'Fixed Launch Investment（一次性on-trade擴張投資）', unit: 'NT$', group: '固定投資', tag: 'assumption', note: '⚠️ 定義：break-even計算專用的一次性投資，預設＝Total A&P＋Trade Marketing（3,500,000）。', editable: true, default: 3500000 },
      { key: 'allocatedFixedCost', label: 'Allocated Fixed Cost（每期經常性overhead分攤）', unit: 'NT$（每季）', group: '固定投資', tag: 'assumption', note: '團隊與代理商營運費用分攤估計。', editable: true, default: 500000 },
      { key: 'attributedRevenue', label: 'Attributed Revenue（Paid Media歸因營收）', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設Paid Media可歸因約30%的Gross Sales。', editable: true, default: 11160000 },
      { key: 'incrementalRevenue', label: 'Incremental Revenue', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設行銷投資帶來的增量營收約為Gross Sales的15%。', editable: true, default: 5580000 },
      { key: 'incrementalGrossMarginRate', label: 'Incremental Gross Margin %', unit: '%', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設增量銷售的毛利率與整體毛利率相近。', editable: true, default: 45 },
    ],
  },
  missingInformation: [
    { item: '實際on-trade通路（酒吧／餐廳）的簽約margin與帳期條件', why: '目前用單一加權平均35%簡化off-trade與on-trade的差異，可能低估on-trade的真實成本。', confidence: 'Low' },
    { item: '菸酒稅未來調整與進口關稅稅率變動風險', why: '菸酒稅是每瓶課徵的變動成本，稅率調整會直接影響Contribution per Unit。', confidence: 'Low' },
    { item: '競品在同價格帶的贊助與KOL投入規模', why: '會直接影響本案sponsorship與KOL預算是否具競爭力。', confidence: 'Low' },
    { item: '消費者在此價格帶的品牌忠誠度與轉換意願市場研究', why: '目前定價與銷量假設未經在地定量調查驗證。', confidence: 'Medium' },
    { item: '集團在其他市場的on-trade擴張經驗數據', why: '可作為此次台灣擴張投資報酬率的參考benchmark。', confidence: 'Medium' },
  ],
  decisionQuestions: STANDARD_DECISION_QUESTIONS,
  referenceAnswers: [
    '核心商業問題不是「要不要賣威士忌」，而是「要不要把成長引擎從穩定但天花板較低的off-trade，換成投資更重、但能建立長期定價權的on-trade」。這個決策的張力在於：on-trade的品飲贊助與試飲屬於沉沒成本（NT$900,000的Trade Marketing一旦投入不會回收），而off-trade擴張的邊際投資遠低於此。',
    '1) 首年15,000瓶的銷量假設，其中on-trade貢獻多少沒有市調驗證。2) 通路加權margin35%是否真實反映on-trade的較高要求——如果on-trade實際要求45%以上，加權平均會被嚴重低估。3) 菸酒稅與關稅是否穩定——這是變動成本裡唯一政策風險較高的一項。',
    '在Base情境下建議執行on-trade擴張：Break-even約7,093瓶，相對15,000瓶目標仍有約53%的安全邊際，Operating Margin約16.6%，代表即使on-trade投資有一定沉沒成本，整體結構仍然健康；但建議先以年度合約而非一次性贊助的方式簽訂重點酒吧，保留調整彈性。',
    '如果on-trade通路margin被迫上修到40%以上（本案例第六個決策的情境），不應該無限加碼贊助去換取更多曝光——應該優先考慮溫和調漲售價（威士忌消費者對高單價品項的價格敏感度通常低於平價消費品），同時把試飲資源集中在轉換率最高的少數指標酒吧，而不是平均分散。',
    '第一句（問題）：Glenmere在on-trade的擴張，核心風險是通路margin被低估、以及品飲贊助屬於沉沒成本。第二句（建議）：在Base假設下，Break-even僅需約7,093瓶，相對15,000瓶目標有安全邊際，建議執行，但採年約而非一次性贊助。第三句（但書）：若實際on-trade margin超過40%，建議優先調價而非砍贊助，因為砍贊助會直接損及尚未建立的品牌關係。',
  ],
  scenarios: {
    conservative: { label: 'Conservative', labelZh: '保守情境', desc: 'on-trade通路要求更高margin，開瓶折扣需要更深，A&P與贊助投入縮減。',
      overrides: { units: 10000, discountRate: 15, channelMarginRate: 40, paidMedia: 640000, kolPR: 480000 } },
    base: { label: 'Base', labelZh: '基準情境', desc: '依目前擴張計畫的假設執行。', overrides: {} },
    aggressive: { label: 'Aggressive', labelZh: '積極情境', desc: '加碼贊助與試飲搶佔on-trade市佔，開瓶折扣可以收斂。',
      overrides: { units: 20000, discountRate: 6, paidMedia: 1040000, sponsorship: 910000, tradeMarketing: 1080000 } },
  },
  sources: [{ title: '（本案例未使用付費HBP案例全文）', publisher: 'Business Decision Lab（Claude assumption）', url: '', pubDate: '', accessDate: '2026-08-19', dataPoint: '案例架構參考一般酒類on-trade／off-trade通路訓練主題自建，數字為Claude assumption，非真實市場調查或財報數字。', tag: 'assumption' }],
});

/* -------------------------------------------------------------------------
 * CASE 3：新型日拋隱形眼鏡通路教育投資決策 — Vision Care / Medical Consumer
 * ---------------------------------------------------------------------- */
CASES.push({
  id: 'vision-001',
  title: '新型日拋隱形眼鏡通路教育投資決策',
  titleEn: 'ClearDay Daily Lens — Channel Education Investment Decision',
  industry: 'vision-care',
  difficulty: 'Advanced',
  mainSkill: 'B2B2C Trial Conversion',
  secondarySkills: ['Distributor & Optical Shop Margin', 'Repeat Purchase Economics', 'Regulatory Constraints'],
  version: 'v1.0',
  createdDate: '2026-08-19',
  updatedDate: '2026-08-19',
  status: 'Public',
  origin: 'Original',
  originNote: '本模擬案例僅參考公開市場常識與產業一般結構，並非Harvard Business Publishing原始案例的重製或摘要，亦非任何真實公司之機密資料。',
  background: {
    companyProfile: 'ClearDay 是一家虛構的隱形眼鏡品牌，主力產品為日拋型隱形眼鏡，透過全台驗光所與眼鏡行通路銷售，屬於醫療器材類消費品（B2B2C模式）。',
    productService: 'ClearDay Daily：日拋型隱形眼鏡，每盒30片，訴求高含水量與配戴舒適度。',
    marketSituation: '隱形眼鏡的購買高度依賴驗光師／眼鏡行的專業推薦，消費者較少主動指名品牌；日拋產品的回購率是獲利關鍵，但首次處方轉換率取決於通路第一線人員是否願意主動推薦。',
    customer: '18–40歲、有配戴隱形眼鏡需求、重視舒適度與方便性的消費者，多數透過驗光所或眼鏡行完成首次購買。',
    competitors: '市場上已有多個國際品牌長期經營驗光所關係，部分品牌設有專屬教育訓練團隊定期拜訪通路。',
    channelStructure: '通路組合：全台約1,200家驗光所／眼鏡行，透過區域代理商鋪貨；消費者回購可透過通路現場或品牌官網訂閱。',
    strategicChallenge: 'ClearDay需要決定：是否把行銷預算重心從消費者廣告轉向「通路教育投資」（驗光師專業訓練與試戴計畫），來提高第一線的主動推薦意願與處方轉換率，即使這會壓縮短期的消費者端聲量。',
  },
  managementDecision: 'ClearDay是否應該把明年度行銷預算重心從消費者廣告轉向通路教育投資（驗光師訓練與試戴計畫），以提高處方轉換率與長期回購率？',
  decisionSubQuestions: [
    '是否應以NT$990的單盒（30片）建議售價維持現有定位？',
    '是否應提供15%的首購試戴優惠折扣？',
    '通路（驗光所／眼鏡行）加權margin達40%時，是否仍可獲利？',
    '通路教育投資（訓練與試戴品供應）應投入多少才合理？',
    '需要達到多少銷量才能break-even？',
    '如果主力通路要求margin再提高5個百分點，應該調漲價格、縮減教育投資，還是把資源集中在願意主動推薦的通路？',
  ],
  financialInputs: {
    currency: 'TWD',
    fields: [
      { key: 'listPrice', label: '建議售價 List Price（每盒30片）', unit: 'NT$/盒', group: '定價與銷量', tag: 'assumption', note: '對標市場日拋型隱形眼鏡的定價帶所設之假設。', editable: true, default: 990 },
      { key: 'units', label: '首年目標銷售盒數 Units', unit: '盒', group: '定價與銷量', tag: 'assumption', note: '涵蓋首購與回購的合理估計，非真實市調數字。', editable: true, default: 40000 },
      { key: 'discountRate', label: '首購試戴優惠 Discount Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: '促成第一次處方轉換所需的折扣深度假設，通常深於一般消費品因為要克服「换品牌」的心理門檻。', editable: true, default: 15 },
      { key: 'returnRate', label: '退換貨率 Return Rate（度數不合／過敏）', unit: '%', group: '定價與銷量', tag: 'assumption', note: '隱形眼鏡因個人適配問題產生的退換貨率假設。', editable: true, default: 2 },
      { key: 'channelMarginRate', label: '通路 Margin Rate（驗光所／眼鏡行）', unit: '%', group: '通路經濟', tag: 'assumption', note: '醫療器材類通路margin通常高於一般消費品，反映專業服務與陳列成本。', editable: true, default: 40 },
      { key: 'rebateRate', label: 'Rebate Rate（通路年度回饋）', unit: '%（以Net Consumer Sales計）', group: '通路經濟', tag: 'assumption', note: '假設給主要通路夥伴的年度達標回饋。', editable: true, default: 2 },
      { key: 'unitCOGS', label: '每盒生產成本 Unit COGS', unit: 'NT$/盒', group: '成本結構', tag: 'assumption', note: '含原料與代工生產成本估計。', editable: true, default: 280 },
      { key: 'logisticsPerUnit', label: '物流成本（含醫材規範之冷鏈／保存要求）', unit: 'NT$/盒', group: '成本結構', tag: 'assumption', note: '醫療器材配送需符合特定保存條件，成本略高於一般消費品。', editable: true, default: 15 },
      { key: 'otherVariablePerUnit', label: '其他變動成本（法規／品保／客服）', unit: 'NT$/盒', group: '成本結構', tag: 'assumption', note: '⚠️ 產業特殊性：隱形眼鏡屬醫療器材，需負擔法規合規、不良品通報與品保成本，與一般消費品不同。', editable: true, default: 25 },
      { key: 'paidMedia', label: 'Paid Media', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '消費者端數位廣告預算假設。', editable: true, default: 1200000 },
      { key: 'kolPR', label: 'KOL／PR（含視光專業意見領袖）', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '含一般消費型KOL與視光專業人士的合作預算假設。', editable: true, default: 500000 },
      { key: 'creativeProduction', label: 'Creative Production', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '品牌與產品素材製作預算假設。', editable: true, default: 300000 },
      { key: 'sponsorship', label: 'Sponsorship（驗光師教育研討會）', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '專業教育活動贊助預算假設。', editable: true, default: 400000 },
      { key: 'otherBrandInvestment', label: 'Other Brand Investment', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '其他品牌活動預算假設。', editable: true, default: 200000 },
      { key: 'tradeMarketing', label: 'Trade Marketing（通路教育訓練＋試戴品供應）', unit: 'NT$（年度）', group: '通路投資', tag: 'assumption', note: '本案例核心決策：投資驗光師專業訓練與消費者試戴品供應，目的是提高主動推薦意願，與品牌端A&P分開計算。', editable: true, default: 1500000 },
      { key: 'fixedLaunchInvestment', label: 'Fixed Launch Investment（一次性通路教育投資）', unit: 'NT$', group: '固定投資', tag: 'assumption', note: '⚠️ 定義：break-even計算專用的一次性投資，預設＝Total A&P＋Trade Marketing（4,100,000）。', editable: true, default: 4100000 },
      { key: 'allocatedFixedCost', label: 'Allocated Fixed Cost（每期經常性overhead分攤）', unit: 'NT$（每季）', group: '固定投資', tag: 'assumption', note: '團隊與法規合規維護費用分攤估計。', editable: true, default: 450000 },
      { key: 'attributedRevenue', label: 'Attributed Revenue（Paid Media歸因營收）', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設Paid Media可歸因約35%的Gross Sales。', editable: true, default: 13860000 },
      { key: 'incrementalRevenue', label: 'Incremental Revenue', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設行銷與通路教育投資帶來的增量營收約為Gross Sales的18%，日拋回購模式使增量效果更需要嚴謹估計。', editable: true, default: 7128000 },
      { key: 'incrementalGrossMarginRate', label: 'Incremental Gross Margin %', unit: '%', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設增量銷售的毛利率與整體毛利率相近。', editable: true, default: 55 },
    ],
  },
  missingInformation: [
    { item: '通路教育訓練實際能提升多少處方轉換率', why: '目前incrementalRevenue假設（18%）沒有前導試點數據支持，是本案例最大的不確定性。', confidence: 'Low' },
    { item: '消費者實際回購率與換品牌意願', why: '日拋產品的長期獲利高度依賴回購，目前銷量假設未拆分首購與回購比例。', confidence: 'Low' },
    { item: '主要驗光所通路的實際簽約margin與獨家條件', why: '目前用單一加權平均40%簡化，可能掩蓋個別通路的差異。', confidence: 'Medium' },
    { item: '法規（醫療器材許可）變動風險', why: '會直接影響otherVariablePerUnit的合規成本假設。', confidence: 'Medium' },
    { item: '競品在通路教育投資上的實際規模', why: '會影響本案tradeMarketing預算是否具競爭力。', confidence: 'Low' },
  ],
  decisionQuestions: STANDARD_DECISION_QUESTIONS,
  referenceAnswers: [
    '核心商業問題是：在一個「消費者很少主動指名品牌、購買決策掌握在驗光師手上」的B2B2C市場，行銷預算該花在消費者端（建立品牌知名度）還是通路端（提高第一線主動推薦意願）？這不是預算多寡的問題，而是「說服誰」的問題。',
    '1) 通路教育訓練能提升多少處方轉換率——這是完全沒有數據支持的假設，卻是本案例18% incremental revenue估計的基礎。2) 首購與回購的銷量結構——如果40,000盒大多是首購而非回購，代表獲客成本效率遠低於預期。3) 通路加權margin 40%是否準確反映不同規模驗光所的差異。',
    '在Base情境下，Operating Margin僅約9.0%、Break-even占目標量高達約65%，屬於邊際但可行的投資。建議先以小規模試點（例如50家指標驗光所）驗證通路教育訓練對轉換率的實際提升幅度，取得數據後再決定是否全面擴大投資，而不是一次性投入全年預算。',
    '如果試點結果顯示通路教育訓練對轉換率的提升低於預期（即incremental revenue遠低於18%），應該立即改變決策——薄利的財務結構（Operating Margin僅9.0%）承受不起一個效果不確定的長期投資，此時應該縮小教育投資規模，把資源集中在少數已展現高轉換率的通路，而非平均分散。',
    '第一句（問題）：ClearDay的通路教育投資決策，核心風險是「教育訓練能否真正提升轉換率」完全沒有數據驗證，而財務結構本身偏薄（Operating Margin約9%）。第二句（建議）：建議先以50家指標驗光所進行3個月試點，用實際轉換率數據取代目前的假設。第三句（但書）：若試點轉換率提升低於預期，應立即縮小教育投資規模，因為目前的財務緩衝無法承受一個效果不確定的長期投資。',
  ],
  scenarios: {
    conservative: { label: 'Conservative', labelZh: '保守情境', desc: '通路要求更高margin，首購折扣需要更深，教育投資效果不如預期。',
      overrides: { units: 28000, discountRate: 20, channelMarginRate: 45, tradeMarketing: 1050000 } },
    base: { label: 'Base', labelZh: '基準情境', desc: '依目前通路教育投資計畫的假設執行。', overrides: {} },
    aggressive: { label: 'Aggressive', labelZh: '積極情境', desc: '通路教育投資效果優於預期，回購率提升帶動銷量成長。',
      overrides: { units: 55000, discountRate: 10, tradeMarketing: 1950000, paidMedia: 900000 } },
  },
  sources: [{ title: '（本案例未使用付費HBP案例全文）', publisher: 'Business Decision Lab（Claude assumption）', url: '', pubDate: '', accessDate: '2026-08-19', dataPoint: '案例架構參考一般B2B2C視光產品通路教育訓練主題自建，數字為Claude assumption，非真實市場調查或財報數字。', tag: 'assumption' }],
});

/* -------------------------------------------------------------------------
 * CASE 4：機能飲料通路促銷與cannibalization決策 — FMCG
 * ---------------------------------------------------------------------- */
CASES.push({
  id: 'fmcg-001',
  title: '機能飲料通路促銷與cannibalization決策',
  titleEn: 'Vitalis Functional Beverage — Trade Promotion & Cannibalization Decision',
  industry: 'fmcg',
  difficulty: 'Advanced',
  mainSkill: 'Trade Promotion & Gross-to-Net',
  secondarySkills: ['Cannibalization Risk', 'Listing Fee Economics', 'Distribution Expansion'],
  version: 'v1.0',
  createdDate: '2026-08-19',
  updatedDate: '2026-08-19',
  status: 'Public',
  origin: 'Original',
  originNote: '本模擬案例僅參考公開市場常識與產業一般結構，並非Harvard Business Publishing原始案例的重製或摘要，亦非任何真實公司之機密資料。',
  background: {
    companyProfile: 'Vitalis 是一家虛構的機能飲料品牌，現有主力產品線已在便利商店與量販通路穩定銷售，正評估推出新口味SKU搭配深度通路促銷來搶市佔。',
    productService: 'Vitalis 新口味機能飲料：24入裝箱規格，訴求機能訴求（如電解質補充）與新口味差異化。',
    marketSituation: '機能飲料市場競爭激烈，現代通路（超商／超市／量販）的listing fee與端架陳列費用是進入市場的必要成本，新SKU上市常伴隨對既有產品線的cannibalization風險。',
    customer: '20–40歲、有運動或提神需求、習慣在超商購買機能飲料的消費者。',
    competitors: '市場上已有多個機能飲料品牌透過密集促銷檔期（買一送一、第二件6折）搶佔貨架與消費者心佔率。',
    channelStructure: '通路組合：全家型連鎖超商＋量販／超市，需支付上架費（listing fee）並配合檔期促銷。',
    strategicChallenge: 'Vitalis需要決定：是否推出新口味SKU並搭配深度通路促銷來搶市佔，即使這可能吃掉既有主力產品的銷量（cannibalization），而非帶來真正的增量成長。',
  },
  managementDecision: 'Vitalis是否應該推出新口味SKU並投入深度通路促銷來搶佔市佔，即使可能cannibalize現有主力產品的銷量？',
  decisionSubQuestions: [
    '是否應以NT$600（24入裝）的建議零售總價維持現有定位？',
    '是否應提供12%的通路促銷折扣（買二送一等形式換算）？',
    '現代通路加權margin達32%時，是否仍可獲利？',
    '上架費與端架陳列等trade marketing應投入多少才合理？',
    '需要達到多少銷量才能break-even？',
    '如果主力通路要求margin再提高5個百分點，應該調漲價格、縮減促銷深度，還是集中資源在願意給更好陳列位置的通路？',
  ],
  financialInputs: {
    currency: 'TWD',
    fields: [
      { key: 'listPrice', label: '建議零售總價 List Price（24入裝，每瓶NT$25）', unit: 'NT$/箱', group: '定價與銷量', tag: 'assumption', note: '以「箱」為銷售單位換算的消費者端零售總值假設。', editable: true, default: 600 },
      { key: 'units', label: '首年目標銷售箱數 Units', unit: '箱', group: '定價與銷量', tag: 'assumption', note: '新SKU的鋪貨與銷售目標估計，尚未扣除對既有產品線的cannibalization。', editable: true, default: 200000 },
      { key: 'discountRate', label: '通路促銷折扣 Discount Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: '買二送一／箱購優惠等促銷形式換算之消費者端折扣率。', editable: true, default: 12 },
      { key: 'returnRate', label: '退貨／過期損耗率 Return Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: '飲料類商品的通路退貨與效期損耗假設。', editable: true, default: 2 },
      { key: 'channelMarginRate', label: '通路 Margin Rate（超商／超市／量販加權）', unit: '%', group: '通路經濟', tag: 'assumption', note: '現代通路的加權平均margin假設。', editable: true, default: 32 },
      { key: 'rebateRate', label: 'Rebate Rate（通路年度回饋）', unit: '%（以Net Consumer Sales計）', group: '通路經濟', tag: 'assumption', note: 'FMCG常見的年度達標／成長回饋，比例通常高於其他產業。', editable: true, default: 4 },
      { key: 'unitCOGS', label: '每箱生產成本 Unit COGS', unit: 'NT$/箱', group: '成本結構', tag: 'assumption', note: '含原料、包材與代工成本估計。', editable: true, default: 220 },
      { key: 'logisticsPerUnit', label: '物流倉儲成本', unit: 'NT$/箱', group: '成本結構', tag: 'assumption', note: '飲料類商品體積大、配送頻次高，物流成本佔比相對明顯。', editable: true, default: 18 },
      { key: 'otherVariablePerUnit', label: '其他變動成本（品保／包材耗損）', unit: 'NT$/箱', group: '成本結構', tag: 'assumption', note: '品質保證與包材耗損估計。', editable: true, default: 8 },
      { key: 'paidMedia', label: 'Paid Media', unit: 'NT$（上市年度）', group: 'A&P投資', tag: 'assumption', note: '數位廣告投放預算假設。', editable: true, default: 2500000 },
      { key: 'kolPR', label: 'KOL／PR', unit: 'NT$（上市年度）', group: 'A&P投資', tag: 'assumption', note: '社群與生活風格KOL合作預算假設。', editable: true, default: 900000 },
      { key: 'creativeProduction', label: 'Creative Production', unit: 'NT$（上市年度）', group: 'A&P投資', tag: 'assumption', note: '新口味包裝與素材製作預算假設。', editable: true, default: 500000 },
      { key: 'sponsorship', label: 'Sponsorship（運動／健康活動）', unit: 'NT$（上市年度）', group: 'A&P投資', tag: 'assumption', note: '機能訴求相關活動贊助預算假設。', editable: true, default: 600000 },
      { key: 'otherBrandInvestment', label: 'Other Brand Investment', unit: 'NT$（上市年度）', group: 'A&P投資', tag: 'assumption', note: '其他品牌活動預算假設。', editable: true, default: 300000 },
      { key: 'tradeMarketing', label: 'Trade Marketing（上架費＋端架陳列＋買贈促銷）', unit: 'NT$（上市年度）', group: '通路投資', tag: 'assumption', note: '現代通路的listing fee與陳列資源通常是FMCG新品上市最大的單一支出項目，與品牌端A&P分開計算。', editable: true, default: 3500000 },
      { key: 'fixedLaunchInvestment', label: 'Fixed Launch Investment（一次性上市投資）', unit: 'NT$', group: '固定投資', tag: 'assumption', note: '⚠️ 定義：break-even計算專用的一次性投資，預設＝Total A&P＋Trade Marketing（8,300,000）。', editable: true, default: 8300000 },
      { key: 'allocatedFixedCost', label: 'Allocated Fixed Cost（每期經常性overhead分攤）', unit: 'NT$（每季）', group: '固定投資', tag: 'assumption', note: '團隊與供應鏈管理費用分攤估計。', editable: true, default: 700000 },
      { key: 'attributedRevenue', label: 'Attributed Revenue（Paid Media歸因營收）', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設Paid Media可歸因約30%的Gross Sales。', editable: true, default: 36000000 },
      { key: 'incrementalRevenue', label: 'Incremental Revenue（已扣除cannibalization估計）', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '⚠️ 關鍵假設：機能飲料新口味上市常見cannibalize既有產品線，此數字已假設扣除對既有SKU的排擠效果，估計約為Gross Sales的8%（遠低於一般未扣除cannibalization的estimate），使用前應以實際銷售數據驗證真實增量比例。', editable: true, default: 9600000 },
      { key: 'incrementalGrossMarginRate', label: 'Incremental Gross Margin %', unit: '%', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設增量銷售的毛利率與整體毛利率相近。', editable: true, default: 40 },
    ],
  },
  missingInformation: [
    { item: '新SKU對既有主力產品線的真實cannibalization比例', why: '目前incrementalRevenue已假設扣除cannibalization，但扣除比例本身沒有數據支持，是本案例最大的不確定性。', confidence: 'Low' },
    { item: '主要通路的實際listing fee與陳列合約條件', why: '目前tradeMarketing為整體估計，未拆分個別通路的實際報價。', confidence: 'Low' },
    { item: '促銷檔期結束後的銷量回落幅度', why: '促銷帶動的銷量成長是否可持續，會直接影響長期獲利假設。', confidence: 'Medium' },
    { item: '競品對本次新品上市的促銷反應', why: '若競品同步加碼促銷，可能侵蝕本案的市佔目標與毛利率假設。', confidence: 'Low' },
    { item: '原物料成本波動風險（影響unitCOGS）', why: '飲料類原料成本波動可能直接壓縮Contribution per Unit。', confidence: 'Medium' },
  ],
  decisionQuestions: STANDARD_DECISION_QUESTIONS,
  referenceAnswers: [
    '核心商業問題不是「新口味能不能賣」，而是「這200,000箱的銷量成長，有多少是真正從競品或新消費場景搶來的增量，又有多少只是把既有主力產品的消費者轉移過來」。如果大部分是cannibalization，那麼深度通路促銷等於是用毛利率（本案僅33.4%）去換一場左手打右手的內部競爭。',
    '1) cannibalization比例——incrementalRevenue假設已扣除排擠效果，但扣除多少完全是假設，這是最大的不確定性。2) 促銷檔期結束後的銷量能否維持——如果銷量隨促銷結束而回落，代表這只是需求的時間轉移而非真正成長。3) 通路加權margin 32%是否穩定——FMCG的listing fee與margin要求常隨檔期浮動。',
    '在Base情境下，Break-even約98,530箱，僅為200,000箱目標的49%，安全邊際尚可，且Operating Margin約11.9%屬FMCG合理水準。建議執行，但要求行銷團隊在上市後第一季，用sell-through數據（而非出貨數據）拆分「新增消費者」與「既有產品線轉移」的比例，作為是否延續深度促銷的checkpoint。',
    '如果第一季數據顯示cannibalization比例遠高於假設（例如超過一半的新品銷量來自既有產品線流失），決策應該改變——這時應該立即縮減trade marketing促銷深度，把資源轉向真正差異化的消費場景（例如運動情境），而不是繼續用促銷去衝一個左手打右手的銷量數字。',
    '第一句（問題）：Vitalis新口味上市的核心風險，不是能否達成銷量目標，而是這個銷量有多少是cannibalize既有產品線而非真正增量。第二句（建議）：在Base假設下Break-even僅需約49%的目標量，財務結構可以支撐上市，建議執行。第三句（但書）：但要求上市後第一季用sell-through數據驗證真實cannibalization比例，若超過假設水準，需立即縮減促銷深度並轉向差異化消費場景。',
  ],
  scenarios: {
    conservative: { label: 'Conservative', labelZh: '保守情境', desc: '通路要求更高margin與促銷深度，cannibalization比實際假設更嚴重。',
      overrides: { units: 130000, discountRate: 18, channelMarginRate: 38, incrementalRevenue: 4800000 } },
    base: { label: 'Base', labelZh: '基準情境', desc: '依目前新品上市計畫的假設執行。', overrides: {} },
    aggressive: { label: 'Aggressive', labelZh: '積極情境', desc: '新口味帶來真正增量消費場景，cannibalization低於預期。',
      overrides: { units: 280000, discountRate: 8, tradeMarketing: 4200000, incrementalRevenue: 16800000 } },
  },
  sources: [{ title: '（本案例未使用付費HBP案例全文）', publisher: 'Business Decision Lab（Claude assumption）', url: '', pubDate: '', accessDate: '2026-08-19', dataPoint: '案例架構參考一般FMCG新品上市與trade promotion訓練主題自建，數字為Claude assumption，非真實市場調查或財報數字。', tag: 'assumption' }],
});

/* -------------------------------------------------------------------------
 * CASE 5：電商平台免運補貼與獲客效率決策 — E-commerce / Marketplace
 * ---------------------------------------------------------------------- */
CASES.push({
  id: 'ecom-001',
  title: '電商平台免運補貼與獲客效率決策',
  titleEn: 'NestHome D2C — Free-Shipping Subsidy & CAC Efficiency Decision',
  industry: 'ecommerce-marketplace',
  difficulty: 'Advanced',
  mainSkill: 'Contribution Margin & CAC',
  secondarySkills: ['Free Shipping Threshold', 'Platform Take Rate', 'Repeat Purchase'],
  version: 'v1.0',
  createdDate: '2026-08-19',
  updatedDate: '2026-08-19',
  status: 'Public',
  origin: 'Original',
  originNote: '本模擬案例僅參考公開市場常識與產業一般結構，並非Harvard Business Publishing原始案例的重製或摘要，亦非任何真實公司之機密資料。',
  background: {
    companyProfile: 'NestHome 是一家虛構的D2C家居生活用品電商品牌，主要透過官網與少量第三方平台銷售，正評估調降免運門檻並加碼平台廣告來衝刺獲客。',
    productService: 'NestHome：家居生活用品（收納、寢具、小家飾），平均客單價約NT$1,350。',
    marketSituation: '電商市場的免運門檻是消費者下單決策的重要心理關卡，調降門檻通常能提高轉換率與訂單量，但會直接墊高每筆訂單的物流補貼成本，壓縮contribution margin。',
    customer: '25–40歲、重視居家佈置、習慣線上購物的都會消費者。',
    competitors: '主要電商平台與同類D2C品牌普遍以「滿NT$990免運」或更低門檻作為常態促銷手段。',
    channelStructure: '官網直營為主（D2C），另有少量透過第三方平台銷售需支付take rate；金流與物流由第三方服務商處理。',
    strategicChallenge: 'NestHome需要決定：是否把免運門檻從NT$1,500調降到NT$990並加碼效能廣告，用更高的物流補貼成本換取更多訂單量與市佔，還是維持現有門檻以保護單筆訂單的獲利能力。',
  },
  managementDecision: 'NestHome是否應該調降免運門檻並加碼平台廣告來衝刺獲客，即使會壓縮每筆訂單的contribution margin？',
  decisionSubQuestions: [
    '是否應以NT$1,350的平均客單價（AOV）維持現有定位？',
    '是否應提供10%的檔期促銷折扣？',
    '在金流與平台費用合計約6%、退貨率8%的結構下，是否仍可獲利？',
    'Paid Media效能廣告應投入多少才合理？',
    '需要達到多少訂單數才能break-even？',
    '如果調降免運門檻後物流補貼成本大幅上升，應該調漲客單價門檻、縮減廣告投放，還是接受更低的單筆獲利去換取訂單量與市佔？',
  ],
  financialInputs: {
    currency: 'TWD',
    fields: [
      { key: 'listPrice', label: '平均客單價 List Price（AOV）', unit: 'NT$/筆訂單', group: '定價與銷量', tag: 'assumption', note: '現有訂單資料的平均客單價假設。', editable: true, default: 1350 },
      { key: 'units', label: '首年目標訂單數 Units', unit: '筆', group: '定價與銷量', tag: 'assumption', note: '調降免運門檻後的訂單量成長估計，非真實歷史數據。', editable: true, default: 60000 },
      { key: 'discountRate', label: '檔期促銷折扣 Discount Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: '雙11／週年慶等檔期的消費者端折扣假設。', editable: true, default: 10 },
      { key: 'returnRate', label: '退貨率 Return Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: '電商退貨率通常高於實體通路，家居用品類別的退貨率估計。', editable: true, default: 8 },
      { key: 'channelMarginRate', label: '平台抽成／金流手續費 Channel Margin Rate', unit: '%', group: '通路經濟', tag: 'assumption', note: '⚠️ 產業對應：D2C官網以金流手續費為主，若透過第三方平台銷售則另計take rate，此處為兩者的加權平均概念，非傳統零售通路margin。', editable: true, default: 6 },
      { key: 'rebateRate', label: 'Rebate Rate（平台行銷基金回饋）', unit: '%（以Net Consumer Sales計）', group: '通路經濟', tag: 'assumption', note: '部分平台提供的行銷基金回饋，比例通常較低。', editable: true, default: 0.5 },
      { key: 'unitCOGS', label: '每筆訂單平均商品成本 Unit COGS', unit: 'NT$/筆', group: '成本結構', tag: 'assumption', note: '假設商品成本約為AOV的40%。', editable: true, default: 540 },
      { key: 'logisticsPerUnit', label: '免運補貼＋物流配送成本', unit: 'NT$/筆', group: '成本結構', tag: 'assumption', note: '⚠️ 本案例核心決策變數：調降免運門檻會讓更高比例的訂單符合免運資格，這裡的數字代表品牌吸收的平均物流補貼，門檻越低，這個數字通常越高。', editable: true, default: 180 },
      { key: 'otherVariablePerUnit', label: '其他變動成本（客服／包材）', unit: 'NT$/筆', group: '成本結構', tag: 'assumption', note: '客服與包材成本估計。', editable: true, default: 35 },
      { key: 'paidMedia', label: 'Paid Media（效能廣告）', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '社群與關鍵字效能廣告預算假設，是獲客的主要槓桿。', editable: true, default: 4000000 },
      { key: 'kolPR', label: 'KOL／PR', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '居家生活風格KOL合作預算假設。', editable: true, default: 1000000 },
      { key: 'creativeProduction', label: 'Creative Production', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '商品攝影與廣告素材製作預算假設。', editable: true, default: 400000 },
      { key: 'sponsorship', label: 'Sponsorship', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '品牌活動贊助預算假設。', editable: true, default: 200000 },
      { key: 'otherBrandInvestment', label: 'Other Brand Investment', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '其他品牌活動預算假設。', editable: true, default: 300000 },
      { key: 'tradeMarketing', label: 'Trade Marketing（平台站內廣告資源）', unit: 'NT$（年度）', group: '通路投資', tag: 'assumption', note: '第三方平台首頁曝光與站內廣告資源，與品牌端A&P分開計算。', editable: true, default: 800000 },
      { key: 'fixedLaunchInvestment', label: 'Fixed Launch Investment（一次性獲客投資）', unit: 'NT$', group: '固定投資', tag: 'assumption', note: '⚠️ 定義：break-even計算專用的一次性投資，預設＝Total A&P＋Trade Marketing（6,700,000）。', editable: true, default: 6700000 },
      { key: 'allocatedFixedCost', label: 'Allocated Fixed Cost（每期經常性overhead分攤）', unit: 'NT$（每季）', group: '固定投資', tag: 'assumption', note: '團隊與系統維運費用分攤估計。', editable: true, default: 600000 },
      { key: 'attributedRevenue', label: 'Attributed Revenue（Paid Media歸因營收）', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設Paid Media可歸因約40%的Gross Sales，電商的付費廣告歸因通常較高。', editable: true, default: 32400000 },
      { key: 'incrementalRevenue', label: 'Incremental Revenue', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設行銷投資帶來的增量營收約為Gross Sales的20%。', editable: true, default: 16200000 },
      { key: 'incrementalGrossMarginRate', label: 'Incremental Gross Margin %', unit: '%', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設增量銷售的毛利率與整體毛利率相近。', editable: true, default: 42 },
    ],
  },
  missingInformation: [
    { item: '調降免運門檻後，實際訂單量成長幅度與物流補貼成本上升幅度', why: '這是本案例核心的trade-off，目前units與logisticsPerUnit都是假設，沒有A/B測試數據支持。', confidence: 'Low' },
    { item: '客戶終身價值（LTV）與回購率', why: '免運補貼是否划算，取決於獲得的新客戶未來是否會回購，目前案例僅計算首年單筆訂單經濟，未納入LTV。', confidence: 'Low' },
    { item: '第三方平台實際take rate與行銷資源交換條件', why: '目前channelMarginRate為簡化的加權估計，未拆分官網與平台各自的真實費用結構。', confidence: 'Medium' },
    { item: '競品的免運門檻與廣告投放強度', why: '會直接影響本案調降門檻是否能有效轉換為市佔成長。', confidence: 'Low' },
    { item: '退貨率是否因免運政策改變而上升', why: '免運降低下單門檻，也可能降低消費者購買前的審慎程度，退貨率有上升風險。', confidence: 'Medium' },
  ],
  decisionQuestions: STANDARD_DECISION_QUESTIONS,
  referenceAnswers: [
    '核心商業問題是：調降免運門檻是一個「用更高的物流補貼成本，換取更多訂單量與市佔」的交易，但這個交易划算與否，不能只看首年單筆訂單的contribution margin，還要看這些新增訂單背後的客戶未來是否會回購（LTV）——這正是本案例故意保留的Missing Information。',
    '1) 調降門檻後訂單量究竟會成長多少——目前60,000筆是假設，沒有A/B測試數據。2) 物流補貼成本會墊高多少——logisticsPerUnit是本案例最敏感的變數之一。3) 這些用免運吸引來的新客戶，回購率是否健康——如果只是一次性低價導向的客戶，LTV可能很低，讓整個投資不划算。',
    '在Base情境下，Break-even約23,924筆，僅為60,000筆目標的40%，Operating Margin約15.3%，財務結構健康，建議執行調降門檻的測試，但應該先以小規模流量做A/B測試，同時追蹤這批新客戶3–6個月的回購行為，而不是直接all-in全年預算。',
    '如果物流補貼成本（logisticsPerUnit）因訂單量增加而超出假設許多（例如因為平均客單價下降、更多小額訂單符合免運資格），應該立即改變決策——重新評估免運門檻是否設定過低，或改用「滿額贈品」取代「免運」來達到類似的轉換誘因，同時保護物流成本結構。',
    '第一句（問題）：調降免運門檻能否提升訂單量與市佔，核心不確定性在於實際成本上升幅度與新客戶的長期回購價值都還沒驗證。第二句（建議）：在Base假設下Break-even僅需40%的目標訂單量，財務結構可以支撐一次測試，建議先做小規模A/B測試。第三句（但書）：若物流補貼成本或退貨率明顯超出假設，或新客戶回購率偏低，建議暫緩全面調降門檻，改用滿額贈品等成本更可控的替代方案。',
  ],
  scenarios: {
    conservative: { label: 'Conservative', labelZh: '保守情境', desc: '調降門檻後物流補貼成本上升幅度超出預期，退貨率同步上升。',
      overrides: { units: 42000, returnRate: 11, logisticsPerUnit: 240, paidMedia: 3200000 } },
    base: { label: 'Base', labelZh: '基準情境', desc: '依目前免運門檻調整計畫的假設執行。', overrides: {} },
    aggressive: { label: 'Aggressive', labelZh: '積極情境', desc: '訂單量顯著成長，物流補貼成本控制在合理範圍，回購率健康。',
      overrides: { units: 95000, discountRate: 6, paidMedia: 5200000, logisticsPerUnit: 160 } },
  },
  sources: [{ title: '（本案例未使用付費HBP案例全文）', publisher: 'Business Decision Lab（Claude assumption）', url: '', pubDate: '', accessDate: '2026-08-19', dataPoint: '案例架構參考一般D2C電商免運與獲客效率訓練主題自建，數字為Claude assumption，非真實市場調查或財報數字。', tag: 'assumption' }],
});

/* -------------------------------------------------------------------------
 * CASE 6：SaaS免費試用轉換與CAC回收期決策 — SaaS Subscription
 * ---------------------------------------------------------------------- */
CASES.push({
  id: 'saas-001',
  title: 'SaaS免費試用轉換與CAC回收期決策',
  titleEn: 'Flowdesk — Free Trial Extension & CAC Payback Decision',
  industry: 'saas-subscription',
  difficulty: 'Advanced',
  mainSkill: 'CAC, LTV & Payback Period',
  secondarySkills: ['Gross Margin', 'Free Trial Conversion', 'Sales & Marketing Efficiency'],
  version: 'v1.0',
  createdDate: '2026-08-19',
  updatedDate: '2026-08-19',
  status: 'Public',
  origin: 'Original',
  originNote: '本模擬案例僅參考公開市場常識與產業一般結構，並非Harvard Business Publishing原始案例的重製或摘要，亦非任何真實公司之機密資料。',
  background: {
    companyProfile: 'Flowdesk 是一家虛構的B2B SaaS專案管理工具，主力銷售模式為年繳訂閱，透過官網自助購買與少量經銷夥伴銷售。',
    productService: 'Flowdesk：B2B專案管理SaaS工具，年繳訂閱每席位NT$14,400（月費NT$1,200 x 12）。',
    marketSituation: 'SaaS產品的獲利結構與COGS極低（hosting與support成本遠低於實體商品的製造成本），核心決策槓桿在於Customer Acquisition Cost（CAC）與轉換率，而非傳統的通路margin。',
    customer: '中小企業與新創團隊的專案經理／營運主管，多數透過免費試用後自行評估購買。',
    competitors: '市場上已有多個國際SaaS工具提供14天免費試用，部分競品提供更長試用期搭配銷售人員協助導入（sales assist）。',
    channelStructure: '主要透過官網自助訂閱（PLG, product-led growth），少量透過經銷夥伴／affiliate銷售。',
    strategicChallenge: 'Flowdesk需要決定：是否把免費試用期從14天延長到30天，並加碼銷售協助（sales assist）資源，來提高付費轉換率，即使這會拉長CAC回收期（payback period）並增加試用期間的服務成本。',
  },
  managementDecision: 'Flowdesk是否應該延長免費試用期並加碼Sales Assist資源，以提高付費轉換率，即使會拉長CAC回收期？',
  decisionSubQuestions: [
    '是否應以每席位年繳NT$14,400維持現有定價？',
    '是否應提供15%的年繳優惠折扣？',
    '在通路／經銷佣金15%的結構下，是否仍可獲利？',
    'Sales Assist（試用期客戶成功支援）應投入多少資源才合理？',
    '需要達到多少新增訂閱席位數才能break-even？',
    '如果延長試用期後Sales Assist成本大幅上升，應該調漲定價、縮短試用期，還是只針對高潛力客戶提供人工協助？',
  ],
  financialInputs: {
    currency: 'TWD',
    fields: [
      { key: 'listPrice', label: '年繳訂閱單價 List Price（每席位／年）', unit: 'NT$/席位/年', group: '定價與銷量', tag: 'assumption', note: '月費NT$1,200換算之年繳定價假設。', editable: true, default: 14400 },
      { key: 'units', label: '首年目標新增年約訂閱席位數 Units', unit: '席位', group: '定價與銷量', tag: 'assumption', note: '延長試用期後的新增訂閱數估計，非真實歷史數據。', editable: true, default: 2500 },
      { key: 'discountRate', label: '年繳優惠 Discount Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: '相對月繳的年繳優惠折扣假設。', editable: true, default: 15 },
      { key: 'returnRate', label: '中途取消／退款率 Return Rate', unit: '%', group: '定價與銷量', tag: 'assumption', note: 'SaaS訂閱的合約期間退款率假設（對應非SaaS產業的「退貨率」概念）。', editable: true, default: 3 },
      { key: 'channelMarginRate', label: '通路／經銷佣金 Channel Margin Rate', unit: '%', group: '通路經濟', tag: 'assumption', note: '⚠️ 產業對應：SaaS的「通路margin」通常代表經銷夥伴或affiliate的銷售佣金，而非實體通路加價，此處沿用相同欄位但意義不同。', editable: true, default: 15 },
      { key: 'rebateRate', label: 'Rebate Rate（通路年度達標獎金）', unit: '%（以Net Consumer Sales計）', group: '通路經濟', tag: 'assumption', note: '經銷夥伴的年度達標獎金假設。', editable: true, default: 1 },
      { key: 'unitCOGS', label: '每席位年度Cost to Serve（Hosting＋Support）', unit: 'NT$/席位/年', group: '成本結構', tag: 'assumption', note: '⚠️ 產業特殊性：SaaS的COGS（伺服器、雲端運算、基礎客服）遠低於實體商品的製造成本，這是SaaS毛利率遠高於其他產業的關鍵原因，對應spec「Cost to Serve」概念。', editable: true, default: 1800 },
      { key: 'logisticsPerUnit', label: 'Onboarding導入成本（對應「物流」欄位）', unit: 'NT$/席位', group: '成本結構', tag: 'assumption', note: 'SaaS沒有實體物流，此欄位代表新客戶的導入設定與初期教學成本。', editable: true, default: 400 },
      { key: 'otherVariablePerUnit', label: '其他變動成本（金流／客服）', unit: 'NT$/席位', group: '成本結構', tag: 'assumption', note: '金流手續費與例行客服成本估計。', editable: true, default: 150 },
      { key: 'paidMedia', label: 'Paid Media', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: 'B2B關鍵字與內容行銷廣告預算假設。', editable: true, default: 2200000 },
      { key: 'kolPR', label: 'KOL／PR（產業意見領袖）', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: 'B2B產業意見領袖合作預算假設。', editable: true, default: 400000 },
      { key: 'creativeProduction', label: 'Creative Production', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '品牌與產品素材製作預算假設。', editable: true, default: 250000 },
      { key: 'sponsorship', label: 'Sponsorship（產業研討會）', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: 'B2B產業活動贊助預算假設。', editable: true, default: 350000 },
      { key: 'otherBrandInvestment', label: 'Other Brand Investment', unit: 'NT$（年度）', group: 'A&P投資', tag: 'assumption', note: '其他品牌活動預算假設。', editable: true, default: 200000 },
      { key: 'tradeMarketing', label: 'Trade Marketing（Sales Assist試用期支援）', unit: 'NT$（年度）', group: '通路投資', tag: 'assumption', note: '本案例核心決策：延長試用期需要更多真人銷售協助資源，才能在30天內持續引導客戶完成評估與轉換，與品牌端A&P分開計算。', editable: true, default: 1200000 },
      { key: 'fixedLaunchInvestment', label: 'Fixed Launch Investment（一次性試用期擴大投資）', unit: 'NT$', group: '固定投資', tag: 'assumption', note: '⚠️ 定義：break-even計算專用的一次性投資，預設＝Total A&P＋Trade Marketing（4,600,000）。', editable: true, default: 4600000 },
      { key: 'allocatedFixedCost', label: 'Allocated Fixed Cost（每期經常性overhead分攤）', unit: 'NT$（每季）', group: '固定投資', tag: 'assumption', note: '產品與工程團隊費用分攤估計。', editable: true, default: 550000 },
      { key: 'attributedRevenue', label: 'Attributed Revenue（Paid Media歸因營收）', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設Paid Media可歸因約32%的Gross Sales。', editable: true, default: 11520000 },
      { key: 'incrementalRevenue', label: 'Incremental Revenue', unit: 'NT$', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: '假設行銷與Sales Assist投資帶來的增量營收約為Gross Sales的22%。', editable: true, default: 7920000 },
      { key: 'incrementalGrossMarginRate', label: 'Incremental Gross Margin %', unit: '%', group: '行銷效率（ROAS／ROMI）', tag: 'assumption', note: 'SaaS的高毛利結構使增量銷售的邊際毛利率也維持在高水位。', editable: true, default: 70 },
    ],
  },
  missingInformation: [
    { item: '延長試用期（14天→30天）對實際轉換率的提升幅度', why: '目前units與incrementalRevenue假設都建立在「延長試用期會提升轉換率」的前提上，但沒有A/B測試數據支持，是本案例最大的不確定性。', confidence: 'Low' },
    { item: '客戶流失率（churn rate）與續約率', why: '本案例僅計算首年新增訂閱的財務，未納入長期LTV，而SaaS的獲利本質高度依賴續約率。', confidence: 'Low' },
    { item: 'Sales Assist人力成本是否會隨試用期延長而超線性成長', why: '目前tradeMarketing為整體估計，未拆分每位Sales Assist人員可負擔的試用客戶數上限。', confidence: 'Medium' },
    { item: '競品的試用期長度與轉換率benchmark', why: '會影響延長試用期是否為市場中具競爭力的策略選擇。', confidence: 'Medium' },
    { item: 'CAC payback period是否符合公司財務健康標準', why: '本案例的Fixed Launch Investment與Break-even計算尚未換算成標準SaaS的payback period（月數）指標。', confidence: 'Low' },
  ],
  decisionQuestions: STANDARD_DECISION_QUESTIONS,
  referenceAnswers: [
    '核心商業問題是：延長免費試用期是一個「用更高的Sales Assist成本與更長的CAC回收期，換取更高付費轉換率」的交易，但SaaS的獲利本質建立在長期續約（LTV）上，而本案例的財務模型只計算了首年新增訂閱，完全沒有納入churn rate與續約率——這是評估這個決策時最大的盲點。',
    '1) 延長試用期對轉換率的實際提升幅度——完全是假設，沒有A/B測試數據。2) 客戶流失率／續約率——如果延長試用期吸引來的是「觀望型」而非「高意願」客戶，續約率可能反而更低，讓CAC回收期進一步拉長。3) Sales Assist人力是否能線性擴張——如果每位Sales Assist人員能負擔的客戶數有上限，成本可能隨試用客戶數超線性成長。',
    '在Base情境下，Operating Margin高達約55.5%、Break-even僅需約608席位（僅目標的24%），反映SaaS產業典型的高毛利結構，財務上有充足空間支撐測試。建議先針對「高潛力客戶」（例如試用期間活躍度較高的帳號）提供延長試用與Sales Assist，而非對所有試用戶一視同仁，這樣可以用較低的邊際成本驗證延長試用期的效果。',
    '如果延長試用期後轉換率沒有明顯提升，但Sales Assist成本已經投入，應該立即改變決策——縮回14天標準試用期，把Sales Assist資源集中在成交機率最高的少數客戶（例如企業版／多席位詢問），而不是平均分攤在所有試用用戶身上，避免CAC payback period被不必要地拉長。',
    '第一句（問題）：Flowdesk延長試用期的決策，核心風險不是財務結構（Operating Margin高達55.5%，緩衝充足），而是「轉換率是否真的會提升」與「這些客戶的長期續約率」完全沒有數據驗證。第二句（建議）：建議先針對高潛力客戶小規模測試延長試用期＋Sales Assist，而非全面推行。第三句（但書）：若測試轉換率沒有明顯提升，應立即縮回標準試用期，並追蹤6–12個月續約率再決定是否擴大投資，因為SaaS的真實獲利在續約而非首年新客。',
  ],
  scenarios: {
    conservative: { label: 'Conservative', labelZh: '保守情境', desc: '延長試用期對轉換率提升有限，Sales Assist成本超出預期。',
      overrides: { units: 1600, discountRate: 20, channelMarginRate: 18, tradeMarketing: 1560000 } },
    base: { label: 'Base', labelZh: '基準情境', desc: '依目前延長試用期＋Sales Assist計畫的假設執行。', overrides: {} },
    aggressive: { label: 'Aggressive', labelZh: '積極情境', desc: '延長試用期顯著提升轉換率，續約率同步健康成長。',
      overrides: { units: 4200, discountRate: 10, paidMedia: 2860000, tradeMarketing: 1560000 } },
  },
  sources: [{ title: '（本案例未使用付費HBP案例全文）', publisher: 'Business Decision Lab（Claude assumption）', url: '', pubDate: '', accessDate: '2026-08-19', dataPoint: '案例架構參考一般B2B SaaS免費試用與CAC效率訓練主題自建，數字為Claude assumption，非真實市場調查或財報數字。', tag: 'assumption' }],
});

function getCaseById(id) { return CASES.find((c) => c.id === id); }
function getCasesByIndustry(industryId) { return CASES.filter((c) => c.industry === industryId); }
function getIndustry(id) { return INDUSTRIES.find((i) => i.id === id); }
