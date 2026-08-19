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

  'alcohol-001': [
    { persona: 'CFO', personaZh: 'CFO',
      question: 'ROAS看起來有近14倍，為什麼ROMI卻是負的？你要怎麼說服我這筆A&P與贊助投資是合理的？',
      referenceAnswer: '因為ROAS只計算歸因營收、不扣成本，而ROMI用incremental gross profit跟實際行銷投入比較——本案假設incremental revenue僅占Gross Sales的15%，乘上45%邊際毛利率後，遠不足以覆蓋350萬的品牌與通路投資，代表這筆錢短期無法用單年ROMI證明。但on-trade投資的核心價值是建立長期定價權與品牌關係，我會建議用「多年攤提」角度、搭配鋪點數與回購率而非單年ROMI來評估這筆投資。',
      followUps: [] },
    { persona: 'GM', personaZh: 'GM（台灣總經理）',
      question: 'on-trade通路要求35%的margin，如果他們談到40%，你打算漲價、砍贊助預算，還是縮小合作規模？',
      referenceAnswer: '我會選擇溫和調漲售價，而不是砍贊助或縮小合作規模。威士忌消費者對高單價品項的價格敏感度通常低於平價消費品，且贊助與試飲是建立品牌關係的關鍵武器，在關係尚未穩固的階段砍預算風險更高；縮小合作規模則直接犧牲鋪貨覆蓋率。我會先用敏感度分析確認調價後Operating Profit是否仍為正，再決定調價幅度。',
      followUps: [] },
    { persona: 'Regional HQ', personaZh: '區域總部',
      question: '其他市場都還是off-trade為主，為什麼台灣需要投入on-trade通路？',
      referenceAnswer: '因為off-trade的成長已經接近天花板，而on-trade雖然投資更重，卻是唯一能建立長期定價權與品牌溢價的通路——消費者在餐廳／酒吧的點單經驗，會直接轉化成日後在off-trade指名購買的意願。這是一個「用短期較低的ROMI，換取長期品牌資產」的策略選擇，需要用鋪點數、重複造訪率等領先指標來衡量，而不是單看首年財務報酬。',
      followUps: [] },
    { persona: 'On-trade Partner', personaZh: '餐廳／酒吧採購窗口',
      question: '你要保證多少瓶的銷量與多少試飲支援，才值得我們給你吧檯陳列與酒單曝光？',
      referenceAnswer: '基準情境下Trade Marketing（試飲與POSM）預算約NT$900,000；只要陳列帶來的增量銷量，用Contribution per Unit（約NT$493／瓶）累積起來能打平這筆投資，交易就划算——換算約需要1,800多瓶的增量銷量。我不會用「總銷量」承諾，而是用「可歸因的增量銷量」承諾，並優先鎖定轉換率較高的少數指標酒吧，而非平均分散資源。',
      followUps: [] },
    { persona: 'Tax & Compliance', personaZh: '稅務／法規負責人',
      question: '如果菸酒稅調漲，你的定價策略要怎麼反應？',
      referenceAnswer: '菸酒稅是計入Other Variable Cost的變動成本，調漲會直接壓縮Contribution per Unit——如果選擇由公司吸收，Operating Margin會被壓縮；如果選擇轉嫁給消費者調漲售價，則要重新用敏感度分析確認消費者是否還能接受。我傾向部分轉嫁、部分吸收，並優先確保Break-even門檻仍遠低於目標銷量，而不是讓稅務變動直接侵蝕已經偏薄的16.6%營業利潤率。',
      followUps: [] },
  ],

  'vision-001': [
    { persona: 'CFO', personaZh: 'CFO',
      question: 'Operating Margin只有9%，比其他案例薄很多，你怎麼證明這個通路教育投資值得做？',
      referenceAnswer: '確實，Base情境的Operating Margin只有9.0%，緩衝很薄，但Break-even只需要約26,184盒（目標的65%），不是完全不可行。我不會直接說「值得做」，而是建議先用小規模試點驗證通路教育訓練對轉換率的實際提升幅度——目前18%的incremental revenue完全是假設，沒有數據支持，這才是決定這筆投資是否合理的關鍵，而不是財務模型本身。',
      followUps: [] },
    { persona: 'GM', personaZh: 'GM（台灣總經理）',
      question: '如果通路要求margin從40%再往上加5個百分點，你要漲價、砍教育投資，還是只服務願意主動推薦的通路？',
      referenceAnswer: '我會選擇集中資源在願意主動推薦的通路，而不是全面漲價或砍教育投資。這個生意的核心邏輯是「說服驗光師主動推薦」，如果對所有通路一視同仁，教育投資的邊際效益會被稀釋；把資源集中在少數高潛力、高轉換的通路，用更深的關係換取更高的推薦率，會比平均分散更有效率，且不需要承擔全面漲價對消費者需求的風險。',
      followUps: [] },
    { persona: 'Regional HQ', personaZh: '區域總部',
      question: '這個投資的Operating Margin這麼薄，總部為什麼要批准？',
      referenceAnswer: '因為這是一個「建立長期回購基礎」的投資，而不是追求首年財務報酬——隱形眼鏡是高頻回購商品，一旦驗光師建立起主動推薦的習慣，長期的回購營收不會反映在這份僅計算首年新客的財務模型裡。我會建議用一個明確的試點與checkpoint機制爭取核准：先小規模驗證轉換率提升幅度，用實際數據而非假設來決定是否擴大投資規模。',
      followUps: [] },
    { persona: 'Optical Shop Partner', personaZh: '驗光所窗口',
      question: '你要提供多少試戴品與訓練資源，才值得我們花時間主動跟顧客推薦你的產品？',
      referenceAnswer: '基準情境下Trade Marketing（教育訓練＋試戴品）預算約NT$1,500,000；只要通路教育帶來的增量銷量，用Contribution per Unit（約NT$157／盒）累積起來能打平這筆投資，交易就划算——換算約需要9,500多盒的增量銷量，這個門檻其實不低，代表教育投資的效果必須確實可衡量，我會建議用「轉換率提升」而非「陳列曝光」作為驗光所端的合作KPI。',
      followUps: [] },
    { persona: 'Regulatory Affairs', personaZh: '法規事務負責人',
      question: '這是醫療器材，如果法規要求的品保或標示成本上升，你的定價要怎麼反應？',
      referenceAnswer: '品保與法規成本計入Other Variable Cost（目前假設NT$25／盒），一旦上升會直接壓縮Contribution per Unit——考慮到本案財務結構已經偏薄（Operating Margin僅9.0%），我會優先檢視是否能透過供應鏈規模化來吸收部分成本，而不是立即反映在售價上，因為這個價格帶對消費者的替代品選擇仍然敏感。',
      followUps: [] },
  ],

  'fmcg-001': [
    { persona: 'CFO', personaZh: 'CFO',
      question: 'ROMI是負的，代表這筆促銷投資可能划不來，你怎麼說服我這個新品該上市？',
      referenceAnswer: 'ROMI為負是因為incremental revenue假設已經扣除cannibalization、只占Gross Sales的8%，這是刻意保守的估計。但Break-even只需要約98,528箱（目標的49%），Operating Margin約11.9%，財務結構本身是健康的——問題不在於能不能打平，而在於這些銷量有多少是「真增量」。我會建議上市，但要求上市後第一季用sell-through數據拆分新增消費者與既有產品轉移的比例，作為是否延續促銷深度的checkpoint。',
      followUps: [] },
    { persona: 'GM', personaZh: 'GM（台灣總經理）',
      question: '如果通路要求margin再加5個百分點，你要漲價、縮減促銷深度，還是集中資源在陳列位置好的通路？',
      referenceAnswer: '我會選擇集中資源在陳列位置好、轉換率高的通路，而不是全面漲價或縮減促銷。FMCG新品上市高度依賴陳列曝光帶動的衝動購買，把促銷資源平均分散到margin要求最高的通路，投資報酬率反而最低；漲價則在新品剛建立市場認知時風險過高，容易直接抑制試用。',
      followUps: [] },
    { persona: 'Brand Director', personaZh: '既有主力產品線負責人',
      question: '這個新口味會不會直接吃掉我現有產品的業績？你怎麼向我證明這是真增量？',
      referenceAnswer: '目前incrementalRevenue的假設已經刻意保守（僅Gross Sales的8%），代表模型本身已經預留了cannibalization的空間，而不是假設新品銷量100%都是增量。但這個扣除比例本身沒有實際數據驗證，是本案例Missing Information中列為Low confidence的一項——我建議上市初期用不同的消費場景（例如運動情境）做差異化溝通，並用sell-through數據追蹤既有產品線的銷量是否同步下滑來驗證真實的cannibalization程度。',
      followUps: [] },
    { persona: 'Retail Buyer', personaZh: '通路採購窗口',
      question: '你要付多少上架費、保證多少銷量，才值得我們給你端架陳列？',
      referenceAnswer: '基準情境下Trade Marketing（上架費＋陳列＋促銷）預算約NT$3,500,000，是本案例最大的單一支出項目；只要陳列帶來的增量銷量，用Contribution per Unit（約NT$84／箱）累積起來能打平這筆投資，交易就划算——換算約需要41,000多箱的增量銷量。我會用「可歸因的增量銷量」而非「總出貨量」來設定保證門檻，並優先爭取促銷檔期而非全年常態上架，降低沉沒成本風險。',
      followUps: [] },
    { persona: 'Supply Chain', personaZh: '供應鏈負責人',
      question: '如果原物料成本上升，你的Unit COGS假設還站得住腳嗎？',
      referenceAnswer: 'Unit COGS（NT$220／箱）是基於現有原料採購價格的估計，飲料類原料成本波動風險中等；如果COGS上升，會直接壓縮Contribution per Unit（目前約NT$84／箱，緩衝本來就不厚），Break-even門檻會明顯拉高。我會建議在正式量產前，跟供應鏈確認至少半年的原料價格鎖定，避免上市後立刻面臨毛利率被侵蝕的風險。',
      followUps: [] },
  ],

  'ecom-001': [
    { persona: 'CFO', personaZh: 'CFO',
      question: 'ROMI幾乎打平（1.6%），你怎麼證明調降免運門檻是值得做的？',
      referenceAnswer: 'ROMI幾乎打平代表這筆行銷投資單靠首年的incremental gross profit幾乎無法自我證明，這也是為什麼我不會只看ROMI——調降免運門檻真正的價值在於新增訂單背後客戶的長期回購價值（LTV），而這正是本案例Missing Information中完全沒有數據的一項。我會建議先用小規模流量做A/B測試，同時追蹤新客戶3–6個月的回購行為，而不是直接把全年預算all-in到這個假設上。',
      followUps: [] },
    { persona: 'Growth Lead', personaZh: '成長團隊負責人',
      question: '如果調降門檻後物流補貼成本超出預期，你要調高門檻、縮減廣告，還是接受更低的單筆獲利？',
      referenceAnswer: '我會先確認物流補貼上升的幅度是否讓Contribution per Unit轉負——如果只是壓縮但仍為正，可以接受短期較低的單筆獲利去換取訂單量與市佔，因為獲客的長期價值可能透過LTV回收；但如果Contribution per Unit轉負，就必須立即調整，因為那代表每多一筆訂單反而在虧錢，這時應該優先考慮把免運門檻設在一個折衷值，而不是維持最低門檻。',
      followUps: [] },
    { persona: 'Platform Partner', personaZh: '第三方平台窗口',
      question: '你要投入多少站內廣告資源，才能換到平台首頁曝光？',
      referenceAnswer: '基準情境下Trade Marketing（平台站內廣告資源）預算約NT$800,000；只要曝光帶來的增量訂單，用Contribution per Unit（約NT$280／筆）累積起來能打平這筆投資，交易就划算——換算約需要2,850多筆的增量訂單。我會要求平台提供可歸因的曝光數據，而非只承諾曝光量，避免把本來就會自然發生的訂單算成曝光的功勞。',
      followUps: [] },
    { persona: 'Customer Service', personaZh: '客服／物流負責人',
      question: '免運降低下單門檻，會不會讓退貨率跟著上升？你的成本模型有沒有考慮這個風險？',
      referenceAnswer: '目前的退貨率假設（8%）是基於現有歷史數據，尚未反映免運政策改變後可能的行為變化——消費者購買前的審慎程度可能因為免運與更低的心理門檻而下降，這正是Missing Information中列為Medium confidence的一項。我建議在正式全面調降門檻前，先用小規模測試觀察退貨率是否明顯上升，再決定是否需要額外的退貨預防機制（例如更清楚的商品說明或試用政策）。',
      followUps: [] },
    { persona: 'Regional HQ', personaZh: '區域總部',
      question: '這個免運補貼的邏輯，跟其他市場比起來效率如何？值得複製嗎？',
      referenceAnswer: '目前的物流補貼成本（logisticsPerUnit約NT$180／筆）是否具有效率，無法脫離其他市場的benchmark單獨判斷；但更關鍵的是本案例完全沒有計算LTV，如果總部要求跨市場比較，我會建議先統一「獲客成本回收期」（用Contribution per Unit回收Paid Media投入所需的訂單數）作為共通指標，而不是只比較單筆訂單的contribution margin。',
      followUps: [] },
  ],

  'saas-001': [
    { persona: 'CFO', personaZh: 'CFO',
      question: 'Operating Margin高達55.5%，聽起來很健康，那你為什麼還要問我要不要投資延長試用期？',
      referenceAnswer: '因為財務結構健康（Break-even僅需目標的24%）不代表這筆投資本身是對的——這份模型只計算了首年新增訂閱的經濟，完全沒有納入churn rate與續約率，而SaaS真正的獲利在於長期續約。如果延長試用期吸引來的是轉換率高但續約率低的「觀望型」客戶，即使首年財務數字亮眼，長期LTV可能反而更差，這才是需要你核准資源去驗證的關鍵問題。',
      followUps: [] },
    { persona: 'VP Sales', personaZh: '業務副總',
      question: '如果Sales Assist的人力成本隨試用期延長而超線性成長，你要怎麼控制？',
      referenceAnswer: '我不會對所有試用戶提供同等的Sales Assist資源，而是針對「高潛力客戶」（例如試用期間活躍度較高、多席位詢問的帳號）優先提供人工協助，其餘試用戶維持自助式（product-led）流程。這樣可以用較低的邊際成本驗證延長試用期的效果，同時避免Sales Assist人力隨試用客戶數線性甚至超線性成長。',
      followUps: [] },
    { persona: 'Customer Success', personaZh: '客戶成功負責人',
      question: '延長試用期真的會提升轉換率嗎？如果沒有明顯提升，你要怎麼辦？',
      referenceAnswer: '目前完全沒有A/B測試數據支持「延長試用期會提升轉換率」這個假設，這是本案例最大的不確定性。如果測試結果顯示轉換率沒有明顯提升，我會立即建議縮回14天標準試用期，並把Sales Assist資源轉向已經展現高續約潛力的既有客戶，而不是繼續投入在一個效果不確定的假設上。',
      followUps: [] },
    { persona: 'Channel Partner', personaZh: '經銷夥伴窗口',
      question: '你要給我們多少佣金與銷售支援，才值得我們主動推薦Flowdesk給客戶？',
      referenceAnswer: '目前的通路／經銷佣金假設為15%，這是B2B SaaS常見的reseller margin水準；只要經銷夥伴帶來的訂閱席位數，用Contribution per Unit（約NT$7,569／席位）累積起來能打平我們投入的銷售支援資源，這筆合作就划算。我會用「可歸因的新增訂閱數」而非「總訂閱數」來設計佣金結構，避免把自然增長的訂閱算成經銷夥伴的功勞。',
      followUps: [] },
    { persona: 'Regional HQ', personaZh: '區域總部',
      question: '這個CAC回收期，跟其他市場的SaaS產品比起來效率如何？',
      referenceAnswer: 'Break-even僅需約608個新增席位，相對2,500的目標有很大安全邊際，反映SaaS典型的低COGS高毛利結構；但如果總部要求跨市場比較CAC效率，更準確的指標應該是「CAC payback period」（用月為單位，看多少個月的訂閱毛利能回收獲客成本），而不是直接比較Break-even units，因為不同市場的訂閱單價與COGS結構可能不同，需要換算成月數才能公平比較。',
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
