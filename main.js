$(function() {
  init()
  
  //---------------------------------------- Load Stats & Tooltips
  stats = {
    trickster: {},
    pyromancer: {},
    devastator: {},
    technomancer: {}
  }
  
  $.each(skills, function(c, list) {
    let skilltree = $("." + c + ".skilltree")
    let statstable = $("." + c + ".statstable")
    let s = []
    let u = []
    $.each(list, function(i, node) {
      let t = []
      $.each(node[3], function(k, v) {
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
          t.push(Math.round(v * 100) + "% " + k)
        }
        else {
          if (!u.includes(k)) {
            u.push(k)
          }
          t.push(k)
        }
      })
      $(".node[data-n=" + i + "]", skilltree).append($("<div>").addClass("tooltip").html(color(t.join("<br>"))))
    })
    
    //--- Create sorted stat list
    $.each(s.sort(), function(i, v) {
      $("table:first", statstable)
        .append($("<tr>").addClass("stat inactive").attr("data-s", v)
          .append($("<td>").addClass("stat-k").text(v + ":"))
          .append($("<td>").addClass("stat-v").text("0%"))
          .append($("<td>").addClass("stat-m").text(Math.round(stats[c][v][1] * 100) + "%"))
          .append($("<td>").addClass("stat-n").html("(<span class=\"stat-c\">0</span>/" + stats[c][v][3] + ")")))
    })
    //--- Create sorted stat list (Unique stats)
    $.each(u.sort(), function(i, v) {
      $("table:last", statstable)
        .append($("<tr>").addClass("stat inactive").attr("data-s", v)
          .append($("<td>").html(color(v))))
    })
  })
  
  //---------------------------------------- Points
  points = {
    trickster: 20,
    pyromancer: 20,
    devastator: 20,
    technomancer: 20
  }
  $(".points").text(20)
  
  //---------------------------------------- Get URL params
  url = {
    trickster: [],
    pyromancer: [],
    devastator: [],
    technomancer: []
  }
  let search = new URLSearchParams(location.search)
  active = search.get("c")
  activetree = $("." + active + ".skilltree")
  activestats = $("." + active + ".statstable")
  if (active) {
    let s = search.get("s")
    $("#nav-" + active).click()
    if (s) {
      $.each(s.split(",").map(Number), function(i, n) {
        add(n)
      })
    }
  }
  else {
    $("#nav-trickster").click()
    add(0)
  }
  
  //---------------------------------------- Get cookies
  $.each(document.cookie.split(";"), function(i, s) {
    let cookie = s.split("=")
    if (+cookie[1] && ([ "allstats", "maxstats", "nodecount" ].includes(cookie[0].trim()))) {
      $("#" + cookie[0].trim()).click()
    }
  })
  
  //---------------------------------------- Click node
  $(".node").on("mousedown", function() {
    let id = Number($(this).attr("data-n"))
    if (skills[active][id][0] == 1 && points[active] > 0) {
      add(id)
    }
    else if (skills[active][id][0] == 2 && check(id)) {
      remove(id)
    }
  })

  //---------------------------------------- Disable default right-click on image & nodes
  $("img, area").bind("contextmenu", function() {
    return false
  })
  
  //---------------------------------------- Disable clicking node anchors scrolling to top of page
  $("area").bind("click", function() {
    return false
  })
  
  //---------------------------------------- DEBUG
  $("body").append($("<img>").attr({ id: "bread", src: "favicon.ico", width: 24, height: 24 }).css({ position: "absolute", top: "2000px", right: "1%" }))

  $("#bread").on("click", function() {
    if (!$("#debug").length) {
      $("#reset").after($("<div>").attr("id", "debug").css({ position: "fixed", left: "40px", top: "140px" }))
      $(".node").mousemove(function() {
        $("#debug").text($(this).attr("data-n"))
      })
    }
    points[active] = 100
    $(".points", activetree).text(points[active])
  })
})

//---------------------------------------- Add node
function add(id) {
  let node = skills[active][id]
  
  //--- Activate node
  node[0] = 2
  $(".node[data-n=" + id + "]", activetree).removeClass("activatable").addClass("active")
  $(".points", activetree).text(--points[active])
  
  //--- Stats
  let stat = node[3]
  $.each(stat, function(k, v) {
    if (stats[active][k][1]) {
      stats[active][k][0] += v
      $(".stat[data-s=\"" + k + "\"] .stat-v", activestats).removeClass("stat-0 stat-1 stat-2 stat-3").addClass("stat-" + Math.floor(stats[active][k][0] / stats[active][k][1] * 3)).text(Math.round(stats[active][k][0] * 100) + "%")
      $(".stat[data-s=\"" + k + "\"] .stat-c", activestats).text(++stats[active][k][2])
    }
    $(".stat[data-s=\"" + k + "\"]", activestats).removeClass("inactive").show()
  })
  
  //--- Set non-active children to activatable
  $.each(node[2], function(i, n) {
    if (skills[active][n][0] != 2) {
      skills[active][n][0] = 1
      $(".node[data-n=" + n + "]", activetree).addClass("activatable")
    }
  })
  
  //--- Update URL
  url[active].push(id)
  url[active].sort(function(a, b) {
    return a - b
  })
  history.replaceState(null, "", "?c=" + active + "&s=" + url[active].join(","))
}

//---------------------------------------- Remove node
function remove(id) {
  let node = skills[active][id]
  
  //--- Deactivate node
  node[0] = 1
  $(".node[data-n=" + id + "]", activetree).removeClass("active").addClass("activatable")
  $(".points", activetree).text(++points[active])
  
  //--- Stats
  let stat = node[3]
  $.each(stat, function(k, v) {
    if (stats[active][k][1]) {
      stats[active][k][0] -= v
      $(".stat[data-s=\"" + k + "\"] .stat-v", activestats).removeClass("stat-0 stat-1 stat-2 stat-3")
      $(".stat[data-s=\"" + k + "\"] .stat-c", activestats).text(--stats[active][k][2])
    }
    if (stats[active][k][0]) {
      $(".stat[data-s=\"" + k + "\"] .stat-v", activestats).addClass("stat-" + Math.floor(stats[active][k][0] / stats[active][k][1] * 3)).text(Math.round(stats[active][k][0] * 100) + "%")
    }
    else {
      if (!$("#allstats").prop("checked")) {
        $(".stat[data-s=\"" + k + "\"]", activestats).hide()
      }
      $(".stat[data-s=\"" + k + "\"]", activestats).addClass("inactive")
      $(".stat[data-s=\"" + k + "\"] .stat-v", activestats).text("0%")
    }
  })
  
  //--- Get all activatable child nodes
  let children = []
  $.each(node[2], function(i, n) {
    if (skills[active][n][0] == 1) {
      children.push(n)
    }
  })
  
  //--- Set activatable child nodes with no other active parents to inactive
  $.each(children, function(i, n) {
    let x = 1
    $.each(skills[active][n][1], function(j, m) {
      if (skills[active][m][0] == 2) {
        x = 0
        return false
      }
    })
    if (x) {
      skills[active][n][0] = 0
      $(".node[data-n=" + n + "]", activetree).removeClass("activatable")
    }
  })
  
  //--- Update URL
  url[active].splice($.inArray(id, url[active]), 1)
  history.replaceState(null, "", "?c=" + active + "&s=" + url[active].join(","))
}

