var allData = [];
var budgetDataGlobal = null; 
var staffStatsMaster = {}, storeStatsMaster = {}, storeGroupMap = {}, staffStoreMap = {};
var personMap = {};
var loginUserStore = "";

var storeToGroup = { "神戸店":"兵四", "久米窪田店":"兵四", "高知高須店":"兵四", "北久米店":"兵四", "尼崎店":"兵四", "高槻店":"大阪", "八尾店":"大阪", "堺大泉緑地前店":"大阪", "松原天美店":"大阪", "貝塚店":"大阪", "大津店":"滋三", "栗東店":"滋三", "彦根店":"滋三", "津店":"滋三", "松阪店":"滋三", "鯖江店":"滋三", "久御山店":"京奈", "171店":"京奈", "精華店":"京奈", "西大和店":"京奈", "橿原店":"京奈", "熊本インター店":"旧Dj", "長田店":"旧Dj", "outlet店":"旧Dj", "舞鶴店":"旧Dj", "福知山店":"旧Dj", "加古川店":"旧Dj", "BYD滋賀":"未所属" };

ZOHO.embeddedApp.init().then(function() {
    ZOHO.CRM.CONFIG.getCurrentUser().then(function(res){
        if(res && res.users && res.users.length > 0) loginUserStore = res.users[0].first_name;
        initMonthSelector();
        setInitialDates();
        fetchByCOQL();
    });
});

// --- 初期化・データ取得 ---
function initMonthSelector() { var sel = document.getElementById('month-selector'); var now = new Date(); var curMonth = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2); for(var y=2025; y<=2026; y++) { for(var m=1; m<=12; m++) { var v = y + "-" + (m < 10 ? "0" + m : m); var opt = document.createElement('option'); opt.value = v; opt.text = y + "/" + m; if(v === curMonth) opt.selected = true; sel.add(opt); } } }
function setInitialDates() { var now = new Date(); var y = now.getFullYear(), m = now.getMonth() + 1, last = new Date(y, m, 0).getDate(), mStr = ("0" + m).slice(-2); document.getElementById('start-date').value = y + "-" + mStr + "-01"; document.getElementById('end-date').value = y + "-" + mStr + "-" + last; }
function syncMonthToCalendar() { var v = document.getElementById('month-selector').value, p = v.split("-").map(Number), l = new Date(p[0], p[1], 0).getDate(); document.getElementById('start-date').value = v + "-01"; document.getElementById('end-date').value = v + "-" + l; fetchByCOQL(); }

async function fetchByCOQL() {
    allData = []; budgetDataGlobal = null;
    var loadingEl = document.getElementById('loading');
    loadingEl.style.display = 'block';
    loadingEl.innerHTML = "▶ データ取得中...";
    const start = document.getElementById('start-date').value, end = document.getElementById('end-date').value;
    if(!start || !end) return;
    let d = new Date(start); d.setMonth(d.getMonth() - 1); const startWide = d.toISOString().split('T')[0];
    let page = 1, hasMore = true;
    while(hasMore) {
        const offset = (page - 1) * 200;
        const coql = { "select_query": "select ClosingDay, VisitedDateTime, nousyayoteibi, SyaryouCategory, FOrR, Seated, Option1, ServiceStore, ServicePerson, cancel, HanbaiCategory, Option2, Option3, Option15, Option4, Option5, Option16, Option7, Option8, Option9, Option10, Option6, BackCamera, Option17, TradeinCar, PaymentCategory, arari16, arari17, Option14, arari21, arari22, arari23, arari24, arari25 from Services where ((ClosingDay between '" + startWide + "' and '" + end + "') or (VisitedDateTime between '" + start + "T00:00:00+09:00' and '" + end + "T23:59:59+09:00')) limit " + offset + ", 200" };
        try { const res = await ZOHO.CRM.API.coql(coql); if (res.data) { allData = allData.concat(res.data); if (res.info && res.info.more_records) page++; else hasMore = false; } else hasMore = false; } catch (e) { hasMore = false; }
    } 
    await resolveMastersNames(); await fetchAnalyticsBudgets(); renderAll();
}

