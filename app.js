/* app.js
 - Edit the CONFIG below:
   1) sheetBase: the opensheet URL base
   2) endpoints: tab names (or separate sheet IDs)
   3) zonesConfig: map zoneName -> array of cell numbers (1..36)
   4) gridRows/gridCols: set to 6 for 6x6 (36)
   5) mapImage: filename of the map image in same folder (map.jpg)
*/

const CONFIG = {
  // Use opensheet.elk.sh: opensheet endpoint pattern
  // example final URL: https://opensheet.elk.sh/{SHEET_ID}/{TAB_NAME}
  sheetBase: "https://opensheet.elk.sh",
  // Put your sheetId and tab names here
  sheetId: "1bIJPmq4vJCdYnzI0DQVeiUc4Snj5vC43hB0tKnMEAkE",
  endpoints: {
    stalls: "Stalls",
    schedule: "Schedule",
    announcements: "Announcements",
    home: "Home",
    emergency: "Emergency",    // new
    dosdonts: "DosDonts"       // new (choose exact tab name)
  },
  // club cells into zones here. Use numbers 1..36 (6x6)
  zonesConfig: {
   /* "Entrance": [1,2],
    "Food Court": [7,8,13,14],
    "Games": [3,4,9,10,15],
    "Main Stage": [11,12,17],
    "NGOs": [18,19,20],*/
    // add or edit zone names and associated cell numbers
  },
  gridRows: 0,
  gridCols: 0,
  mapImage: "map.jpg"
};

/* -- END CONFIG -- */

let dataCache = { stalls:[], schedule:[], announcements:[], emergency: [], dosdonts: [] };

// UI Bindings
const pages = {
  home: document.getElementById("home"),
  stalls: document.getElementById("stalls"),
  schedule: document.getElementById("schedule"),
  annc: document.getElementById("annc"),
  bazaarzones: document.getElementById("bazaarzones"),
  emergency: document.getElementById("emergency"),   // new
  dosdonts: document.getElementById("dosdonts")      // new
};

document.querySelectorAll(".nav-btn").forEach(btn=>{
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const id = btn.id.replace("btn-","");
    showPage(id);
  })
});
function showPage(id){
  Object.values(pages).forEach(p=>p.classList.remove("active"));
  if(id === "home") pages.home.classList.add("active");
  else if(id === "stalls") pages.stalls.classList.add("active");
  else if(id === "schedule") pages.schedule.classList.add("active");
  else if(id === "annc") pages.annc.classList.add("active");
  else if(id === "bazaarzones") pages.bazaarzones.classList.add("active");
  else if(id === "emergency") pages.emergency.classList.add("active");
else if(id === "dosdonts") pages.dosdonts.classList.add("active");

}

// Build grid overlay
const overlay = document.getElementById("grid-overlay");
const mapImg = document.getElementById("map-image");
mapImg.src = CONFIG.mapImage; // replaceable file

/*function buildGrid(){
  overlay.innerHTML = "";
  const rows = CONFIG.gridRows;
  const cols = CONFIG.gridCols;
  // overlay dimensions at current render
  const rect = mapImg.getBoundingClientRect();
  const width = mapImg.clientWidth;
  const height = mapImg.clientHeight;
  // style overlay to match image layout (absolute inside wrapper)
  overlay.style.width = mapImg.clientWidth + "px";
  overlay.style.height = mapImg.clientHeight + "px";
  // cell size
  const cellW = width / cols;
  const cellH = height / rows;

  // make a map cell element for each cell numbered 1..rows*cols left->right top->bottom
  let n = 1;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.style.left = (c*100/cols) + "%";
      cell.style.top  = (r*100/rows) + "%";
      cell.style.width = (100/cols) + "%";
      cell.style.height = (100/rows) + "%";
      cell.dataset.cell = n;
      cell.innerText = n;
      // make clickable
      cell.style.pointerEvents = "auto";
      cell.addEventListener("click", onCellClick);
      overlay.appendChild(cell);
      n++;
    }
  }
}*/

//mapImg.addEventListener("load", buildGrid);
//window.addEventListener("resize", buildGrid);

