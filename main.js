$(function() {
  init()
  
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
  
  //--- DEBUG
  //$("#reset").after($("<div>").attr("id", "debug").css({ position: "fixed", left: "40px", top: "140px" }))
  $("body").append($("<img>").attr("src", "favicon.ico").attr("width", "24").attr("height", "24").css({ position: "absolute", top: "2000px", right: "1%" }))
  /*
  points = 100
  $.each(skills, function(i, n) {
    if (i != 0) {
      add(i)
    }
  })
  */
})

$(window).on("load", function() {
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
        stats[k] = [ 0, v, 1 ]
      }
      else {
        stats[k][1] += v
        stats[k][2]++
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
        .append($("<td>").addClass("stat-n").html("(<span class=\"stat-c\">0</span>/" + stats[v][2] + ")")))
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
  }
  else {
    $(".stat.inactive").hide()
  }
})

$("#maxstats").on("click", function() {
  $("#stats .stat-m").toggle()
})

$("#nodecount").on("click", function() {
  $("#stats .stat-n").toggle()
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
  }
}

//---------------------------------------- Disable default right-click on image & nodes
$("img, area").bind("contextmenu", function() {
  return false
})

//---------------------------------------- Disable clicking node anchors scrolling to top of page
$("area").bind("click", function() {
  return false
})

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
      [ 0, [ 8 ], [], { "Activation of Disruption Skills increases your Weapon Damage by 20% for 8s": null } ],
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
      [ 0, [ 25, 33 ], [ 25, 33, 27 ], { "Activating Movement Skills increases your Armor Penetration by 25% for 10s": null } ],
      [ 0, [ 26 ], [], { "Gain additional 3% health for every enemy that died in close range": null } ],
      [ 0, [ 8, 36 ], [ 8, 29, 36 ], { "When your Movement Skill ends, increase Weapon Damage by 20% for 8s": null } ],
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
      [ 0, [ 62 ], [], { "Activating your Movement Skill increases your Resistance Penetration by 25% for 10s": null } ],
      [ 0, [ 62 ], [ 66 ], { "Weakness Duration": 0.3 } ],
      [ 0, [ 62 ], [ 66 ], { "Resistance": 0.15 } ], //--- 65
      [ 0, [ 64, 65 ], [ 67, 68, 69 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 66 ], [], { "Activating your Movement Skill increases your Anomaly Power by 20% for 10s": null } ],
      [ 0, [ 66 ], [ 70 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 66 ], [ 70 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 68, 69 ], [ 71, 73 ], { "Anomaly Power": 0.06 } ],
      [ 0, [ 70 ], [ 72 ], { "Killed Marked enemy increases healing by 15%": null } ],
      [ 0, [ 71 ], [], { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.12 } ],
      [ 0, [ 70 ], [ 74, 75 ], { "Weapon Leech": 0.05 } ],
      [ 0, [ 73 ], [], { "When your Damage Skill ends, increase your Armor and Resistance Penetration by 25% for 10s": null } ],
      [ 0, [ 73 ], [ 76, 77 ], { "Activating Movement Skill increases your Armor Penetration by 25% for 10s": null } ], //--- 75
      [ 0, [ 75 ], [ 78 ], { "(UNKNOWN 5) Weapon Damage (Conditional?)": null } ], //--- ???
      [ 0, [ 75 ], [ 78 ], { "Shield": 0.1, "Shield Degredation": -0.3 } ],
      [ 0, [ 76, 77 ], [], { "For each enemy in close range, your Anomaly Power is increased by 10% (Stacks up to 10 times)": null } ]
    ],
    
    pyromancer: [
      [ 1, [], [  ], { "Anomaly Power": 0.1, "Skill Leech": 0.05, "Skills mark Enemies for 15s. Killing a Marked heals you by 24% of your Maximum Health": null } ],
    ],
    
    devastator: [
      [ 1, [], [  ], { "Every Close Range kill heals you by 24% of your Maximum Health": null, "Health": 0.15, "Armor": 0.3 } ],
    ],
    
    technomancer: [
      [ 1, [], [  ], { "Weapon Damage (Long Range)": 0.075, "Skill Leech": 0.15, "WeaponLeech": 0.15 } ],
    ]
  }
}