async function resolveMastersNames() {
    var ids = [...new Set(allData.map(r => r.ServicePerson ? r.ServicePerson.id : null).filter(id => id))];
    await Promise.all(ids.map(async (id) => {
        if (!personMap[id]) {
            try { var res = await ZOHO.CRM.API.getRecord({ Entity: "Masters", RecordID: id }); if (res.data && res.data.length > 0) personMap[id] = res.data[0].Name; } catch (e) {}
        }
    }));
}

async function fetchAnalyticsBudgets() {
    try {
        const res = await ZOHO.CRM.FUNCTIONS.execute("get_dashboard_budgets", { arguments: JSON.stringify({}) });
        if(res && res.details && res.details.output) budgetDataGlobal = JSON.parse(res.details.output);
    } catch(e) {}
}

function createStats() { return { budget_n:0, budget_ar:0, budget_j:0, budget_current:0, j_k:0, j_f:0, v_n_k:0, v_n_f:0, sho_k:0, sho_f:0, ab_k:0, ab_f:0, jk_k:0, jk_f:0, rv_k:0, rv_f:0, rj_k:0, rj_f:0, tot_v_k:0, tot_v_f:0, n_k:0, n_f:0, m_k:0, m_f:0, c_k:0, c_f:0, o2_k:0, o2_f:0, o3_k:0, o3_f:0, pk_k:0, pk_f:0, ct_k:0, ct_f:0, up_k:0, up_f:0, tp_k:0, tp_f:0, ic_k:0, ic_f:0, rst_k:0, rst_f:0, ni_k:0, ni_f:0, nu_k:0, nu_f:0, hp_k:0, hp_f:0, fl_k:0, fl_f:0, aq_k:0, aq_f:0, tr_k:0, tr_f:0, ln_k:0, ln_f:0, l84_k:0, l84_f:0, r69_k:0, r69_f:0, r59_k:0, r59_f:0, r49_k:0, r49_f:0, r39_k:0, r39_f:0, r29_k:0, r29_f:0, low_k:0, low_f:0, zn_k:0, zn_f:0, ar21_k:0, ar21_f:0, ar22_k:0, ar22_f:0, ar23_k:0, ar23_f:0, ar24_k:0, ar24_f:0, ar25_k:0, ar25_f:0, ar_cnt_k:0, ar_cnt_f:0, del_cnt_k:0, del_cnt_f:0, del_ar21_k:0, del_ar21_f:0, del_ar22_k:0, del_ar22_f:0, del_ar23_k:0, del_ar23_f:0, del_ar24_k:0, del_ar24_f:0, del_ar25_k:0, del_ar25_f:0 }; }

