/* =========================================================================
 * Business Decision Lab — Fixed Financial Engine
 * -------------------------------------------------------------------------
 * 所有 P&L 計算都必須經過這裡的固定公式，Claude Coach／UI 不可自行發明算法。
 * 每一條公式都在 FORMULA_GLOSSARY 中有「定義 / 計算方式 / 商業意義 / 常見錯誤 /
 * 適用產業 / 是否可調整」的說明，供介面上的「公式小抄」使用。
 * ========================================================================= */

const Engine = (() => {

  // ---- 基礎工具 -----------------------------------------------------------
  const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  const pct = (n) => (isFinite(n) ? n : 0);

  /**
   * 計算完整 P&L。
   * inputs 欄位定義見 js/cases.js 內每個 case 的 financialInputs。
   * 重要：以下項目彼此獨立，不可混算或重複扣除：
   *   consumerDiscount / channelMargin / rebates / tradeMarketing /
   *   paidMedia+KOL+creative+sponsorship+other(=A&P) / COGS / variable cost / fixed cost
   */
  function computePnL(inputs) {
    const units = num(inputs.units);
    const listPrice = num(inputs.listPrice);
    const discountRate = pctToRatio(inputs.discountRate);
    const returnRate = pctToRatio(inputs.returnRate);
    const channelMarginRate = pctToRatio(inputs.channelMarginRate);
    const rebateRate = pctToRatio(inputs.rebateRate);
    const unitCOGS = num(inputs.unitCOGS);
    const logisticsPerUnit = num(inputs.logisticsPerUnit);
    const otherVariablePerUnit = num(inputs.otherVariablePerUnit);

    const paidMedia = num(inputs.paidMedia);
    const kolPR = num(inputs.kolPR);
    const creativeProduction = num(inputs.creativeProduction);
    const sponsorship = num(inputs.sponsorship);
    const otherBrandInvestment = num(inputs.otherBrandInvestment);
    const tradeMarketing = num(inputs.tradeMarketing);
    const fixedLaunchInvestment = num(inputs.fixedLaunchInvestment);
    const allocatedFixedCost = num(inputs.allocatedFixedCost);

    const grossSales = units * listPrice;
    const consumerDiscount = grossSales * discountRate;
    const returns = grossSales * returnRate;
    const netConsumerSales = grossSales - consumerDiscount - returns;
    const channelMargin = netConsumerSales * channelMarginRate;
    const rebates = netConsumerSales * rebateRate;
    const companyNetRevenue = netConsumerSales - channelMargin - rebates;

    const cogs = units * unitCOGS;
    const grossProfit = companyNetRevenue - cogs;
    const grossMarginPct = companyNetRevenue !== 0 ? grossProfit / companyNetRevenue : 0;

    const totalAP = paidMedia + kolPR + creativeProduction + sponsorship + otherBrandInvestment;
    const variableOperatingCost = units * (logisticsPerUnit + otherVariablePerUnit);

    const contributionProfit = grossProfit - totalAP - tradeMarketing - variableOperatingCost;
    const operatingProfit = contributionProfit - allocatedFixedCost;
    const operatingMarginPct = companyNetRevenue !== 0 ? operatingProfit / companyNetRevenue : 0;

    const unitNetRevenue = units !== 0 ? companyNetRevenue / units : 0;
    const contributionPerUnit = unitNetRevenue - unitCOGS - (logisticsPerUnit + otherVariablePerUnit);
    const breakEvenUnits = contributionPerUnit > 0 ? fixedLaunchInvestment / contributionPerUnit : Infinity;

    const apPctOfRevenue = companyNetRevenue !== 0 ? totalAP / companyNetRevenue : 0;

    // Marketing efficiency (獨立於核心 P&L，需另外輸入 attributedRevenue / incremental 假設)
    const attributedRevenue = num(inputs.attributedRevenue);
    const roas = paidMedia !== 0 ? attributedRevenue / paidMedia : 0;

    const incrementalRevenue = num(inputs.incrementalRevenue);
    const incrementalGrossMarginRate = pctToRatio(inputs.incrementalGrossMarginRate);
    const incrementalGrossProfit = incrementalRevenue * incrementalGrossMarginRate;
    const marketingInvestment = totalAP + tradeMarketing;
    const romi = marketingInvestment !== 0 ? (incrementalGrossProfit - marketingInvestment) / marketingInvestment : 0;

    return {
      units, listPrice,
      grossSales, consumerDiscount, returns, netConsumerSales,
      channelMargin, rebates, companyNetRevenue,
      cogs, grossProfit, grossMarginPct,
      totalAP, tradeMarketing, variableOperatingCost,
      contributionProfit, allocatedFixedCost, operatingProfit, operatingMarginPct,
      unitNetRevenue, contributionPerUnit, fixedLaunchInvestment, breakEvenUnits,
      apPctOfRevenue,
      attributedRevenue, roas,
      incrementalRevenue, incrementalGrossMarginRate, incrementalGrossProfit,
      marketingInvestment, romi,
    };
  }

  function num(v) { const n = parseFloat(v); return isFinite(n) ? n : 0; }
  function pctToRatio(v) { return num(v) / 100; }

  // ---- Sensitivity analysis ------------------------------------------------
  const SENSITIVITY_KEYS = [
    { key: 'units', label: '銷量 (Units)' },
    { key: 'listPrice', label: '售價 (List Price)' },
    { key: 'discountRate', label: '消費者折扣 (Discount Rate)' },
    { key: 'channelMarginRate', label: '通路margin (Channel Margin)' },
    { key: 'unitCOGS', label: '單位成本 (Unit COGS)' },
    { key: 'paidMedia', label: 'Paid Media 投入' },
    { key: 'allocatedFixedCost', label: '固定費用分攤 (Fixed Cost)' },
  ];

  function sensitivityAnalysis(inputs) {
    const base = computePnL(inputs).operatingProfit;
    const steps = [-0.10, -0.05, -0.01, 0.01, 0.05, 0.10];
    const rows = SENSITIVITY_KEYS.map(({ key, label }) => {
      const impacts = {};
      steps.forEach((s) => {
        const trial = { ...inputs, [key]: num(inputs[key]) * (1 + s) };
        const op = computePnL(trial).operatingProfit;
        impacts[s] = round(op - base);
      });
      const swing10 = Math.abs(impacts[0.10] - impacts[-0.10]);
      return { key, label, impacts, swing10 };
    });
    rows.sort((a, b) => b.swing10 - a.swing10);
    const maxSwing = rows.length ? rows[0].swing10 : 1;
    return { base: round(base), rows, top3: rows.slice(0, 3), maxSwing: maxSwing || 1 };
  }

  // ---- Threshold / break-point solver (bisection) ---------------------------
  // 找出「哪個變數跨過什麼門檻，Operating Profit 會歸零 → 原決策失效」
  function solveThreshold(inputs, key, lo, hi, targetFn) {
    const target = targetFn || ((pnl) => pnl.operatingProfit);
    const f = (v) => target(computePnL({ ...inputs, [key]: v }));
    let flo = f(lo), fhi = f(hi);
    if (!isFinite(flo) || !isFinite(fhi)) return null;
    if ((flo > 0 && fhi > 0) || (flo < 0 && fhi < 0)) return null; // 沒有跨界
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const fmid = f(mid);
      if (Math.abs(fmid) < 1) return round(mid);
      if ((fmid > 0) === (flo > 0)) { lo = mid; flo = fmid; } else { hi = mid; }
    }
    return round((lo + hi) / 2);
  }

  // ---- 公式小抄 (glossary) --------------------------------------------------
  const FORMULA_GLOSSARY = [
    {
      name: 'Gross Sales', zh: '總銷售額',
      formula: 'Units × List Price',
      definition: '以牌價計算、未扣除任何折扣或退貨的名目銷售額。',
      meaning: '代表市場上「定價 × 銷量」的原始規模，是所有後續扣減的起點。',
      mistake: '常被誤當成公司實際入帳營收——它還沒扣折扣、退貨、通路margin。',
      industry: '所有產業通用',
      adjustable: true,
    },
    {
      name: 'Consumer Discount', zh: '消費者折扣',
      formula: 'Gross Sales × Discount Rate',
      definition: '直接讓利給終端消費者的價格折讓（例如上市優惠、雙11折扣）。',
      meaning: '影響消費者實際支付價格，是price-volume trade-off的核心槓桿。',
      mistake: '不要和通路margin或trade marketing混在一起算，三者受益對象不同。',
      industry: '零售／電商產業尤其明顯',
      adjustable: true,
    },
    {
      name: 'Returns', zh: '退貨損失',
      formula: 'Gross Sales × Return Rate',
      definition: '因退貨而無法實現的銷售額。',
      meaning: '高階家電、電商通路的退貨率會直接侵蝕淨銷售，常被新品上市規劃忽略。',
      mistake: '只看毛退貨率，忘記退貨也會產生額外物流與整新成本（本引擎另計在Variable Cost）。',
      industry: 'Home Appliance、E-commerce',
      adjustable: true,
    },
    {
      name: 'Net Consumer Sales', zh: '消費者淨銷售額',
      formula: 'Gross Sales − Consumer Discount − Returns',
      definition: '消費者實際支付、扣除折扣與退貨後的銷售額。',
      meaning: '是通路margin與rebate計算的基礎。',
      mistake: '—',
      industry: '所有產業通用',
      adjustable: false,
    },
    {
      name: 'Channel Margin', zh: '通路利潤（抽成）',
      formula: 'Net Consumer Sales × Channel Margin Rate',
      definition: '零售商／經銷商／平台從消費者淨銷售中抽取的margin。',
      meaning: '通路要求的margin越高，公司實拿的淨營收越低——是本案例第三個決策的核心。',
      mistake: '不可與distributor margin、listing fee重複計算；不同通路的margin結構要分開建模。',
      industry: '所有有中間通路的產業（FMCG、家電、酒類尤其重要）',
      adjustable: true,
    },
    {
      name: 'Company Net Revenue', zh: '公司淨營收',
      formula: 'Net Consumer Sales − Channel Margin − Rebates',
      definition: '公司實際入帳、可用來計算毛利與後續投資報酬的營收基礎。',
      meaning: '幾乎所有獲利指標（Gross Margin、Operating Margin、ROMI）都以此為分母。',
      mistake: '很多人誤用Gross Sales當分母計算margin%，會嚴重高估獲利率。',
      industry: '所有產業通用',
      adjustable: false,
    },
    {
      name: 'COGS', zh: '銷貨成本',
      formula: 'Units × Unit COGS',
      definition: '產品本身的製造／進貨成本，不含物流與其他變動成本。',
      meaning: '決定毛利率的下限，是pricing決策必須對照的硬成本。',
      mistake: '不要把物流成本、關稅、倉儲費混入COGS——本引擎將它們獨立列在Variable Cost。',
      industry: '所有產業通用；SaaS則對應Cost to Serve/Hosting',
      adjustable: true,
    },
    {
      name: 'Gross Profit / Gross Margin %', zh: '毛利 / 毛利率',
      formula: 'Gross Profit = Company Net Revenue − COGS；Gross Margin % = Gross Profit ÷ Company Net Revenue',
      definition: '扣除產品成本後的獲利與獲利率。',
      meaning: '衡量「產品與定價」本身是否健康，尚未反映行銷投資效率。',
      mistake: '毛利率高不代表最終賺錢——還要看A&P、trade marketing與fixed cost怎麼扣。',
      industry: '所有產業通用',
      adjustable: false,
    },
    {
      name: 'Total A&P', zh: '品牌投資總額',
      formula: 'Paid Media + KOL/PR + Creative Production + Sponsorship + Other Brand Investment',
      definition: '用於建立品牌認知、需求創造的「上層」行銷投資。',
      meaning: '是行銷主管最能主導的投資項目，也是本系統訓練的核心。',
      mistake: '不要把trade marketing（給通路的促銷資源）算進A&P——兩者的商業目的不同，必須分開檢視ROI。',
      industry: '所有產業通用，比重因產業而異（premium品類通常較高）',
      adjustable: true,
    },
    {
      name: 'Contribution Profit', zh: '貢獻利潤',
      formula: 'Gross Profit − Total A&P − Trade Marketing − Variable Operating Cost',
      definition: '扣除所有可歸屬的行銷投資與變動成本後的利潤，尚未分攤固定費用。',
      meaning: '評估「這個產品線／這次投資」是否值得繼續的核心指標。',
      mistake: '容易忘記扣Variable Operating Cost（物流、售後、金流），導致高估貢獻利潤。',
      industry: '所有產業通用',
      adjustable: false,
    },
    {
      name: 'Operating Profit / Operating Margin %', zh: '營業利潤 / 營業利潤率',
      formula: 'Operating Profit = Contribution Profit − Allocated Fixed Cost；Operating Margin % = Operating Profit ÷ Company Net Revenue',
      definition: '扣除分攤固定費用（人事、辦公室、系統等overhead）後的最終營業利潤。',
      meaning: '是本系統所有商業決策最終要對齊的「北極星」指標。',
      mistake: 'Revenue成長不代表Operating Profit成長——這正是本系統反覆訓練的判斷。',
      industry: '所有產業通用',
      adjustable: false,
    },
    {
      name: 'Contribution per Unit', zh: '單位貢獻margin',
      formula: 'Unit Net Revenue − Unit COGS − Unit Variable Cost',
      definition: '每多賣一件產品，扣除COGS與變動成本後帶來的貢獻margin（尚未扣A&P/固定費用）。',
      meaning: '用來計算break-even volume與評估「多賣量」是否划算。',
      mistake: 'Unit Net Revenue是「平均」淨營收（已反映折扣/退貨/通路margin），不是List Price。',
      industry: '所有產業通用',
      adjustable: false,
    },
    {
      name: 'Break-even Units', zh: '損益兩平銷量',
      formula: 'Fixed Launch Investment ÷ Contribution per Unit',
      definition: '需要賣出多少件，才能用「單位貢獻margin」回收一次性的上市投資（本案例＝Total A&P＋Trade Marketing）。',
      meaning: '回答「這個上市計畫多久／多少量才不虧錢」。',
      mistake: '⚠️ 定義易錯點：Fixed Launch Investment（一次性上市投資，用於break-even）與Allocated Fixed Cost（每期經常性overhead，用於Operating Profit）是兩個不同的數字，不可混用，否則會嚴重低估或高估break-even銷量。',
      industry: '所有產業通用，SaaS常換算成payback period（月）',
      adjustable: false,
    },
    {
      name: 'A&P as % of Revenue', zh: 'A&P佔營收比',
      formula: 'Total A&P ÷ Company Net Revenue',
      definition: '品牌投資強度指標。',
      meaning: '用來跟產業benchmark比較，判斷投資是否合理（premium品類通常較高）。',
      mistake: '沒有「絕對正確」的比例，必須搭配ROMI與Operating Margin一起判斷。',
      industry: '所有產業通用',
      adjustable: false,
    },
    {
      name: 'ROAS', zh: '廣告投資報酬率',
      formula: 'Attributed Revenue ÷ Paid Media Spend',
      definition: '衡量paid media帶來的「歸因營收」相對於花費的倍數。',
      meaning: '常被誤用來代表獲利能力，但ROAS只算Revenue，沒有扣COGS與其他成本。',
      mistake: '⚠️ ROAS高不代表Operating Profit高——Attributed Revenue通常是「總」歸因營收，不是incremental也不是profit，必須跟ROMI一起看。',
      industry: '所有有付費媒體投放的產業，尤其E-commerce',
      adjustable: true,
    },
    {
      name: 'Incremental Gross Profit', zh: '增量毛利',
      formula: 'Incremental Revenue × Incremental Gross Margin %',
      definition: '因某項行銷投資「額外」創造出來的毛利（非投資也會發生的銷售不算）。',
      meaning: '是評估A&P投資是否合理的關鍵——用incremental而非total數字。',
      mistake: '很多人直接用total revenue乘以毛利率，高估了行銷貢獻（沒有扣除baseline銷量）。',
      industry: '所有產業通用',
      adjustable: false,
    },
    {
      name: 'ROMI', zh: '行銷投資報酬率',
      formula: '(Incremental Gross Profit − Marketing Investment) ÷ Marketing Investment',
      definition: '行銷投資扣除成本後的淨報酬率，以毛利（非營收）為基礎。',
      meaning: '是本系統判斷「A&P投資是否合理」的核心指標，比ROAS更接近真實獲利。',
      mistake: '分子必須是Incremental Gross Profit，不是Incremental Revenue，否則會嚴重高估報酬。',
      industry: '所有產業通用',
      adjustable: false,
    },
  ];

  return {
    computePnL, sensitivityAnalysis, solveThreshold, FORMULA_GLOSSARY, SENSITIVITY_KEYS,
    round, num, pctToRatio,
  };
})();
