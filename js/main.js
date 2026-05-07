function buildDailyTable(sum, totalS) {
    const wDays = ["日", "月", "火", "水", "木", "金", "土"];
    var h = "<table class='daily-table'><thead>";
    
    // 1段目ヘッダー
    h += "<tr><th rowspan='2' colspan='2' class='w-date-n'>日付</th><th rowspan='2' class='w-num'>新規<br>来場</th><th rowspan='2' class='w-num'>再<br>来場</th><th rowspan='2' class='w-num'>総<br>来場</th>" +
         "<th rowspan='2' class='w-mid' style='background:#fff2cc; color:#000;'>予算</th><th rowspan='2' class='w-mid' style='background:#fff2cc; color:#000;'>着地<br>予想</th><th rowspan='2' class='w-num'>実績</th><th rowspan='2' class='w-mid'>予算<br>進捗</th><th rowspan='2' class='w-mid'>予想<br>進捗</th><th rowspan='2' class='w-num'>商談<br>数</th><th rowspan='2' class='w-rate'>商談<br>率</th><th rowspan='2' class='w-rate'>成約<br>率</th>" +
         "<th colspan='3' class='bg-last-year'>合計(昨年)</th><th colspan='3' class='bg-last-year'>軽(昨年)</th><th colspan='3' class='bg-last-year'>普通(昨年)</th>" +
         "<th colspan='3' class='bg-now-k'>軽自動車</th><th colspan='3' class='bg-now-f'>普通車</th></tr>";
         
    // 2段目ヘッダー
    h += "<tr><th class='bg-last-year w-last'>新</th><th class='bg-last-year w-last'>再</th><th class='bg-last-year w-last'>成</th><th class='bg-last-year w-last'>新</th><th class='bg-last-year w-last'>再</th><th class='bg-last-year w-last'>成</th><th class='bg-last-year w-last'>新</th><th class='bg-last-year w-last'>再</th><th class='bg-last-year w-last'>成</th>" +
         "<th class='bg-now-k w-last'>新</th><th class='bg-now-k w-last'>再</th><th class='bg-now-k w-last'>実</th><th class='bg-now-f w-last'>新</th><th class='bg-now-f w-last'>再</th><th class='bg-now-f w-last'>実</th></tr></thead><tbody>";

    Object.keys(sum).sort().forEach(date => {
        var s = sum[date]; var d = new Date(date);
        var vn = (s.v_n_k||0)+(s.v_n_f||0), rv = (s.rv_k||0)+(s.rv_f||0), totv = vn+rv, act = (s.j_k||0)+(s.j_f||0), bud = s.budget_current||0, sho = (s.sho_k||0)+(s.sho_f||0);
        var prog = act - bud; var w = d.getDay();
        var rowStyle = w === 0 ? "color:red;" : (w === 6 ? "color:blue;" : "");
        
        h += `<tr><td class='w-date-n'>${d.getDate()}</td><td class='w-date-w' style='${rowStyle}'>${wDays[w]}</td>` +
             `<td class='w-num'>${vn||""}</td><td class='w-num'>${rv||""}</td><td class='w-num'>${totv||""}</td>` +
             `<td class='w-mid' style='background:#fff2cc;'>${bud||""}</td><td class='w-mid' style='background:#fff2cc;'>${bud||""}</td>` +
             `<td class='w-num'>${act||""}</td><td class='w-mid' style='${prog < 0 ? "color:red" : ""}'>${prog||"0"}</td><td class='w-mid'>0</td>` +
             `<td class='w-num'>${sho||""}</td><td class='w-rate'>${vn?Math.round(sho/vn*100):0}%</td><td class='w-rate'>${totv?Math.round(act/totv*100):0}%</td>` +
             `<td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td>` + 
             `<td class='w-last'>${s.v_n_k||""}</td><td class='w-last'>${s.rv_k||""}</td><td class='w-last'>${s.j_k||""}</td>` +
             `<td class='w-last'>${s.v_n_f||""}</td><td class='w-last'>${s.rv_f||""}</td><td class='w-last'>${s.j_f||""}</td></tr>`;
    });

    // 合計行
    var t = totalS;
    var tvn = (t.v_n_k||0)+(t.v_n_f||0), trv = (t.rv_k||0)+(t.rv_f||0), ttot = tvn+trv, tact = (t.j_k||0)+(t.j_f||0), tbud = t.budget_current||0, tsho = (t.sho_k||0)+(t.sho_f||0);
    h += `<tr class='daily-total-row'><td colspan='2'>合計</td><td class='w-num'>${tvn}</td><td class='w-num'>${trv}</td><td class='w-num'>${ttot}</td><td class='w-mid' style='background:#ffd966'>${tbud}</td><td class='w-mid' style='background:#ffd966'>${tbud}</td><td class='w-num'>${tact}</td><td class='w-mid'>${tact-tbud}</td><td class='w-mid'>0</td><td class='w-num'>${tsho}</td><td class='w-rate'>${tvn?Math.round(tsho/tvn*100):0}%</td><td class='w-rate'>${ttot?Math.round(tact/ttot*100):0}%</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>-</td><td class='w-last'>${t.v_n_k}</td><td class='w-last'>${t.rv_k}</td><td class='w-last'>${t.j_k}</td><td class='w-last'>${t.v_n_f}</td><td class='w-last'>${t.rv_f}</td><td class='w-last'>${t.j_f}</td></tr>`;

    return h + "</tbody></table>";
}