function aggregate(s, rec) {
    var c = (rec.SyaryouCategory === "軽" || rec.SyaryouCategory === "軽自動車") ? "k" : "f";
    var vD = (rec.VisitedDateTime || "").split('T')[0], cD = (rec.ClosingDay || ""), nD = (rec.nousyayoteibi || "").split('T')[0], isCancel = (rec.cancel === true || rec.cancel === "true");
    const st = document.getElementById('start-date').value, ed = document.getElementById('end-date').value;
    if (vD && vD >= st && vD <= ed) { s["tot_v_"+c]++; if (rec.FOrR === "初回") s["v_n_"+c]++; if (rec.Seated === "〇") s["sho_"+c]++; if (rec.Option1 === "〇") s["ab_"+c]++; if (rec.FOrR === "初回" && cD === vD && !isCancel) s["jk_"+c]++; if (rec.FOrR === "再来") s["rv_"+c]++; }
    if (cD && cD >= st && cD <= ed && !isCancel) { s["j_"+c]++; if (rec.FOrR === "再来") s["rj_"+c]++; if (rec.HanbaiCategory === "新") s["n_"+c]++; if (rec.HanbaiCategory === "未") s["m_"+c]++; if (rec.HanbaiCategory === "中") s["c_"+c]++; if (rec.Option2 === "〇") s["o2_"+c]++; if (rec.Option3 === "〇") s["o3_"+c]++; if (["新車ﾊﾟｯｸ","未使用ﾊﾟｯｸ","中ｴｺﾊﾟｯｸ","中ｽﾀﾊﾟｯｸ","中ｱﾌﾟﾊﾟｯｸ"].indexOf(rec.Option15) !== -1) s["pk_"+c]++; if (rec.Option4 === "〇") s["ct_"+c]++; if (rec.Option5 === "〇") s["up_"+c]++; if (rec.Option16 === "〇") s["tp_"+c]++; if (rec.Option7 === "〇") s["ic_"+c]++; if (rec.Option8 === "〇") s["rst_"+c]++; if (rec.Option9 === "〇") s["ni_"+c]++; if (rec.Option10 === "〇") s["nu_"+c]++; if (rec.Option6 === "〇") s["hp_"+c]++; if (rec.BackCamera === "〇") s["fl_"+c]++; if (rec.Option17 === "〇") s["aq_"+c]++; if (["✖","✕","×","","null","-","無","なし"].indexOf(rec.TradeinCar || "") === -1) s["tr_"+c]++; if ((rec.PaymentCategory || "").indexOf("ローン") !== -1) { s["ln_"+c]++; if (parseInt(rec.arari16) >= 84) s["l84_"+c]++; var r = parseFloat(rec.arari17)||0; if (r >= 6 && r < 7) s["r69_"+c]++; else if (r >= 5 && r < 6) s["r59_"+c]++; else if (r >= 4 && r < 5) s["r49_"+c]++; else if (r >= 3 && r < 4) s["r39_"+c]++; else if (r >= 2.9 && r < 3) s["r29_"+c]++; else if (r > 0 && r < 2.9) s["low_"+c]++; } if (rec.Option14 === "〇") s["zn_"+c]++; s["ar21_"+c] += (parseFloat(rec.arari21)||0); s["ar22_"+c] += (parseFloat(rec.arari22)||0); s["ar23_"+c] += (parseFloat(rec.arari23)||0); s["ar24_"+c] += (parseFloat(rec.arari24)||0); s["ar25_"+c] += (parseFloat(rec.arari25)||0); s["ar_cnt_"+c]++; }
    if (nD && nD >= st && nD <= ed && !isCancel) { s["del_cnt_"+c]++; s["del_ar21_"+c]+=(parseFloat(rec.arari21)||0); s["del_ar22_"+c]+=(parseFloat(rec.arari22)||0); s["del_ar23_"+c]+=(parseFloat(rec.arari23)||0); s["del_ar24_"+c]+=(parseFloat(rec.arari24)||0); s["del_ar25_"+c]+=(parseFloat(rec.arari25)||0); }
}

// --- メイン描画 ---
function renderAll() {
    var storeSet = new Set();
    allData.forEach(r => { if(r.ServiceStore) storeSet.add(r.ServiceStore); });
    updateSelector('store-selector', storeSet, '全店舗表示');

    var storeSel = document.getElementById('store-selector');
    if (loginUserStore && (storeSel.value === "all" || storeSel.value === "")) {
        for (var i = 0; i < storeSel.options.length; i++) {
            if (storeSel.options[i].value === loginUserStore) { storeSel.value = loginUserStore; break; }
        }
    }
    
    // フィルタリングと各表の描画を実行
    refreshTables();
    document.getElementById('loading').style.display = 'none';
}