//---------------------------------------- Check tree
function check(id) {
  tree = id != 0 && [ id ] || []
  recurse(0)
  tree.shift()
  
  //--- Check for invalid active child node
  let x = 1
  $.each(skills[active][id][2], function(i, n) {
    if (skills[active][n][0] == 2 && !tree.includes(n)) {
      x = 0
      return false
    }
  })
  return x
}

//---------------------------------------- Recurse children
function recurse(id) {
  $.each(skills[active][id][2], function(i, n) {
    if (skills[active][n][0] == 2 && !tree.includes(n)) {
      tree.push(n)
      recurse(n)
    }
  })
}

//---------------------------------------- Reset tree
$("#reset").on("click", function() {
  //--- Set all nodes to inactive
  $.each(skills[active], function(i, s) {
    s[0] = 0
  })
  $(".node", activetree).removeClass("active activatable highlight")
  
  //--- Clear stats
  if (!$("#allstats").prop("checked")) {
    $(".stat", activestats).hide()
  }
  $(".stat", activestats).addClass("inactive")
  
  $.each(stats[active], function(k, s) {
    s[0] = 0
    s[2] = 0
  })
  $(".stat .stat-v", activestats).removeClass("stat-0 stat-1 stat-2 stat-3").text("0%")
  $(".stat .stat-c", activestats).text(0)
  
  //--- Add node 0
  url[active] = []
  points[active] = 20
  skills[active][0][0] = 1
  add(0)
})

//---------------------------------------- Change Tree
$("#nav-trickster, #nav-pyromancer, #nav-devastator, #nav-technomancer").on("click", function() {
  activetree.hide()
  activestats.hide()
  $("#searchbox").val("")
  $(".node", activetree).removeClass("highlight")
  
  active = $(this).attr("data-class")
  activetree = $("." + active + ".skilltree").show()
  activestats = $("." + active + ".statstable").show()
  
  history.replaceState(null, "", "?c=" + active + "&s=" + url[active].join(","))
})

//---------------------------------------- Stats Options
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

//---------------------------------------- Search
$("#search").on("click", search)

$("#searchbox").keyup(function(e) {
  if (e.keyCode == 13) {
    search()
  }
})

function search() {
  $(".node", activestats).removeClass("highlight")
  let s = $("#searchbox").val().toLowerCase()
  if (s) {
    $.each(skills[active], function(i, n) {
      $.each(n[3], function(k, v) {
        if (k.toLowerCase().includes(s)) {
          $(".node[data-n=" + i + "]", activestats).addClass("highlight")
          return false
        }
      })
    })
    $("#searchcount").text("(" + $(".node.highlight").length + " matches)")
  }
  else {
    $("#searchcount").text("")
  }
}

//---------------------------------------- Color Keywords
function color(s) {
  $.each(keywords, function(k, v) {
    if (s.match(v)) {
      s = s.replace(v, "<span class=\"" + k + "\">$1</span>")
    }
  })
  return $("<span>").html(s)
}