// helper: find zone name for a cell number
/*function zoneForCell(num){
  for(const [z,arr] of Object.entries(CONFIG.zonesConfig)){
    if(arr.includes(Number(num))) return z;
  }
  return null;
}

function onCellClick(e){
  const cell = e.currentTarget.dataset.cell;
  const zone = zoneForCell(cell);
  showZoneInfo(cell, zone);
}
*/
// Show zone info panel
/*const zoneTitle = document.getElementById("zone-title");
const zoneContents = document.getElementById("zone-contents");
function showZoneInfo(cell, zone){
  zoneTitle.innerText = zone ? `${zone} (Cell ${cell})` : `Cell ${cell} — No Zone`;
  zoneContents.innerHTML = "";
  if(!zone){
    zoneContents.innerHTML = "<p>No items assigned. Edit zonesConfig in app.js to assign this cell.</p>";
    return;
  }
  // collect items from stalls that belong to this zone
  const stalls = dataCache.stalls.filter(s => (s.zone || "").trim().toLowerCase() === zone.toLowerCase() || (s.cells && s.cells.split(",").map(x=>x.trim()).includes(String(cell))));
  const schedule = dataCache.schedule.filter(s => (s.zone || "").trim().toLowerCase() === zone.toLowerCase());
  const annc = dataCache.announcements.filter(a => (a.zone || "").trim().toLowerCase() === zone.toLowerCase());

  if(stalls.length){
    const h = document.createElement("h4"); h.innerText = "Stalls"; zoneContents.appendChild(h);
    stalls.forEach(s=>{
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<div><strong>${s.name || s.Stall || "Unnamed"}</strong><div style="color:var(--muted)">${s.type || s.Type || ""} ${s.menu ? "•"+s.menu : ""}</div></div>`;
      zoneContents.appendChild(div);
    });
  }

  if(schedule.length){
    const h = document.createElement("h4"); h.innerText = "Schedule"; zoneContents.appendChild(h);
    schedule.forEach(s=>{
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<div><strong>${s.title}</strong><div style="color:var(--muted)">${s.time} • ${s.stage || ""}</div></div>`;
      zoneContents.appendChild(div);
    });
  }

  if(annc.length){
    const h = document.createElement("h4"); h.innerText = "Announcements"; zoneContents.appendChild(h);
    annc.forEach(a=>{
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<div><strong>${a.title}</strong><div style="color:var(--muted)">${a.message}</div></div>`;
      zoneContents.appendChild(div);
    });
  }

  if(!stalls.length && !schedule.length && !annc.length){
    zoneContents.innerHTML += "<p>No entries in Sheets for this zone yet.</p>";
  }
}*/

// Fetching google sheets (opensheet)
async function fetchSheet(tab){
  const url = `${CONFIG.sheetBase}/${CONFIG.sheetId}/${tab}`;
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error("Failed to load sheet: "+url);
    const json = await res.json();
    return json;
  } catch(e){
    console.error(e);
    return [];
  }
}

async function loadAll(){
  const [stalls, schedule, announcements, home, emergency, dosdonts] = await Promise.all([
    fetchSheet(CONFIG.endpoints.stalls),
    fetchSheet(CONFIG.endpoints.schedule),
    fetchSheet(CONFIG.endpoints.announcements),
    fetchSheet(CONFIG.endpoints.home),
    fetchSheet(CONFIG.endpoints.emergency),
    fetchSheet(CONFIG.endpoints.dosdonts)
  ]);

  dataCache.stalls = stalls;
  dataCache.schedule = schedule;
  dataCache.announcements = announcements;
  dataCache.home = home;
  dataCache.emergency = emergency;
  dataCache.dosdonts = dosdonts;

  renderHomeDashboard();
  renderStallsList();
  renderSchedule();
  renderAnnouncements();
  renderEmergencies();   // new
  renderDosDonts();      // new
}



function renderHomeDashboard() {

  const home = dataCache.home?.[0] || {};
  const announcements = dataCache.announcements || [];

  /* ----------- Latest Announcement ---------- */
  const anncBox = document.getElementById("home-announcement");
  const anncText = document.getElementById("home-latest-annc");

  if (anncText && announcements.length) {
    const last = announcements[announcements.length - 1];
    anncText.innerText = `${last.title} — ${last.message}`;
    if (anncBox) anncBox.style.display = "block";
  } else {
    if (anncBox) anncBox.style.display = "none";
  }


  /* ----------- Venue Name ------------------- */
  const venueName = document.getElementById("home-venue-name");
  if (venueName) {
    venueName.innerText = home.venue || "";
  }

  /* ----------- Google Maps Link ------------- */
  const venueLink = document.getElementById("home-venue-link");
  if (venueLink) {
    if (home.maps) {
      venueLink.href = home.maps;
      venueLink.style.display = "inline-block";
    } else {
      venueLink.style.display = "none";
    }
  }

  /* ----------- No next-event, no stats ------- */
  /* These were removed in HTML so JS no longer touches them */
}



