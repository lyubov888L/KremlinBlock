var bandomains = ["yandex.ru", "yadro.ru", "yandex.st",  
    "vk.me", "vk.com", "vkontakte.ru", 
    "rambler.ru", "adfox.ru", "top100.ru", "tns-counter.ru", 
    "xiti.com", "advombat.ru", "audtd.com", "begun.ru", 
    "memonet.ru", "adru.net", "list.ru", "mail.ru", 
    "ok.ru", "odnoklassniki.ru", "smi2.ru", "finam.ru", "mirtesen.ru", 
    "adriver.ru", "revsci.net", "openstat.net", "botscanner.com",
    "rtb-media.ru", "alfatarget.ru", "reformal.ru", "visitweb.com",
    "marketgid.com", "admixer.net", "go7media.ru", "globalteaser.ru",
    "luxup.ru", "dessaly.com", "quantserve.com", "marketo.net", 
    "digitaltarget.ru", "24smi.net", "24smi.org", "actionteaser.ru", 
    "directadvert.ru", 
    ]

var whitelist = {"vk.com":{whitelist:["vk.com","vkontakte.ru", "vk.me"]}, 
        "ok.ru":{whitelist:["ok.ru", "odnoklassniki.ru"]},
        "yandex.ru":{whitelist:["yandex.ru", "yandex.st", "yandex.ua"]},
        "yandex.ua":{whitelist:["yandex.ru", "yandex.st", "yandex.ua"]}
        }

var hosts = {}      
for(var i in bandomains){
            var domain = bandomains[i];
            hosts[domain] = true;
}      

function hasSuffix(host, domain){
    var suffix = "."+domain;
    return host.endsWith(suffix) || host == domain;             
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var global = {cnt:0}
var tabs={}

function tabsDomain(tabId, host){
    
    
    if(tabId in tabs){
    }else{
        tabs[tabId] = {cnt:0, patterns:{}, hosts:{}}
    }
    tabs[tabId].host = host
    tabs[tabId].r_cnt = 0
    tabs[tabId].r_patterns = {}
    tabs[tabId].r_hosts = {}
    
    

    var wl = null;
    for(var domain in whitelist){
        if(hasSuffix(host, domain)){
            console.log("whitelist tab", tabId, host, domain, whitelist[domain])
            wl = domain;
        }
    }

    tabs[tabId].whitelist = wl

    var wl2 = null;
    
    for(var i in bandomains){
        var domain = bandomains[i]
        if(hasSuffix(host, domain)){
            console.log("whitelist2 tab", tabId, host, domain)
            wl2 = domain;
        }
    }

    tabs[tabId].whitelist2 = wl2

    chrome.browserAction.setBadgeText({text: "", tabId: tabId});

}
function tabsReportBlock(tabId, x1){
    global.cnt++
    
    if(tabId in tabs){
    }else{
         console.log("error: tab not found ", tabId, x1)
        return
    }
    
    var tab = tabs[tabId]
    tab.cnt++
    tab.r_cnt++
    
    if(x1.pattern in tab.patterns){
    }else{
        tab.patterns[x1.pattern] = {cnt:0}
    }
    tab.patterns[x1.pattern].cnt++
    
    
    if(x1.pattern in tab.r_patterns){
    }else{
        tab.r_patterns[x1.pattern] = {cnt:0}
    }
    tab.r_patterns[x1.pattern].cnt++
    
    
    if(x1.host in tab.hosts){
    }else{
        tab.hosts[x1.host] = {cnt:0}
    }
    tab.hosts[x1.host].cnt++
    
    
    if(x1.host in tab.r_hosts){
    }else{
        tab.r_hosts[x1.host] = {cnt:0}
    }
    tab.r_hosts[x1.host].cnt++
    
    
    chrome.browserAction.setBadgeText({text: ""+tab.cnt, tabId: tabId});
    chrome.browserAction.setBadgeBackgroundColor({ color: "#44a" });

    
}

function isWhiteListed(tabId, host){
    if(!(tabId in tabs)) return false;
    
    if(tabs[tabId].whitelist2 != null){
        if(hasSuffix(host, tabs[tabId].whitelist2)) return true;
    }
    
    if(tabs[tabId].whitelist == null) return false;
    
    var rule = whitelist[tabs[tabId].whitelist];
    
    for(var id in rule.whitelist){
        var domain = rule.whitelist[id];
        if(hasSuffix(host, domain)){
            return true;
        }
    }
    return false;
}

function onTabClosedHandler(tabId) {
    console.log("Close tab " + tabId);
    delete tabs[tabId];
}
      
      
      
function onBeforeRequestHandler(details) {
      //console.log(details);
      if (0)
        return { cancel: false };
        
        var pos1 = details.url.indexOf(":")
        if(pos1 == -1)         return { cancel: false };
        var pos2 = details.url.indexOf("/", pos1 + 3)
        if(pos1 == -1)         return { cancel: false };
        var host = details.url.substring(pos1+3, pos2);

        if(details.type == "main_frame"){
            tabsDomain(details.tabId, host);
            return { cancel: false };
        }else if(isWhiteListed(details.tabId, host)){
            return { cancel: false };
        }
    

        //console.log(host);
        if(!hosts[host]){
            hosts[host] = true;
            console.log("New domain: ", host, details);
        }
        
        for(var i in bandomains){
            var domain = bandomains[i];
            if(hasSuffix(host, domain)){
                console.log("### " + host);
                tabsReportBlock(details.tabId, {host: host, pattern: domain});
               
                return { cancel: true };
            }
       }


                
        return { cancel: false  };
 
 
      if (blocked && elType === ElementTypes.image) {
        // 1x1 px transparant image.
        // Same URL as ABP and Ghostery to prevent conflict warnings (issue 7042)
        return {redirectUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="};
      }
      if (blocked && elType === ElementTypes.subdocument) {
        return { redirectUrl: "about:blank" };
      }
      return { cancel: blocked };
}        

    chrome.webRequest.onBeforeRequest.addListener(onBeforeRequestHandler, {urls: ["http://*/*", "https://*/*"]}, ["blocking"]);
    chrome.tabs.onRemoved.addListener(onTabClosedHandler);
    
rnd = function(){
    return "haha-"+Math.random();
}
getCurrentTabInfo = function(cb) {
    chrome.tabs.query({active: true, currentWindow: true}, function(_tabs) {
      if (_tabs.length === 0)
        return;
      var _tab = _tabs[0];
      var tab = tabs[_tab.id]
      if (tab === undefined){
            return;
      }
      var o1 = {g_cnt: global.cnt, t_cnt: tab.cnt, tab: tab}
      cb(o1)
    })
}
