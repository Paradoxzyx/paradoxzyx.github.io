$(() => {
  loadData()
  
  //---------------------------------------- Points
  points = {
    trickster: 21,
    pyromancer: 21,
    devastator: 21,
    technomancer: 21
  }
  $("#points").text(20)
  
  //---------------------------------------- Load URL Params
  url = {
    trickster: [],
    pyromancer: [],
    devastator: [],
    technomancer: []
  }
  power = {
    trickster: [],
    pyromancer: [],
    devastator: [],
    technomancer: []
  }

  let search = new URLSearchParams(location.search)
  active = url.hasOwnProperty(search.get("c")) ? search.get("c") : "pyromancer"
  $("#nav .button[data-class=" + active + "]").addClass("active")
  activetree = $("." + active + ".skilltree").show()
  activestats = $("." + active + ".statstable").show()
  
  let p = search.get("p")
  if (p) {
    $.each(p.split(",").map(Number), (i, n) => {
      $(".power[data-i=" + n + "]", activestats).addClass("active")
      power[active].push(n)
    })
  }
  
  let s = search.get("s") || "A-g"
  //--- URL Backwards Compatability
  if (s.includes(",") || s == "0") {
    s = s.split(",").map(Number)
  }
  else {
    s = decode(s)
  }
  //---
  let l = skills[active].length
  $.each(s, (i, n) => {
    if (n < l) {
      add(n)
    }
  })
  encode()
  
  //---------------------------------------- Bind Elements
  bindElements()
  
  //---------------------------------------- Load Cookies
  $.each(document.cookie.split(";"), (i, s) => {
    let cookie = s.split("=")
    if (+cookie[1]) {
      $("#" + cookie[0].trim()).prop("checked", false).click()
    }
  })
  
  //---------------------------------------- Bread
  $("body").append($("<div>").css("position", "relative")
    .append($("<img>").attr({ src: "favicon.ico", width: 24, height: 24 }).css({ position: "absolute", top: "600px", right: "1%" })))
})

//---------------------------------------- Add node
function add(id) {
  let node = skills[active][id]
  
  //--- Activate node
  node[0] = 2
  $(".node", activetree).eq(id).removeClass("activatable").addClass("active")
  $("#points").text(--points[active])
  
  //--- Stats
  let stat = node[4]
  $.each(stat, (k, v) => {
    if (stats[active][k][1]) {
      stats[active][k][0] += v
      $(".stat[data-s=\"" + k + "\"] .stat-v", activestats).removeClass("stat-0 stat-1 stat-2 stat-3").addClass("stat-" + Math.floor(stats[active][k][0] / stats[active][k][1] * 3)).text(+(stats[active][k][0] * 100).toFixed(1) + "%")
      $(".stat[data-s=\"" + k + "\"] .stat-c", activestats).text(++stats[active][k][2])
    }
    $(".stat[data-s=\"" + k + "\"]", activestats).removeClass("inactive").show()
  
    //--- Ability Cooldowns
    if (k.startsWith("Skill Cooldown")) {
      let type = k.replace(/Skill Cooldown \((.+?)\)/, "$1")
      cooldowns[type] -= v
      $.each(abilities[active][type], (name, cd) => {
        $(".cooldowns div[data-n=\"" + name + "\"] .cooldown").removeClass("stat-0 stat-1 stat-2 stat-3").addClass("stat-" + Math.floor(stats[active][k][0] / stats[active][k][1] * 3)).text(+(cd * cooldowns[type]).toFixed(1))
      })
    }
  })
  
  //--- Unique Node Skill Count
  if ([ "Concentration", "Magma Golem", "Anomaly in Veins", "Br/8 Impact Amplifier" ].includes(skills[active][id][3])) {
    $(".stat .unique", activestats).attr("data-c", +$(".stat .unique", activestats).attr("data-c") + 1)
    $(".stat .unique", activestats).text(+($(".stat .unique", activestats).attr("data-v") * $(".stat .unique", activestats).attr("data-c") * 100).toFixed(1) + "%")
  }
  
  //--- Sort Stats
  if ($("#sortstats").prop("checked")) {
    sortstats()
  }
  
  //--- Set non-active children to activatable
  $.each(node[2], (i, n) => {
    if (skills[active][n][0] != 2) {
      skills[active][n][0] = 1
      $(".node", activetree).eq(n).addClass("activatable")
    }
  })
  
  //--- Update URL
  url[active].push(id)
  url[active].sort((a, b) => a - b)
}

//---------------------------------------- Remove node
function remove(id) {
  let node = skills[active][id]
  
  //--- Deactivate node
  node[0] = 1
  $(".node", activetree).eq(id).removeClass("active").addClass("activatable")
  $("#points").text(++points[active])
  
  //--- Stats
  let stat = node[4]
  $.each(stat, (k, v) => {
    if (stats[active][k][1]) {
      stats[active][k][0] -= v
      $(".stat[data-s=\"" + k + "\"] .stat-v", activestats).removeClass("stat-0 stat-1 stat-2 stat-3")
      $(".stat[data-s=\"" + k + "\"] .stat-c", activestats).text(--stats[active][k][2])
    }
    if (stats[active][k][0]) {
      $(".stat[data-s=\"" + k + "\"] .stat-v", activestats).addClass("stat-" + Math.floor(stats[active][k][0] / stats[active][k][1] * 3)).text(+(stats[active][k][0] * 100).toFixed(1) + "%")
    }
    else {
      if (!$("#allstats").prop("checked")) {
        $(".stat[data-s=\"" + k + "\"]", activestats).hide()
      }
      $(".stat[data-s=\"" + k + "\"]", activestats).addClass("inactive")
      $(".stat[data-s=\"" + k + "\"] .stat-v", activestats).text("0%")
    }
  
    //--- Ability Cooldowns
    if (k.startsWith("Skill Cooldown")) {
      let type = k.replace(/Skill Cooldown \((.+?)\)/, "$1")
      cooldowns[type] += v
      $.each(abilities[active][type], (name, cd) => {
        $(".cooldowns div[data-n=\"" + name + "\"] .cooldown").removeClass("stat-0 stat-1 stat-2 stat-3").text(+(cd * cooldowns[type]).toFixed(1))
        if (stats[active][k][0]) {
          $(".cooldowns div[data-n=\"" + name + "\"] .cooldown").addClass("stat-" + Math.floor(stats[active][k][0] / stats[active][k][1] * 3))
        }
      })
    }
  })
  
  //--- Unique Node Skill Count
  if ([ "Concentration", "Magma Golem", "Anomaly in Veins", "Br/8 Impact Amplifier" ].includes(skills[active][id][3])) {
    $(".stat .unique", activestats).attr("data-c", +$(".stat .unique", activestats).attr("data-c") - 1)
    $(".stat .unique", activestats).text(+($(".stat .unique", activestats).attr("data-v") * $(".stat .unique", activestats).attr("data-c") * 100).toFixed(1) + "%")
  }
  
  //--- Sort Stats
  if ($("#sortstats").prop("checked")) {
    sortstats()
  }
  
  //--- Get all activatable child nodes
  let children = []
  $.each(node[2], (i, n) => {
    if (skills[active][n][0] == 1) {
      children.push(n)
    }
  })
  
  //--- Set activatable child nodes with no other active parents to inactive
  $.each(children, (i, n) => {
    let x = 1
    $.each(skills[active][n][1], (j, m) => {
      if (skills[active][m][0] == 2) {
        x = 0
        return false
      }
    })
    if (x) {
      skills[active][n][0] = 0
      $(".node", activetree).eq(n).removeClass("activatable")
    }
  })
  
  //--- Update URL
  url[active].splice($.inArray(id, url[active]), 1)
  encode()
}

//---------------------------------------- Check tree
function check(id) {
  tree = [ id ]
  recurse(0)
  tree.shift()
  
  //--- Check for invalid active child node
  let x = 1
  $.each(skills[active][id][2], (i, n) => {
    if (skills[active][n][0] == 2 && !tree.includes(n)) {
      x = 0
      return false
    }
  })
  return x
}

//---------------------------------------- Recurse children
function recurse(id) {
  $.each(skills[active][id][2], (i, n) => {
    if (skills[active][n][0] == 2 && !tree.includes(n)) {
      tree.push(n)
      recurse(n)
    }
  })
}

//---------------------------------------- URL Encode
//--- [MODIFIED] https://coolaj86.com/articles/bigints-and-base64-in-javascript/
function encode() {
  let hex = BigInt("10" + url[active].map(x => x.toString().length == 1 ? "0" + x : x).join("")).toString(16)
  if (hex.length % 2) {
    hex = "0" + hex
  }
  let bin = []
  for (let i = 0; i < hex.length; i += 2) {
    bin.push(String.fromCharCode(parseInt(hex.slice(i, i + 2), 16)))
  }
  bin = btoa(bin.join("")).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  history.replaceState(null, "", "?c=" + active + (url[active].length > 1 ? "&s=" + bin : "") + (power[active].length ? "&p=" + power[active].join(",") : ""))
}

function decode(e) {
  e = e.replace(/-/g, "+").replace(/_/g, "/")
  let r = e % 4
  if (r == 2) {
    e += "=="
  }
  else if (r == 3) {
    e += "="
  }
  
  let bin = atob(e)
  let hex = []
  $.each(bin.split(""), (i, ch) => {
    let h = ch.charCodeAt(0).toString(16)
    if (h.length % 2) {
      h = "0" + h
    }
    hex.push(h)
  })
  
  let str = BigInt("0x" + hex.join("")).toString()
  let arr = []
  for (let i = 0; i < str.length - 1; i += 2) {
    arr.push(+(str[i].toString() + str[i + 1].toString()))
  }
  arr.shift()
  
  return arr
}

//---------------------------------------- Search
function search() {
  $(".node", activetree).removeClass("highlight")
  let s = $("#searchtext").val().toLowerCase()
  if (s) {
    $.each(skills[active], (i, n) => {
      $.each(n[4], (k, v) => {
        if (k.toLowerCase().includes(s)) {
          $(".node", activetree).eq(i).addClass("highlight")
          return false
        }
      })
    })
    $("#searchcount").text("(" + $(".node.highlight", activetree).length + " matches)")
  }
  else {
    $("#searchcount").text("")
  }
}

//---------------------------------------- Sort Stats --- Wow this is ugly
function sortstats() {
  let table = $("table", activestats).first()
  table.children().sort((a, b) => +($(".stat-v", b).attr("class").split(/\s+/)[1] || "-1").replace("stat-", "") - +($(".stat-v", a).attr("class").split(/\s+/)[1] || "-1").replace("stat-", "") || $(a).attr("data-s").localeCompare($(b).attr("data-s"))).appendTo(table)
  table = $("table", activestats).last()
  table.children().sort((a, b) => $(a).hasClass("inactive") - $(b).hasClass("inactive") || $(a).attr("data-s").localeCompare($(b).attr("data-s"))).appendTo(table)
}