function refreshTables() {
    var selectedStore = document.getElementById('store-selector').value;
    staffStatsMaster = {}; staffStoreMap = {};
    var dailyStats = {}; var totalStaffS = createStats(); var totalDailyS = createStats();

    // 1. 日付枠の作成
    var stStr = document.getElementById('start-date').value, edStr = document.getElementById('end-date').value;
    var dIter = new Date(stStr); while (dIter <= new Date(edStr)) { dailyStats[dIter.toISOString().split('T')[0]] = createStats(); dIter.setDate(dIter.getDate() + 1); }

    // 2. 実績集計
    allData.forEach(r => {
        if (selectedStore === "all" || r.ServiceStore === selectedStore) {
            var pr = (r.ServicePerson && r.ServicePerson.id) ? personMap[r.ServicePerson.id] : "未設定";
            if(!staffStatsMaster[pr]) staffStatsMaster[pr] = createStats();
            staffStoreMap[pr] = r.ServiceStore;
            
            aggregate(staffStatsMaster[pr], r);
            aggregate(totalStaffS, r);
            var vD = (r.VisitedDateTime || "").split('T')[0];
            if(dailyStats[vD]) aggregate(dailyStats[vD], r);
        }
    });

    // 3. 予算集計
    if(budgetDataGlobal) {
        var selM = document.getElementById('month-selector').value.replace("-","/");
        if(budgetDataGlobal.sales_budget) budgetDataGlobal.sales_budget.forEach(b => {
            if((b["月"]||"").includes(selM) && (selectedStore === "all" || b["店舗"] === selectedStore)) {
                var pr = b["担当者"]; if(!staffStatsMaster[pr]) staffStatsMaster[pr] = createStats();
                staffStatsMaster[pr].budget_j += parseInt(b["成約台数予算"])||0;
                staffStatsMaster[pr].budget_n += parseInt(b["納車予算"])||0;
                staffStatsMaster[pr].budget_ar += parseInt(b["粗利予算"])||0;
                totalStaffS.budget_j += parseInt(b["成約台数予算"])||0;
                totalStaffS.budget_n += parseInt(b["納車予算"])||0;
                totalStaffS.budget_ar += parseInt(b["粗利予算"])||0;
            }
        });
        if(budgetDataGlobal.daily_budget) budgetDataGlobal.daily_budget.forEach(b => {
            var d = (b["日"]||"").replace(/\//g, "-");
            if(dailyStats[d] && (selectedStore === "all" || b["店舗"] === selectedStore)) {
                var v = parseInt(b["成約台数予算"])||0;
                dailyStats[d].budget_current += v; totalDailyS.budget_current += v;
            }
        });
    }

    // 4. テーブル出力
    document.getElementById("staff-table-container").innerHTML = buildTable(staffStatsMaster, "担当者名", totalStaffS);
    document.getElementById("daily-table-container").innerHTML = buildDailyTable(dailyStats, totalDailyS);
}

// --- 描画関数 ---
function buildDailyTable(sum, totalS) {
    var h = "<table><thead><tr><th class='shop-header'>日付</th><th class='shop-header'>予算</th><th class='shop-header'>実績</th><th class='shop-header'>達成率</th><th class='shop-header'>新規</th><th class='shop-header'>再来</th><th class='shop-header'>粗利</th></tr></thead><tbody>";
    Object.keys(sum).sort().forEach(date => {
        var s = sum[date], j = (s.j_k||0)+(s.j_f||0), v = (s.v_n_k||0)+(s.v_n_f||0), bud = s.budget_current||0;
        h += "<tr><td class='sticky-col-item' style='left:0; width:80px !important;'>"+date.split("-")[2]+"日</td><td>"+bud+"</td><td style='background:#ffe599'>"+j+"</td><td>"+(bud>0?Math.round(j/bud*100):0)+"%</td><td>"+v+"</td><td>"+((s.rv_k||0)+(s.rv_f||0))+"</td><td>"+((s.ar25_k||0)+(s.ar25_f||0)).toLocaleString()+"</td></tr>";
    });
    return h + "</tbody></table>";
}

function buildTable(sum, title, totalS) {
    var keys = Object.keys(sum).sort(), h = "<table><thead><tr><th class='sticky-col-item shop-header'>"+title+"</th><th class='sticky-col-total shop-header' style='left:170px;'>合計</th>";
    for(var i=0; i<keys.length; i++) h += "<th class='shop-header'>"+keys[i]+"</th>";
    h += "</tr></thead><tbody>";
    const rows = [
        { sec: "予算・目標" }, { lbl: "予算", m: "budget_j", type: "total_only" }, { lbl: "現時点予算", m: "budget_current", type: "total_only" },
        { sec: "基本実績" }, { lbl: "実績", m: "j", cls: "#ffe599" }, { lbl: "達成率", type: "total_ratio", n: "j", d: "budget_j" }, { lbl: "新規接客数", m: "v_n" },
        { sec: "受注時想定" }, { lbl: "受注台数", type: "arari_val", val: "j", cls: "#ead1dc" }, { lbl: "総粗利(込)", type: "arari_sum", val: "ar25", cls: "#ead1dc" },
        { sec: "納車着地予測" }, { lbl: "納車台数", type: "del_arari_val", val: "del_cnt", cls: "#d9ead3" }, { lbl: "総粗利(込)", type: "del_arari_sum", val: "del_ar25", cls: "#d9ead3" }
    ];
    rows.forEach(r => {
        if(r.sec) h += "<tr><td class='section-row'>"+r.sec+"</td><td class='section-row' style='left:170px;'></td><td colspan='"+keys.length+"' class='section-row'></td></tr>";
        else { h += "<tr><td class='sticky-col-item' style='background:"+(r.cls||"#fff")+"'>"+r.lbl+"</td>"+renderCell(totalS, r, true); for(var k=0; k<keys.length; k++) h += renderCell(sum[keys[k]], r, false); h += "</tr>"; }
    });
    return h + "</tbody></table>";
}

function renderCell(s, r, isT) {
    var kVal="-", fVal="-", tVal="-", bg=r.cls||"#ffffff", c=isT?"sticky-col-total ":"";
    if(r.type==="total_only") { tVal=(s[r.m]||0).toLocaleString(); return "<td class='"+c+"' style='background:"+bg+"'>"+tVal+"</td>"; }
    if(r.type==="total_ratio") { var act = (r.n==="del_ar25")?((s.del_ar25_k||0)+(s.del_ar25_f||0)):((s[r.n+"_k"]||0)+(s[r.n+"_f"]||0)), bud=s[r.d]||0; return "<td class='"+c+"' style='background:"+bg+"'>"+(bud>0?Math.round(act/bud*100):0)+"%</td>"; }
    var isA = r.type && r.type.startsWith("arari"), isD = r.type && r.type.startsWith("del_arari");
    if(isA || isD) {
        if(r.type.endsWith("_val")) { tVal=((s[r.val+"_k"]||0)+(s[r.val+"_f"]||0)).toLocaleString(); kVal=(s[r.val+"_k"]||0).toLocaleString(); fVal=(s[r.val+"_f"]||0).toLocaleString(); }
        else if(r.type.endsWith("_sum")) { tVal=((s[r.val+"_k"]||0)+(s[r.val+"_f"]||0)).toLocaleString(); kVal=Math.round(s[r.val+"_k"]||0).toLocaleString(); fVal=Math.round(s[r.val+"_f"]||0).toLocaleString(); }
        return "<td class='"+c+"' style='background:"+bg+"'><div class='cell-stack'><div class='bg-sou-upper'>"+tVal+"</div><div class='bg-sou-lower'><div class='val-kei'>"+kVal+"</div><div class='val-fu'>"+fVal+"</div></div></div></td>";
    }
    if(r.lbl==="実績" && !r.type) { tVal=((s.j_k||0)+(s.j_f||0)).toLocaleString(); kVal=(s.j_k||0).toLocaleString(); fVal=(s.j_f||0).toLocaleString(); return "<td class='"+c+"' style='background:"+bg+"'><div class='cell-stack'><div class='stack-label-3'><div>軽</div><div>普</div></div><div class='stack-values-3'><div class='val-kei'>"+kVal+"</div><div class='val-fu'>"+fVal+"</div></div><div class='stack-total-3'>"+tVal+"</div></div></td>"; }
    kVal=(s[r.m+"_k"]||0).toLocaleString(); fVal=(s[r.m+"_f"]||0).toLocaleString(); tVal=((s[r.m+"_k"]||0)+(s[r.m+"_f"]||0)).toLocaleString();
    return "<td class='"+c+"' style='background:"+bg+"'><div class='cell-stack'><div class='stack-upper'><div class='val-kei'>"+kVal+"</div><div class='val-fu'>"+fVal+"</div></div><div class='stack-lower'>"+tVal+"</div></div></td>";
}

function updateSelector(id, set, def) { var sel=document.getElementById(id); var cur=sel.value; sel.innerHTML='<option value="all">'+def+'</option>'; Array.from(set).sort().forEach(v=>{ var o=document.createElement('option'); o.value=o.text=v; sel.add(o); }); if(cur) sel.value=cur; }
function showPage(id) { document.querySelectorAll('.page-content').forEach(p=>p.classList.remove('active')); document.getElementById(id).classList.add('active'); document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active')); document.getElementById('btn-'+id.replace('-page','')).classList.add('active'); }
