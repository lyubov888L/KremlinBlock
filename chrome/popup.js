var BG = chrome.extension.getBackgroundPage();

document.addEventListener('DOMContentLoaded', function() {
    
    BG.getCurrentTabInfo(function(o1){
        document.getElementById('g_cnt').textContent = o1.g_cnt     
        document.getElementById('t_cnt').textContent = o1.t_cnt     


    
        var report = "This Page:\n\n"



        for (var i in o1.tab.r_patterns){
            var pattern = o1.tab.r_patterns[i]
            report += i + ": " + pattern.cnt + "\n"
        }
        
        report += "\nTab Total:\n\n"

        for (var i in o1.tab.patterns){
            var pattern = o1.tab.patterns[i]
            report += i + ": " + pattern.cnt + "\n"
        }
        
        document.getElementById('status').textContent = report;


    })
    
});