//---------------------------------------- Init
function init() {
  //---------------------------------------- Keywords for tooltips & stats descriptions
  keywords = {
    "hl-wd": /((weapon|assault|close range|long range) damage)/gi,
    "hl-ap": /(anomaly power)/gi,
    "hl-ar": /((armor|(armor and )?resistance) penetration)/gi,
    "hl-s": /((damage|disruption|movement) Skills?)/gi
  }
  
  //---------------------------------------- All Skills
  skills = {
    trickster: [
      [ 1, [], [ 1, 30, 55 ], { "Health": 0.05, "Damage Mitigation while Shield is active": 0.05 } ],
      
      //--- 1 - Master of Space
      [ 0, [ 0, 2, 3 ], [ 2, 3 ], { "Weapon Damage (Close Range)": 0.15 } ],
      [ 0, [ 1, 4 ], [ 1, 4 ], { "Reload Time": -0.2 } ],
      [ 0, [ 1, 4 ], [ 1, 4 ], { "Armor Penetration": 0.1 } ],
      [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], { "Weapon Damage": 0.08 } ],
      [ 0, [ 4 ], [], { "Weapon Damage (Shotgun)": 0.2, "Drop Rate (Shotgun)": 0.12 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "Skill Cooldown (Movement)": 0.15 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "Crit Damage": 0.2 } ],
      [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], { "Weapon Damage (Close Range)": 0.15 } ],
      [ 0, [ 8 ], [], { "Activating a Disruption Skill increases your Weapon Damage by 20% for 8s": null } ],
      [ 0, [ 8 ], [ 12 ], { "Skill Cooldown (Disruption)": 0.15 } ], //--- 10
      [ 0, [ 8 ], [ 12 ], { "Armor Penetration": 0.1 } ],
      [ 0, [ 10, 11 ], [ 13, 14, 15 ], { "Weapon Damage (From Behind)": 0.2 } ],
      [ 0, [ 12 ], [], { "When your Damage Skill ends, increase your Weapon Damage by 20% for 8s": null } ],
      [ 0, [ 12 ], [ 16 ], { "Weapon Damage": 0.08 } ],
      [ 0, [ 12 ], [ 16 ], { "Weapon Damage (Close Range)": 0.15 } ],
      [ 0, [ 14, 15 ], [ 17, 19 ], { "Weapon Damage": 0.08 } ],
      [ 0, [ 16 ], [ 18 ], { "Skill Cooldown (Movement)": 0.15 } ],
      [ 0, [ 18 ], [], { "Weapon Leech": 0.05 } ],
      [ 0, [ 16 ], [ 20, 21 ], { "Weapon Damage (From Behind)": 0.2 } ],
      [ 0, [ 19 ], [], { "Weapon Damage (Against Elites)": 0.15 } ], //--- 20
      [ 0, [ 19 ], [ 22, 23 ], { "Magazine Size": 0.5 } ],
      [ 0, [ 21 ], [ 24 ], { "Weapon Damage (Assault)": 0.12 } ],
      [ 0, [ 21 ], [ 24 ], { "Weapon Damage (Shotgun)": 0.12 } ],
      [ 0, [ 22, 23 ], [], { "For each enemy in close range your Weapon Damage is increased by 8% (Stacks up to 10 times)": null } ],
      
      //--- 25
      [ 0, [ 4, 26 ], [ 4, 26 ], { "Weapon Damage (Close Range)": 0.15 } ],
      [ 0, [ 25, 33 ], [ 25, 33, 27 ], { "Activating a Movement Skill increases your Armor Penetration by 25% for 10s": null } ],
      [ 0, [ 26 ], [], { "Gain additional 3% health for every enemy that died in close range": null } ],
      [ 0, [ 8, 36 ], [ 8, 29, 36 ], { "When your Movement Skill ends, increase your Weapon Damage by 20% for 8s": null } ],
      [ 0, [ 28 ], [], { "Armor Penetration": 0.1 } ],
      
      //--- 30 - Harbinger
      [ 0, [ 0, 31, 32 ], [ 31, 32 ], { "Health": 0.1 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "Resistance": 0.15 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "Damage Mitigation while Shield is active": 0.05 } ],
      [ 0, [ 26, 31, 32, 34, 35, 50 ], [ 26, 31, 32, 34, 35, 50 ], { "Health": 0.1 } ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "Shield": 0.1, "Shield Degredation": -0.3 } ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "(UNKNOWN 1)": null } ],
      [ 0, [ 28, 34, 35, 53 ], [ 28, 34, 35, 37, 38, 53 ], { "Health": 0.1 } ],
      [ 0, [ 36 ], [ 39 ], { "Resistance": 0.15 } ],
      [ 0, [ 36 ], [ 39 ], { "Shield Degredation": -0.3 } ],
      [ 0, [ 37, 38 ], [ 40, 41, 42 ], { "Skill Cooldown (Disruption)": 0.15 } ],
      [ 0, [ 39 ], [], { "When your Damage Skill ends, increase your Damage Mitigation by 5% for 10s": null } ], //--- 40
      [ 0, [ 39 ], [ 43 ], { "Armor": 0.2 } ],
      [ 0, [ 39 ], [ 43 ], { "Shield": 0.1 } ],
      [ 0, [ 41, 42 ], [ 44, 45 ], { "Shield Degredation": -0.3 } ],
      [ 0, [ 43 ], [], { "For each enemy in close range, your Armor is increased by 15% (Stacks up to 10 times)": null } ],
      [ 0, [ 43 ], [ 46 ], { "Health": 0.1 } ],
      [ 0, [ 45 ], [ 47, 48 ], { "Every ammo pickup heals you for 5% of your maximum health": null } ],
      [ 0, [ 46 ], [ 49 ], { "Shield": 0.1, "Shield Degredation": -0.3 } ],
      [ 0, [ 46 ], [ 49 ], { "Armor": 0.2 } ],
      [ 0, [ 47, 48 ], [], { "Activating a Disruption Skill grants you 20% shield": null } ],
      
      //--- 50
      [ 0, [ 33, 52 ], [ 33, 51, 52 ], { "When surrounded by enemies, reloading your weapon deals damage and interrupts enemies' abilities. Damage scales with Anomaly Power.": null } ],
      [ 0, [ 50 ], [], { "(UNKNOWN 2)": null } ],
      [ 0, [ 50, 58 ], [ 50, 58 ], { "(UNKNOWN 3) Resistance Penetration": null } ],
      [ 0, [ 36, 62 ], [ 36, 54, 62 ], { "Melee applies Weakness": null } ],
      [ 0, [ 53 ], [], { "(UNKNOWN 4) 10% Shield, -30% Shield Degredation": null } ],
      
      //--- 55 - Assassin
      [ 0, [ 0, 56, 57 ], [ 56, 57 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 55, 58 ], [ 55, 58 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 55, 58 ], [ 55, 58 ], { "Resistance Penetration": 0.15 } ],
      [ 0, [ 52, 56, 57, 60, 61 ], [ 52, 56, 57, 59, 60, 61 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 58 ], [], { "Increase Assault Damage by 7% for each unlocked Concentration node": null, "Drop Rate (Assault)": 0.12 } ],
      [ 0, [ 58, 62 ], [ 58, 62 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 58, 62 ], [ 58, 62 ], { "Skill Cooldown (Damage)": 0.15 } ],
      [ 0, [ 53, 60, 61 ], [ 53, 60, 61, 63, 64, 65 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 62 ], [], { "Activating a Movement Skill increases your Resistance Penetration by 25% for 10s": null } ],
      [ 0, [ 62 ], [ 66 ], { "Weakness Duration": 0.3 } ],
      [ 0, [ 62 ], [ 66 ], { "Resistance": 0.15 } ], //--- 65
      [ 0, [ 64, 65 ], [ 67, 68, 69 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 66 ], [], { "Activating a Movement Skill increases your Anomaly Power by 20% for 10s": null } ],
      [ 0, [ 66 ], [ 70 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 66 ], [ 70 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 68, 69 ], [ 71, 73 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 70 ], [ 72 ], { "Killed Marked enemy increases healing by 15%": null } ],
      [ 0, [ 71 ], [], { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.12 } ],
      [ 0, [ 70 ], [ 74, 75 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 73 ], [], { "When your Damage Skill ends, increase your Armor and Resistance Penetration by 25% for 10s": null } ],
      [ 0, [ 73 ], [ 76, 77 ], { "Activating a Movement Skill increases your Armor Penetration by 25% for 10s": null } ], //--- 75
      [ 0, [ 75 ], [ 78 ], { "(UNKNOWN 5) Weapon Damage (Conditional?)": null } ],
      [ 0, [ 75 ], [ 78 ], { "Shield": 0.1, "Shield Degredation": -0.3 } ],
      [ 0, [ 76, 77 ], [], { "For each enemy in close range, your Anomaly Power is increased by 10% (Stacks up to 10 times)": null } ]
    ],
    
    pyromancer: [
      [ 1, [], [ 1, 30, 56 ], { "Anomaly Power": 0.1, "Skill Leech": 0.05, "Skills mark Enemies for 15s. Killing a Marked heals you by 24% of your Maximum Health": null } ],
      
      //--- 1 - Ash Breaker
      [ 0, [ 0, 2, 3 ], [ 2, 3 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 1, 4 ], [ 1, 4 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 1, 4 ], [ 1, 4 ], { "Skill Cooldown (Immobilize)": 0.15 } ],
      [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 4 ], [], { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.12 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "Armor Penetration": 0.1 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "Damage (Against Ashed)": 0.2 } ],
      [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 8 ], [], { "(UNKNOWN 1)": null } ],
      [ 0, [ 8 ], [ 12 ], { "Armor Penetration": 0.1 } ], //--- 10
      [ 0, [ 8 ], [ 12 ], { "(UNKNOWN 2) Burn Duration": 0.2 } ],
      [ 0, [ 10, 11 ], [ 13, 14, 15 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 12 ], [], { "Weapon Damage (Sniper)": 0.2, "Drop Rate (Sniper)": 0.12 } ],
      [ 0, [ 12 ], [ 16 ], { "Armor Penetration": 0.1 } ],
      [ 0, [ 12 ], [ 16 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 14, 15 ], [ 17, 19, 20 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 16 ], [ 18 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 17 ], [], { "Activating an Immobilize Skill doubles your Weapon Leech for 4s": null } ],
      [ 0, [ 16 ], [], { "(UNKNOWN 3)": null } ],
      [ 0, [ 16 ], [ 21 ], { "Reload Time": -0.2 } ], //--- 20
      [ 0, [ 20 ], [ 22, 23 ], { "Damage (Against Elites)": 0.1, "Take less damage (From Elites)": 0.1 } ],
      [ 0, [ 21 ], [ 24 ], { "Damage (Against Ashed)": 0.2 } ],
      [ 0, [ 21 ], [ 24 ], { "Skill Cooldown (Immobilize)": 0.15 } ],
      [ 0, [ 22, 23 ], [], { "Activating an Immobilize Skill increases your Weapon Damage by 20% for 10s": null } ],
      
      //--- 25
      [ 0, [ 4, 26 ], [ 4, 26 ], { "(UNKNOWN 4) Damage Increase": null } ],
      [ 0, [ 25, 33 ], [ 25, 33, 27 ], { "Armor Penetration (Against Marked)": 0.3 } ],
      [ 0, [ 26 ], [], { "(UNKNOWN 5)": null } ],
      [ 0, [ 8, 36 ], [ 8, 29, 36 ], { "(UNKNOWN 6)": null } ],
      [ 0, [ 28 ], [], { "Burn Duration": 0.2 } ],
      
      //--- 30 - Firestorm
      [ 0, [ 0, 31, 32 ], [ 31, 32 ], { "Health": 0.1 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "Skill Cooldown (Ignite)": 0.15 } ],
      [ 0, [ 26, 31, 32, 34, 35, 51 ], [ 26, 31, 32, 34, 35, 51 ], { "Health": 0.1 } ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "(UNKNOWN 7) Armor Increase": null} ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "Burn Damage": 0.2 } ],
      [ 0, [ 28, 34, 35, 54 ], [ 28, 34, 35, 37, 38, 54 ], { "Health": 0.1 } ],
      [ 0, [ 36 ], [ 39 ], { "Weapon Damage": 0.05, "Anomaly Power": 0.05 } ],
      [ 0, [ 36 ], [ 39 ], { "(UNKNOWN 8) Resistance Increase": null } ],
      [ 0, [ 37, 38 ], [ 40, 41, 42, 43 ], { "Health": 0.1 } ],
      [ 0, [ 39 ], [], { "Increase Anomaly Power by 2.5% for each unlocked Magma Golem node": null } ], //--- 40
      [ 0, [ 39 ], [], { "Activating any skill increases Weapon Damage by 20% for 7s": null } ],
      [ 0, [ 39 ], [ 44 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 39 ], [ 44 ], { "Burn Duration": 0.2 } ],
      [ 0, [ 42, 43 ], [ 45 ], { "Health": 0.1 } ],
      [ 0, [ 44 ], [ 46, 47 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 45 ], [], { "Activating an Ignite Skill increases your Armor by 45% for 10s": null } ],
      [ 0, [ 45 ], [ 48, 49 ], { "Skill Leech is doubled when below 30% Health": null } ],
      [ 0, [ 47 ], [ 50 ], { "Damage (Against Burning)": 0.1 } ],
      [ 0, [ 47 ], [ 50 ], { "Skill Cooldown (Ignite)": 0.15 } ],
      [ 0, [ 48, 49 ], [], { "(UNKNOWN 9)": null } ],
      
      //--- 51
      [ 0, [ 33, 53 ], [ 33, 52, 53 ], { "Skill Cooldown": 0.1 } ],
      [ 0, [ 51 ], [], { "(UNKNOWN 10) Damage boost (Conditional)": null } ],
      [ 0, [ 51, 59 ], [ 51, 59 ], { "Weapon Damage (Sidearm)": 0.12 } ],
      [ 0, [ 36, 63 ], [ 36, 55, 63 ], { "(UNKNOWN 11)": null } ],
      [ 0, [ 54 ], [], { "(UNKNOWN 12) Burn related": null } ],
      
      //--- 56 - Tempest
      [ 0, [ 0, 57, 58 ], [ 57, 58 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 56, 59 ], [ 56, 59 ], { "(UNKNOWN 13)": null } ],
      [ 0, [ 56, 59 ], [ 56, 59 ], { "Skill Cooldown (Explosive)": 0.15 } ],
      [ 0, [ 53, 57, 58, 61, 62 ], [ 53, 57, 58, 60, 61, 62 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 59 ], [], { "(UNKNOWN 14)": null } ],
      [ 0, [ 59, 63 ], [ 59, 63 ], { "(UNKNOWN 15)": null } ],
      [ 0, [ 59, 63 ], [ 59, 63 ], { "(UNKNOWN 16)": null } ],
      [ 0, [ 54, 61, 62 ], [ 54, 61, 62, 64, 65, 66 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 63 ], [], { "Weapon Damage is increased by 15% of Anomaly Power": null } ],
      [ 0, [ 63 ], [ 67 ], { "(UNKNOWN 17) Burn related": null } ],
      [ 0, [ 63 ], [ 67 ], { "(UNKNOWN 18)": null } ], //--- 65
      [ 0, [ 65, 66 ], [ 68, 69, 70 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 67 ], [], { "(UNKNOWN 19)": null } ],
      [ 0, [ 67 ], [ 71 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 67 ], [ 71 ], { "(UNKNOWN 20) Resistance boost": null } ],
      [ 0, [ 69, 70 ], [ 72, 74 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 71 ], [ 73 ], { "Upon losing all health you will recive a second chance to return to the battlefield with 50% Health (180s cooldown)": null } ],
      [ 0, [ 72 ], [], { "Your Phoenix revival will now grant 100% of your health points and will be ready to activate every 135s": null } ],
      [ 0, [ 71 ], [ 75, 76 ], { "(UNKNOWN 21) Resistance Penetration": null } ],
      [ 0, [ 74 ], [], { "Killing a Marked target heals you by additional 12% of your maximum health": null } ],
      [ 0, [ 74 ], [ 77, 78 ], { "(UNKNOWN 22)": null } ], //--- 75
      [ 0, [ 76 ], [ 79 ], { "(UNKNOWN 23)": null } ],
      [ 0, [ 76 ], [ 79 ], { "Skill Cooldown (Explosive)": 0.15 } ],
      [ 0, [ 77, 78 ], [], { "(UNKNOWN 24)": null } ]
    ],
    
    devastator: [
      [ 1, [], [ 1, 30, 55 ], { "Every Close Range kill heals you by 24% of your Maximum Health": null, "Health": 0.15, "Armor": 0.3 } ],
      
      //--- 1 - Vanquisher
      [ 0, [ 1, 4 ], [ 1, 4 ], { "Weapon Damage": 0.08 } ],
      [ 0, [ 1, 4 ], [ 1, 4 ], { "Weapon Damage (Shotgun)": 0.12 } ],
      [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], { "Armor Penetration": 0.1 } ],
      [ 0, [ 4 ], [], { "Weapon Damage": 0.08 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "Weapon Damage (Shotgun)": 0.2, "Drop Rate (Shotgun)": 0.12 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "Weapon Damage (Assault)": 0.12 } ],
      [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], { "Armor Penetration": 0.1 } ],
      [ 0, [ 8 ], [], { "Weapon Damage": 0.08 } ],
      [ 0, [ 8 ], [ 12 ], { "When your Kinetic Skill ends, increase your Weapon Damage by 20% for 10s": null } ], //--- 10
      [ 0, [ 8 ], [ 12 ], { "Crit Damage": 0.2 } ],
      [ 0, [ 10, 11 ], [ 13, 14, 15 ], { "(UNKNOWN 1)": null } ],
      [ 0, [ 12 ], [], { "Weapon Damage": 0.08 } ],
      [ 0, [ 12 ], [ 16 ], { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.12 } ],
      [ 0, [ 12 ], [ 16 ], { "Skill Cooldown (Kinetic)": 0.15 } ],
      [ 0, [ 14, 15 ], [ 17, 19 ], { "Weapon Damage (Close Range)": 0.15 } ],
      [ 0, [ 16 ], [ 18 ], { "Weapon Damage": 0.08 } ],
      [ 0, [ 18 ], [], { "Weapon Leech": 0.05 } ],
      [ 0, [ 16 ], [ 20, 21 ], { "(UNKNOWN 2)": null } ],
      [ 0, [ 19 ], [], { "(UNKNOWN 3)": null } ], //--- 20
      [ 0, [ 19 ], [ 22, 23 ], { "(UNKNOWN 4)": null } ],
      [ 0, [ 19 ], [ 22, 23 ], { "Damage (Physical against Elites)": 0.15, "Take less damage (From Elites)": 0.15 } ],
      [ 0, [ 21 ], [ 24 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 21 ], [ 24 ], { "Armor Penetration": 0.1 } ],
      [ 0, [ 22, 23 ], [], { "When your Kinetic Skill ends, increase your Weapon Damage by 70% for 10s": null } ],
      
      //--- 25
      [ 0, [ 4, 26 ], [ 4, 26 ], { "(UNKNOWN 5) Skill Cooldown": null } ],
      [ 0, [ 25, 33 ], [ 25, 33, 27 ], { "When your Kinetic Skill ends, increase your Damage Mitigation by 20% for 10s": null } ],
      [ 0, [ 26 ], [], { "(UNKNWON 6) Weapon Damage": null } ],
      [ 0, [ 8, 36 ], [ 8, 29, 36 ], { "When an enemy dies in close range, gain 20% of their Armor for 10s": null } ],
      [ 0, [ 28 ], [], { "(UNKNOWN 7)": null } ],
      
      //--- 30 - Warden
      [ 0, [ 0, 31, 32 ], [ 31, 32 ], { "Health": 0.1 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "Armor": 0.2 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "Health Regen every second": 0.01 } ],
      [ 0, [ 26, 31, 32, 34, 35, 50 ], [ 26, 31, 32, 34, 35, 50 ], { "Health": 0.1 } ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "Resistance increase for each enemy in close range": 0.15 } ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "Health Regen every second": 0.01 } ],
      [ 0, [ 28, 34, 35, 53 ], [ 28, 34, 35, 37, 38, 53 ], { "Health": 0.1 } ],
      [ 0, [ 36 ], [ 39 ], { "Health Regen every second": 0.01 } ],
      [ 0, [ 36 ], [ 39 ], { "Armor": 0.2 } ],
      [ 0, [ 37, 38 ], [ 40, 41, 42 ], { "Health": 0.1 } ],
      [ 0, [ 39 ], [], { "Increase all Healing and Shields by 20% for your and your allies": null } ], //--- 40
      [ 0, [ 39 ], [ 43 ], { "Health": 0.1 } ],
      [ 0, [ 39 ], [ 43 ], { "Skill Cooldown (Protection)": 0.15 } ],
      [ 0, [ 41, 42 ], [ 44, 45 ], { "Resistance increase for each enemy in close range": 0.15 } ],
      [ 0, [ 43 ], [], { "You have 100% chance to ignore damage that would kill you and instantly heal your for 50% of your health points (180s cooldown)": null } ],
      [ 0, [ 43 ], [ 46 ], { "Armor": 0.2 } ],
      [ 0, [ 45 ], [ 47, 48 ], { "": 0.1 } ],
      [ 0, [ 46 ], [ 49 ], { "Resistance increase for each enemy in close range": 0.15 } ],
      [ 0, [ 46 ], [ 49 ], { "Armor": 0.2  } ],
      [ 0, [ 47, 48 ], [], { "Increase Firepower by 10% of your Armor": null, "Increase Anomaly Power by 10% of your Armor": null } ],
      
      //--- 50
      [ 0, [ 33, 52 ], [ 33, 51, 52 ], { "After using Stone Push, increase Resistance Penetration by 15% for each hit enemy for 10s": null } ],
      [ 0, [ 50 ], [], { "(UNKNWON 8) Health": null } ],
      [ 0, [ 50, 58 ], [ 50, 58 ], { "Skill Cooldown (Kinetic)": 0.15 } ],
      [ 0, [ 36, 62 ], [ 36, 54, 62 ], { "(UNKNWON 9) Health": null } ],
      [ 0, [ 53 ], [], { "(UNKNWON 10) Armor": null } ],
      
      //--- 55 - Seismic Shifter
      [ 0, [ 0, 56, 57 ], [ 56, 57 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 55, 58 ], [ 55, 58 ], { "Skill Cooldown (Kinetic)": 0.15 } ],
      [ 0, [ 55, 58 ], [ 55, 58 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 52, 56, 57, 60, 61 ], [ 52, 56, 57, 59, 60, 61 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 58 ], [], { "Activating a Protection Skill increases Anomaly Power by 60% for 5s": null } ],
      [ 0, [ 58, 62 ], [ 58, 62 ], { "Resistance Penetration": 0.15 } ],
      [ 0, [ 58, 62 ], [ 58, 62 ], { "Skill Cooldown (Seismic)": 0.15 } ],
      [ 0, [ 53, 60, 61 ], [ 53, 60, 61, 63, 64, 65 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 62 ], [], { "Increase your Firepower by 15% of your Anomaly Power": null } ],
      [ 0, [ 62 ], [ 66 ], { "(UNKNOWN 11) Bleed": null } ],
      [ 0, [ 62 ], [ 66 ], { "Skill Cooldown (Seismic)": 0.15 } ], //--- 65
      [ 0, [ 64, 65 ], [ 67, 68, 69 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 66 ], [], { "(UNKNOWN 12)": null } ],
      [ 0, [ 66 ], [ 70 ], { "Increase Damage by 20% against enemies with lesss than 30% Health": null } ],
      [ 0, [ 66 ], [ 70 ], { "(UNKNOWN 13) Bleed": null } ],
      [ 0, [ 68, 69 ], [ 71, 73 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 70 ], [ 72 ], { "(UNKNOWN 14) Bleed": null } ],
      [ 0, [ 71 ], [], { "You are healed by 50% of the Damage caused by Bleed": null } ],
      [ 0, [ 70 ], [ 74, 75 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 73 ], [], { "When any skill ends, increase your Armor and Resistance by 20% for 10s": null } ],
      [ 0, [ 73 ], [ 76, 77 ], { "Increase your Armor bonus by 40% of your Anomaly Power": null } ], //--- 75
      [ 0, [ 75 ], [ 78 ], { "Resistance Penetration": 0.15 } ],
      [ 0, [ 75 ], [ 78 ], { "(UNKNOWN 15) Bleed": null } ],
      [ 0, [ 76, 77 ], [], { "Double Seismic Skills Damage": null } ]
    ],
    
    technomancer: [
      [ 1, [], [ 1, 30, 55 ], { "Weapon Damage (Long Range)": 0.075, "Skill Leech": 0.15, "WeaponLeech": 0.15 } ],
      
      //--- 1 - Pestilence
      [ 0, [ 1, 4 ], [ 1, 4 ], { "": 0.1 } ],
      [ 0, [ 1, 4 ], [ 1, 4 ], { "": 0.1 } ],
      [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], { "": 0.1 } ],
      [ 0, [ 4 ], [], { "": 0.1 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "": 0.1 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "": 0.1 } ],
      [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], { "": 0.1 } ],
      [ 0, [ 8 ], [], { "": 0.1 } ],
      [ 0, [ 8 ], [ 12 ], { "": 0.1 } ], //--- 10
      [ 0, [ 8 ], [ 12 ], { "": 0.1 } ],
      [ 0, [ 10, 11 ], [ 13, 14, 15 ], { "": 0.1 } ],
      [ 0, [ 12 ], [], { "": 0.1 } ],
      [ 0, [ 12 ], [ 16 ], { "": 0.1 } ],
      [ 0, [ 12 ], [ 16 ], { "": 0.1 } ],
      [ 0, [ 14, 15 ], [ 17, 19 ], { "": 0.1 } ],
      [ 0, [ 16 ], [ 18 ], { "": 0.1 } ],
      [ 0, [ 18 ], [], { "": 0.1 } ],
      [ 0, [ 16 ], [ 20, 21 ], { "": 0.1 } ],
      [ 0, [ 19 ], [], { "": 0.1 } ], //--- 20
      [ 0, [ 19 ], [ 22, 23 ], { "": 0.1 } ],
      [ 0, [ 21 ], [ 24 ], { "": 0.1 } ],
      [ 0, [ 21 ], [ 24 ], { "": 0.1 } ],
      [ 0, [ 22, 23 ], [], { "": 0.1 } ],
      
      //--- 25
      [ 0, [ 4, 26 ], [ 4, 26 ], { "": 0.1 } ],
      [ 0, [ 25, 33 ], [ 25, 33, 27 ], { "": 0.1 } ],
      [ 0, [ 26 ], [], { "": 0.1 } ],
      [ 0, [ 8, 36 ], [ 8, 29, 36 ], { "": 0.1 } ],
      [ 0, [ 28 ], [], { "": 0.1 } ],
      
      //--- 30 - Tech Shaman
      [ 0, [ 0, 31, 32 ], [ 31, 32 ], { "": 0.1 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "": 0.1 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "": 0.1 } ],
      [ 0, [ 26, 31, 32, 34, 35, 50 ], [ 26, 31, 32, 34, 35, 50 ], { "": 0.1 } ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "": 0.1 } ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "": 0.1 } ],
      [ 0, [ 28, 34, 35, 53 ], [ 28, 34, 35, 37, 38, 53 ], { "": 0.1 } ],
      [ 0, [ 36 ], [ 39 ], { "": 0.1 } ],
      [ 0, [ 36 ], [ 39 ], { "": 0.1 } ],
      [ 0, [ 37, 38 ], [ 40, 41, 42 ], { "": 0.1 } ],
      [ 0, [ 39 ], [], { "": 0.1 } ], //--- 40
      [ 0, [ 39 ], [ 43 ], { "": 0.1 } ],
      [ 0, [ 39 ], [ 43 ], { "": 0.1 } ],
      [ 0, [ 41, 42 ], [ 44, 45 ], { "": 0.1 } ],
      [ 0, [ 43 ], [], { "": 0.1 } ],
      [ 0, [ 43 ], [ 46 ], { "": 0.1 } ],
      [ 0, [ 45 ], [ 47, 48 ], { "": 0.1 } ],
      [ 0, [ 46 ], [ 49 ], { "": 0.1 } ],
      [ 0, [ 46 ], [ 49 ], { "": 0.1 } ],
      [ 0, [ 47, 48 ], [], { "": 0.1 } ],
      
      //--- 50
      [ 0, [ 33, 52 ], [ 33, 51, 52 ], { "": 0.1 } ],
      [ 0, [ 50 ], [], { "": 0.1 } ],
      [ 0, [ 50, 58 ], [ 50, 58 ], { "": 0.1 } ],
      [ 0, [ 36, 62 ], [ 36, 54, 62 ], { "": 0.1 } ],
      [ 0, [ 53 ], [], { "": 0.1 } ],
      
      //--- 55 - Demolisher
      [ 0, [ 0, 56, 57 ], [ 56, 57 ], { "": 0.1 } ],
      [ 0, [ 55, 58 ], [ 55, 58 ], { "": 0.1 } ],
      [ 0, [ 55, 58 ], [ 55, 58 ], { "": 0.1 } ],
      [ 0, [ 52, 56, 57, 60, 61 ], [ 52, 56, 57, 59, 60, 61 ], { "": 0.1 } ],
      [ 0, [ 58 ], [], { "": 0.1 } ],
      [ 0, [ 58, 62 ], [ 58, 62 ], { "": 0.1 } ],
      [ 0, [ 58, 62 ], [ 58, 62 ], { "": 0.1 } ],
      [ 0, [ 53, 60, 61 ], [ 53, 60, 61, 63, 64, 65 ], { "": 0.1 } ],
      [ 0, [ 62 ], [], { "": 0.1 } ],
      [ 0, [ 62 ], [ 66 ], { "": 0.1 } ],
      [ 0, [ 62 ], [ 66 ], { "": 0.1 } ], //--- 65
      [ 0, [ 64, 65 ], [ 67, 68, 69 ], { "": 0.1 } ],
      [ 0, [ 66 ], [], { "": 0.1 } ],
      [ 0, [ 66 ], [ 70 ], { "": 0.1 } ],
      [ 0, [ 66 ], [ 70 ], { "": 0.1 } ],
      [ 0, [ 68, 69 ], [ 71, 73 ], { "": 0.1 } ],
      [ 0, [ 70 ], [ 72 ], { "": 0.1 } ],
      [ 0, [ 71 ], [], { "": 0.1 } ],
      [ 0, [ 70 ], [ 74, 75 ], { "": 0.1 } ],
      [ 0, [ 73 ], [], { "": 0.1 } ],
      [ 0, [ 73 ], [ 76, 77 ], { "": 0.1 } ], //--- 75
      [ 0, [ 75 ], [ 78 ], { "": 0.1 } ],
      [ 0, [ 75 ], [ 78 ], { "": 0.1 } ],
      [ 0, [ 76, 77 ], [], { "": 0.1 } ]
    ]
  }
  
  //----------------------------------------- Node Positions
  let allcoords = {
    trickster: [
      [ 164, 437, 2 ],
      
      [ 357, 146, 0 ],
      [ 454, 97, 0 ],
      [ 454, 194, 0 ],
      [ 551, 146, 0 ],
      [ 551, 48, 1 ],
      [ 648, 97, 0 ],
      [ 648, 194, 0 ],
      [ 745, 146, 0 ],
      [ 745, 48, 1 ],
      [ 842, 97, 0 ],
      [ 842, 194, 0 ],
      [ 939, 146, 0 ],
      [ 939, 48, 1 ],
      [ 1036, 97, 0 ],
      [ 1036, 194, 0 ],
      [ 1133, 146, 0 ],
      [ 1133, 49, 0 ],
      [ 1229, 48, 1 ],
      [ 1229, 146, 0 ],
      [ 1229, 243, 1 ],
      [ 1326, 194, 1 ],
      [ 1423, 146, 0 ],
      [ 1423, 243, 0 ],
      [ 1520, 194, 1 ],
      
      [ 551, 243, 0 ],
      [ 551, 339, 1 ],
      [ 454, 291, 0 ],
      [ 745, 291, 1 ],
      [ 842, 291, 0 ],
      
      [ 357, 436, 0 ],
      [ 454, 388, 0 ],
      [ 454, 485, 0 ],
      [ 551, 436, 0 ],
      [ 648, 388, 0 ],
      [ 648, 485, 0 ],
      [ 745, 436, 0 ],
      [ 842, 388, 0 ],
      [ 842, 485, 0 ],
      [ 939, 436, 0 ],
      [ 939, 533, 1 ],
      [ 1036, 388, 0 ],
      [ 1036, 485, 0 ],
      [ 1133, 436, 0 ],
      [ 1133, 339, 1 ],
      [ 1229, 436, 0 ],
      [ 1326, 436, 1 ],
      [ 1423, 388, 0 ],
      [ 1423, 485, 0 ],
      [ 1520, 436, 1 ],
      
      [ 551, 533, 1 ],
      [ 454, 582, 0 ],
      [ 551, 630, 0 ],
      [ 745, 582, 1 ],
      [ 842, 582, 0 ],
      
      [ 357, 727, 0 ],
      [ 454, 679, 0 ],
      [ 454, 776, 0 ],
      [ 551, 727, 0 ],
      [ 551, 824, 1 ],
      [ 648, 679, 0 ],
      [ 648, 776, 0 ],
      [ 745, 727, 0 ],
      [ 745, 824, 1 ],
      [ 842, 679, 0 ],
      [ 842, 776, 0 ],
      [ 939, 727, 0 ],
      [ 939, 824, 1 ],
      [ 1036, 679, 0 ],
      [ 1036, 776, 0 ],
      [ 1133, 727, 0 ],
      [ 1133, 824, 0 ],
      [ 1229, 824, 1 ],
      [ 1229, 727, 0 ],
      [ 1229, 630, 1 ],
      [ 1326, 679, 1 ],
      [ 1423, 630, 0 ],
      [ 1423, 727, 0 ],
      [ 1520, 679, 1 ]
    ],
    
    pyromancer: [
      [ 188, 436, 2 ],
      
      [ 283, 341, 0 ],
      [ 378, 204, 0 ],
      [ 422, 295, 0 ],
      [ 516, 155, 0 ],
      [ 517, 62, 1 ],
      [ 658, 107, 0 ],
      [ 658, 201, 0 ],
      [ 752, 155, 0 ],
      [ 751, 63, 1 ],
      [ 845, 107, 0 ],
      [ 845, 201, 0 ],
      [ 937, 157, 0 ],
      [ 938, 64, 1 ],
      [ 1031, 109, 0 ],
      [ 1030, 204, 0 ],
      [ 1123, 155, 0 ],
      [ 1122, 64, 0 ],
      [ 1215, 62, 1 ],
      [ 1122, 248, 1 ],
      [ 1215, 202, 0 ],
      [ 1309, 202, 1 ],
      [ 1403, 153, 0 ],
      [ 1402, 248, 0 ],
      [ 1497, 204, 1 ],
      
      [ 517, 250, 0 ],
      [ 516, 341, 1 ],
      [ 612, 296, 0 ],
      [ 751, 293, 1 ],
      [ 846, 295, 0 ],
      
      [ 332, 436, 0 ],
      [ 425, 389, 0 ],
      [ 424, 483, 0 ],
      [ 518, 436, 0 ],
      [ 658, 387, 0 ],
      [ 659, 484, 0 ],
      [ 750, 434, 0 ],
      [ 842, 389, 0 ],
      [ 844, 482, 0 ],
      [ 936, 434, 0 ],
      [ 936, 341, 1 ],
      [ 937, 526, 1 ],
      [ 1030, 389, 0 ],
      [ 1030, 481, 0 ],
      [ 1123, 434, 0 ],
      [ 1216, 434, 0 ],
      [ 1216, 343, 1 ],
      [ 1309, 438, 1 ],
      [ 1405, 388, 0 ],
      [ 1402, 482, 0 ],
      [ 1496, 434, 1 ],
      
      [ 517, 529, 1 ],
      [ 611, 572, 0 ],
      [ 518, 622, 0 ],
      [ 750, 570, 1 ],
      [ 845, 574, 0 ],
      
      [ 285, 527, 0 ],
      [ 424, 575, 0 ],
      [ 379, 670, 0 ],
      [ 518, 714, 0 ],
      [ 516, 808, 1 ],
      [ 657, 670, 0 ],
      [ 658, 760, 0 ],
      [ 752, 714, 0 ],
      [ 748, 805, 1 ],
      [ 844, 669, 0 ],
      [ 843, 759, 0 ],
      [ 936, 713, 0 ],
      [ 939, 807, 1 ],
      [ 1031, 667, 0 ],
      [ 1030, 761, 0 ],
      [ 1123, 714, 0 ],
      [ 1123, 811, 1 ],
      [ 1217, 810, 0 ],
      [ 1215, 714, 0 ],
      [ 1217, 621, 1 ],
      [ 1308, 665, 1 ],
      [ 1403, 620, 0 ],
      [ 1402, 717, 0 ],
      [ 1495, 669, 1 ]
    ],
    
    devastator: [
      [ 189, 454, 2 ],
      
      [ 283, 362, 0 ],
      [ 376, 224, 0 ],
      [ 423, 317, 0 ],
      [ 517, 175, 0 ],
      [ 516, 83, 1 ],
      [ 655, 129, 0 ],
      [ 656, 221, 0 ],
      [ 750, 177, 0 ],
      [ 749, 82, 1 ],
      [ 843, 127, 0 ],
      [ 843, 223, 0 ],
      [ 936, 174, 0 ],
      [ 936, 83, 1 ],
      [ 1028, 129, 0 ],
      [ 1028, 221, 0 ],
      [ 1121, 175, 0 ],
      [ 1121, 84, 0 ],
      [ 1215, 83, 1 ],
      [ 1215, 175, 0 ],
      [ 1214, 266, 1 ],
      [ 1307, 221, 1 ],
      [ 1402, 177, 0 ],
      [ 1403, 268, 0 ],
      [ 1494, 224, 1 ],
      
      [ 517, 268, 0 ],
      [ 517, 361, 1 ],
      [ 612, 316, 0 ],
      [ 750, 312, 1 ],
      [ 844, 314, 0 ],
      
      [ 330, 456, 0 ],
      [ 422, 407, 0 ],
      [ 424, 500, 0 ],
      [ 516, 458, 0 ],
      [ 659, 410, 0 ],
      [ 657, 502, 0 ],
      [ 749, 455, 0 ],
      [ 841, 408, 0 ],
      [ 843, 501, 0 ],
      [ 935, 453, 0 ],
      [ 936, 548, 1 ],
      [ 1026, 408, 0 ],
      [ 1030, 501, 0 ],
      [ 1124, 453, 0 ],
      [ 1123, 364, 1 ],
      [ 1215, 454, 0 ],
      [ 1309, 455, 1 ],
      [ 1397, 408, 0 ],
      [ 1404, 505, 0 ],
      [ 1494, 453, 1 ],
      
      [ 516, 547, 1 ],
      [ 608, 596, 0 ],
      [ 514, 642, 0 ],
      [ 750, 594, 1 ],
      [ 842, 595, 0 ],
      
      [ 283, 547, 0 ],
      [ 423, 592, 0 ],
      [ 378, 686, 0 ],
      [ 515, 734, 0 ],
      [ 515, 830, 1 ],
      [ 656, 689, 0 ],
      [ 656, 780, 0 ],
      [ 750, 733, 0 ],
      [ 748, 826, 1 ],
      [ 840, 689, 0 ],
      [ 840, 782, 0 ],
      [ 934, 736, 0 ],
      [ 937, 826, 1 ],
      [ 1028, 686, 0 ],
      [ 1029, 781, 0 ],
      [ 1120, 734, 0 ],
      [ 1123, 828, 0 ],
      [ 1216, 828, 1 ],
      [ 1216, 735, 0 ],
      [ 1212, 641, 1 ],
      [ 1309, 689, 1 ],
      [ 1402, 642, 0 ],
      [ 1401, 735, 0 ],
      [ 1493, 687, 1 ]
    ],
    
    technomancer: [
      [ 180, 451, 2 ],
      
      [ 276, 355, 0 ],
      [ 373, 215, 0 ],
      [ 418, 309, 0 ],
      [ 513, 166, 0 ],
      [ 512, 73, 1 ],
      [ 656, 121, 0 ],
      [ 655, 213, 0 ],
      [ 749, 169, 0 ],
      [ 748, 73, 1 ],
      [ 846, 120, 0 ],
      [ 845, 214, 0 ],
      [ 938, 169, 0 ],
      [ 937, 74, 1 ],
      [ 1033, 121, 0 ],
      [ 1033, 213, 0 ],
      [ 1127, 165, 0 ],
      [ 1126, 262, 1 ],
      [ 1222, 166, 0 ],
      [ 1221, 71, 1 ],
      [ 1316, 215, 1 ],
      [ 1411, 166, 0 ],
      [ 1411, 261, 0 ],
      [ 1505, 214, 1 ],
      
      [ 512, 262, 0 ],
      [ 511, 357, 1 ],
      [ 606, 310, 0 ],
      [ 747, 306, 1 ],
      [ 843, 308, 0 ],
      
      [ 322, 451, 0 ],
      [ 418, 403, 0 ],
      [ 417, 499, 0 ],
      [ 511, 453, 0 ],
      [ 654, 401, 0 ],
      [ 653, 498, 0 ],
      [ 748, 451, 0 ],
      [ 845, 401, 0 ],
      [ 844, 497, 0 ],
      [ 937, 453, 0 ],
      [ 939, 356, 1 ],
      [ 939, 542, 1 ],
      [ 1033, 593, 0 ],
      [ 1034, 402, 0 ],
      [ 1033, 497, 0 ],
      [ 1126, 451, 0 ],
      [ 1223, 447, 0 ],
      [ 1224, 358, 1 ],
      [ 1317, 451, 1 ],
      [ 1410, 403, 0 ],
      [ 1411, 497, 0 ],
      [ 1503, 451, 1 ],
      
      [ 514, 541, 1 ],
      [ 607, 591, 0 ],
      [ 514, 639, 0 ],
      [ 749, 594, 1 ],
      
      [ 275, 545, 0 ],
      [ 419, 590, 0 ],
      [ 371, 685, 0 ],
      [ 514, 734, 0 ],
      [ 513, 828, 1 ],
      [ 655, 689, 0 ],
      [ 657, 778, 0 ],
      [ 752, 730, 0 ],
      [ 751, 828, 1 ],
      [ 844, 687, 0 ],
      [ 844, 779, 0 ],
      [ 939, 737, 0 ],
      [ 938, 830, 1 ],
      [ 1034, 688, 0 ],
      [ 1033, 782, 0 ],
      [ 1128, 734, 0 ],
      [ 1128, 827, 0 ],
      [ 1224, 827, 1 ],
      [ 1220, 735, 0 ],
      [ 1218, 637, 1 ],
      [ 1317, 687, 1 ],
      [ 1410, 643, 0 ],
      [ 1410, 735, 0 ],
      [ 1505, 690, 1 ]
    ]
  }
  
  //---------------------------------------- Load nodes
  let alloffsets = [ 19, 29, 69 ]
  $.each(allcoords, function(c, coords) {
    let map = $("." + c + ".skilltree map")
    $.each(coords, function(i, node) {
      let offset = alloffsets[node[2]]
      map.append($("<div>").addClass("node n" + node[2]).attr("data-n", i).css({ left: node[0] - offset + "px", top: node[1] - offset + "px" })
        .append($("<area>").attr({ shape: "circle", href: "#", coords: node[0] + "," + node[1] + "," + (offset + 1) })))
    })
  })
}
