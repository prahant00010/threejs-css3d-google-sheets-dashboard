import { GOOGLE_CLIENT_ID, PUBLISHED_CSV_URL } from "./config.js";
import { loadPeople } from "./sheets.js";
import { createVisualization } from "./visualization.js";

const authView = document.getElementById("authView");
const vizView = document.getElementById("vizView");
const btnSignOut = document.getElementById("btnSignOut");
const gsiButton = document.getElementById("gsiButton");
const container = document.getElementById("container");

let idToken = "";
let accessToken = "";
let tokenClient = null;
let viz = null;
let hasRetriedConsent = false;

// Load tokens from localStorage on page load
function loadStoredTokens() {
  try {
    idToken = localStorage.getItem("datagrid_idToken") || "";
    accessToken = localStorage.getItem("datagrid_accessToken") || "";
    return { idToken, accessToken };
  } catch (e) {
    console.warn("Failed to load stored tokens:", e);
    return { idToken: "", accessToken: "" };
  }
}

// Save tokens to localStorage
function saveTokens(id, access) {
  try {
    if (id) localStorage.setItem("datagrid_idToken", id);
    if (access) localStorage.setItem("datagrid_accessToken", access);
  } catch (e) {
    console.warn("Failed to save tokens:", e);
  }
}

// Clear tokens from localStorage
function clearTokens() {
  try {
    localStorage.removeItem("datagrid_idToken");
    localStorage.removeItem("datagrid_accessToken");
  } catch (e) {
    console.warn("Failed to clear tokens:", e);
  }
}

function showAuth() {
  if (authView) authView.style.display = "grid";
  if (vizView) vizView.style.display = "none";
  if (btnSignOut) btnSignOut.hidden = true;
  if (viz) {
    viz.dispose();
    viz = null;
  }
}

function showViz() {
  console.log("showViz() called");
  if (!authView || !vizView) {
    console.error("Missing view elements!", { authView, vizView });
    return;
  }
  authView.style.display = "none";
  authView.removeAttribute("hidden");
  authView.setAttribute("hidden", "true");
  
  vizView.removeAttribute("hidden");
  vizView.style.display = "block";
  vizView.style.width = "100%";
  vizView.style.height = "100%";
  
  if (btnSignOut) btnSignOut.hidden = false;
  console.log("After showViz() - authView.display:", authView.style.display, "vizView.display:", vizView.style.display);
  console.log("vizView computed style:", window.getComputedStyle(vizView).display);
}

function ensureConfigured() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes("PASTE_YOUR")) {
    throw new Error("Missing GOOGLE_CLIENT_ID in src/config.js");
  }
}