function renderStallsList() {
  const container = document.getElementById("stalls-list");
  //container.innerHTML = "<h2>Stalls</h2>";


  // Sort stalls alphabetically by name
  const stalls = dataCache.stalls.sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  let html = "";

  stalls.forEach(stall => {
    // Trim notes to 200 characters
    let notes = stall.notes || "";
    if (notes.length > 300) {
      notes = notes.substring(0, 300) + "...";
    }

    const stallNumber = stall.stall || stall.Stall || "";


    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `<div>
                        <strong>${stall.name} • Stall #:<span class="stall-number"> ${stallNumber || "—"}</span>
                        <div style="color:var(--muted)"><strong>Type:</strong>${stall.type || stall.Type || "--"} 
                        | <strong>Zone:</strong> <span class="zone-link" onclick="showPage('bazaarzones')">${stall.zone || stall.all.zone || stall.Zone || "—"}</span>
                        </div>
                        <div style="margin-top:4px;">${stall.menu ? stall.menu : ""}</div></div>`;
    container.appendChild(el);

    /*html += `
      <div class="stall-card">
        <h3>${stall.name || "Unnamed Stall"}</h3>
        <p><strong>Type:</strong> ${stall.type || "-"}</p>
        <p><strong>Zone:</strong> ${stall.zone || "-"}</p>
        <p><strong>Notes:</strong> ${notes}</p>
      </div>
    `;*/
  });

  //container.innerHTML += html;
}

function renderSchedule(){
  const container = document.getElementById("schedule-list");
  container.innerHTML = "";
  if(!dataCache.schedule.length) { container.innerHTML = "<p>No schedule yet.</p>"; return; }
  dataCache.schedule.forEach(s=>{
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `<div><strong>${s.title}</strong><div style="color:var(--muted)">${s.time} • 
                          ${s.stage || ""}
                          </div></div>`;
    container.appendChild(el);
  });
}
function renderAnnouncements(){
  const container = document.getElementById("annc-list");
  container.innerHTML = "";
  if(!dataCache.announcements.length) { container.innerHTML = "<p>No announcements.</p>"; return; }
  dataCache.announcements.forEach(a=>{
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `<div><strong>${a.title}</strong><div style="color:var(--muted)">${a.message}</div></div>`;
    container.appendChild(el);
  });
}

function renderEmergencies(){
  // Create container or update existing one
  const container = document.getElementById("emergency-list");
  if(!container) return;
  //container.innerHTML = "<h2>Emergency Contacts</h2>";
  container.innerHTML = "";

  const items = dataCache.emergency || [];
  if(!items.length){
    container.innerHTML += "<p>No emergency contacts available.</p>";
    return;
  }

  // Expect sheet to have columns like: name, role, phone, notes
  items.forEach(it=>{
    const el = document.createElement("div");
    el.className = "item";
    const phone = it.phone || it.Phone || it.contact || it.Contact || "";
    const role = it.role || it.Role || it.designation || "";
    const notes = it.notes || it.Notes || "";

    el.innerHTML = `<div>
      <strong>${it.name || it.Name || "Unnamed"}</strong>
      <div style="color:var(--muted)">${role} ${phone ? "• " + phone : ""}</div>
      <div style="margin-top:6px;color:var(--muted);font-size:0.95rem">${notes}</div>
    </div>
    <div style="text-align:right">
      ${phone ? `<a href="tel:${phone.replace(/\s+/g,'')}" class="btn">Call</a>` : ""}
    </div>`;
    container.appendChild(el);
  });
}

