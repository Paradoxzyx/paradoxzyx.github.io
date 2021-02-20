$(() => {
  loadData()
  
  //---------------------------------------- Load Stats & Tooltips
  //--- Keywords for tooltips & stats descriptions
  let keywords = {
    "hl-a": /(anomaly power)/gi,
    "hl-d": /((weapon|assault|close range|long range) damage|firepower)/gi,
    "hl-e": /(weakness|mark(ed)?|burn(ing)?|bleed|toxic|vulnerab(le|ility)|freeze|frozen)/gi,
    "hl-h": /((maximum )?health( regen)?)/gi,
    "hl-l": /((weapon|skill) leech|heal(?!th)(s|ed|ing)?)/gi,
    "hl-n": /((concentration|magma golem|br\/8 impact amplifier) node)/gi,
    "hl-p": /((armor|(armor and )?resistance) penetration)/gi,
    "hl-r": /((armor|resistance)(?!( and resistance)? penetration)|damage mitigation)/gi,
    "hl-s": /((damage|disruption|movement|ignite|immobilize|explosive|protection|seismic|kinetic|decay|ordinance|gadget|any) skills?|stone push|(?<=skill cooldown \()(damage|disruption|movement|ignite|immobilize|explosive|protection|seismic|kinetic|decay|ordinance|gadget|any))/gi,
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
    $.each(s.sort(), (i, v) => {
      $("table", statstable).first()
        .append($("<tr>").addClass("stat inactive").attr("data-s", v)
          .append($("<td>").addClass("stat-k").text(v + ":"))
          .append($("<td>").addClass("stat-v").text("0%"))
          .append($("<td>").addClass("stat-m").text(+(stats[c][v][1] * 100).toFixed(1) + "%"))
          .append($("<td>").addClass("stat-n").html("(<span class=\"stat-c\">0</span>/" + stats[c][v][3] + ")")))
    })
    //--- Create sorted stat list (Unique stats)
    $.each(u.sort(), (i, v) => {
      $("table", statstable).last()
        .append($("<tr>").addClass("stat inactive").attr("data-s", v)
          .append($("<td>").html(color(v, keywords))))
    })
  })
      
  //--- Unique Node Skill Count
  $(".stat[data-s='Increase Assault Damage by 7% for each unlocked Concentration node'] td").append(" (<span class=\"unique\" data-c=\"0\" data-v=\"0.07\">0%</span>)")
  $(".stat[data-s='Increase Anomaly Power by 2.5% for each unlocked Magma Golem node'] td").append(" (<span class=\"unique\" data-c=\"0\" data-v=\"0.025\">0%</span>)")
  $(".stat[data-s='Increase Anomaly Power by 12% for each unlocked Br/8 Impact Amplifier node'] td").append(" (<span class=\"unique\" data-c=\"0\" data-v=\"0.12\">0%</span>)")
  
  //---------------------------------------- Load Abilities
  $.each(abilities, (c, types) => {
    let statstable = $("." + c + ".statstable .cooldowns")
    $.each(types, (type, list) => {
      $.each(list, (name, cd) => {
        statstable.append($("<div>").attr("data-n", name)
          .append($("<div>").text(name))
          //.append($("<img>").attr({ src: "skills/" + name.replace(/ /g, "-").toLowerCase() + ".webp", width: "64px", height: "64px" }))
          .append($("<img>").attr({ src: "skills/placeholder.webp", width: "64px", height: "64px" }))
          .append($("<div>").addClass("cooldown").text(cd)))
      })
    })
  })
  
  //---------------------------------------- Points
  points = {
    trickster: 21,
    pyromancer: 21,
    devastator: 21,
    technomancer: 21
  }
  $("#points").text(20)
  
  //---------------------------------------- Get URL params
  url = {
    trickster: [],
    pyromancer: [],
    devastator: [],
    technomancer: []
  }

  let search = new URLSearchParams(location.search)
  active = url.hasOwnProperty(search.get("c")) ? search.get("c") : "trickster"
  $("#nav .button[data-class=" + active + "]").addClass("active")
  activetree = $("." + active + ".skilltree").show()
  activestats = $("." + active + ".statstable").show()
  let s = search.get("s") || "0"
  let l = skills[active].length
  $.each(s.split(",").map(Number), (i, n) => {
    if (n < l) {
      add(n)
    }
  })
  
  //---------------------------------------- Bind Elements
  bindElements()
  
  //---------------------------------------- Get cookies
  $.each(document.cookie.split(";"), (i, s) => {
    let cookie = s.split("=")
    if (+cookie[1]) {
      $("#" + cookie[0].trim()).prop("checked", false).click()
    }
  })
  
  //---------------------------------------- DEBUG
  $("body").append($("<div>").css("position", "relative")
    .append($("<img>").attr({ id: "bread", src: "favicon.ico", width: 24, height: 24 }).css({ position: "absolute", top: "500px", right: "1%" })))

  $("#bread").on("click", function() {
    if (!$("#debug").length) {
      $("#reset").after($("<div>").attr("id", "debug").css({ position: "fixed", left: "250px", top: "200px" }))
      $(".node").mousemove(function() {
        $("#debug").text($(this).index())
      })
    }
    $("#points").text(points[active] = 100)
  })
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
  if ([ "Concentration", "Magma Golem", "Br/8 Impact Amplifier" ].includes(skills[active][id][3])) {
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
  history.replaceState(null, "", "?c=" + active + "&s=" + url[active].join(","))
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
  if ([ "Concentration", "Magma Golem", "Br/8 Impact Amplifier" ].includes(skills[active][id][3])) {
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
  if (url[active].length) {
    history.replaceState(null, "", "?c=" + active + "&s=" + url[active].join(","))
  }
  else {
    history.replaceState(null, "", "?c=" + active)
  }
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
  //---------------------------------------- Disable default right-click on image & nodes
  $("img, area").bind("contextmenu", () => false)
  
  //---------------------------------------- Disable clicking node anchors scrolling to top of page
  $("area").bind("click", () => false)
  
  //---------------------------------------- Click node
  $(".node").on("mousedown", function() {
    let id = +$(this).index()
    if (skills[active][id][0] == 1 && points[active] > 0) {
      add(id)
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
    if (url[active].length) {
      history.replaceState(null, "", "?c=" + active + "&s=" + url[active].join(","))
    }
    else {
      add(0)
    }
  })
  
  //---------------------------------------- Search
  $("#search .button").on("click", search)
  
  $("#searchtext").keyup(e => {
    if (e.keyCode == 13) {
      search()
    }
  })
  
  //---------------------------------------- DPS Calculator
  $("#dps-input input").on("input", () => {
    let clip = +$("#dps-in-clip").val() || 1
    let rpm = +$("#dps-in-rpm").val() || 1
    let dmg = +$("#dps-in-dmg").val() || 0
    let reload = +$("#dps-in-reload").val() || 0
    let crit = ($("#dps-in-crit").val() || 100) / 100 - 1
    let acc = ($("#dps-in-acc").val() || 0) / 100
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
      document.cookie = "sortstats=0;expires=Tue, 19 Jan 2038 03:14:07 UTC"
    }
  })
}

//---------------------------------------- Load Data
function loadData() {
  abilities = {
    trickster: {
      Damage: {
        "Temporal Slice": 20,
        "Twisted Rounds": 20,
        "Roundslice": 14,
      },
      Disruption: {
        "Slow Trap": 30,
        "Venator's Knife": 10,
        "Time Rift": 10
      },
      Movement: {
        "Hunt the Prey": 10,
        "Borrowed Time": 13
      }
    },
    pyromancer: {
      Explosive: {
        "Thermal Bomb": 12,
        "Overheat": 19,
        "Eruption": 37
      },
      Ignite: {
        "Heatwave": 11,
        "Volcanic Rounds": 23,
        "F.A.S.E.R Beam": 10
      },
      Immobilize: {
        "Feed the Flames": 14,
        "Ash Blast": 23
      }
    },
    devastator: {
      Kinetic: {
        "Gravity Leap": 14,
        "Boulderdash": 9,
        "Endless Mass": 32
      },
      Protection: {
        "Golem": 35
      },
      Seismic: {
        "Earthquake": 13,
        "Reflect Bullets": 20,
        "Impale": 36,
        "Tremor": 15
      }
    },
    technomancer: {
      Decay: {
        "Blighted Rounds": 54,
        "Blighted Turret": 7
      },
      Gadget: {
        "Cryo Turret": 23,
        "Fixing Wave": 26,
        "Cold Snap": 1
      },
      Ordinance: {
        "Scrapnel": 1,
        "Pain Launcher": 26,
        "Tool Of Destruction": 1
      }
    }
  }
  
  cooldowns = {
    Damage: 1,
    Disruption: 1,
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
  
  //---------------------------------------- All Skills
  skills = {
    trickster: [
      /* 0  */ [ 1, [], [ 1, 30, 55 ], "", { "Every Close Range kill Heals you for 20% of your Maximum Health and grants you 12% Shield": null, "Health": 0.05, "Damage Mitigation while Shield is active": 0.05 } ],
      
      /* 1  */ [ 0, [ 0, 2, 3 ], [ 2, 3 ], "Arms Trick", { "Weapon Damage (Close Range)": 0.15 } ],
      /* 2  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Bulletstorm", { "Reload Time": -0.2 } ],
      /* 3  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Ace of Trumps", { "Armor Penetration": 0.1 } ],
      /* 4  */ [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], "Death Probability", { "Weapon Damage": 0.08 } ],
      /* 5  */ [ 0, [ 4 ], [], "Shotgun Master", { "Weapon Damage (Shotgun)": 0.2, "Drop Rate (Shotgun)": 0.12 } ],
      /* 6  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Equlibrium", { "Skill Cooldown (Movement)": 0.15 } ],
      /* 7  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Deadly Shadow", { "Crit Damage": 0.2 } ],
      /* 8  */ [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], "Arms Trick", { "Weapon Damage (Close Range)": 0.15 } ],
      /* 9  */ [ 0, [ 8 ], [], "Distruptive Firepower", { "Activating a Disruption Skill increases Weapon Damage by 20% for 8s": null } ],
      /* 10 */ [ 0, [ 8 ], [ 12 ], "Singularity", { "Skill Cooldown (Disruption)": 0.15 } ],
      /* 11 */ [ 0, [ 8 ], [ 12 ], "Ace of Trumps", { "Armor Penetration": 0.1 } ],
      /* 12 */ [ 0, [ 10, 11 ], [ 13, 14, 15 ], "Unforseen End", { "Weapon Damage (From Behind)": 0.2 } ],
      /* 13 */ [ 0, [ 12 ], [], "Scion of Power", { "When your Damage Skill ends, increase Weapon Damage by 20% for 8s": null } ],
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
      /* 24 */ [ 0, [ 22, 23 ], [], "Cold Calculation", { "For each Enemy in Close Range, your Weapon Damage is increased by 8% (Stacks up to 10 times)": null } ],
      
      /* 25 */ [ 0, [ 4, 26 ], [ 4, 26 ], "Arms Trick", { "Weapon Damage (Close Range)": 0.15 } ],
      /* 26 */ [ 0, [ 25, 33 ], [ 25, 33, 27 ], "Leap of Quietus", { "Activating a Movement Skill increases Armor Penetration by 25% for 10s": null } ],
      /* 27 */ [ 0, [ 26 ], [], "Cycle of Life and Death", { "Gain additional 3% Health for every enemy that died in Close Range": null } ],
      /* 28 */ [ 0, [ 8, 36 ], [ 8, 29, 36 ], "Outrider Executioner", { "When your Movement Skill ends, increase Weapon Damage by 20% for 8s": null } ],
      /* 29 */ [ 0, [ 28 ], [], "Ace of Trumps", { "Armor Penetration": 0.1 } ],
      
      /* 30 */ [ 0, [ 0, 31, 32 ], [ 31, 32 ], "Anomaly Presistence", { "Health": 0.1 } ],
      /* 31 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Immunity", { "Resistance": 0.15 } ],
      /* 32 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Dualshield", { "Damage Mitigation while Shield is active": 0.05 } ],
      /* 33 */ [ 0, [ 26, 31, 32, 34, 35, 50 ], [ 26, 31, 32, 34, 35, 50 ], "Anomaly Presistence", { "Health": 0.1 } ],
      /* 34 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Shield's Timeline or Increment", { "Shield Gain": 0.1, "Shield Degredation": -0.3 } ],
      /* 35 */ [ 0, [ 33, 36 ], [ 33, 36 ], "???", { "(UNKNOWN 1)": null } ],
      /* 36 */ [ 0, [ 28, 34, 35, 53 ], [ 28, 34, 35, 37, 38, 53 ], "Anomaly Presistence", { "Health": 0.1 } ],
      /* 37 */ [ 0, [ 36 ], [ 39 ], "Immunity", { "Resistance": 0.15 } ],
      /* 38 */ [ 0, [ 36 ], [ 39 ], "Shield's Timeline", { "Shield Degredation": -0.3 } ],
      /* 39 */ [ 0, [ 37, 38 ], [ 40, 41, 42 ], "Singularity", { "Skill Cooldown (Disruption)": 0.15 } ],
      /* 40 */ [ 0, [ 39 ], [], "Mitigation in Motion", { "When your Damage Skill ends, increase Damage Mitigation by 5% for 10s": null } ],
      /* 41 */ [ 0, [ 39 ], [ 43 ], "Anomaly Cloak", { "Armor": 0.2 } ],
      /* 42 */ [ 0, [ 39 ], [ 43 ], "Shield's Increment", { "Shield Gain": 0.1 } ],
      /* 43 */ [ 0, [ 41, 42 ], [ 44, 45 ], "Shield's Timeline", { "Shield Degredation": -0.3 } ],
      /* 44 */ [ 0, [ 43 ], [], "Long Odds", { "For each Enemy in Close Range, your Armor is increased by 15% (Stacks up to 10 times)": null } ],
      /* 45 */ [ 0, [ 43 ], [ 46 ], "Anomaly Presistence", { "Health": 0.1 } ],
      /* 46 */ [ 0, [ 45 ], [ 47, 48 ], "Profit Squared", { "Every ammo pickup Heals you for 5% of your Maximum Health": null } ],
      /* 47 */ [ 0, [ 46 ], [ 49 ], "Shield's Timeline or Increment", { "Shield Gain": 0.1, "Shield Degredation": -0.3 } ],
      /* 48 */ [ 0, [ 46 ], [ 49 ], "Anomaly Cloak", { "Armor": 0.2 } ],
      /* 49 */ [ 0, [ 47, 48 ], [], "Distruption Shield", { "Activating a Disruption Skill grants you 20% Shield": null } ],
      
      /* 50 */ [ 0, [ 33, 52 ], [ 33, 51, 52 ], "Against the Odds", { "When surrounded by Enemies, reloading your weapon deals damage and interrupts enemies' abilities. Damage scales with Anomaly Power": null } ],
      /* 51 */ [ 0, [ 50 ], [], "???", { "(UNKNOWN 2)": null } ],
      /* 52 */ [ 0, [ 50, 58 ], [ 50, 58 ], "???", { "(UNKNOWN 3) Resistance Penetration": null } ],
      /* 53 */ [ 0, [ 36, 62 ], [ 36, 54, 62 ], "Wither Scything", { "Melee applies Weakness": null } ],
      /* 54 */ [ 0, [ 53 ], [], "???", { "(UNKNOWN 4) 10% Shield, -30% Shield Degredation": null } ],
      
      /* 55 */ [ 0, [ 0, 56, 57 ], [ 56, 57 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 56 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Transfusion", { "Weapon Leech": 0.05 } ],
      /* 57 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Disturbance Coating", { "Resistance Penetration": 0.15 } ],
      /* 58 */ [ 0, [ 52, 56, 57, 60, 61 ], [ 52, 56, 57, 59, 60, 61 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 59 */ [ 0, [ 58 ], [], "Assault Master", { "Increase Assault Damage by 7% for each unlocked Concentration node": null, "Drop Rate (Assault)": 0.12 } ],
      /* 60 */ [ 0, [ 58, 62 ], [ 58, 62 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 61 */ [ 0, [ 58, 62 ], [ 58, 62 ], "???", { "Skill Cooldown (Damage)": 0.15 } ],
      /* 62 */ [ 0, [ 53, 60, 61 ], [ 53, 60, 61, 63, 64, 65 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 63 */ [ 0, [ 62 ], [], "Leap of Clincher", { "Activating a Movement Skill increases Resistance Penetration by 25% for 10s": null } ],
      /* 64 */ [ 0, [ 62 ], [ 66 ], "Athropy", { "Weakness Duration": 0.3 } ],
      /* 65 */ [ 0, [ 62 ], [ 66 ], "Immunity", { "Resistance": 0.15 } ],
      /* 66 */ [ 0, [ 64, 65 ], [ 67, 68, 69 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 67 */ [ 0, [ 66 ], [], "Combat Shield Timeline", { "Activating a Movement Skill increases Anomaly Power by 20% for 10s": null } ],
      /* 68 */ [ 0, [ 66 ], [ 70 ], "Transfusion", { "Weapon Leech": 0.05 } ],
      /* 69 */ [ 0, [ 66 ], [ 70 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 70 */ [ 0, [ 68, 69 ], [ 71, 73 ], "Concentration", { "Anomaly Power": 0.06 } ],
      /* 71 */ [ 0, [ 70 ], [ 72 ], "Conitinuum", { "Killing a Marked Enemy increases Healing by 15%": null } ],
      /* 72 */ [ 0, [ 71 ], [], "Assault Master", { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.12 } ],
      /* 73 */ [ 0, [ 70 ], [ 74, 75 ], "Transfusion", { "Weapon Leech": 0.05 } ],
      /* 74 */ [ 0, [ 73 ], [], "Scion of the Void", { "When your Damage Skill ends, increase Armor and Resistance Penetration by 25% for 10s": null } ],
      /* 75 */ [ 0, [ 73 ], [ 76, 77 ], "Countershield", { "Activating a Movement Skill increases Armor Penetration by 25% for 10s": null } ],
      /* 76 */ [ 0, [ 75 ], [ 78 ], "???", { "(UNKNOWN 5) Weapon Damage (Conditional?)": null } ],
      /* 77 */ [ 0, [ 75 ], [ 78 ], "Shield's Timeline or Increment", { "Shield Gain": 0.1, "Shield Degredation": -0.3 } ],
      /* 78 */ [ 0, [ 76, 77 ], [], "Altered Executioner", { "For each Enemy in Close Range, your Anomaly Power is increased by 10% (Stacks up to 10 times)": null } ]
    ],
    
    pyromancer: [
       /* 0  */ [ 1, [], [ 1, 30, 56 ], "", { "Anomaly Power": 0.1, "Skill Leech": 0.05, "Skills mark Enemies for 15s. Killing a Marked Enemy Heals you for 24% of your Maximum Health": null } ],
      
       /* 1  */ [ 0, [ 0, 2, 3 ], [ 2, 3 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 2  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 3  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Marble Orchard", { "Skill Cooldown (Immobilize)": 0.15 } ],
       /* 4  */ [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 5  */ [ 0, [ 4 ], [], "Assault Master", { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.12 } ],
       /* 6  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Blood Boil", { "Armor Penetration": 0.1 } ],
       /* 7  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Trail of the Ashes", { "Damage (Against Ashed)": 0.2 } ],
       /* 8  */ [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 9  */ [ 0, [ 8 ], [], "???", { "(UNKNOWN 1)": null } ],
       /* 10 */ [ 0, [ 8 ], [ 12 ], "Blood Boil", { "Armor Penetration": 0.1 } ],
       /* 11 */ [ 0, [ 8 ], [ 12 ], "???", { "(UNKNOWN 2) Burn Duration": 0.2 } ],
       /* 12 */ [ 0, [ 10, 11 ], [ 13, 14, 15 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 13 */ [ 0, [ 12 ], [], "Sniper Master", { "Weapon Damage (Sniper)": 0.2, "Drop Rate (Sniper)": 0.12 } ],
       /* 14 */ [ 0, [ 12 ], [ 16 ], "Blood Boil", { "Armor Penetration": 0.1 } ],
       /* 15 */ [ 0, [ 12 ], [ 16 ], "Moths to the Flame", { "Weapon Leech": 0.05 } ],
       /* 16 */ [ 0, [ 14, 15 ], [ 17, 19, 20 ], "Mark of the Anomaly", { "Weapon Damage (Against Marked)": 0.1 } ],
       /* 17 */ [ 0, [ 16 ], [ 18 ], "Moths to the Flame", { "Weapon Leech": 0.05 } ],
       /* 18 */ [ 0, [ 17 ], [], "Leeching force", { "Activating an Immobilize Skill doubles Weapon Leech for 4s": null } ],
       /* 19 */ [ 0, [ 16 ], [], "???", { "(UNKNOWN 3)": null } ],
       /* 20 */ [ 0, [ 16 ], [ 21 ], "Nimble as Flame", { "Reload Time": -0.2 } ],
       /* 21 */ [ 0, [ 20 ], [ 22, 23 ], "Hurt Twice as Long", { "Damage (Against Elites)": 0.1, "Damage Taken (From Elites)": -0.1 } ],
       /* 22 */ [ 0, [ 21 ], [ 24 ], "Trail of the Ashes", { "Damage (Against Ashed)": 0.2 } ],
       /* 23 */ [ 0, [ 21 ], [ 24 ], "Marble Orchard", { "Skill Cooldown (Immobilize)": 0.15 } ],
       /* 24 */ [ 0, [ 22, 23 ], [], "Burning Situation", { "Activating an Immobilize Skill increases Weapon Damage by 20% for 10s": null } ],
      
       /* 25 */ [ 0, [ 4, 26 ], [ 4, 26 ], "???", { "(UNKNOWN 4) Damage Increase": null } ],
       /* 26 */ [ 0, [ 25, 33 ], [ 25, 33, 27 ], "Armor Melting", { "Armor Penetration (Against Marked)": 0.3 } ],
       /* 27 */ [ 0, [ 26 ], [], "???", { "(UNKNOWN 5)": null } ],
       /* 28 */ [ 0, [ 8, 36 ], [ 8, 29, 36 ], "???", { "(UNKNOWN 6)": null } ],
       /* 29 */ [ 0, [ 28 ], [], "Let Them Burn", { "Burn Duration": 0.2 } ],
      
       /* 30 */ [ 0, [ 0, 31, 32 ], [ 31, 32 ], "Magma Golem", { "Health": 0.1 } ],
       /* 31 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Unquenchable", { "Skill Leech": 0.1 } ],
       /* 32 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Warm Up", { "Skill Cooldown (Ignite)": 0.15 } ],
       /* 33 */ [ 0, [ 26, 31, 32, 34, 35, 51 ], [ 26, 31, 32, 34, 35, 51 ], "Magma Golem", { "Health": 0.1 } ],
       /* 34 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Master of the Armor", { "(UNKNOWN 7) Armor Increase": null} ],
       /* 35 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Meltdown", { "Burn Damage": 0.2 } ],
       /* 36 */ [ 0, [ 28, 34, 35, 54 ], [ 28, 34, 35, 37, 38, 54 ], "Magma Golem", { "Health": 0.1 } ],
       /* 37 */ [ 0, [ 36 ], [ 39 ], "Gifted", { "Weapon Damage": 0.05, "Anomaly Power": 0.05 } ],
       /* 38 */ [ 0, [ 36 ], [ 39 ], "Master of the Resistance", { "(UNKNOWN 8) Resistance Increase": null } ],
       /* 39 */ [ 0, [ 37, 38 ], [ 40, 41, 42, 43 ], "Magma Golem", { "Health": 0.1 } ],
       /* 40 */ [ 0, [ 39 ], [], "Distant Flame", { "Increase Anomaly Power by 2.5% for each unlocked Magma Golem node": null } ],
       /* 41 */ [ 0, [ 39 ], [], "All Guns Blazing", { "Activating Any Skill increases Weapon Damage by 20% for 7s": null } ],
       /* 42 */ [ 0, [ 39 ], [ 44 ], "Unquenchable", { "Skill Leech": 0.1 } ],
       /* 43 */ [ 0, [ 39 ], [ 44 ], "Let Them Burn", { "Burn Duration": 0.2 } ],
       /* 44 */ [ 0, [ 42, 43 ], [ 45 ], "Magma Golem", { "Health": 0.1 } ],
       /* 45 */ [ 0, [ 44 ], [ 46, 47 ], "Unquenchable", { "Skill Leech": 0.1 } ],
       /* 46 */ [ 0, [ 45 ], [], "Anomalus Lava", { "Activating an Ignite Skill increases Armor by 45% for 10s": null } ],
       /* 47 */ [ 0, [ 45 ], [ 48, 49 ], "Fuel for the Embers", { "Skill Leech is doubled when below 30% Health": null } ],
       /* 48 */ [ 0, [ 47 ], [ 50 ], "Trail by Fire", { "Damage (Against Burning)": 0.1 } ],
       /* 49 */ [ 0, [ 47 ], [ 50 ], "Warm Up", { "Skill Cooldown (Ignite)": 0.15 } ],
       /* 50 */ [ 0, [ 48, 49 ], [], "???", { "(UNKNOWN 9)": null } ],
      
       /* 51 */ [ 0, [ 33, 53 ], [ 33, 52, 53 ], "Wildfire", { "Skill Cooldown (Explosive)": 0.1, "Skill Cooldown (Ignite)": 0.1, "Skill Cooldown (Immobilize)": 0.1 } ],
       /* 52 */ [ 0, [ 51 ], [], "???", { "(UNKNOWN 10) Damage boost (Conditional)": null } ],
       /* 53 */ [ 0, [ 51, 59 ], [ 51, 59 ], "Sidearm Adept", { "Weapon Damage (Sidearm)": 0.12 } ],
       /* 54 */ [ 0, [ 36, 63 ], [ 36, 55, 63 ], "???", { "(UNKNOWN 11)": null } ],
       /* 55 */ [ 0, [ 54 ], [], "???", { "(UNKNOWN 12) Burn related": null } ],
      
       /* 56 */ [ 0, [ 0, 57, 58 ], [ 57, 58 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 57 */ [ 0, [ 56, 59 ], [ 56, 59 ], "???", { "(UNKNOWN 13)": null } ],
       /* 58 */ [ 0, [ 56, 59 ], [ 56, 59 ], "World Ablaze", { "Skill Cooldown (Explosive)": 0.15 } ],
       /* 59 */ [ 0, [ 53, 57, 58, 61, 62 ], [ 53, 57, 58, 60, 61, 62 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 60 */ [ 0, [ 59 ], [], "???", { "(UNKNOWN 14)": null } ],
       /* 61 */ [ 0, [ 59, 63 ], [ 59, 63 ], "???", { "(UNKNOWN 15)": null } ],
       /* 62 */ [ 0, [ 59, 63 ], [ 59, 63 ], "???", { "(UNKNOWN 16)": null } ],
       /* 63 */ [ 0, [ 54, 61, 62 ], [ 54, 61, 62, 64, 65, 66 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 64 */ [ 0, [ 63 ], [], "Inferno Bullets", { "Weapon Damage is increased by 15% of Anomaly Power": null } ],
       /* 65 */ [ 0, [ 63 ], [ 67 ], "???", { "(UNKNOWN 17) Burn related": null } ],
       /* 66 */ [ 0, [ 63 ], [ 67 ], "???", { "(UNKNOWN 18)": null } ],
       /* 67 */ [ 0, [ 65, 66 ], [ 68, 69, 70 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 68 */ [ 0, [ 67 ], [], "???", { "(UNKNOWN 19)": null } ],
       /* 69 */ [ 0, [ 67 ], [ 71 ], "Unquenchable", { "Skill Leech": 0.1 } ],
       /* 70 */ [ 0, [ 67 ], [ 71 ], "???", { "(UNKNOWN 20) Resistance boost": null } ],
       /* 71 */ [ 0, [ 69, 70 ], [ 72, 74 ], "Archmage", { "Anomaly Power": 0.06 } ],
       /* 72 */ [ 0, [ 71 ], [ 73 ], "Phoenix Resting", { "Upon losing all Health you will receive a second chance to return to the battlefield with 50% Maximum Health (180s cooldown)": null } ],
       /* 73 */ [ 0, [ 72 ], [], "Phoenix", { "Phoenix Revival will now grant 100% of your Health and will be ready to activate every 135s": null } ],
       /* 74 */ [ 0, [ 71 ], [ 75, 76 ], "???", { "(UNKNOWN 21) Resistance Penetration": null } ],
       /* 75 */ [ 0, [ 74 ], [], "Chasin the Chill Away", { "Killing a Marked Enemy Heals you for an additional 12% of your Maximum Health": null } ],
       /* 76 */ [ 0, [ 74 ], [ 77, 78 ], "???", { "(UNKNOWN 22)": null } ],
       /* 77 */ [ 0, [ 76 ], [ 79 ], "???", { "(UNKNOWN 23)": null } ],
       /* 78 */ [ 0, [ 76 ], [ 79 ], "???", { "Skill Cooldown (Explosive)": 0.15 } ],
       /* 79 */ [ 0, [ 77, 78 ], [], "???", { "(UNKNOWN 24)": null } ]
    ],
    
    devastator: [
       /* 0  */ [ 1, [], [ 1, 30, 55 ], "", { "Every Close Range kill Heals you for 24% of your Maximum Health": null, "Health": 0.15, "Armor": 0.3 } ],
      
       /* 1  */ [ 0, [ 0, 2, 3 ], [ 2, 3 ], "Havoc", { "Weapon Damage": 0.08 } ],
       /* 2  */ [ 0, [ 2, 4 ], [ 2, 4 ], "Shotgun Adept", { "Weapon Damage (Shotgun)": 0.12 } ],
       /* 3  */ [ 0, [ 2, 4 ], [ 2, 4 ], "Armor Breaker", { "Armor Penetration": 0.1 } ],
       /* 4  */ [ 0, [ 2, 3, 6, 7, 25 ], [ 2, 3, 5, 6, 7, 25 ], "Havoc", { "Weapon Damage": 0.08 } ],
       /* 5  */ [ 0, [ 4 ], [], "Shotgun Master", { "Weapon Damage (Shotgun)": 0.2, "Drop Rate (Shotgun)": 0.12 } ],
       /* 6  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Assault Adept", { "Weapon Damage (Assault)": 0.12 } ],
       /* 7  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Armor Breaker", { "Armor Penetration": 0.1 } ],
       /* 8  */ [ 0, [ 6, 7, 28 ], [ 6, 7, 9, 10, 11, 28 ], "Havoc", { "Weapon Damage": 0.08 } ],
       /* 9  */ [ 0, [ 8 ], [], "Kinetic Charge", { "When your Kinetic Skill ends, increase Weapon Damage by 20% for 10s": null } ],
       /* 10 */ [ 0, [ 8 ], [ 12 ], "Bull's Eye", { "Crit Damage": 0.2 } ],
       /* 11 */ [ 0, [ 8 ], [ 12 ], "???", { "(UNKNOWN 1)": null } ],
       /* 12 */ [ 0, [ 10, 11 ], [ 13, 14, 15 ], "Havoc", { "Weapon Damage": 0.08 } ],
       /* 13 */ [ 0, [ 12 ], [], "Assault Master", { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.12 } ],
       /* 14 */ [ 0, [ 12 ], [ 16 ], "Perpetual Motion", { "Skill Cooldown (Kinetic)": 0.15 } ],
       /* 15 */ [ 0, [ 12 ], [ 16 ], "Brawler", { "Weapon Damage (Close Range)": 0.15 } ],
       /* 16 */ [ 0, [ 14, 15 ], [ 17, 19 ], "Havoc", { "Weapon Damage": 0.08 } ],
       /* 17 */ [ 0, [ 16 ], [ 18 ], "Dry Them Out", { "Weapon Leech": 0.05 } ],
       /* 18 */ [ 0, [ 17 ], [], "???", { "(UNKNOWN 2)": null } ],
       /* 19 */ [ 0, [ 16 ], [ 20, 21 ], "???", { "(UNKNOWN 3)": null } ],
       /* 20 */ [ 0, [ 19 ], [], "???", { "(UNKNOWN 4)": null } ],
       /* 21 */ [ 0, [ 19 ], [ 22, 23 ], "Bount Hunter", { "Damage (Physical against Elites)": 0.15, "Damage Taken (From Elites)": -0.15 } ],
       /* 22 */ [ 0, [ 21 ], [ 24 ], "Dry Them Out", { "Weapon Leech": 0.05 } ],
       /* 23 */ [ 0, [ 21 ], [ 24 ], "Armor Breaker", { "Armor Penetration": 0.1 } ],
       /* 24 */ [ 0, [ 22, 23 ], [], "Altered Charge", { "When your Kinetic Skill ends, increase Weapon Damage by 70% for 10s": null } ],
      
       /* 25 */ [ 0, [ 4, 26 ], [ 4, 26 ], "???", { "(UNKNOWN 5) Skill Cooldown": null } ],
       /* 26 */ [ 0, [ 25, 33 ], [ 25, 33, 27 ], "Into the Fray", { "When your Kinetic Skill ends, increase Damage Mitigation by 20% for 10s": null } ],
       /* 27 */ [ 0, [ 26 ], [], "???", { "(UNKNWON 6) Weapon Damage": null } ],
       /* 28 */ [ 0, [ 8, 36 ], [ 8, 29, 36 ], "Hierloom Armor", { "When an Enemy dies in Close Range, gain 20% of their Armor for 10s": null } ],
       /* 29 */ [ 0, [ 28 ], [], "???", { "(UNKNOWN 7)": null } ],
      
       /* 30 */ [ 0, [ 0, 31, 32 ], [ 31, 32 ], "Colossus", { "Health": 0.1 } ],
       /* 31 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Tank", { "Armor": 0.2 } ],
       /* 32 */ [ 0, [ 30, 33 ], [ 30, 33 ], "Anomaly in Veins", { "Health Regen every second": 0.01 } ],
       /* 33 */ [ 0, [ 26, 31, 32, 34, 35, 50 ], [ 26, 31, 32, 34, 35, 50 ], "Colossus", { "Health": 0.1 } ],
       /* 34 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Resist the Mob", { "Resistance for each Enemy in Close Range": 0.15 } ],
       /* 35 */ [ 0, [ 33, 36 ], [ 33, 36 ], "Anomaly in Veins", { "Health Regen every second": 0.01 } ],
       /* 36 */ [ 0, [ 28, 34, 35, 53 ], [ 28, 34, 35, 37, 38, 53 ], "Colossus", { "Health": 0.1 } ],
       /* 37 */ [ 0, [ 36 ], [ 39 ], "Anomaly in Veins", { "Health Regen every second": 0.01 } ],
       /* 38 */ [ 0, [ 36 ], [ 39 ], "Tank", { "Armor": 0.2 } ],
       /* 39 */ [ 0, [ 37, 38 ], [ 40, 41, 42 ], "Colossus", { "Health": 0.1 } ],
       /* 40 */ [ 0, [ 39 ], [], "Outrider Commander", { "Increase all Healing and Shields by 20% for you and your allies": null } ],
       /* 41 */ [ 0, [ 39 ], [ 43 ], "Colossus", { "Health": 0.1 } ],
       /* 42 */ [ 0, [ 39 ], [ 43 ], "Unending Watch", { "Skill Cooldown (Protection)": 0.15 } ],
       /* 43 */ [ 0, [ 41, 42 ], [ 44, 45 ], "Resist the Mob", { "Resistance for each Enemy in Close Range": 0.15 } ],
       /* 44 */ [ 0, [ 43 ], [], "Unbroken Vow", { "You have 100% chance to ignore damage that would kill you and instantly Heal you for 50% of your Maximum Health (180s cooldown)": null } ],
       /* 45 */ [ 0, [ 43 ], [ 46 ], "Tank", { "Armor": 0.2 } ],
       /* 46 */ [ 0, [ 45 ], [ 47, 48 ], "Overlord of the Battleground", { "Increase all Healing done by you and your allies by 20%": null } ],
       /* 47 */ [ 0, [ 46 ], [ 49 ], "Resist the Mob", { "Resistance for each Enemy in Close Range": 0.15 } ],
       /* 48 */ [ 0, [ 46 ], [ 49 ], "Tank", { "Armor": 0.2  } ],
       /* 49 */ [ 0, [ 47, 48 ], [], "Mighty Tank", { "Increase Firepower by 10% of your Armor": null, "Increase Anomaly Power by 10% of your Armor": null } ],
      
       /* 50 */ [ 0, [ 33, 52 ], [ 33, 51, 52 ], "Strong Arm Anomaly", { "After using Stone Push, increase Resistance Penetration by 15% for each hit enemy for 10s": null } ],
       /* 51 */ [ 0, [ 50 ], [], "???", { "(UNKNWON 8) Health": null } ],
       /* 52 */ [ 0, [ 50, 58 ], [ 50, 58 ], "Perpetual Motion", { "Skill Cooldown (Kinetic)": 0.15 } ],
       /* 53 */ [ 0, [ 36, 62 ], [ 36, 54, 62 ], "???", { "(UNKNWON 9) Health": null } ],
       /* 54 */ [ 0, [ 53 ], [], "???", { "(UNKNWON 10) Armor": null } ],
      
       /* 55 */ [ 0, [ 0, 56, 57 ], [ 56, 57 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 56 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Endless Tremors", { "Skill Cooldown (Seismic)": 0.15 } ],
       /* 57 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Rejuvenation", { "Skill Leech": 0.1 } ],
       /* 58 */ [ 0, [ 52, 56, 57, 60, 61 ], [ 52, 56, 57, 59, 60, 61 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 59 */ [ 0, [ 58 ], [], "Paladin", { "Activating a Protection Skill increases Anomaly Power by 60% for 5s": null } ],
       /* 60 */ [ 0, [ 58, 62 ], [ 58, 62 ], "Disturbance Coating", { "Resistance Penetration": 0.15 } ],
       /* 61 */ [ 0, [ 58, 62 ], [ 58, 62 ], "Endless Tremors", { "Skill Cooldown (Seismic)": 0.15 } ],
       /* 62 */ [ 0, [ 53, 60, 61 ], [ 53, 60, 61, 63, 64, 65 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 63 */ [ 0, [ 62 ], [], "Anomaly Bullets", { "Increase Firepower by 15% of your Anomaly Power": null } ],
       /* 64 */ [ 0, [ 62 ], [ 66 ], "???", { "(UNKNOWN 11) Bleed": null } ],
       /* 65 */ [ 0, [ 62 ], [ 66 ], "Endless Tremors", { "Skill Cooldown (Seismic)": 0.15 } ],
       /* 66 */ [ 0, [ 64, 65 ], [ 67, 68, 69 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 67 */ [ 0, [ 66 ], [], "???", { "(UNKNOWN 12)": null } ],
       /* 68 */ [ 0, [ 66 ], [ 70 ], "Executioner", { "Increase Damage by 20% against enemies with lesss than 30% Health": null } ],
       /* 69 */ [ 0, [ 66 ], [ 70 ], "???", { "(UNKNOWN 13) Bleed": null } ],
       /* 70 */ [ 0, [ 68, 69 ], [ 71, 73 ], "Anomaly Resevoir", { "Anomaly Power": 0.06 } ],
       /* 71 */ [ 0, [ 70 ], [ 72 ], "???", { "(UNKNOWN 14) Bleed": null } ],
       /* 72 */ [ 0, [ 71 ], [], "Blood Donation", { "You are Healed for 50% of the Damage caused by Bleed": null } ],
       /* 73 */ [ 0, [ 70 ], [ 74, 75 ], "Rejuvenation", { "Skill Leech": 0.1 } ],
       /* 74 */ [ 0, [ 73 ], [], "Skilled Sentry", { "When Any Skill ends, increase Armor and Resistance by 20% for 10s": null } ],
       /* 75 */ [ 0, [ 73 ], [ 76, 77 ], "Protected by Anomaly", { "Increase Armor by 40% of your Anomaly Power": null } ],
       /* 76 */ [ 0, [ 75 ], [ 78 ], "Pure Anomaly", { "Resistance Penetration": 0.15 } ],
       /* 77 */ [ 0, [ 75 ], [ 78 ], "???", { "(UNKNOWN 15) Bleed": null } ],
       /* 78 */ [ 0, [ 76, 77 ], [], "Earth's Heritage", { "Doubles Seismic Skills Damage": null } ]
    ],
    
    technomancer: [
       /* 0  */ [ 1, [], [ 1, 29, 55 ], "", { "Weapon Damage (Long Range)": 0.075, "Skill Leech": 0.15, "Weapon Leech": 0.15 } ],
      
       /* 1  */ [ 0, [ 0, 2, 3 ], [ 2, 3 ], "Br/8 Impact Amplifier", { "Weapon Damage": 0.08 } ],
       /* 2  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Suction Module", { "Weapon Leech": 0.05 } ],
       /* 3  */ [ 0, [ 1, 4 ], [ 1, 4 ], "Sower of Decay", { "Skill Cooldown (Decay)": 0.15 } ],
       /* 4  */ [ 0, [ 2, 3, 6, 7, 24 ], [ 2, 3, 5, 6, 7, 24 ], "Drill Coating", { "Armor Penetration": 0.1 } ],
       /* 5  */ [ 0, [ 4 ], [], "Sniper Master", { "Weapon Damage (Sniper)": 0.2, "Drop Rate (Sniper)": 0.12 } ],
       /* 6  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Nitrogen Capsules", { "Decrease the distance considered to be Long Range by 6.5m [1]": null } ],
       /* 7  */ [ 0, [ 4, 8 ], [ 4, 8 ], "Toxicologist", { "Toxic Duration": 0.3 } ],
       /* 8  */ [ 0, [ 6, 7, 27 ], [ 6, 7, 9, 10, 11, 27 ], "Br/8 Impact Amplifier", { "Weapon Damage": 0.08 } ],
       /* 9  */ [ 0, [ 8 ], [], "Cannonade", { "Activating an Ordinance Skill increases Weapon Damage for you and your allies by 30% for 10s": null } ],
       /* 10 */ [ 0, [ 8 ], [ 12 ], "Nitrogen Capsules", { "Decrease the distance considered to be Long Range by 6.5m [2]": null } ],
       /* 11 */ [ 0, [ 8 ], [ 12 ], "Purge", { "Damage (Against Toxic'ed)": 0.1 } ],
       /* 12 */ [ 0, [ 10, 11 ], [ 13, 14, 15 ], "Br/8 Impact Amplifier", { "Weapon Damage": 0.08 } ],
       /* 13 */ [ 0, [ 12 ], [], "Assault Master", { "Weapon Damage (Assault)": 0.2, "Drop Rate (Assault)": 0.12 } ],
       /* 14 */ [ 0, [ 12 ], [ 16 ], "Assault Adept", { "Weapon Damage (Assault)": 0.12 } ],
       /* 15 */ [ 0, [ 12 ], [ 16 ], "Sniper Adept", { "Weapon Damage (Sniper)": 0.12 } ],
       /* 16 */ [ 0, [ 14, 15 ], [ 17, 18 ], "Drill Coating", { "Armor Penetration": 0.1 } ],
       /* 17 */ [ 0, [ 16 ], [], "Two Sides of the Power", { "Damage Taken": 0.15, "Damage": 0.2 } ],
       /* 18 */ [ 0, [ 16 ], [ 19, 20 ], "Sharpshooter", { "Damage (Long Range)": 0.3 } ],
       /* 19 */ [ 0, [ 18 ], [], "Grand Amplification", { "Increase Anomaly Power by 12% for each unlocked Br/8 Impact Amplifier node": null } ],
       /* 20 */ [ 0, [ 18 ], [ 21, 22 ], "UT-14 Clips", { "Magazine Size": 0.5 } ],
       /* 21 */ [ 0, [ 20 ], [ 23 ], "Charged Gunshot", { "First shot after reloading deals 200% damage (5s cooldown)": null } ],
       /* 22 */ [ 0, [ 20 ], [ 23 ], "Purge", { "Damage (Against Toxic'ed)": 0.3 } ],
       /* 23 */ [ 0, [ 21, 22 ], [], "Empowering Antena", { "Activating a Decay Skill increases Weapon Damage for you and your allies by 40% for 10s": null } ],
      
       /* 24 */ [ 0, [ 4, 25 ], [ 4, 25 ], "BL-STM Havoc Nexus", { "Crit Damage": 0.15 } ],
       /* 25 */ [ 0, [ 24, 32 ], [ 24, 32, 26 ], "Exposing Toxin", { "Every time Toxic is applied on an enemy, Vulnerable is applied aswell": null } ],
       /* 26 */ [ 0, [ 25 ], [], "Marked for Execution", { "Vulnerability Effectiveness": 0.4 } ],
       /* 27 */ [ 0, [ 8, 35 ], [ 8, 28, 35 ], "Blurscreen", { "Health Regen in increased by up to 20% of Maximum Health when you recive no damage": null } ],
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
       /* 40 */ [ 0, [ 38 ], [ 41 ], "Exposing Frost", { "Every time Freeze is applied on an enemy, Vulnerable is applied aswell": null } ],
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
       /* 54 */ [ 0, [ 35, 62 ], [ 35, 62 ], "Wipe Out", { "Damage (Against Enemies below 30% Health)": 0.2 } ],
      
       /* 55 */ [ 0, [ 0, 56, 57 ], [ 56, 57 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 56 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Ordanance Technician", { "Skill Cooldown (Ordinance)": 0.15 } ],
       /* 57 */ [ 0, [ 55, 58 ], [ 55, 58 ], "Disturbance Coating", { "Resistance Penetration": 0.15 } ],
       /* 58 */ [ 0, [ 53, 56, 57, 60, 61 ], [ 53, 56, 57, 59, 60, 61 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 59 */ [ 0, [ 58 ], [], "Brain Freeze", { "Melee applies Toxic": null } ],
       /* 60 */ [ 0, [ 58, 62 ], [ 58, 62 ], "A.N.E.T.A. Plates", { "Resistance": 0.2 } ],
       /* 61 */ [ 0, [ 58, 62 ], [ 58, 62 ], "Welcome Shot", { "First shot after reloading deals bonus damage equal to 15% of Anomaly Power": null } ],
       /* 62 */ [ 0, [ 54, 60, 61 ], [ 54, 60, 61, 63, 64, 65 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 63 */ [ 0, [ 62 ], [], "Adrenalizing Antena", { "Activating a Decay Skill increases Weapon Damage for you and your allies by 30% for 10s": null } ],
       /* 64 */ [ 0, [ 62 ], [ 66 ], "Ordanance Technician", { "Skill Cooldown (Ordinance)": 0.15 } ],
       /* 65 */ [ 0, [ 62 ], [ 66 ], "Toxicologist", { "Toxic Duration": 0.3 } ],
       /* 66 */ [ 0, [ 64, 65 ], [ 67, 68, 69 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 67 */ [ 0, [ 66 ], [], "Heavy Absorbtion", { "Activating an Ordinance Skill increases Skill Leech by 15% for 7s": null } ],
       /* 68 */ [ 0, [ 66 ], [ 70 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 69 */ [ 0, [ 66 ], [ 70 ], "D-Kay Toxin", { "Damage (Toxic)": 0.2 } ],
       /* 70 */ [ 0, [ 68, 69 ], [ 71, 73 ], "Disturbance Coating", { "Resistance Penetration": 0.15 } ],
       /* 71 */ [ 0, [ 70 ], [ 72 ], "Vitality Magnet", { "Skill Leech": 0.06 } ],
       /* 72 */ [ 0, [ 71 ], [], "Armored Unit", { "Activating an Ordinance Skill increases Armor by 50% for 15s": null } ],
       /* 73 */ [ 0, [ 70 ], [ 74, 75 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 74 */ [ 0, [ 73 ], [], "???", { "Decreases Elite's damage against you and your allies by 10%": null } ],
       /* 75 */ [ 0, [ 73 ], [ 76, 77 ], "Emergency Transfusion", { "Doubles Skill Leech when Health drops below 30%": null } ],
       /* 76 */ [ 0, [ 75 ], [ 78 ], "Anomally Fueled", { "Anomaly Power": 0.06 } ],
       /* 77 */ [ 0, [ 75 ], [ 78 ], "D-Kay Toxin", { "Damage (Toxic)": 0.2 } ],
       /* 78 */ [ 0, [ 76, 77 ], [], "Techbond", { "Activating an Ordinance Skill increases Anomaly Power by 50% for 10s": null } ]
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
      [ 191, 441, 2 ],
      
      [ 285, 349, 0 ],
      [ 378, 211, 0 ],
      [ 425, 304, 0 ],
      [ 519, 162, 0 ],
      [ 518, 70, 1 ],
      [ 657, 116, 0 ],
      [ 658, 208, 0 ],
      [ 752, 164, 0 ],
      [ 751, 69, 1 ],
      [ 845, 114, 0 ],
      [ 845, 210, 0 ],
      [ 938, 161, 0 ],
      [ 938, 70, 1 ],
      [ 1030, 116, 0 ],
      [ 1030, 208, 0 ],
      [ 1123, 162, 0 ],
      [ 1123, 71, 0 ],
      [ 1217, 70, 1 ],
      [ 1217, 162, 0 ],
      [ 1216, 253, 1 ],
      [ 1309, 208, 1 ],
      [ 1404, 164, 0 ],
      [ 1405, 255, 0 ],
      [ 1496, 211, 1 ],
      
      [ 519, 255, 0 ],
      [ 519, 348, 1 ],
      [ 614, 303, 0 ],
      [ 752, 299, 1 ],
      [ 846, 301, 0 ],
      
      [ 332, 443, 0 ],
      [ 424, 394, 0 ],
      [ 426, 487, 0 ],
      [ 518, 445, 0 ],
      [ 661, 397, 0 ],
      [ 659, 489, 0 ],
      [ 751, 442, 0 ],
      [ 843, 395, 0 ],
      [ 845, 488, 0 ],
      [ 937, 440, 0 ],
      [ 938, 535, 1 ],
      [ 1028, 395, 0 ],
      [ 1032, 488, 0 ],
      [ 1126, 440, 0 ],
      [ 1125, 351, 1 ],
      [ 1217, 441, 0 ],
      [ 1311, 442, 1 ],
      [ 1399, 395, 0 ],
      [ 1406, 492, 0 ],
      [ 1496, 440, 1 ],
      
      [ 518, 534, 1 ],
      [ 610, 583, 0 ],
      [ 516, 629, 0 ],
      [ 752, 581, 1 ],
      [ 844, 582, 0 ],
      
      [ 285, 534, 0 ],
      [ 425, 579, 0 ],
      [ 380, 673, 0 ],
      [ 517, 721, 0 ],
      [ 517, 817, 1 ],
      [ 658, 676, 0 ],
      [ 658, 767, 0 ],
      [ 752, 720, 0 ],
      [ 750, 813, 1 ],
      [ 842, 676, 0 ],
      [ 842, 769, 0 ],
      [ 936, 723, 0 ],
      [ 939, 813, 1 ],
      [ 1030, 673, 0 ],
      [ 1031, 768, 0 ],
      [ 1122, 721, 0 ],
      [ 1125, 815, 0 ],
      [ 1218, 815, 1 ],
      [ 1218, 722, 0 ],
      [ 1214, 628, 1 ],
      [ 1311, 676, 1 ],
      [ 1404, 629, 0 ],
      [ 1403, 722, 0 ],
      [ 1495, 674, 1 ]
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
  $.each(allcoords, (c, coords) => {
    let map = $("." + c + ".skilltree map")
    $.each(coords, (i, node) => {
      let offset = alloffsets[node[2]]
      map.append($("<div>").addClass("node n" + node[2]).css({ left: node[0] - offset + "px", top: node[1] - offset + "px" })
        .append($("<area>").attr({ shape: "circle", href: "#", coords: node[0] + "," + node[1] + "," + (offset + 1) })))
    })
  })
}