async function startVisualization() {
  try {
    console.log("Loading people data...");
    const people = await loadPeople({ accessToken });
    console.log(`Loaded ${people.length} people:`, people);
    
    if (!people || people.length === 0) {
      throw new Error("No data found. Check your sheet has data and the range is correct.");
    }
    
   
    const firstPerson = people[0];
    console.log("First person data:", firstPerson);
    console.log("First person keys:", Object.keys(firstPerson));
    if (!firstPerson || Object.keys(firstPerson).length === 0) {
      throw new Error("People data is empty. Check data parsing logic.");
    }
    
    if (!container) {
      throw new Error("Container element not found!");
    }
    
    console.log("Creating visualization...");
   
    showViz();
    
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
    console.log("Container dimensions after showViz:", {
      width: container.clientWidth,
      height: container.clientHeight,
      offsetWidth: container.offsetWidth,
      offsetHeight: container.offsetHeight
    });
    

    if (container.clientWidth === 0 || container.clientHeight === 0) {
      console.warn("Container has zero dimensions, checking parent");
      const parent = container.parentElement; // .viz
      const main = parent?.parentElement; // .main
      console.log("Parent (.viz) dimensions:", {
        width: parent?.clientWidth,
        height: parent?.clientHeight,
        offsetWidth: parent?.offsetWidth,
        offsetHeight: parent?.offsetHeight
      });
      console.log("Main (.main) dimensions:", {
        width: main?.clientWidth,
        height: main?.clientHeight,
        offsetWidth: main?.offsetWidth,
        offsetHeight: main?.offsetHeight
      });
      
    
      const vh = window.innerHeight - 64; 
      const vw = window.innerWidth;
      if (parent) {
       
        parent.removeAttribute("hidden");
        parent.style.display = "block";
        parent.style.position = "relative";
        parent.style.width = vw + "px";
        parent.style.height = vh + "px";
        parent.style.minHeight = vh + "px";
        
       
        container.style.position = "absolute";
        container.style.width = vw + "px";
        container.style.height = vh + "px";
        container.style.top = "0";
        container.style.left = "0";
        container.style.right = "0";
        container.style.bottom = "0";
        
        console.log("Forced dimensions from viewport:", {
          width: vw,
          height: vh
        });
        console.log("After forcing - parent dimensions:", {
          width: parent.clientWidth,
          height: parent.clientHeight,
          display: window.getComputedStyle(parent).display
        });
      }
    }
    
    viz = createVisualization({ container, people });
    console.log("Visualization created successfully!");


  const tableBtn = document.getElementById("table");
  const sphereBtn = document.getElementById("sphere");
  const helixBtn = document.getElementById("helix");
  const gridBtn = document.getElementById("grid");
  
  if (tableBtn) {
    tableBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("TABLE button clicked, viz exists:", !!viz);
      if (!viz) {
        console.error("Visualization object is null!");
        return;
      }
      viz.transformTo("table");
    });
  }
  if (sphereBtn) {
    sphereBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("SPHERE button clicked, viz exists:", !!viz);
      if (!viz) {
        console.error("Visualization object is null!");
        return;
      }
      viz.transformTo("sphere");
    });
  }
  if (helixBtn) {
    helixBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("HELIX button clicked, viz exists:", !!viz);
      if (!viz) {
        console.error("Visualization object is null!");
        return;
      }
      viz.transformTo("helix");
    });
  }
  if (gridBtn) {
    gridBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("GRID button clicked, viz exists:", !!viz);
      if (!viz) {
        console.error("Visualization object is null!");
        return;
      }
      viz.transformTo("grid");
    });
  }
  } catch (error) {
    console.error("Error in startVisualization:", error);
    throw error;
  }
}

function initGoogleAuth() {
  ensureConfigured();


  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    callback: async (resp) => {
      if (resp.error) {
      
        const retryable =
          resp.error === "consent_required" || resp.error === "interaction_required";
        if (retryable && !hasRetriedConsent) {
          hasRetriedConsent = true;
          tokenClient?.requestAccessToken({ prompt: "consent" });
          return;
        }
        console.error(resp);
        alert("Google authorization failed. Check console for details.");
        return;
      }
      accessToken = resp.access_token;
      saveTokens(idToken, accessToken); 
      try {
        await startVisualization();
      } catch (e) {
        console.error(e);
        alert(String(e?.message || e));
        showAuth();
      }
    }
  });

 
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (resp) => {
      idToken = resp.credential || "";
      saveTokens(idToken, accessToken); // Save ID token
      hasRetriedConsent = false;
      if (PUBLISHED_CSV_URL) {
        try {
          await startVisualization();
        } catch (e) {
          console.error(e);
          alert(String(e?.message || e));
          showAuth();
        }
        return;
      }
      tokenClient?.requestAccessToken({ prompt: "" });
    }
  });

  gsiButton.innerHTML = "";
  window.google.accounts.id.renderButton(gsiButton, {
    theme: "filled_blue",
    size: "large",
    type: "standard",
    text: "signin_with",
    shape: "pill",
    logo_alignment: "left",
    width: 240
  });
}

btnSignOut.addEventListener("click", () => {
  try {
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {});
    }
  } finally {
    accessToken = "";
    idToken = "";
    clearTokens(); 
    showAuth();
  }
});


function waitForGoogle(maxMs = 15_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (window.google?.accounts?.id && window.google?.accounts?.oauth2) return resolve();
      if (Date.now() - start > maxMs) return reject(new Error("Google Identity Services failed to load."));
      setTimeout(tick, 50);
    };
    tick();
  });
}

(async function boot() {

  const stored = loadStoredTokens();
  if (stored.accessToken || PUBLISHED_CSV_URL) {
    
    accessToken = stored.accessToken;
    idToken = stored.idToken;
    try {
      await waitForGoogle();
      
      if (PUBLISHED_CSV_URL) {
        await startVisualization();
        return;
      }
      
      await startVisualization();
      return; 
    } catch (e) {
      console.log("Failed to restore session, showing auth screen:", e);
    
      clearTokens();
      accessToken = "";
      idToken = "";
    }
  }
  
 
  showAuth();
  try {
    await waitForGoogle();
    initGoogleAuth();
  } catch (e) {
    console.error(e);
    alert(String(e?.message || e));
  }
})();

