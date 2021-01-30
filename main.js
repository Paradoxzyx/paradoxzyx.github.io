$(function() {
  init()
  
  //--- Get URL params
  let c = new URLSearchParams(location.search).get("c")
  if (c) {
    let s = new URLSearchParams(location.search).get("s")
    $("#" + c).click()
    if (s) {
      $.each(s.split(",").map(Number), function(i, v) {
        if (v != 0) {
          add(v)
        }
      })
    }
  }
  else {
    $("#trickster").click()
  }
  
  //--- Get cookies
  $.each(document.cookie.split(";"), function(i, s) {
    let c = s.split("=")
    if (+c[1]) {
      $("#" + c[0].trim()).click()
    }
  })
  
  
  //--- Load Tooltips
  $.each(allskills, function(c, t) {
    $.each(t, function(i, n) {
      let s = []
      $.each(n[3], function(k, v) {
        if (v) {
          s.push(Math.round(v * 100) + "% " + k)
        }
        else {
          s.push(k)
        }
      })
      $("#" + c + "-st .node[data-n=" + i + "]").append($("<div>").addClass("tooltip").html(color(s.join("<br>"))))
    })
  })
  
  //---------------------------------------- Click node
  $(".node").on("mousedown", function() {
    let id = Number($(this).attr("data-n"))
    if (skills[id][0] == 1) {
      add(id)
    }
    else if (skills[id][0] == 2) {
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
  
  //--- DEBUG
  $("body").append($("<img>").attr({ id: "bread", src: "favicon.ico", width: 24, height: 24 }).css({ position: "absolute", top: "2000px", right: "1%" }))

  $("#bread").on("click", function() {
    if (!$("#debug").length) {
      $("#reset").after($("<div>").attr("id", "debug").css({ position: "fixed", left: "40px", top: "140px" }))
      $(".node").mousemove(function() {
        $("#debug").text($(this).attr("data-n"))
      })
    }
    points = 100
    $("#points").text(points)
  })
})

//---------------------------------------- Add node
function add(id) {
  if (points > 0) {
    let node = skills[id]
    
    //--- Activate node
    node[0] = 2
    $(".node[data-n=" + id + "]").removeClass("activatable").addClass("active")
    $("#points").text(--points)
    
    //--- Stats
    let s = node[3]
    $.each(s, function(k, v) {
      if (stats[k][1]) {
        stats[k][0] += v
        $(".stat[data-s=\"" + k + "\"] .stat-v").removeClass("stat-0 stat-1 stat-2 stat-3").addClass("stat-" + Math.floor(stats[k][0] / stats[k][1] * 3)).text(Math.round(stats[k][0] * 100) + "%")
        $(".stat[data-s=\"" + k + "\"] .stat-c").text(++stats[k][2])
      }
      $(".stat[data-s=\"" + k + "\"]").removeClass("inactive").show()
    })
    
    //--- Set non-active children to activatable
    $.each(node[2], function(i, n) {
      if (skills[n][0] != 2) {
        skills[n][0] = 1
        $(".node[data-n=" + n + "]").addClass("activatable")
      }
    })
    
    //--- Update URL
    url.push(id)
    url.sort(function(a, b) {
      return a - b
    })
    history.replaceState(null, "", "?c=" + urlclass + "&s=" + url.join(","))
  }
}

//---------------------------------------- Remove node
function remove(id) {
  if (check(id)) {
    let node = skills[id]
    
    //--- Deactivate node
    node[0] = 1
    $(".node[data-n=" + id + "]").removeClass("active").addClass("activatable")
    $("#points").text(++points)
    
    //--- Stats
    let s = node[3]
    $.each(s, function(k, v) {
      if (stats[k][1]) {
        stats[k][0] -= v
        $(".stat[data-s=\"" + k + "\"] .stat-v").removeClass("stat-0 stat-1 stat-2 stat-3")
        $(".stat[data-s=\"" + k + "\"] .stat-c").text(--stats[k][2])
      }
      if (stats[k][0]) {
        $(".stat[data-s=\"" + k + "\"] .stat-v").addClass("stat-" + Math.floor(stats[k][0] / stats[k][1] * 3)).text(Math.round(stats[k][0] * 100) + "%")
      }
      else {
        if (!$("#allstats").prop("checked")) {
          $(".stat[data-s=\"" + k + "\"]").hide()
        }
        $(".stat[data-s=\"" + k + "\"]").addClass("inactive")
        $(".stat[data-s=\"" + k + "\"] .stat-v").text("0%")
      }
    })
    
    //--- Get all activatable child nodes
    let e = []
    $.each(node[2], function(i, n) {
      if (skills[n][0] == 1) {
        e.push(n)
      }
    })
    
    //--- Set activatable child nodes with no other active parents to inactive
    $.each(e, function(i, n) {
      let c = 1
      $.each(skills[n][1], function(j, m) {
        if (skills[m][0] == 2) {
          c = 0
          return false
        }
      })
      if (c) {
        skills[n][0] = 0
        $(".node[data-n=" + n + "]").removeClass("activatable")
      }
    })
    
    //--- Update URL
    url.splice($.inArray(id, url), 1)
    history.replaceState(null, "", "?c=" + urlclass + "&s=" + url.join(","))
  }
}

//---------------------------------------- Check tree
function check(id) {
  tree = id != 0 && [ id ] || []
  recurse(0)
  tree.shift()
  
  //--- Check for invalid active child node
  let c = 1
  $.each(skills[id][2], function(i, n) {
    if (skills[n][0] == 2 && !tree.includes(n)) {
      c = 0
      return false
    }
  })
  return c
}

//---------------------------------------- Recurse children
function recurse(id) {
  $.each(skills[id][2], function(i, n) {
    if (skills[n][0] == 2 && !tree.includes(n)) {
      tree.push(n)
      recurse(n)
    }
  })
}

//---------------------------------------- Reset tree
$("#reset").on("click", reset)

function reset() {
  //--- Set all nodes to inactive
  $.each(skills, function(i, n) {
    n[0] = 0
  })
  $(".node").removeClass("active activatable highlight")
  
  //--- Clear stats
  $.each(stats, function(i, s) {
    s[0] = 0
  })
  if (!$("#allstats").prop("checked")) {
    $(".stat").hide()
  }
  $(".stat").addClass("inactive")
  $(".stat .stat-v").removeClass("stat-0 stat-1 stat-2 stat-3").text("0%")
  
  //--- Add node 0
  url = []
  points = 20
  skills[0][0] = 1
  add(0)
}

//---------------------------------------- Change Tree
$("#trickster, #pyromancer, #devastator, #technomancer").on("click", function() {
  let c = $(this).attr("id")
  $(".skilltree").hide()
  $("#" + c + "-st").show()
  skills = allskills[c]
  urlclass = c
  change()
})
  
function change() {
  stats = {}
  $("#stats table").empty()
  
  //--- Get all unique stats
  s = []
  u = []
  $.each(skills, function(i, n) {
    $.each(n[3], function(k, v) {
      if (!stats[k]) {
        stats[k] = [ 0, v, 0, 1 ]
      }
      else {
        stats[k][1] += v
        stats[k][3]++
      }
      
      if (v) {
        if (!s.includes(k)) {
          s.push(k)
        }
      }
      else {
        if (!u.includes(k)) {
          u.push(k)
        }
      }
    })
  })
  
  //--- Create sorted stat list
  $.each(s.sort(), function(i, v) {
    $("#stats table:first")
      .append($("<tr>").addClass("stat").attr("data-s", v)
        .append($("<td>").addClass("stat-k").text(v + ":"))
        .append($("<td>").addClass("stat-v"))
        .append($("<td>").addClass("stat-m").text(Math.round(stats[v][1] * 100) + "%"))
        .append($("<td>").addClass("stat-n").html("(<span class=\"stat-c\">0</span>/" + stats[v][3] + ")")))
  })
  //--- Create sorted stat list (Unique stats)
  $.each(u.sort(), function(i, v) {
    $("#stats table:last")
      .append($("<tr>").addClass("stat").attr("data-s", v)
        .append($("<td>").html(color(v))))
  })
  
  reset()
}

//---------------------------------------- Stats
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
  $(".node").removeClass("highlight")
  let s = $("#searchbox").val().toLowerCase()
  if (s) {
    $.each(skills, function(i, n) {
      $.each(n[3], function(k, v) {
        if (k.toLowerCase().includes(s)) {
          $(".node[data-n=" + i + "]").addClass("highlight")
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
  return "<span>" + s + "</span>"
}

//---------------------------------------- Init
function init() {
  //--- Keywords for tooltips & stats descriptions
  keywords = {
    "hl-wd": /((weapon|assault|close range|long range) damage)/gi,
    "hl-ap": /(anomaly power)/gi,
    "hl-ar": /((armor|(armor and )?resistance) (piercing|penetration))/gi,
    "hl-s": /((damage|disruption|movement) Skills?)/gi
  }
  
  //--- All Skills
  allskills = {
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
      [ 0, [ 33, 36 ], [ 33, 36 ], { "(UNKNOWN 1)": null } ], //--- ???
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
      [ 0, [ 50 ], [], { "(UNKNOWN 2)": null } ], //--- ???
      [ 0, [ 50, 58 ], [ 50, 58 ], { "(UNKNOWN 3) Resistance Penetration": null } ], //--- ???
      [ 0, [ 36, 62 ], [ 36, 54, 62 ], { "Melee applies Weakness": null } ],
      [ 0, [ 53 ], [], { "(UNKNOWN 4) 10% Shield, -30% Shield Degredation": null } ], //--- ???
      
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
      [ 0, [ 75 ], [ 78 ], { "(UNKNOWN 5) Weapon Damage (Conditional?)": null } ], //--- ???
      [ 0, [ 75 ], [ 78 ], { "Shield": 0.1, "Shield Degredation": -0.3 } ],
      [ 0, [ 76, 77 ], [], { "For each enemy in close range, your Anomaly Power is increased by 10% (Stacks up to 10 times)": null } ]
    ],
    
    pyromancer: [
      [ 1, [], [ 1, 30, 56 ], { "Anomaly Power": 0.1, "Skill Leech": 0.05, "Skills mark Enemies for 15s. Killing a Marked heals you by 24% of your Maximum Health": 0.1 } ],
      
      //--- 1 - Ash Breaker
      [ 0, [ 0, 2, 3 ], [ 2, 3 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 1, 4 ], [ 1, 4 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 1, 4 ], [ 1, 4 ], { "Skill Cooldown (Immobilize)": 0.15 } ],
      [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 4 ], [], { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.12 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "Armor Penetration": 0.1 } ],
      [ 0, [ 4, 8 ], [ 4, 8 ], { "Damage (Against Ashed)": 0.2 } ],
      [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 8 ], [], { "(UNKNOWN 1)": 0.1 } ],
      [ 0, [ 8 ], [ 12 ], { "Armor Penetration": 0.1 } ], //--- 10
      [ 0, [ 8 ], [ 12 ], { "(UNKNOWN 2) Burn Duration": 0.2 } ],
      [ 0, [ 10, 11 ], [ 13, 14, 15 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 12 ], [], { "Weapon Damage (Sniper)": 0.2, "Drop Rate (Sniper)": 0.12 } ],
      [ 0, [ 12 ], [ 16 ], { "Armor Penetration": 0.1 } ],
      [ 0, [ 12 ], [ 16 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 14, 15 ], [ 17, 19 ], { "Weapon Damage (Against Marked)": 0.1 } ],
      [ 0, [ 16 ], [ 18 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 17 ], [], { "Activating an Immobilize Skill doubles your Weapon Leech for 4s": 0.1 } ],
      [ 0, [ 16 ], [], { "(UNKNOWN 3)": 0.1 } ],
      [ 0, [ 16 ], [ 21 ], { "Reload Time": -0.2 } ], //--- 20
      [ 0, [ 20 ], [ 22, 23 ], { "Damage (Against Elites)": 0.1, "Take less damage (From Elites)": 0.1 } ],
      [ 0, [ 21 ], [ 24 ], { "Damage (Against Ashed)": 0.2 } ],
      [ 0, [ 21 ], [ 24 ], { "Skill Cooldown (Immobilize)": 0.15 } ],
      [ 0, [ 22, 23 ], [], { "Activating an Immobilize Skill increases your Weapon Damage by 20% for 10s": 0.1 } ],
      
      //--- 25
      [ 0, [ 4, 26 ], [ 4, 26 ], { "(UNKNOWN 4) Damage Increase": 0.1 } ],
      [ 0, [ 25, 33 ], [ 25, 33, 27 ], { "Armor Penetration (Against Marked)": 0.3 } ],
      [ 0, [ 26 ], [], { "(UNKNOWN 5)": 0.1 } ],
      [ 0, [ 8, 36 ], [ 8, 29, 36 ], { "(UNKNOWN 6)": 0.1 } ],
      [ 0, [ 28 ], [], { "Burn Duration": 0.2 } ],
      
      //--- 30 - Firestorm
      [ 0, [ 0, 31, 32 ], [ 31, 32 ], { "Health": 0.1 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 30, 33 ], [ 30, 33 ], { "Skill Cooldown (Ignite)": 0.15 } ],
      [ 0, [ 26, 31, 32, 34, 35, 51 ], [ 26, 31, 32, 34, 35, 51 ], { "Health": 0.1 } ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "(UNKNOWN 7) Armor Increase": 0.1} ],
      [ 0, [ 33, 36 ], [ 33, 36 ], { "Burn Damage": 0.2 } ],
      [ 0, [ 28, 34, 35, 54 ], [ 28, 34, 35, 37, 38, 54 ], { "Health": 0.1 } ],
      [ 0, [ 36 ], [ 39 ], { "Weapon Damage": 0.05, "Anomaly Power": 0.05 } ],
      [ 0, [ 36 ], [ 39 ], { "(UNKNOWN 8) Resistance Increase": 0.1 } ],
      [ 0, [ 37, 38 ], [ 40, 41, 42, 43 ], { "Health": 0.1 } ],
      [ 0, [ 39 ], [], { "Increase Anomaly Power by 2.5% for each unlocked Magma Golem node": 0.1 } ], //--- 40
      [ 0, [ 39 ], [], { "Activating any skill increases Weapon Damage by 20% for 7s": 0.1 } ],
      [ 0, [ 39 ], [ 44 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 39 ], [ 44 ], { "Burn Duration": 0.2 } ],
      [ 0, [ 42, 43 ], [ 45 ], { "Health": 0.1 } ],
      [ 0, [ 44 ], [ 46, 47 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 45 ], [], { "Activating an Ignite Skill increases your Armor by 45% for 10s": 0.1 } ],
      [ 0, [ 45 ], [ 48, 49 ], { "Skill Leech is doubled when below 30% Health": 0.1 } ],
      [ 0, [ 47 ], [ 50 ], { "Damage (Against Burning)": 0.1 } ],
      [ 0, [ 47 ], [ 50 ], { "Skill Cooldown (Ignite)": 0.15 } ],
      [ 0, [ 48, 49 ], [], { "(UNKNOWN 9)": 0.1 } ],
      
      //--- 51
      [ 0, [ 33, 53 ], [ 33, 52, 53 ], { "Skill Cooldown": 0.1 } ],
      [ 0, [ 51 ], [], { "(UNKNOWN 10) Damage boost (Conditional)": 0.1 } ], //--- ???
      [ 0, [ 51, 59 ], [ 51, 59 ], { "Weapon Damage (Sidearm)": 0.12 } ], //--- ???
      [ 0, [ 36, 63 ], [ 36, 55, 63 ], { "(UNKNOWN 11)": 0.1 } ],
      [ 0, [ 54 ], [], { "(UNKNOWN 12) Burn related": 0.1 } ], //--- ???
      
      //--- 56 - Tempest
      [ 0, [ 0, 57, 58 ], [ 57, 58 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 56, 59 ], [ 56, 59 ], { "(UNKNOWN 13)": 0.1 } ],
      [ 0, [ 56, 59 ], [ 56, 59 ], { "Skill Cooldown (Explosive)": 0.15 } ],
      [ 0, [ 53, 57, 58, 61, 62 ], [ 53, 57, 58, 60, 61, 62 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 59 ], [], { "(UNKNOWN 14)": 0.1 } ],
      [ 0, [ 59, 63 ], [ 59, 63 ], { "(UNKNOWN 15)": 0.1 } ],
      [ 0, [ 59, 63 ], [ 59, 63 ], { "(UNKNOWN 16)": 0.1 } ],
      [ 0, [ 54, 61, 62 ], [ 54, 61, 62, 64, 65, 66 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 63 ], [], { "Weapon Damage is increased by 15% of Anomaly Power": 0.1 } ],
      [ 0, [ 63 ], [ 67 ], { "(UNKNOWN 17) Burn related": 0.1 } ],
      [ 0, [ 63 ], [ 67 ], { "(UNKNOWN 18)": 0.1 } ], //--- 65
      [ 0, [ 65, 66 ], [ 68, 69, 70 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 67 ], [], { "(UNKNOWN 19)": 0.1 } ],
      [ 0, [ 67 ], [ 71 ], { "Skill Leech": 0.1 } ],
      [ 0, [ 67 ], [ 71 ], { "(UNKNOWN 20) Resistance boost": 0.1 } ],
      [ 0, [ 69, 70 ], [ 72, 74 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 71 ], [ 73 ], { "Upon losing all health you will recive a second chance to return to the battlefield with 50% Health (180s cooldown)": 0.1 } ],
      [ 0, [ 72 ], [], { "Your Phoenix revival will now grant 100% of your health points and will be ready to activate every 135s": 0.1 } ],
      [ 0, [ 71 ], [ 75, 76 ], { "(UNKNOWN 21) Resistance piercing": 0.1 } ],
      [ 0, [ 74 ], [], { "Killing a Marked target heals you by additional 12% of your maximum health": 0.1 } ],
      [ 0, [ 74 ], [ 77, 78 ], { "(UNKNOWN 22)": 0.1 } ], //--- 75
      [ 0, [ 76 ], [ 79 ], { "(UNKNOWN 23)": 0.1 } ], //--- ???
      [ 0, [ 76 ], [ 79 ], { "Skill Cooldown (Explosive)": 0.15 } ],
      [ 0, [ 77, 78 ], [], { "(UNKNOWN 24)": 0.1 } ]
    ],
    
    devastator: [
      [ 1, [], [ 1, 30, 55 ], { "Every Close Range kill heals you by 24% of your Maximum Health": null, "Health": 0.15, "Armor": 0.3 } ],
      
      //--- 1 - 
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
      
      //--- 30 - 
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
      
      //--- 55 - 
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
    ],
    
    technomancer: [
      [ 1, [], [ 1, 30, 55 ], { "Weapon Damage (Long Range)": 0.075, "Skill Leech": 0.15, "WeaponLeech": 0.15 } ],
      
      //--- 1 - 
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
      
      //--- 30 - 
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
      
      //--- 55 - 
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
  
  //--- Node Positions
  let coords = {
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
      [ 516, 83, 0 ],
      [ 655, 129, 0 ],
      [ 656, 221, 0 ],
      [ 750, 177, 0 ],
      [ 749, 82, 0 ],
      [ 843, 127, 0 ],
      [ 843, 223, 0 ],
      [ 936, 174, 0 ],
      [ 936, 83, 0 ],
      [ 1028, 129, 0 ],
      [ 1028, 221, 0 ],
      [ 1121, 175, 0 ],
      [ 1121, 84, 0 ],
      [ 1215, 83, 0 ],
      [ 1215, 175, 0 ],
      [ 1214, 266, 0 ],
      [ 1307, 221, 0 ],
      [ 1402, 177, 0 ],
      [ 1403, 268, 0 ],
      [ 1494, 224, 0 ],
      [ 517, 268, 0 ],
      [ 517, 361, 0 ],
      [ 612, 316, 0 ],
      [ 750, 312, 0 ],
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
      [ 936, 548, 0 ],
      [ 1026, 408, 0 ],
      [ 1030, 501, 0 ],
      [ 1124, 453, 0 ],
      [ 1123, 364, 0 ],
      [ 1215, 454, 0 ],
      [ 1309, 455, 0 ],
      [ 1397, 408, 0 ],
      [ 1404, 505, 0 ],
      [ 1494, 453, 0 ],
      [ 516, 547, 0 ],
      [ 608, 596, 0 ],
      [ 514, 642, 0 ],
      [ 750, 594, 0 ],
      [ 842, 595, 0 ],
      [ 283, 547, 0 ],
      [ 423, 592, 0 ],
      [ 378, 686, 0 ],
      [ 515, 734, 0 ],
      [ 515, 830, 0 ],
      [ 656, 689, 0 ],
      [ 656, 780, 0 ],
      [ 750, 733, 0 ],
      [ 748, 826, 0 ],
      [ 840, 689, 0 ],
      [ 840, 782, 0 ],
      [ 934, 736, 0 ],
      [ 937, 826, 0 ],
      [ 1028, 686, 0 ],
      [ 1029, 781, 0 ],
      [ 1120, 734, 0 ],
      [ 1123, 828, 0 ],
      [ 1216, 828, 0 ],
      [ 1216, 735, 0 ],
      [ 1212, 641, 0 ],
      [ 1309, 689, 0 ],
      [ 1402, 642, 0 ],
      [ 1401, 735, 0 ],
      [ 1493, 687, 1 ]
    ],
    
    technomancer: [
      [ 179, 451, 2 ],
      [ 278, 357, 0 ],
      [ 372, 215, 0 ],
      [ 419, 309, 0 ],
      [ 514, 167, 0 ],
      [ 516, 76, 0 ],
      [ 655, 119, 0 ],
      [ 654, 211, 0 ],
      [ 749, 166, 0 ],
      [ 751, 72, 0 ],
      [ 846, 119, 0 ],
      [ 844, 213, 0 ],
      [ 937, 165, 0 ],
      [ 939, 79, 0 ],
      [ 1036, 119, 0 ],
      [ 1033, 214, 0 ],
      [ 1121, 167, 0 ],
      [ 1127, 259, 0 ],
      [ 1221, 172, 0 ],
      [ 1225, 72, 0 ],
      [ 1316, 217, 0 ],
      [ 1409, 168, 0 ],
      [ 1411, 260, 0 ],
      [ 1501, 214, 0 ],
      [ 513, 261, 0 ],
      [ 512, 356, 0 ],
      [ 606, 309, 0 ],
      [ 749, 308, 0 ],
      [ 845, 310, 0 ],
      [ 326, 449, 0 ],
      [ 419, 401, 0 ],
      [ 420, 497, 0 ],
      [ 511, 449, 0 ],
      [ 653, 404, 0 ],
      [ 654, 500, 0 ],
      [ 753, 446, 0 ],
      [ 843, 402, 0 ],
      [ 844, 495, 0 ],
      [ 937, 449, 0 ],
      [ 941, 354, 0 ],
      [ 938, 544, 0 ],
      [ 1032, 593, 0 ],
      [ 1035, 406, 0 ],
      [ 1034, 502, 0 ],
      [ 1127, 452, 0 ],
      [ 1221, 448, 0 ],
      [ 1220, 357, 0 ],
      [ 1316, 452, 0 ],
      [ 1409, 403, 0 ],
      [ 1408, 504, 0 ],
      [ 1500, 455, 0 ],
      [ 512, 537, 0 ],
      [ 610, 587, 0 ],
      [ 513, 634, 0 ],
      [ 755, 582, 0 ],
      [ 940, 534, 0 ],
      [ 1034, 586, 0 ],
      [ 280, 539, 0 ],
      [ 416, 583, 0 ],
      [ 375, 679, 0 ],
      [ 507, 726, 0 ],
      [ 512, 828, 0 ],
      [ 660, 683, 0 ],
      [ 659, 776, 0 ],
      [ 754, 732, 0 ],
      [ 747, 815, 0 ],
      [ 847, 680, 0 ],
      [ 846, 770, 0 ],
      [ 942, 730, 0 ],
      [ 941, 823, 0 ],
      [ 1034, 684, 0 ],
      [ 1034, 783, 0 ],
      [ 1129, 729, 0 ],
      [ 1124, 824, 0 ],
      [ 1221, 823, 0 ],
      [ 1223, 727, 0 ],
      [ 1224, 637, 0 ],
      [ 1314, 682, 0 ],
      [ 1409, 630, 0 ],
      [ 1410, 731, 0 ],
      [ 1498, 681, 1 ]
    ]
  }
  
  //--- Load nodes
  let o = [ 19, 29, 69 ]
  $.each(coords, function(c, t) {
    let m = $("#" + c + "-st map")
    $.each(t, function(i, n) {
      let s = o[n[2]]
      m.append($("<div>").addClass("node n" + n[2]).attr("data-n", i).css({ left: n[0] - s + "px", top: n[1] - s + "px" })
        .append($("<area>").attr({ shape: "circle", href: "#", coords: n[0] + "," + n[1] + "," + (s + 1) })))
    })
  })
}
