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
   home: "Home"
}
,
  // club cells into zones here. Use numbers 1..36 (6x6)
  zonesConfig: {
    "Entrance": [1,2],
    "Food Court": [7,8,13,14],
    "Games": [3,4,9,10,15],
    "Main Stage": [11,12,17],
    "Parking": [31,32,36],
    // add or edit zone names and associated cell numbers
  },
  gridRows: 5,
  gridCols: 5,
  mapImage: "map_with_grid_names.png"
};

/* -- END CONFIG -- */

let dataCache = { stalls:[], schedule:[], announcements:[] };

// UI Bindings
const pages = {
  home: document.getElementById("home"),
  stalls: document.getElementById("stalls"),
  schedule: document.getElementById("schedule"),
  annc: document.getElementById("annc"),
  map: document.getElementById("map"),
  contact: document.getElementById("contact")
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
  else if(id === "map") pages.map.classList.add("active");
  else if(id === "contact") pages.contact.classList.add("active");
}

// Build grid overlay
const overlay = document.getElementById("grid-overlay");
const mapImg = document.getElementById("map-image");
mapImg.src = CONFIG.mapImage; // replaceable file

function buildGrid(){
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
}

mapImg.addEventListener("load", buildGrid);
window.addEventListener("resize", buildGrid);

// helper: find zone name for a cell number
function zoneForCell(num){
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

// Show zone info panel
const zoneTitle = document.getElementById("zone-title");
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
}

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
  const [stalls, schedule, announcements, home] = await Promise.all([
    fetchSheet(CONFIG.endpoints.stalls),
    fetchSheet(CONFIG.endpoints.schedule),
    fetchSheet(CONFIG.endpoints.announcements),
    fetchSheet(CONFIG.endpoints.home)
  ]);

  dataCache.stalls = stalls;
  dataCache.schedule = schedule;
  dataCache.announcements = announcements;
  dataCache.home = home;

  renderHomeDashboard();
  renderStallsList();
  renderSchedule();
  renderAnnouncements();
}


function renderHomeDashboard() {

  /* ----------- Home Sheet Data -------------- */
  const home = dataCache.home?.[0] || {};
  document.getElementById("home-date").innerText =
      `📅 ${home.date || ""} • ${home.time || ""}`;
  /* ----------- Venue with Google Maps Link ----------- */
  /* ----------- Venue Map Card ----------- */
/* ----------- Venue Map Card ----------- */
const venueName = document.getElementById("home-venue-name");
const venueLink = document.getElementById("home-venue-link");
const mapCard = document.getElementById("home-map-card");

// If no venue provided → hide entire card
if (!home.venue && !home.maps) {
  mapCard.style.display = "none";
  return;
}

// Show venue name
venueName.innerText = home.venue || "Venue";

// If Google Maps link exists → show button
if (home.maps && home.maps.trim() !== "") {
  venueLink.href = home.maps;
  venueLink.style.display = "inline-block";
}
// If NO maps URL → hide button but keep venue visible
else {
  venueLink.style.display = "none";
}



  /* ----------- Latest Announcement ---------- */
  const annc = dataCache.announcements;
  if (annc.length) {
    document.getElementById("home-latest-annc").innerText =
      `${annc[annc.length - 1].title} — ${annc[annc.length - 1].message}`;
  } else {
    document.getElementById("home-announcement").style.display = "none";
  }

  /* ----------- Next Event ------------------- */
  const events = dataCache.schedule;
  const next = findNextEvent(events);

if (next) {
  document.getElementById("home-next-title").innerText = next.title || "";
  document.getElementById("home-next-time").innerText =
      `${next.time || ""} • ${next.stage || ""}`;
} else {
  document.getElementById("home-next-event").style.display = "none";
}
  /* ----------- Stats ------------------------ */
  //document.getElementById("stat-stalls").innerText = dataCache.stalls.length;
  //document.getElementById("stat-events").innerText = dataCache.schedule.length;
  //document.getElementById("stat-annc").innerText = dataCache.announcements.length;
}


function renderStallsList() {
  const container = document.getElementById("stalls-list");
  container.innerHTML = "<h2>Stalls</h2>";

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

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `<div><strong>${stall.name}</strong><div style="color:var(--muted)">${stall.type || stall.Type || ""} • Zone: ${stall.zone || stall.Zone || "—"}</div><div style="margin-top:4px;">${stall.menu ? stall.menu : ""}</div></div>`;
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
    el.innerHTML = `<div><strong>${s.title}</strong><div style="color:var(--muted)">${s.time} • ${s.stage || ""}</div></div>`;
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