function renderDosDonts(){
  const container = document.getElementById("dosdonts-list");
  if(!container) return;

  container.innerHTML = "";

  //container.innerHTML = "<h2>Do's & Don'ts</h2>";

  const items = dataCache.dosdonts || [];
  if(!items.length){
    container.innerHTML += "<p>No guidelines available.</p>";
    return;
  }

  // Separate into Do and Don't groups
  const dos = [];
  const donts = [];

  items.forEach(it => {
    const t = (it.type || it.Type || "").toLowerCase();
    const txt = it.text || it.Text || it.item || it.Item || "";

    if (!txt) return;

    if (t.includes("do") && !t.includes("don't") && !t.includes("dont")) {
      dos.push(txt);
    } else if (t.includes("dont") || t.includes("don't")) {
      donts.push(txt);
    }
  });

  // Build DO's card
  if (dos.length) {
    const cardDo = document.createElement("div");
    cardDo.className = "home-block";
    cardDo.style.borderLeft = "6px solid #16A34A"; // green stripe
    cardDo.innerHTML = `
      <h3>✅ Do's</h3>
      <ul>${dos.map(d => `<li>${d}</li>`).join("")}</ul>
    `;
    container.appendChild(cardDo);
  }

  // Build DON'Ts card
  if (donts.length) {
    const cardDont = document.createElement("div");
    cardDont.className = "home-block";
    cardDont.style.borderLeft = "6px solid #DC2626"; // red stripe
    cardDont.innerHTML = `
      <h3>⛔ Don'ts</h3>
      <ul>${donts.map(d => `<li>${d}</li>`).join("")}</ul>
    `;
    container.appendChild(cardDont);
  }
}


// Quick search
document.getElementById("stalls-search").addEventListener("input", (e)=>{
  const q = e.target.value.trim().toLowerCase();
  const container = document.getElementById("stalls-list");
  container.innerHTML = "";
  const filtered = dataCache.stalls.filter(s=>{
    return (s.name||s.Stall||"").toLowerCase().includes(q) ||
           (s.zone||s.Zone||"").toLowerCase().includes(q) ||
           (s.type||s.Type||"").toLowerCase().includes(q) ||
           (s.menu||s.Menu||"").toLowerCase().includes(q);
  });
  if(!filtered.length) container.innerHTML = "<p>No results.</p>";
  filtered.forEach(stall=>{
    const el = document.createElement("div");
    el.className = "item";
    //el.innerHTML = `<div><strong>${s.name || s.Stall}</strong><div style="color:var(--muted)">${s.type || s.Type || ""} • Zone: ${s.zone || s.Zone || "—"}</div></div><br><div>${s.menu ? s.menu : ""}</div>`;
    el.innerHTML = `<div><strong>${stall.name}</strong><div style="color:var(--muted)">${stall.type || stall.Type || ""} • Zone: ${stall.zone || stall.Zone || "—"}</div><div style="margin-top:4px;">${stall.menu ? stall.menu : ""}</div></div>`;

    container.appendChild(el);
  });
});

// on load
document.addEventListener("DOMContentLoaded", ()=>{
  // initial page
  showPage("home");
  // load sheets
  if(CONFIG.sheetId === "1bIJPmq4vJCdYnzI0DQVeiUc4Snj5vC43hB0tKnMEAkE"){
    
    loadAll();
    // reload every 2 minutes for near-real-time
    setInterval(loadAll, 120000);
  }
});

/* Drawer Logic */
const drawer = document.getElementById("drawer");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const menuBtn = document.getElementById("menu-btn");
const drawerClose = document.getElementById("drawer-close");

function openDrawer() {
  drawer.classList.add("open");
  drawerBackdrop.classList.add("open");
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawerBackdrop.classList.remove("open");
}

menuBtn.addEventListener("click", openDrawer);
drawerClose.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);

// Called when tapping an item in the drawer
function navigateAndClose(page) {
  showPage(page);
  closeDrawer();
}
/*--End Drawer Logic*/

function parseTimeToDate(timeStr) {
  // Expecting: "13:45" or "09:10"
  if (!timeStr) return null;

  const [hr, min] = timeStr.split(':').map(Number);
  if (isNaN(hr) || isNaN(min)) return null;

  const d = new Date();
  d.setHours(hr);
  d.setMinutes(min);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

function findNextEvent(events) {

  const now = new Date();

  const parsed = events
    .map(ev => {
      const t = parseTimeToDate(ev.time);
      return t ? { ...ev, _timeObj: t } : null;
    })
    .filter(Boolean)
    .filter(ev => ev._timeObj > now)  // only future events
    .sort((a, b) => a._timeObj - b._timeObj); // earliest first

  return parsed.length ? parsed[0] : null;
}

document.getElementById("brand-link").addEventListener("click", () => {
    showPage("home");   // navigate to Home Page
});