//---------------------------------------- Color Keywords
function color(s, keywords) {
  $.each(keywords, (k, v) => {
    if (s.match(v)) {
      s = s.replace(v, "<span class=\"" + k + "\">$1</span>")
    }
  })
  return s
}

//---------------------------------------- Bind Elements
function bindElements() {
  //---------------------------------------- Disable default right-click on image, nodes, powers
  $("img, .node, .power").bind("contextmenu", () => false)
  
  //---------------------------------------- Click node
  $(".node").on("mousedown", function() {
    let id = +$(this).index()
    if (skills[active][id][0] == 1 && points[active] > 0) {
      add(id)
      encode()
    }
    else if (skills[active][id][0] == 2 && id != 0 && check(id)) {
      remove(id)
    }
  })
  
  //---------------------------------------- Reset tree
  $("#reset").on("click", () => {
    //--- Set all nodes to inactive
    $.each(skills[active], (i, s) => s[0] = 0)
    $(".node", activetree).removeClass("active activatable")
    
    //--- Clear stats
    if (!$("#allstats").prop("checked")) {
      $(".stat", activestats).hide()
    }
    $(".stat", activestats).addClass("inactive")
   
    $.each(stats[active], (k, s) => s[0] = s[2] = 0)
    $(".stat .stat-v", activestats).removeClass("stat-0 stat-1 stat-2 stat-3").text("0%")
    $(".stat .stat-c", activestats).text(0)
    
    //--- Unique Node Skill Count
    $(".stat .unique", activestats).attr("data-c", 0).text("0%")
  
    //--- Ability Cooldowns
    $.each(abilities[active], (type, list) => {
      cooldowns[type] = 1
      $.each(list, (name, cd) => {
        $(".cooldowns div[data-n=\"" + name + "\"] .cooldown", activestats).text(cd)
      })
    })
    $(".cooldowns .cooldown", activestats).removeClass("stat-0 stat-1 stat-2 stat-3")
    
    //--- Add node 0
    url[active] = []
    points[active] = 21
    skills[active][0][0] = 1
    add(0)
    encode()
  })
  
  //---------------------------------------- Change Tree
  $("#nav-trickster, #nav-pyromancer, #nav-devastator, #nav-technomancer").on("click", function() {
    activetree.hide()
    activestats.hide()
    $("#searchcount").text("")
    $(".node", activetree).removeClass("highlight")
    $("#nav .button").removeClass("active")
    
    active = $(this).attr("data-class")
    $(this).addClass("active")
    activetree = $("." + active + ".skilltree").show()
    activestats = $("." + active + ".statstable").show()
    
    $("#points").text(points[active])
    if (!url[active].length) {
      add(0)
    }
    encode()
  })
  
  //---------------------------------------- Search
  $("#search .button").on("click", search)
  
  $("#searchtext").keyup(e => {
    if (e.keyCode == 13) {
      search()
    }
  })
  
  //---------------------------------------- Click Powers
  $(".power").on("mousedown", function() {
    let id = +$(this).attr("data-i")
    if ($(this).hasClass("active")) {
      $(this).removeClass("active")
      power[active].splice($.inArray(id, power[active]), 1)
    }
    else if ($(".power.active", activestats).length < 3) {
      $(this).addClass("active")
      power[active].push(id)
      power[active].sort((a, b) => a - b)
    }
    encode()
  })
  
  //---------------------------------------- DPS Calculator
  $("#dps-input input").on("input", () => {
    let clip = +$("#dps-in-clip").val() || 1
    let rpm = +$("#dps-in-rpm").val() || 1
    let dmg = +$("#dps-in-dmg").val() || 0
    let reload = +$("#dps-in-reload").val() || 0
    let crit = (+$("#dps-in-crit").val() || 100) / 100 - 1
    let acc = (+$("#dps-in-acc").val() || 0) / 100
    let rof = rpm / 60
    let dmgcrit = dmg * (1 + crit * acc)
    $("#dps-dmg").text(+dmg.toFixed(1))
    $("#dps-crit").text(+(dmg * (1 + crit)).toFixed(1))
    $("#dps-clip").text(+(dmgcrit * clip).toFixed(1) + " (" + +(clip / rof).toFixed(1) + "s)")
    $("#dps-simple").text(+(dmgcrit * rof).toFixed(1))
    $("#dps-true").text(+((dmgcrit * clip) / (clip / rof + reload)).toFixed(1))
  })
  
  //---------------------------------------- Options
  $("#nodenames").on("click", function() {
    if ($(this).prop("checked")) {
      $(".node .name").show()
      document.cookie = "nodenames=1;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
    else {
      $(".node .name").hide()
      document.cookie = "nodenames=0;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
  })
  
  $("#allstats").on("click", function() {
    if ($(this).prop("checked")) {
      $(".stat.inactive").show()
      document.cookie = "allstats=1;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
    else {
      $(".stat.inactive").hide()
      document.cookie = "allstats=0;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
  })
  
  $("#maxstats").on("click", function() {
    if ($(this).prop("checked")) {
      $(".stat .stat-m").show()
      document.cookie = "maxstats=1;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
    else {
      $(".stat .stat-m").hide()
      document.cookie = "maxstats=0;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
  })
  
  $("#nodecount").on("click", function() {
    if ($(this).prop("checked")) {
      $(".stat .stat-n").show()
      document.cookie = "nodecount=1;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
    else {
      $(".stat .stat-n").hide()
      document.cookie = "nodecount=0;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
  })

  $("#sortstats").on("click", function() {
    if ($(this).prop("checked")) {
      sortstats()
      document.cookie = "sortstats=1;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
    else {
      let table = $("table", activestats).first()
      table.children().sort((a, b) => $(a).attr("data-s").localeCompare($(b).attr("data-s"))).appendTo(table)
      table = $("table", activestats).last()
      table.children().sort((a, b) => $(a).attr("data-s").localeCompare($(b).attr("data-s"))).appendTo(table)
      document.cookie = "sortstats=0;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
  })
}

//---------------------------------------- Load Data
function loadData() {  
  //---------------------------------------- Skills
  skills = {
    trickster: [
      /* 0  */ [ 1, [], [ 1, 30, 55 ], "", { "Health": 0.05, "Damage Mitigation while Shield is active": 0.05, "[HM] Every Close Range kill Heals you for 20% of your Maximum Health and grants you 12% Shield": null } ],
      
      /* 1  */ [ 0, [ 0, 2, 3 ], [ 2, 3 ], "Arms Trick", { "Weapon Damage (Close Range)": 0.15 } ],
      /* 2  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Bulletstorm", { "Reload Time": -0.2 } ],
      /* 3  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Ace of Trumps", { "Armor Piercing": 0.1 } ],
      /* 4  */ [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], "Death Probability", { "Weapon Damage": 0.08 } ],
      /* 5  */ [ 0, [ 4 ], [], "Shotgun Master", { "Weapon Damage (Shotgun)": 0.15, "Drop Rate (Shotgun)": 0.2 } ],
      /* 6  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Equlibrium", { "Skill Cooldown (Movement)": 0.15 } ],
      /* 7  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Deadly Shadow", { "Crit Damage": 0.2 } ],
      /* 8  */ [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], "Arms Trick", { "Weapon Damage (Close Range)": 0.15 } ],
      /* 9  */ [ 0, [ 8 ], [], "Distruptive Firepower", { "Activating a Deception Skill increases Weapon Damage by 35% for 8s": null } ],
      /* 10 */ [ 0, [ 8 ], [ 12 ], "Singularity", { "Skill Cooldown (Deception)": 0.15 } ],
      /* 11 */ [ 0, [ 8 ], [ 12 ], "Ace of Trumps", { "Armor Piercing": 0.1 } ],
      /* 12 */ [ 0, [ 10, 11 ], [ 13, 14, 15 ], "Unforseen End", { "Weapon Damage (From Behind)": 0.2 } ],
      /* 13 */ [ 0, [ 12 ], [], "Scion of the Power", { "When your Damage Skill ends, increase Weapon Damage by 35% for 8s": null } ],
      /* 14 */ [ 0, [ 12 ], [ 16 ], "Death Probability", { "Weapon Damage": 0.08 } ],
      /* 15 */ [ 0, [ 12 ], [ 16 ], "Arms Trick", { "Weapon Damage (Close Range)": 0.15 } ],
      /* 16 */ [ 0, [ 14, 15 ], [ 17, 19 ], "Death Probability", { "Weapon Damage": 0.08 } ],
      /* 17 */ [ 0, [ 16 ], [ 18 ], "Equlibrium", { "Skill Cooldown (Movement)": 0.15 } ],
      /* 18 */ [ 0, [ 17 ], [], "Transfusion", { "Weapon Leech": 0.05 } ],
      /* 19 */ [ 0, [ 16 ], [ 20, 21 ], "Unforseen End", { "Weapon Damage (From Behind)": 0.2 } ],
      /* 20 */ [ 0, [ 19 ], [], "Bounty Hunter", { "Weapon Damage (Against Elites)": 0.15 } ],
      /* 21 */ [ 0, [ 19 ], [ 22, 23 ], "Oddity Summation", { "Magazine Size": 0.5 } ],
      /* 22 */ [ 0, [ 21 ], [ 24 ], "Assault Adept", { "Weapon Damage (Assault)": 0.12 } ],
      /* 23 */ [ 0, [ 21 ], [ 24 ], "Shotgun Adept", { "Weapon Damage (Shotgun)": 0.12 } ],
      /* 24 */ [ 0, [ 22, 23 ], [], "Cold Calculation", { "For each Enemy in Close Range, your Weapon Damage is increased by 8%": null } ],
      
      /* 25 */ [ 0, [ 4, 26 ], [ 4, 26 ], "Arms Trick", { "Weapon Damage (Close Range)": 0.15 } ],
      /* 26 */ [ 0, [ 25, 33 ], [ 25, 33, 27 ], "Leap of Quietus", { "Activating a Movement Skill increases Armor Piercing by 25% for 10s": null } ],
      /* 27 */ [ 0, [ 26 ], [], "Cycle of Life and Death", { "[HM] Health for each enemy that died in Close Range": 0.1 } ],
      /* 28 */ [ 0, [ 8, 36 ], [ 8, 29, 36 ], "Outrider Executioner", { "Activating a Movement Skill increases Weapon Damage by 35% for 8s": null } ],
      /* 29 */ [ 0, [ 28 ], [], "Ace of Trumps", { "Armor Piercing": 0.1 } ],
      
      /* 30 */ [ 0, [ 0, 31, 32 ], [ 31, 32 ], "Anomaly Presistence", { "Health": 0.1 } ],
      /* 31 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Immunity", { "Resistance": 0.15 } ],
      /* 32 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Oddity Resistance", { "Damage Taken (From Elites)": -0.2 } ],
      /* 33 */ [ 0, [ 26, 31, 32, 34, 35, 50 ], [ 26, 31, 32, 34, 35, 50 ], "Anomaly Presistence", { "Health": 0.1 } ],
      /* 34 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Shield's Timeline", { "Shield Degradation": -0.3 } ],
      /* 35 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Atrophy", { "Weakness Duration": 0.3 } ],
      /* 36 */ [ 0, [ 28, 34, 35, 53 ], [ 28, 34, 35, 37, 38, 53 ], "Anomaly Presistence", { "Health": 0.1 } ],
      /* 37 */ [ 0, [ 36 ], [ 39 ], "Immunity", { "Resistance": 0.15 } ],
      /* 38 */ [ 0, [ 36 ], [ 39 ], "Shield's Timeline", { "Shield Degradation": -0.3 } ],
      /* 39 */ [ 0, [ 37, 38 ], [ 40, 41, 42 ], "Singularity", { "Skill Cooldown (Deception)": 0.15 } ],
      /* 40 */ [ 0, [ 39 ], [], "Mitigation in Motion", { "When your Damage Skill ends, increase Damage Mitigation by 10% for 10s": null } ],
      /* 41 */ [ 0, [ 39 ], [ 43 ], "Anomaly Cloak", { "Armor": 0.2 } ],
      /* 42 */ [ 0, [ 39 ], [ 43 ], "Shield's Increment", { "Shield Gain": 0.1 } ],
      /* 43 */ [ 0, [ 41, 42 ], [ 44, 45 ], "Shield's Timeline", { "Shield Degradation": -0.3 } ],
      /* 44 */ [ 0, [ 43 ], [], "Long Odds", { "For each Enemy in Close Range, your Armor is increased by 15%": null } ],
      /* 45 */ [ 0, [ 43 ], [ 46 ], "Anomaly Presistence", { "Health": 0.1 } ],
      /* 46 */ [ 0, [ 45 ], [ 47, 48 ], "Profit Squared", { "Every ammo pickup Heals you for 5% of your Maximum Health": null } ],
      /* 47 */ [ 0, [ 46 ], [ 49 ], "Dualshield", { "Damage Mitigation while Shield is active": 0.06 } ],
      /* 48 */ [ 0, [ 46 ], [ 49 ], "Anomaly Cloak", { "Armor": 0.2 } ],
      /* 49 */ [ 0, [ 47, 48 ], [], "Distruption Shield", { "Activating a Deception Skill grants you 20% Shield": null } ],
      
      /* 50 */ [ 0, [ 33, 52 ], [ 33, 51, 52 ], "Against the Odds", { "When surrounded by Enemies, reloading your weapon deals damage and interrupts enemies' abilities. Damage scales with Anomaly Power": null } ],
      /* 51 */ [ 0, [ 50 ], [], "Cycle of Life and Death", { "[HM] Health for each enemy that died in Close Range": 0.1 } ],
      /* 52 */ [ 0, [ 50, 58 ], [ 50, 58 ], "Anomaly Scything", { "Activating Melee Skill increases Anomaly Power by 30% for 5s": null } ],
      /* 53 */ [ 0, [ 36, 62 ], [ 36, 54, 62 ], "Wither Scything", { "Melee Skill applies Weakness": null } ],
      /* 54 */ [ 0, [ 53 ], [], "Shield's Increment", { "Shield Gain": 0.1 } ],
      
      /* 55 */ [ 0, [ 0, 56, 57 ], [ 56, 57 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 56 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Life Transfer", { "Skill Leech": 0.06 } ],
      /* 57 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Disturbance Coating", { "Resistance Piercing": 0.1 } ],
      /* 58 */ [ 0, [ 52, 56, 57, 60, 61 ], [ 52, 56, 57, 59, 60, 61 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 59 */ [ 0, [ 58 ], [], "Assault Master", { "Increase Assault Damage by 3.5% for each unlocked Concentration node": null, "Drop Rate (Assault)": 0.2 } ],
      /* 60 */ [ 0, [ 58, 62 ], [ 58, 62 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 61 */ [ 0, [ 58, 62 ], [ 58, 62 ], "Continuum", { "Skill Cooldown (Damage)": 0.15 } ],
      /* 62 */ [ 0, [ 53, 60, 61 ], [ 53, 60, 61, 63, 64, 65 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 63 */ [ 0, [ 62 ], [], "Countershield", { "Activating a Deception Skill increases Anomaly Power by 50% for 10s": null } ],
      /* 64 */ [ 0, [ 62 ], [ 66 ], "Athropy", { "Weakness Duration": 0.3 } ],
      /* 65 */ [ 0, [ 62 ], [ 66 ], "Disturbance Coating", { "Resistance Piercing": 0.1 } ],
      /* 66 */ [ 0, [ 64, 65 ], [ 67, 68, 69 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 67 */ [ 0, [ 66 ], [], "Combat Shield Timeline", { "Activating a Movement Skill increases Anomaly Power by 50% for 10s": null } ],
      /* 68 */ [ 0, [ 66 ], [ 70 ], "Life Transfer", { "Skill Leech": 0.06 } ],
      /* 69 */ [ 0, [ 66 ], [ 70 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 70 */ [ 0, [ 68, 69 ], [ 71, 73 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 71 */ [ 0, [ 70 ], [ 72 ], "Continuum", { "Skill Cooldown (Damage)": 0.15 } ],
      /* 72 */ [ 0, [ 71 ], [], "Anomalic Acceleration", { "When your Damage Skill ends, increase Anomaly Power by 50% for 10s": null } ],
      /* 73 */ [ 0, [ 70 ], [ 74, 75 ], "Life Transfer", { "Skill Leech": 0.06 } ],
      /* 74 */ [ 0, [ 73 ], [], "Leap of Clincher", { "Activating a Movement Skill increases Resistance Piercing by 25% for 10s": null } ],
      /* 75 */ [ 0, [ 73 ], [ 76, 77 ], "Scion of the Void", { "When your Damage Skill ends, increase Armor Piercing by 30% and Resistance Piercing by 25% for 10s": null } ],
      /* 76 */ [ 0, [ 75 ], [ 78 ], "Shadow's Embrace", { "Increase Firepower by 15% of your Anomaly Power": null } ],
      /* 77 */ [ 0, [ 75 ], [ 78 ], "Shielded Readiness", { "[HM] You will not be Healed for each enemy that dies in Close Range, instead your Shield Gain will be increased by 20%": null } ],
      /* 78 */ [ 0, [ 76, 77 ], [], "Altered Executioner", { "For each Enemy in Close Range, your Anomaly Power is increased by 10%": null } ]
    ],
    
    pyromancer: [
       /* 0  */ [ 1, [], [ 1, 30, 56 ], "", { "Anomaly Power": 0.1, "[HM] Skills mark Enemies for 15s. Killing a Marked Enemy Heals you for 24% of your Maximum Health": null } ],
      
       /* 1  */ [ 0, [ 0, 2, 3 ], [ 2, 3 ], "Inferno Weapon", { "Weapon Damage": 0.08 } ],
       /* 2  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Moths to the Flame", { "Weapon Leech": 0.05 } ],
       /* 3  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Marble Orchard", { "Skill Cooldown (Immobilize)": 0.15 } ],
       /* 4  */ [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 5  */ [ 0, [ 4 ], [], "Assault Master", { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.2 } ],
       /* 6  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Blood Boil", { "Armor Piercing": 0.1 } ],
       /* 7  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Trial of the Ashes", { "Damage (Against Ashed)": 0.1 } ],
       /* 8  */ [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 9  */ [ 0, [ 8 ], [], "Hot Situation", { "Activating an Immobilize Skill increases Anomaly Power by 45% for 10s": null } ],
       /* 10 */ [ 0, [ 8 ], [ 12 ], "Conflagration", { "Resistance Piercing": 0.15 } ],
       /* 11 */ [ 0, [ 8 ], [ 12 ], "Curse of the Pompeii", { "Ash Duration": 0.15 } ],
       /* 12 */ [ 0, [ 10, 11 ], [ 13, 14, 15 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 13 */ [ 0, [ 12 ], [], "Sniper Master", { "Weapon Damage (Sniper)": 0.2, "Drop Rate (Sniper)": 0.2 } ],
       /* 14 */ [ 0, [ 12 ], [ 16 ], "Blood Boil", { "Armor Piercing": 0.1 } ],
       /* 15 */ [ 0, [ 12 ], [ 16 ], "Inferno Weapon", { "Weapon Damage": 0.08 } ],
       /* 16 */ [ 0, [ 14, 15 ], [ 17, 19, 20 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 17 */ [ 0, [ 16 ], [ 18 ], "Moths to the Flame", { "Weapon Leech": 0.05 } ],
       /* 18 */ [ 0, [ 17 ], [], "Leeching Force", { "Activating an Immobilize Skill doubles Weapon Leech for 4s": null } ],
       /* 19 */ [ 0, [ 16 ], [], "Ashes to Ashes", { "Ash applies Vulnerable": null } ],
       /* 20 */ [ 0, [ 16 ], [ 21 ], "Nimble as a Flame", { "Reload Time": -0.2 } ],
       /* 21 */ [ 0, [ 20 ], [ 22, 23 ], "...Hurt Twice as Long", { "Damage (Against Elites)": 0.1, "Damage Taken (From Elites)": -0.1 } ],
       /* 22 */ [ 0, [ 21 ], [ 24 ], "Trial of the Ashes", { "Damage (Against Ashed)": 0.15 } ],
       /* 23 */ [ 0, [ 21 ], [ 24 ], "Marble Orchard", { "Skill Cooldown (Immobilize)": 0.15 } ],
       /* 24 */ [ 0, [ 22, 23 ], [], "Burning Situation", { "Activating an Immobilize Skill increases Weapon Damage by 45% for 10s": null } ],
      
       /* 25 */ [ 0, [ 4, 26 ], [ 4, 26 ], "Sidearm Adept", { "Weapon Damage (Sidearm)": 0.12 } ],
       /* 26 */ [ 0, [ 25, 33 ], [ 25, 33, 27 ], "Armor Melting", { "Armor Piercing (Against Marked)": 0.3 } ],
       /* 27 */ [ 0, [ 26 ], [], "Steady Fire", { "Weapon Recoil": -0.3 } ],
       /* 28 */ [ 0, [ 8, 36 ], [ 8, 29, 36 ], "Incinerate", { "The moment Burn ends on an enemy, inflict Ash": null } ],
       /* 29 */ [ 0, [ 28 ], [], "Curse of the Pompeii", { "Ash Duration": 0.15 } ],
      
       /* 30 */ [ 0, [ 0, 31, 32 ], [ 31, 32 ], "Magma Golem", { "Health": 0.1 } ],
       /* 31 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Unquenchable", { "Skill Leech": 0.06 } ],
       /* 32 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Warm Up", { "Skill Cooldown (Ignite)": 0.15 } ],
       /* 33 */ [ 0, [ 26, 31, 32, 34, 35, 51 ], [ 26, 31, 32, 34, 35, 51 ], "Magma Golem", { "Health": 0.1 } ],
       /* 34 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Master of the Armor", { "Armor": 0.2 } ],
       /* 35 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Meltdown", { "Burn Damage": 0.2 } ],
       /* 36 */ [ 0, [ 28, 34, 35, 54 ], [ 28, 34, 35, 37, 38, 54 ], "Magma Golem", { "Health": 0.1 } ],
       /* 37 */ [ 0, [ 36 ], [ 39 ], "Gifted", { "Weapon Damage": 0.05, "Anomaly Power": 0.05 } ],
       /* 38 */ [ 0, [ 36 ], [ 39 ], "Master of the Resistance", { "Resistance": 0.2 } ],
       /* 39 */ [ 0, [ 37, 38 ], [ 40, 41, 42, 43 ], "Magma Golem", { "Health": 0.1 } ],
       /* 40 */ [ 0, [ 39 ], [], "Distant Flame", { "Increase Anomaly Power by 2.5% for each unlocked Magma Golem node": null } ],
       /* 41 */ [ 0, [ 39 ], [], "All Guns Blazing", { "Activating Any Skill increases Weapon Damage by 20% for 7s": null } ],
       /* 42 */ [ 0, [ 39 ], [ 44 ], "Unquenchable", { "Skill Leech": 0.06 } ],
       /* 43 */ [ 0, [ 39 ], [ 44 ], "Let Them Burn", { "Burn Duration": 0.2 } ],
       /* 44 */ [ 0, [ 42, 43 ], [ 45 ], "Magma Golem", { "Health": 0.1 } ],
       /* 45 */ [ 0, [ 44 ], [ 46, 47 ], "Unquenchable", { "Skill Leech": 0.06 } ],
       /* 46 */ [ 0, [ 45 ], [], "Anomalous Lava", { "Activating an Ignite Skill increases Armor by 45% for 10s": null } ],
       /* 47 */ [ 0, [ 45 ], [ 48, 49 ], "Fuel for the Embers", { "Skill Leech is doubled when below 30% Health": null } ],
       /* 48 */ [ 0, [ 47 ], [ 50 ], "Trail by Fire", { "Damage (Against Burning)": 0.15 } ],
       /* 49 */ [ 0, [ 47 ], [ 50 ], "Warm Up", { "Skill Cooldown (Ignite)": 0.15 } ],
       /* 50 */ [ 0, [ 48, 49 ], [], "Magma Elemental", { "Activating an Ignite Skill increases Armor and Resistance Piercing by 45% for 10s": null } ],
      
       /* 51 */ [ 0, [ 33, 53 ], [ 33, 52, 53 ], "Wildfire", { "Skill Cooldown (Explosive)": 0.1, "Skill Cooldown (Ignite)": 0.1, "Skill Cooldown (Immobilize)": 0.1 } ],
       /* 52 */ [ 0, [ 51 ], [], "Trail by Fire", { "Damage (Against Burning)": 0.05 } ],
       /* 53 */ [ 0, [ 51, 59 ], [ 51, 59 ], "Gifted", { "Weapon Damage": 0.05, "Anomaly Power": 0.05 } ],
       /* 54 */ [ 0, [ 36, 63 ], [ 36, 55, 63 ], "Extinction", { "Increase Damage by 20% against Enemies below 30% Health": null } ],
       /* 55 */ [ 0, [ 54 ], [], "Let Them Burn", { "Burn Duration": 0.2 } ],
      
       /* 56 */ [ 0, [ 0, 57, 58 ], [ 57, 58 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 57 */ [ 0, [ 56, 59 ], [ 56, 59 ], "Mark's Cumulation", { "Skill Damage (Against Marked)": 0.08 } ],
       /* 58 */ [ 0, [ 56, 59 ], [ 56, 59 ], "World Ablaze", { "Skill Cooldown (Explosive)": 0.15 } ],
       /* 59 */ [ 0, [ 53, 57, 58, 61, 62 ], [ 53, 57, 58, 60, 61, 62 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 60 */ [ 0, [ 59 ], [], "With Fire and Rifle", { "Activating an Explosive Skill increases Weapon Damage by 35% for 10s": null } ],
       /* 61 */ [ 0, [ 59, 63 ], [ 59, 63 ], "Mark's Cumulation", { "Skill Damage (Against Marked)": 0.08 } ],
       /* 62 */ [ 0, [ 59, 63 ], [ 59, 63 ], "Strength of the Flame", { "Damage Taken (From Elites)": -0.1 } ],
       /* 63 */ [ 0, [ 54, 61, 62 ], [ 54, 61, 62, 64, 65, 66 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 64 */ [ 0, [ 63 ], [], "Inferno Bullets", { "Increase Firepower by 15% of your Anomaly Power": null } ],
       /* 65 */ [ 0, [ 63 ], [ 67 ], "Meltdown", { "Burn Damage": 0.2 } ],
       /* 66 */ [ 0, [ 63 ], [ 67 ], "Gifted", { "Weapon Damage": 0.05, "Anomaly Power": 0.05 } ],
       /* 67 */ [ 0, [ 65, 66 ], [ 68, 69, 70 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 68 */ [ 0, [ 67 ], [], "With Fire and Anomaly", { "Activating an Explosive Skill increases Anomaly Power by 12% for 10s": null } ],
       /* 69 */ [ 0, [ 67 ], [ 71 ], "Unquenchable", { "Skill Leech": 0.06 } ],
       /* 70 */ [ 0, [ 67 ], [ 71 ], "Master of the Resistance", { "Resistance": 0.2 } ],
       /* 71 */ [ 0, [ 69, 70 ], [ 72, 74 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 72 */ [ 0, [ 71 ], [ 73 ], "Phoenix Nestling", { "[Phoenix] Upon losing all Health you will receive a second chance to return to the battlefield with 50% Maximum Health (180s cooldown)": null } ],
       /* 73 */ [ 0, [ 72 ], [], "Phoenix", { "[Phoenix] Revive with 100% Maximum Health (135s cooldown)": null } ],
       /* 74 */ [ 0, [ 71 ], [ 75, 76 ], "Conflagration", { "Resistance Piercing": 0.15 } ],
       /* 75 */ [ 0, [ 74 ], [], "Chasing the Chill Away", { "[HM] Killing a Marked Enemy Heals you for an additional 12% of your Maximum Health": null } ],
       /* 76 */ [ 0, [ 74 ], [ 77, 78 ], "Flames that Burn Twice...", { "Damage (Against Elites)": 0.1 } ],
       /* 77 */ [ 0, [ 76 ], [ 79 ], "Mark's Cumulation", { "Skill Damage (Against Marked)": 0.08 } ],
       /* 78 */ [ 0, [ 76 ], [ 79 ], "World Ablaze", { "Skill Cooldown (Explosive)": 0.15 } ],
       /* 79 */ [ 0, [ 77, 78 ], [], "Grave Ablaze", { "Skill Damage (Explosive)": 0.3 } ]
    ],
    
    devastator: [
       /* 0  */ [ 1, [], [ 1, 30, 55 ], "", { "[HM] Every Close Range kill Heals you for 24% of your Maximum Health": null, "Health": 0.15, "Armor": 0.3 } ],
      
       /* 1  */ [ 0, [ 0, 2, 3 ], [ 2, 3 ], "Havoc", { "Weapon Damage": 0.08 } ],
       /* 2  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Shotgun Adept", { "Weapon Damage (Shotgun)": 0.12 } ],
       /* 3  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Armorbreaker", { "Armor Piercing": 0.1 } ],
       /* 4  */ [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], "Brawler", { "Weapon Damage (Close Range)": 0.15 } ],
       /* 5  */ [ 0, [ 4 ], [], "Shotgun Master", { "Weapon Damage (Shotgun)": 0.15, "Drop Rate (Shotgun)": 0.2 } ],
       /* 6  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Assault Adept", { "Weapon Damage (Assault)": 0.12 } ],
       /* 7  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Armorbreaker", { "Armor Piercing": 0.1 } ],
       /* 8  */ [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], "Havoc", { "Weapon Damage": 0.08 } ],
       /* 9  */ [ 0, [ 8 ], [], "Champion", { "Activating a Protection Skill increases Weapon Damage by 45% for 10s": null } ],
       /* 10 */ [ 0, [ 8 ], [ 12 ], "Bull's Eye", { "Crit Damage": 0.2 } ],
       /* 11 */ [ 0, [ 8 ], [ 12 ], "Steady Hands", { "Weapon Recoil": -0.3 } ],
       /* 12 */ [ 0, [ 10, 11 ], [ 13, 14, 15 ], "Havoc", { "Weapon Damage": 0.08 } ],
       /* 13 */ [ 0, [ 12 ], [], "Assault Master", { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.2 } ],
       /* 14 */ [ 0, [ 12 ], [ 16 ], "Perpetual Motion", { "Skill Cooldown (Kinetic)": 0.15 } ],
       /* 15 */ [ 0, [ 12 ], [ 16 ], "Brawler", { "Weapon Damage (Close Range)": 0.15 } ],
       /* 16 */ [ 0, [ 14, 15 ], [ 17, 19 ], "Havoc", { "Weapon Damage": 0.08 } ],
       /* 17 */ [ 0, [ 16 ], [ 18 ], "Dry Them Out", { "Weapon Leech": 0.05 } ],
       /* 18 */ [ 0, [ 17 ], [], "Bounty Hunter", { "Damage (Against Elites)": 0.15, "Damage Taken (From Elites)": -0.15 } ],
       /* 19 */ [ 0, [ 16 ], [ 20, 21 ], "Bulletstorm", { "Reload Time": -0.2 } ],
       /* 20 */ [ 0, [ 19 ], [], "Ammo Stockpile", { "Magazine Size": 0.5 } ],
       /* 21 */ [ 0, [ 19 ], [ 22, 23 ], "Confrontation", { "Enemies who damage you will have their Physical Damage reduced by 10% for 5s. This effect is doubled if you damage that Enemy": null } ],
       /* 22 */ [ 0, [ 21 ], [ 24 ], "Dry Them Out", { "Weapon Leech": 0.05 } ],
       /* 23 */ [ 0, [ 21 ], [ 24 ], "Armorbreaker", { "Armor Piercing": 0.1 } ],
       /* 24 */ [ 0, [ 22, 23 ], [], "Altered Charge", { "When your Kinetic Skill ends, increase Weapon Damage by 70% for 10s": null } ],
      
       /* 25 */ [ 0, [ 4, 26 ], [ 4, 26 ], "Perpetual Motion", { "Skill Cooldown (Kinetic)": 0.15 } ],
       /* 26 */ [ 0, [ 25, 33 ], [ 25, 33, 27 ], "Into the Fray", { "When your Kinetic Skill ends, increase Damage Mitigation by 15% for 10s": null } ],
       /* 27 */ [ 0, [ 26 ], [], "Vim and Vigor", { "Increase Weapon Damage by 10% for each unlocked Anomaly in Veins node": null } ],
       /* 28 */ [ 0, [ 8, 36 ], [ 8, 29, 36 ], "Hierloom Armor", { "When an Enemy dies in Close Range, gain 20% of their Armor for 10s": null } ],
       /* 29 */ [ 0, [ 28 ], [], "Profit Squared", { "Every ammo pickup Heals you for 5% of your Maximum Health": null } ],
      
       /* 30 */ [ 0, [ 0, 31, 32 ], [ 31, 32 ], "Colossus", { "Health": 0.1 } ],
       /* 31 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Tank", { "Armor": 0.2 } ],
       /* 32 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Anomaly in Veins", { "Health Regen every second": 0.01 } ],
       /* 33 */ [ 0, [ 26, 31, 32, 34, 35, 50 ], [ 26, 31, 32, 34, 35, 50 ], "Colossus", { "Health": 0.1 } ],
       /* 34 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Resistance Paragon", { "Resistance": 0.2 } ],
       /* 35 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Anomaly in Veins", { "Health Regen every second": 0.01 } ],
       /* 36 */ [ 0, [ 28, 34, 35, 53 ], [ 28, 34, 35, 37, 38, 53 ], "Colossus", { "Health": 0.1 } ],
       /* 37 */ [ 0, [ 36 ], [ 39 ], "Anomaly in Veins", { "Health Regen every second": 0.01 } ],
       /* 38 */ [ 0, [ 36 ], [ 39 ], "Tank", { "Armor": 0.2 } ],
       /* 39 */ [ 0, [ 37, 38 ], [ 40, 41, 42 ], "Colossus", { "Health": 0.1 } ],
       /* 40 */ [ 0, [ 39 ], [], "Outrider Commander", { "Increase all Healing and Shields by 20% for you and your allies": null } ],
       /* 41 */ [ 0, [ 39 ], [ 43 ], "Colossus", { "Health": 0.1 } ],
       /* 42 */ [ 0, [ 39 ], [ 43 ], "Unending Watch", { "Skill Cooldown (Protection)": 0.15 } ],
       /* 43 */ [ 0, [ 41, 42 ], [ 44, 45 ], "Resist the Mob", { "Increase Resistance by 7.5% for each Enemy in Close Range": null } ],
       /* 44 */ [ 0, [ 43 ], [], "Unbroken Vow", { "You have 100% chance to ignore damage that would kill you and instantly Heal you for 50% of your Maximum Health (180s cooldown)": null } ],
       /* 45 */ [ 0, [ 43 ], [ 46 ], "Tank", { "Armor": 0.2 } ],
       /* 46 */ [ 0, [ 45 ], [ 47, 48 ], "Overlord of the Battleground", { "[HM] Gain an additional 10% Health when an Enemy dies in Close Range": null } ],
       /* 47 */ [ 0, [ 46 ], [ 49 ], "Resistance Paragon", { "Resistance": 0.2 } ],
       /* 48 */ [ 0, [ 46 ], [ 49 ], "Tank", { "Armor": 0.2  } ],
       /* 49 */ [ 0, [ 47, 48 ], [], "Mighty Tank", { "Increase Firepower by 5% of your Armor (Bonus capped at 40% of total Firepower)": null, "Increase Anomaly Power by 5% of your Armor (Bonus capped at 40% of total Anomaly Power)": null } ],
      
       /* 50 */ [ 0, [ 33, 52 ], [ 33, 51, 52 ], "Strong Arm of the Anomaly", { "After using Melee Skill, increase Resistance Piercing by 15% for each hit enemy for 10s": null } ],
       /* 51 */ [ 0, [ 50 ], [], "Colossus", { "Health": 0.1 } ],
       /* 52 */ [ 0, [ 50, 58 ], [ 50, 58 ], "Unending Watch", { "Skill Cooldown (Protection)": 0.15 } ],
       /* 53 */ [ 0, [ 36, 62 ], [ 36, 54, 62 ], "Stone Circle", { "Increase the distance considered to be Close Range by 4m": null } ],
       /* 54 */ [ 0, [ 53 ], [], "Through the Mob", { "Increase Armor by 7% for each Enemy in Close Range": null } ],
      
       /* 55 */ [ 0, [ 0, 56, 57 ], [ 56, 57 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 56 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Endless Tremors", { "Skill Cooldown (Seismic)": 0.15 } ],
       /* 57 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Rejuvenation", { "Skill Leech": 0.06 } ],
       /* 58 */ [ 0, [ 52, 56, 57, 60, 61 ], [ 52, 56, 57, 59, 60, 61 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 59 */ [ 0, [ 58 ], [], "Paladin", { "Activating a Protection Skill increases Anomaly Power by 45% for 5s": null } ],
       /* 60 */ [ 0, [ 58, 62 ], [ 58, 62 ], "Pure Anomaly", { "Resistance Piercing": 0.15 } ],
       /* 61 */ [ 0, [ 58, 62 ], [ 58, 62 ], "Perpetual Motion", { "Skill Cooldown (Kinetic)": 0.15 } ],
       /* 62 */ [ 0, [ 53, 60, 61 ], [ 53, 60, 61, 63, 64, 65 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 63 */ [ 0, [ 62 ], [], "Anomaly Bullets", { "Increase Firepower by 15% of your Anomaly Power": null } ],
       /* 64 */ [ 0, [ 62 ], [ 66 ], "Red Rivers", { "Bleed Duration": 0.3 } ],
       /* 65 */ [ 0, [ 62 ], [ 66 ], "Endless Tremors", { "Skill Cooldown (Seismic)": 0.15 } ],
       /* 66 */ [ 0, [ 64, 65 ], [ 67, 68, 69 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 67 */ [ 0, [ 66 ], [], "Strong Arm of the Law", { "Melee Skill deals double Damage": null } ],
       /* 68 */ [ 0, [ 66 ], [ 70 ], "Executioner", { "Increase Damage by 20% against Enemies below 30% Health": null } ],
       /* 69 */ [ 0, [ 66 ], [ 70 ], "Red Rivers", { "Bleed Duration": 0.3 } ],
       /* 70 */ [ 0, [ 68, 69 ], [ 71, 73 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 71 */ [ 0, [ 70 ], [ 72 ], "Bloodbath", { "Bleed Damage": 0.3 } ],
       /* 72 */ [ 0, [ 71 ], [], "Blood Donation", { "You are Healed for 25% of the Damage caused by Bleed": null } ],
       /* 73 */ [ 0, [ 70 ], [ 74, 75 ], "Rejuvenation", { "Skill Leech": 0.06 } ],
       /* 74 */ [ 0, [ 73 ], [], "Protected by the Anomaly", { "Increase Armor by 40% of your Anomaly Power": null } ],
       /* 75 */ [ 0, [ 73 ], [ 76, 77 ], "Skilled Sentry", { "When Any Skill ends, increase Armor and Resistance by 20% for 10s": null } ],
       /* 76 */ [ 0, [ 75 ], [ 78 ], "Pure Anomaly", { "Resistance Piercing": 0.15 } ],
       /* 77 */ [ 0, [ 75 ], [ 78 ], "Bloodbath", { "Bleed Damage": 0.3 } ],
       /* 78 */ [ 0, [ 76, 77 ], [], "Earth's Heritage", { "Skill Damage (Seismic)": 0.5 } ]
    ],
    
    technomancer: [
       /* 0  */ [ 1, [], [ 1, 29, 55 ], "", { "Weapon Damage (Long Range)": 0.15, "Skill Leech": 0.15, "Weapon Leech": 0.15 } ],
      
       /* 1  */ [ 0, [ 0, 2, 3 ], [ 2, 3 ], "Br/8 Impact Amplifier", { "Weapon Damage": 0.08 } ],
       /* 2  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Suction Module", { "Weapon Leech": 0.05 } ],
       /* 3  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Sower of Decay", { "Skill Cooldown (Decay)": 0.15 } ],
       /* 4  */ [ 0, [ 2, 3, 6, 7, 24 ], [ 2, 3, 5, 6, 7, 24 ], "Drill Coating", { "Armor Piercing": 0.1 } ],
       /* 5  */ [ 0, [ 4 ], [], "Sniper Master", { "Weapon Damage (Sniper)": 0.2, "Drop Rate (Sniper)": 0.2 } ],
       /* 6  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Nitrogen Capsules", { "Decrease the distance considered to be Long Range by 3m [1]": null } ],
       /* 7  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Toxicologist", { "Toxic Duration": 0.3 } ],
       /* 8  */ [ 0, [ 6, 7, 27 ], [ 6, 7, 9, 10, 11, 27 ], "Br/8 Impact Amplifier", { "Weapon Damage": 0.08 } ],
       /* 9  */ [ 0, [ 8 ], [], "Cannonade", { "Activating an Ordinance Skill increases Weapon Damage for you and your allies by 30% for 10s": null } ],
       /* 10 */ [ 0, [ 8 ], [ 12 ], "Nitrogen Capsules", { "Decrease the distance considered to be Long Range by 3m [2]": null } ],
       /* 11 */ [ 0, [ 8 ], [ 12 ], "Purge", { "Damage (Against Toxic'ed)": 0.1 } ],
       /* 12 */ [ 0, [ 10, 11 ], [ 13, 14, 15 ], "Br/8 Impact Amplifier", { "Weapon Damage": 0.08 } ],
       /* 13 */ [ 0, [ 12 ], [], "Assault Master", { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.2 } ],
       /* 14 */ [ 0, [ 12 ], [ 16 ], "Assault Adept", { "Weapon Damage (Assault)": 0.12 } ],
       /* 15 */ [ 0, [ 12 ], [ 16 ], "Sniper Adept", { "Weapon Damage (Sniper)": 0.12 } ],
       /* 16 */ [ 0, [ 14, 15 ], [ 17, 18 ], "Drill Coating", { "Armor Piercing": 0.1 } ],
       /* 17 */ [ 0, [ 16 ], [], "Two Sides of the Power", { "Damage Taken": 0.15, "Damage": 0.2 } ],
       /* 18 */ [ 0, [ 16 ], [ 19, 20 ], "Sharpshooter", { "Weapon Damage (Long Range)": 0.3 } ],
       /* 19 */ [ 0, [ 18 ], [], "Grand Amplification", { "Increase Anomaly Power by 4% for each unlocked Br/8 Impact Amplifier node": null } ],
       /* 20 */ [ 0, [ 18 ], [ 21, 22 ], "UT-14 Clips", { "Magazine Size": 0.5 } ],
       /* 21 */ [ 0, [ 20 ], [ 23 ], "Charged Gunshot", { "First shot after reloading deals +200% damage (5s cooldown)": null } ],
       /* 22 */ [ 0, [ 20 ], [ 23 ], "Purge", { "Damage (Against Toxic'ed)": 0.15 } ],
       /* 23 */ [ 0, [ 21, 22 ], [], "Empowering Antena", { "Activating a Decay Skill increases Weapon Damage for you and your allies by 40% for 10s": null } ],
      
       /* 24 */ [ 0, [ 4, 25 ], [ 4, 25 ], "BL-STM Havoc Nexus", { "Crit Damage": 0.15 } ],
       /* 25 */ [ 0, [ 24, 32 ], [ 24, 32, 26 ], "Exposing Toxin", { "Toxic applies Vulnerable": null } ],
       /* 26 */ [ 0, [ 25 ], [], "Marked for Execution", { "Vulnerability Effectiveness": 0.4 } ],
       /* 27 */ [ 0, [ 8, 35 ], [ 8, 28, 35 ], "Blurscreen", { "Health Regen threshold is increased by 20% of Maximum Health": null } ],
       /* 28 */ [ 0, [ 27 ], [], "Engineer", { "Turrets' Health Decay": -0.3 } ],
      
       /* 29 */ [ 0, [ 0, 30, 31 ], [ 30, 31 ], "Anomalus Body", { "Health": 0.1 } ],
       /* 30 */ [ 0, [ 29, 32 ], [ 29, 32 ], "A.N.E.T.A. Plates", { "Resistance": 0.2 } ],
       /* 31 */ [ 0, [ 29, 32 ], [ 29, 32 ], "Gadgeteer", { "Skill Cooldown (Gadget)": 0.15 } ],
       /* 32 */ [ 0, [ 25, 30, 31, 33, 34, 51 ], [ 25, 30, 31, 33, 34, 51 ], "Anomalus Body", { "Health": 0.1 } ],
       /* 33 */ [ 0, [ 32, 35 ], [ 32, 35 ], "Armor Plates", { "Armor": 0.2 } ],
       /* 34 */ [ 0, [ 32, 35 ], [ 32, 35 ], "Fracture", { "Damage (Against Frozen)": 0.1 } ],
       /* 35 */ [ 0, [ 27, 33, 34, 54 ], [ 27, 33, 34, 36, 37, 54 ], "Anomalus Body", { "Health": 0.1 } ],
       /* 36 */ [ 0, [ 35 ], [ 38 ], "Vitality Magnet", { "Skill Leech": 0.06 } ],
       /* 37 */ [ 0, [ 35 ], [ 38 ], "Gadgeteer", { "Skill Cooldown (Gadget)": 0.15 } ],
       /* 38 */ [ 0, [ 36, 37 ], [ 39, 40, 42, 43 ], "Anomalus Body", { "Health": 0.1 } ],
       /* 39 */ [ 0, [ 38 ], [], "Senior Engineer", { "Increase Turrets Health by 100%": null } ],
       /* 40 */ [ 0, [ 38 ], [ 41 ], "Exposing Frost", { "Freeze applies Vulnerable": null } ],
       /* 41 */ [ 0, [ 40 ], [], "Marked for Execution", { "Vulnerability Effectiveness": 0.4 } ],
       /* 42 */ [ 0, [ 38 ], [ 44 ], "Armor Plates", { "Armor": 0.2 } ],
       /* 43 */ [ 0, [ 38 ], [ 44 ], "Sols-56 Freezing Tanks", { "Freeze Duration": 0.2 } ],
       /* 44 */ [ 0, [ 42, 43 ], [ 45 ], "Suction Module", { "Weapon Leech": 0.05 } ],
       /* 45 */ [ 0, [ 44 ], [ 46, 47 ], "Armor Plates", { "Armor": 0.2 } ],
       /* 46 */ [ 0, [ 45 ], [], "Medical Unit", { "Activating a Gadget Skill increases all Healing received for you and your allies by 30% for 7s": null } ],
       /* 47 */ [ 0, [ 45 ], [ 48, 49 ], "Doctor of Medicine", { "Increase all Healing done by you and your allies by 20%": null } ],
       /* 48 */ [ 0, [ 47 ], [ 50 ], "Vitality Magnet", { "Skill Leech": 0.06 } ],
       /* 49 */ [ 0, [ 47 ], [ 50 ], "Fracture", { "Damage (Against Frozen)": 0.3 } ],
       /* 50 */ [ 0, [ 48, 49 ], [], "Overclocked", { "Activating a Gadget Skill increases Weapon Damage and Anomaly Power by 40% for 10s": null, "Upon losing all Health you will receive a second chance to return to the battlefield with 50% Maximum Health for 10s (180s cooldown)": null } ],
       
       /* 51 */ [ 0, [ 32, 53 ], [ 32, 52, 53 ], "Winter's Barrier", { "After using your Melee Skill, gain 40% Damage Mitigation for 3s": null } ],
       /* 52 */ [ 0, [ 51 ], [], "Sols-56 Freezing Tanks", { "Freeze Duration": 0.2 } ],
       /* 53 */ [ 0, [ 51, 58 ], [ 51, 58 ], "Sidearm Adept", { "Weapon Damage (Sidearm)": 0.12 } ],
       /* 54 */ [ 0, [ 35, 62 ], [ 35, 62 ], "Wipe Out", { "Increase Damage by 20% against Enemies below 30% Health": null } ],
      
       /* 55 */ [ 0, [ 0, 56, 57 ], [ 56, 57 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 56 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Ordanance Technician", { "Skill Cooldown (Ordinance)": 0.15 } ],
       /* 57 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Disturbance Coating", { "Resistance Piercing": 0.15 } ],
       /* 58 */ [ 0, [ 53, 56, 57, 60, 61 ], [ 53, 56, 57, 59, 60, 61 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 59 */ [ 0, [ 58 ], [], "Brain Freeze", { "Melee Skill applies Toxic": null } ],
       /* 60 */ [ 0, [ 58, 62 ], [ 58, 62 ], "A.N.E.T.A. Plates", { "Resistance": 0.2 } ],
       /* 61 */ [ 0, [ 58, 62 ], [ 58, 62 ], "Welcome Shot", { "First shot after reloading deals damage with Firepower increased by 15% of Anomaly Power": null } ],
       /* 62 */ [ 0, [ 54, 60, 61 ], [ 54, 60, 61, 63, 64, 65 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 63 */ [ 0, [ 62 ], [], "Adrenalizing Antena", { "Activating a Decay Skill increases Anomaly Power for you and your allies by 30% for 10s": null } ],
       /* 64 */ [ 0, [ 62 ], [ 66 ], "Ordanance Technician", { "Skill Cooldown (Ordinance)": 0.15 } ],
       /* 65 */ [ 0, [ 62 ], [ 66 ], "Toxicologist", { "Toxic Duration": 0.3 } ],
       /* 66 */ [ 0, [ 64, 65 ], [ 67, 68, 69 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 67 */ [ 0, [ 66 ], [], "Heavy Absorbtion", { "Activating an Ordinance Skill increases Skill Leech by 15% for 7s": null } ],
       /* 68 */ [ 0, [ 66 ], [ 70 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 69 */ [ 0, [ 66 ], [ 70 ], "D-Kay Toxin", { "Toxic Damage": 0.2 } ],
       /* 70 */ [ 0, [ 68, 69 ], [ 71, 73 ], "Disturbance Coating", { "Resistance Piercing": 0.15 } ],
       /* 71 */ [ 0, [ 70 ], [ 72 ], "Vitality Magnet", { "Skill Leech": 0.06 } ],
       /* 72 */ [ 0, [ 71 ], [], "Emergency Transfusion", { "Doubles Skill Leech when Health drops below 30%": null } ],
       /* 73 */ [ 0, [ 70 ], [ 74, 75 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 74 */ [ 0, [ 73 ], [], "Armored Unit", { "Activating an Ordinance Skill increases Armor by 50% for 15s": null } ],
       /* 75 */ [ 0, [ 73 ], [ 76, 77 ], "Team Player", { "Decreases Elite's damage against you and your allies by 10%": null } ],
       /* 76 */ [ 0, [ 75 ], [ 78 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 77 */ [ 0, [ 75 ], [ 78 ], "D-Kay Toxin", { "Toxic Damage": 0.2 } ],
       /* 78 */ [ 0, [ 76, 77 ], [], "Techbond", { "Activating an Ordinance Skill increases Anomaly Power by 50% for 10s": null } ]
    ]
  }
  
  //----------------------------------------- Node Positions
  let allcoords = {
    trickster: [
      [ 108, 375, 2 ],
      
      [ 252, 329, 0 ],
      [ 347, 186, 0 ],
      [ 394, 281, 0 ],
      [ 490, 138, 0 ],
      [ 480, 33, 1 ],
      [ 632, 91, 0 ],
      [ 632, 186, 0 ],
      [ 727, 138, 0 ],
      [ 717, 33, 1 ],
      [ 822, 91, 0 ],
      [ 822, 186, 0 ],
      [ 918, 138, 0 ],
      [ 908, 33, 1 ],
      [ 1013, 91, 0 ],
      [ 1013, 186, 0 ],
      [ 1108, 138, 0 ],
      [ 1108, 43, 0 ],
      [ 1193, 33, 1 ],
      [ 1203, 138, 0 ],
      [ 1193, 224, 1 ],
      [ 1288, 176, 1 ],
      [ 1393, 138, 0 ],
      [ 1393, 234, 0 ],
      [ 1478, 176, 1 ],
      
      [ 490, 234, 0 ],
      [ 480, 319, 1 ],
      [ 585, 281, 0 ],
      [ 717, 271, 1 ],
      [ 822, 281, 0 ],
      
      [ 299, 424, 0 ],
      [ 394, 376, 0 ],
      [ 394, 471, 0 ],
      [ 490, 424, 0 ],
      [ 632, 376, 0 ],
      [ 632, 471, 0 ],
      [ 727, 424, 0 ],
      [ 822, 376, 0 ],
      [ 822, 471, 0 ],
      [ 918, 424, 0 ],
      [ 908, 509, 1 ],
      [ 1013, 376, 0 ],
      [ 1013, 471, 0 ],
      [ 1108, 424, 0 ],
      [ 1098, 319, 1 ],
      [ 1203, 424, 0 ],
      [ 1288, 414, 1 ],
      [ 1393, 376, 0 ],
      [ 1393, 471, 0 ],
      [ 1478, 414, 1 ],
      
      [ 480, 509, 1 ],
      [ 585, 566, 0 ],
      [ 490, 614, 0 ],
      [ 717, 556, 1 ],
      [ 822, 566, 0 ],
      
      [ 252, 519, 0 ],
      [ 394, 566, 0 ],
      [ 347, 662, 0 ],
      [ 490, 709, 0 ],
      [ 480, 794, 1 ],
      [ 632, 662, 0 ],
      [ 632, 757, 0 ],
      [ 727, 709, 0 ],
      [ 717, 794, 1 ],
      [ 822, 662, 0 ],
      [ 822, 757, 0 ],
      [ 918, 709, 0 ],
      [ 908, 794, 1 ],
      [ 1013, 662, 0 ],
      [ 1013, 757, 0 ],
      [ 1108, 709, 0 ],
      [ 1108, 804, 0 ],
      [ 1192, 794, 1 ],
      [ 1202, 709, 0 ],
      [ 1192, 604, 1 ],
      [ 1288, 652, 1 ],
      [ 1393, 614, 0 ],
      [ 1393, 709, 0 ],
      [ 1478, 652, 1 ]
    ],
    
    pyromancer: [
      [ 108, 375, 2 ],
      
      [ 252, 329, 0 ],
      [ 347, 186, 0 ],
      [ 394, 281, 0 ],
      [ 490, 138, 0 ],
      [ 480, 33, 1 ],
      [ 632, 91, 0 ],
      [ 632, 186, 0 ],
      [ 727, 138, 0 ],
      [ 717, 33, 1 ],
      [ 822, 91, 0 ],
      [ 822, 186, 0 ],
      [ 918, 138, 0 ],
      [ 908, 33, 1 ],
      [ 1013, 91, 0 ],
      [ 1013, 186, 0 ],
      [ 1108, 138, 0 ],
      [ 1108, 43, 0 ],
      [ 1193, 33, 1 ],
      [ 1098, 224, 1 ],
      [ 1203, 186, 0 ],
      [ 1288, 176, 1 ],
      [ 1393, 138, 0 ],
      [ 1393, 234, 0 ],
      [ 1478, 176, 1 ],
      
      [ 490, 234, 0 ],
      [ 480, 319, 1 ],
      [ 585, 281, 0 ],
      [ 717, 271, 1 ],
      [ 822, 281, 0 ],
      
      [ 299, 424, 0 ],
      [ 394, 376, 0 ],
      [ 394, 471, 0 ],
      [ 490, 424, 0 ],
      [ 632, 376, 0 ],
      [ 632, 471, 0 ],
      [ 727, 424, 0 ],
      [ 822, 376, 0 ],
      [ 822, 471, 0 ],
      [ 918, 424, 0 ],
      [ 908, 319, 1 ],
      [ 908, 509, 1 ],
      [ 1013, 376, 0 ],
      [ 1013, 471, 0 ],
      [ 1108, 424, 0 ],
      [ 1203, 424, 0 ],
      [ 1193, 319, 1 ],
      [ 1288, 414, 1 ],
      [ 1393, 376, 0 ],
      [ 1393, 471, 0 ],
      [ 1478, 414, 1 ],
      
      [ 480, 509, 1 ],
      [ 585, 566, 0 ],
      [ 490, 614, 0 ],
      [ 717, 556, 1 ],
      [ 822, 566, 0 ],
      
      [ 252, 519, 0 ],
      [ 394, 566, 0 ],
      [ 347, 662, 0 ],
      [ 490, 709, 0 ],
      [ 480, 794, 1 ],
      [ 632, 662, 0 ],
      [ 632, 757, 0 ],
      [ 727, 709, 0 ],
      [ 717, 794, 1 ],
      [ 822, 662, 0 ],
      [ 822, 757, 0 ],
      [ 918, 709, 0 ],
      [ 908, 794, 1 ],
      [ 1013, 662, 0 ],
      [ 1013, 757, 0 ],
      [ 1108, 709, 0 ],
      [ 1098, 794, 1 ],
      [ 1202, 804, 0 ],
      [ 1202, 709, 0 ],
      [ 1192, 604, 1 ],
      [ 1288, 652, 1 ],
      [ 1393, 614, 0 ],
      [ 1393, 709, 0 ],
      [ 1478, 652, 1 ]
    ],
    
    devastator: [
      [ 108, 375, 2 ],
      
      [ 252, 329, 0 ],
      [ 347, 186, 0 ],
      [ 394, 281, 0 ],
      [ 490, 138, 0 ],
      [ 480, 33, 1 ],
      [ 632, 91, 0 ],
      [ 632, 186, 0 ],
      [ 727, 138, 0 ],
      [ 717, 33, 1 ],
      [ 822, 91, 0 ],
      [ 822, 186, 0 ],
      [ 918, 138, 0 ],
      [ 908, 33, 1 ],
      [ 1013, 91, 0 ],
      [ 1013, 186, 0 ],
      [ 1108, 138, 0 ],
      [ 1108, 43, 0 ],
      [ 1193, 33, 1 ],
      [ 1203, 138, 0 ],
      [ 1193, 224, 1 ],
      [ 1288, 176, 1 ],
      [ 1393, 138, 0 ],
      [ 1393, 234, 0 ],
      [ 1478, 176, 1 ],
      
      [ 490, 234, 0 ],
      [ 480, 319, 1 ],
      [ 585, 281, 0 ],
      [ 717, 271, 1 ],
      [ 822, 281, 0 ],
      
      [ 299, 424, 0 ],
      [ 394, 376, 0 ],
      [ 394, 471, 0 ],
      [ 490, 424, 0 ],
      [ 632, 376, 0 ],
      [ 632, 471, 0 ],
      [ 727, 424, 0 ],
      [ 822, 376, 0 ],
      [ 822, 471, 0 ],
      [ 918, 424, 0 ],
      [ 908, 509, 1 ],
      [ 1013, 376, 0 ],
      [ 1013, 471, 0 ],
      [ 1108, 424, 0 ],
      [ 1098, 319, 1 ],
      [ 1203, 424, 0 ],
      [ 1288, 414, 1 ],
      [ 1393, 376, 0 ],
      [ 1393, 471, 0 ],
      [ 1478, 414, 1 ],
      
      [ 480, 509, 1 ],
      [ 585, 566, 0 ],
      [ 490, 614, 0 ],
      [ 717, 556, 1 ],
      [ 822, 566, 0 ],
      
      [ 252, 519, 0 ],
      [ 394, 566, 0 ],
      [ 347, 662, 0 ],
      [ 490, 709, 0 ],
      [ 480, 794, 1 ],
      [ 632, 662, 0 ],
      [ 632, 757, 0 ],
      [ 727, 709, 0 ],
      [ 717, 794, 1 ],
      [ 822, 662, 0 ],
      [ 822, 757, 0 ],
      [ 918, 709, 0 ],
      [ 908, 794, 1 ],
      [ 1013, 662, 0 ],
      [ 1013, 757, 0 ],
      [ 1108, 709, 0 ],
      [ 1108, 804, 0 ],
      [ 1192, 794, 1 ],
      [ 1202, 709, 0 ],
      [ 1192, 604, 1 ],
      [ 1288, 652, 1 ],
      [ 1393, 614, 0 ],
      [ 1393, 709, 0 ],
      [ 1478, 652, 1 ]
    ],
    
    technomancer: [
      [ 107, 374, 2 ],
      
      [ 252, 329, 0 ],
      [ 347, 186, 0 ],
      [ 394, 281, 0 ],
      [ 490, 138, 0 ],
      [ 480, 33, 1 ],
      [ 632, 91, 0 ],
      [ 632, 186, 0 ],
      [ 727, 138, 0 ],
      [ 717, 33, 1 ],
      [ 822, 91, 0 ],
      [ 822, 186, 0 ],
      [ 918, 138, 0 ],
      [ 908, 33, 1 ],
      [ 1013, 91, 0 ],
      [ 1013, 186, 0 ],
      [ 1108, 138, 0 ],
      [ 1098, 224, 1 ],
      [ 1202, 138, 0 ],
      [ 1193, 33, 1 ],
      [ 1288, 176, 1 ],
      [ 1393, 138, 0 ],
      [ 1393, 234, 0 ],
      [ 1478, 176, 1 ],
      
      [ 490, 234, 0 ],
      [ 480, 319, 1 ],
      [ 585, 281, 0 ],
      [ 717, 271, 1 ],
      [ 822, 281, 0 ],
      
      [ 299, 424, 0 ],
      [ 394, 376, 0 ],
      [ 394, 471, 0 ],
      [ 490, 424, 0 ],
      [ 632, 376, 0 ],
      [ 632, 471, 0 ],
      [ 727, 424, 0 ],
      [ 822, 376, 0 ],
      [ 822, 471, 0 ],
      [ 918, 424, 0 ],
      [ 908, 319, 1 ],
      [ 908, 509, 1 ],
      [ 1013, 566, 0 ],
      [ 1013, 376, 0 ],
      [ 1013, 471, 0 ],
      [ 1108, 424, 0 ],
      [ 1203, 424, 0 ],
      [ 1193, 319, 1 ],
      [ 1288, 414, 1 ],
      [ 1393, 376, 0 ],
      [ 1393, 471, 0 ],
      [ 1478, 414, 1 ],
      
      [ 480, 509, 1 ],
      [ 585, 566, 0 ],
      [ 490, 614, 0 ],
      [ 717, 556, 1 ],
      
      [ 252, 519, 0 ],
      [ 394, 566, 0 ],
      [ 347, 662, 0 ],
      [ 490, 709, 0 ],
      [ 480, 794, 1 ],
      [ 632, 662, 0 ],
      [ 632, 757, 0 ],
      [ 727, 709, 0 ],
      [ 717, 794, 1 ],
      [ 822, 662, 0 ],
      [ 822, 757, 0 ],
      [ 918, 709, 0 ],
      [ 908, 794, 1 ],
      [ 1013, 662, 0 ],
      [ 1013, 757, 0 ],
      [ 1108, 709, 0 ],
      [ 1108, 804, 0 ],
      [ 1192, 794, 1 ],
      [ 1202, 709, 0 ],
      [ 1192, 604, 1 ],
      [ 1288, 652, 1 ],
      [ 1393, 614, 0 ],
      [ 1393, 709, 0 ],
      [ 1478, 652, 1 ]
    ]
  }
  
  //---------------------------------------- Load Nodes
  $.each(allcoords, (c, coords) => {
    let nodes = $("." + c + ".skilltree .nodes")
    $.each(coords, (i, node) => {
      nodes.append($("<div>").addClass("node n" + node[2]).css({ left: node[0], top: node[1] }))
    })
  })
  
  //---------------------------------------- Load Stats & Tooltips
  let keywords = {
    "hl-a": /(anomaly power)/gi,
    "hl-d": /((weapon|assault|close range|long range) damage|firepower)/gi,
    "hl-e": /(weakness|vulnerab(le|ility)|marked|burn(ing)?|ash(ed)?|bleed|toxic|freeze|frozen)/gi,
    "hl-h": /((maximum )?health( regen)?)/gi,
    "hl-l": /(^\[hm\]|(weapon|skill) leech|heal(?!th)(s|ed|ing)?)/gi,
    "hl-n": /((concentration|magma golem|anomaly in veins|br\/8 impact amplifier) node)/gi,
    "hl-p": /((armor|(armor and )?resistance) piercing)/gi,
    "hl-r": /((armor|resistance)(?!( and resistance)? piercing)|damage mitigation)/gi,
    "hl-s": /((damage|deception|movement|ignite|immobilize|explosive|protection|seismic|kinetic|decay|ordinance|gadget|melee|any) skills?|stone push|(?<=skill (cooldown|damage) \()(damage|deception|movement|ignite|immobilize|explosive|protection|seismic|kinetic|decay|ordinance|gadget|any))/gi,
    "hl-t": /(shields?( degredation| gain)?)/gi
  }
  
  stats = {
    trickster: {},
    pyromancer: {},
    devastator: {},
    technomancer: {}
  }
  
  $.each(skills, (c, list) => {
    let skilltree = $("." + c + ".skilltree")
    let statstable = $("." + c + ".statstable")
    let s = []
    let u = []
    $.each(list, (i, node) => {
      let t = []
      $.each(node[4], (k, v) => {
        if (!stats[c][k]) {
          stats[c][k] = [ 0, v, 0, 1 ]
        }
        else {
          stats[c][k][1] += v
          stats[c][k][3]++
        }
        
        if (v) {
          if (!s.includes(k)) {
            s.push(k)
          }
          t.push(+(v * 100).toFixed(1) + "% " + k)
        }
        else {
          if (!u.includes(k)) {
            u.push(k)
          }
          t.push(k)
        }
      })
      let tooltip = $("<ul>")
      $.each(t, (j, v) => {
        tooltip.append($("<li>").html(color(v, keywords)))
      })
      $(".node", skilltree).eq(i)
        .append($("<div>").addClass("name").text(node[3]))
        .append($("<div>").addClass("tooltip")
          .append(tooltip))
    })
    
    //--- Create sorted stat list
    $.each(s.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())), (i, v) => {
      $("table", statstable).first()
        .append($("<tr>").addClass("stat inactive").attr("data-s", v)
          .append($("<td>").addClass("stat-k").text(v + ":"))
          .append($("<td>").addClass("stat-v").text("0%"))
          .append($("<td>").addClass("stat-m").text(+(stats[c][v][1] * 100).toFixed(1) + "%"))
          .append($("<td>").addClass("stat-n").html("(<span class=\"stat-c\">0</span>/" + stats[c][v][3] + ")")))
    })
    //--- Create sorted stat list (Unique stats)
    $.each(u.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())), (i, v) => {
      $("table", statstable).last()
        .append($("<tr>").addClass("stat inactive").attr("data-s", v)
          .append($("<td>").html(color(v, keywords))))
    })
  })
      
  //--- Unique Node Skill Count
  $(".stat[data-s='Increase Assault Damage by 3.5% for each unlocked Concentration node'] td").append(" (<span class=\"unique\" data-c=\"0\" data-v=\"0.035\">0%</span>)")
  $(".stat[data-s='Increase Anomaly Power by 2.5% for each unlocked Magma Golem node'] td").append(" (<span class=\"unique\" data-c=\"0\" data-v=\"0.025\">0%</span>)")
  $(".stat[data-s='Increase Weapon Damage by 10% for each unlocked Anomaly in Veins node'] td").append(" (<span class=\"unique\" data-c=\"0\" data-v=\"0.1\">0%</span>)")
  $(".stat[data-s='Increase Anomaly Power by 4% for each unlocked Br/8 Impact Amplifier node'] td").append(" (<span class=\"unique\" data-c=\"0\" data-v=\"0.04\">0%</span>)")
  
  //---------------------------------------- Load Abilities
  abilities = {
    trickster: {
      Damage: {
        "Temporal Blade": 20,
        "Twisted Rounds": 20,
        "Cyclone Slice": 0,
      },
      Deception: {
        "Slow Trap": 31,
        "Venator's Knife": 0,
        "Time Rift": 0
      },
      Movement: {
        "Hunt The Prey": 11,
        "Borrowed Time": 0
      }
    },
    pyromancer: {
      Explosive: {
        "Thermal Bomb": 14,
        "Overheat": 22,
        "Eruption": 0
      },
      Ignite: {
        "Heatwave": 13,
        "Volcanic Rounds": 0,
        "F.A.S.E.R Beam": 0
      },
      Immobilize: {
        "Feed the Flames": 17,
        "Ash Blast": 0
      }
    },
    devastator: {
      Kinetic: {
        "Gravity Leap": 20,
        "Boulderdash": 0,
        "Endless Mass": 0
      },
      Protection: {
        "Golem": 26
      },
      Seismic: {
        "Earthquake": 14,
        "Reflect Bullets": 22,
        "Impale": 0,
        "Tremor": 0
      }
    },
    technomancer: {
      Decay: {
        "Blighted Rounds": 58,
        "Blighted Turret": 0
      },
      Gadget: {
        "Cryo Turret": 24,
        "Fixing Wave": 0,
        "Cold Snap": 0
      },
      Ordinance: {
        "Scrapnel": 22,
        "Pain Launcher": 40,
        "Tool Of Destruction": 0
      }
    }
  }
  
  cooldowns = {
    Damage: 1,
    Deception: 1,
    Movement: 1,
    Explosive: 1,
    Ignite: 1,
    Immobilize: 1,
    Kinetic: 1,
    Protection: 1,
    Seismic: 1,
    Decay: 1,
    Gadget: 1,
    Ordinance: 1
  }
  
  let abilitydesc = {
    trickster: {
      "Temporal Blade": "Paralyze and slice enemies in front of you, dealing ~86% damage and inflicting Slow and Interrupt to all targets.",
      "Twisted Rounds": "Fill your current weapon's magazine with Anomaly-infused bullets that increase your Firepower by ~50%. The skill lasts until you reload or switch weapons.",
      "Cyclone Slice": "Create a whirlwind of Anomaly blades that deal [Z] damage and Interrupt onto enemies within a small radius of you with every hit. The skill lasts for [X] seconds.",
      "Slow Trap": "Create a spacetime Anomaly sphere that inflicts Slow onto enemies and projectiles for 10 seconds.",
      "Venator's Knife": "Throw a temporal knife at an enemy. The blade will ricochet between a maximum of [Y] enemies within a small radius, dealing [Z] damage and marking them. All marked targets will be inflicted by Slow, and for [X] seconds the first damage dealt by you will be doubled.",
      "Time Rift": "Create a shockwave that suspends enemies in the air, leaving them unable to fight for 3.5 seconds and inflicts Weakness.",
      "Hunt The Prey": "Select an enemy and teleport behind them, receiving a ~19% Shield bonus.",
      "Borrowed Time": "Receive [X] Shield and mark your location for [Y] seconds. Triggering the skill again will bend spacetime and teleport you back to the marked spot.",
    },
    pyromancer: {
      "Thermal Bomb": "Select an enemy to Burn, Interrupt and deal ~13% damage to. If killed while still afflicted by the skill, the enemy will explode, dealing ~112% damage within a large radius.",
      "Overheat": "Deal ~3.7% damage to all enemies within a large radius and Interrupt their skills. Enemies afflicted with Burn receive ~45% damage instead (the Burn will be consumed).",
      "Eruption": "Create a volcanic eruption beneath the selected enemy, dealing [Z] damage to all enemies within a small radius of the target. The eruption spews lava, dealing damage over time within a small area.",
      "Heatwave": "Summon a fiery wave that deals ~17.5% damage and inflicts Burn onto all enemies in its path.",
      "Volcanic Rounds": "Fill your current weapon's magazine with bullets that will ignite the air around enemies and inflict Burn onto them, even if the bullet misses. If the bullet hits, it causes skill damage, ignoring armor and piercing the target, damaging others behind them. The skill lasts until you reload or switch weapons.",
      "F.A.S.E.R Beam": "Fire an energy beam that deals [Z] damage that benefits from [X]% of Status Power, inflicting Burn and causing Interrupt to enemies hit by the beam, as well as enemies within a small radius around you.",
      "Feed the Flames": "Select and pull an enemy towards you dealing ~25% damage, draining ~25% Health, and inflicting Ash.",
      "Ash Blast": "Create an Anomaly blast to inflict Ash onto all enemies within a large radius around you.",
    },
    devastator: {
      "Gravity Leap": "Leap into the air and strike your targets from above, dealing ~80% damage and Interrupting enemies within a small radius of the area you land in.",
      "Boulderdash": "Charge forward to Interrupt all enemies in your path and deal [Z] damage. At the end of the charge, you will smash the ground and deal [Z] damage to all enemies within a small radius around you.",
      "Endless Mass": "Select a target to encase in stone, inflicting Bleed and pulling enemies within a small radius towards the initial target. The stone will then explode, dealing [Z] damage to all enemies within a small radius around the target.",
      "Golem": "Fortify yourself against 65% of incoming damage for 8 seconds.",
      "Earthquake": "Release a shockwave to deal ~40% damage and Interrupt all enemies in front of you.",
      "Reflect Bullets": "Create a barrier that captures all enemy projectiles and accumulates damage. After 10 seconds of triggering the skill, the accumulated damage is reflected back to enemies in front of you.<br><br>The barrier also protects against melee attacks by reflecting some damage back.",
      "Impale": "Select a target to Interrupt their skills, inflict Bleed, and deal [Z] damage.<br><br>If the damage is lethal, the enemy will be impaled, granting a powerful bonus to Armor and Health Regeneration to all allies for 9 seconds.",
      "Tremor": "Create a series of explosions around you, each dealing [Z] damage and draining [X] Health from enemies within a medium radius around you.",
    },
    technomancer: {
      "Blighted Rounds": "Fill your current weapon's magazine with decay-infused bullets that inflict Toxic onto enemies. Enemies within a small radius of the main target also receive Toxic and 50% of damage. The skill lasts until you reload or switch weapons.",
      "Blighted Turret": "Place an automated turret that deals [Z] damage and inflicts Toxic onto enemies. The turret's health depletes slowly over time and when it takes damage.",
      "Cryo Turret": "Place an automated turret that deals ~2% damage and inflicts Freeze onto enemies. The turret's health depletes slowly over time and when it takes damage.",
      "Fixing Wave": "Release your energy to restore [X]% of Health to all players and [Y]% of Health to your turrets, regardless of distance.",
      "Cold Snap": "Drop a gadget to inflict Freeze onto all enemies within a large radius around you.",
      "Scrapnel": "Throw a proximity mine. The explosion deals ~77% damage and Interrupts the skills of enemies caught within the blast radius.",
      "Pain Launcher": "Place a missile launcher and bomb the area in front of you. Each missile deals ~13% damage per hit and Interrupts enemy skills.",
      "Tool Of Destruction": "Press the skill button to equip a Rocket Launcher that can Interrupt enemies and deals [X] damage. Hold the skill button for a Minigun that deals [Z] damage per shot.<br><br>The skill will remain active until all ammo is depleted or until you switch weapons.",
    }
  }
  
  let abilitykeywords = {
    "hl-d": /(~?\d+(\.\d+)?%|3\.5|9|\[[xyz]\]%?|firepower)/gi,
    "hl-e": /(weakness|burn|\bash|bleed|toxic|freeze)/gi,
    "hl-h": /(health( regeneration)?)/gi,
    "hl-n": /(interrupt(s|ing)?)/gi,
    "hl-r": /(Armor)/g,
    "hl-s": /(rocket launcher|minigun)/gi,
    "hl-t": /(shield)/gi
  }
  
  $.each(abilities, (c, types) => {
    let statstable = $("." + c + ".statstable .cooldowns")
    let i = 1
    $.each(types, (type, list) => {
      let activetype = $("<div>")
      statstable.append(activetype.append($("<div>").addClass("powertype").text(type)))
      $.each(list, (name, cd) => {
        activetype.append($("<div>").addClass("power").attr("data-i", i++).attr("data-n", name)
          .append($("<div>").text(name))
          .append($("<img>").attr({ src: "skills/" + name.replace(/ /g, "-").toLowerCase() + ".png", width: "64px", height: "64px", onerror: "this.onerror = null; this.src='skills/placeholder.webp'" }))
          .append($("<div>").addClass("cooldown").text(cd))
          .append($("<div>").addClass("tooltip").html(color(abilitydesc[c][name], abilitykeywords))))
      })
    })
  })
}
