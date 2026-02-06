import { PUBLISHED_CSV_URL, SHEET_ID, SHEET_NAME, SHEET_RANGE } from "./config.js";

function parseMoneyToNumber(value) {
  if (value == null) return 0;
  const s = String(value).trim();
  const cleaned = s.replace(/[^0-9.\-]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseCsv(text) {

  const rows = [];
  let row = [];
  let cur = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cur += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      row.push(cur);
      cur = "";
      i += 1;
      continue;
    }
    if (ch === "\r") {
      i += 1;
      continue;
    }
    if (ch === "\n") {
      row.push(cur);
      cur = "";
      if (row.length > 1 || row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    cur += ch;
    i += 1;
  }

  row.push(cur);
  if (row.length > 1 || row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

function normalizeHeaderKey(key) {
  return String(key || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function rowsToPeople(header, rows) {
  const idx = new Map();
  header.forEach((h, i) => idx.set(normalizeHeaderKey(h), i));
  
  console.log("Normalized header keys:", Array.from(idx.keys()));
  console.log("Looking for keys:", ["name", "photo", "age", "country", "interest", "net worth"]);

  const gi = (row, key) => {
    const i = idx.get(key);
    if (i == null) {
      console.warn(`Key "${key}" not found in header. Available keys:`, Array.from(idx.keys()));
      return "";
    }
    return row[i] ?? "";
  };

  const people = rows
    .filter((r) => r.some((c) => String(c || "").trim() !== ""))
    .map((r) => {
      const netWorthRaw = gi(r, "net worth");
      const person = {
        name: gi(r, "name"),
        photo: gi(r, "photo"),
        age: gi(r, "age"),
        country: gi(r, "country"),
        interest: gi(r, "interest"),
        netWorthRaw,
        netWorth: parseMoneyToNumber(netWorthRaw)
      };
      console.log("Parsed person:", person);
      return person;
    });
  
  console.log(`Parsed ${people.length} people, first one:`, people[0]);
  return people;
}

async function fetchPublishedCsv() {
  if (!PUBLISHED_CSV_URL) {
    throw new Error("PUBLISHED_CSV_URL is not configured.");
  }
  const res = await fetch(PUBLISHED_CSV_URL, { credentials: "omit" });
  if (!res.ok) throw new Error(`Failed to fetch published CSV (${res.status})`);
  const text = await res.text();
  const all = parseCsv(text);
  const header = all[0] || [];
  const rows = all.slice(1);
  return rowsToPeople(header, rows);
}

async function fetchSheetsApi(accessToken) {
  if (!SHEET_ID) throw new Error("SHEET_ID is not configured.");
  const range = encodeURIComponent(`${SHEET_NAME}!${SHEET_RANGE}`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
    SHEET_ID
  )}/values/${range}?majorDimension=ROWS`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Sheets API error (${res.status}): ${body || res.statusText}`);
  }
  const json = await res.json();
  console.log("Sheets API response:", json);
  const values = json.values || [];
  console.log(`Raw values: ${values.length} rows`);
  const header = values[0] || [];
  console.log("Header:", header);
  const rows = values.slice(1);
  console.log(`Data rows: ${rows.length}`);
  const people = rowsToPeople(header, rows);
  console.log(`Parsed people: ${people.length}`);
  return people;
}

export async function loadPeople({ accessToken } = {}) {

  if (PUBLISHED_CSV_URL) return await fetchPublishedCsv();
  if (!accessToken) throw new Error("Missing access token. Sign in to load from Sheets API.");
  return await fetchSheetsApi(accessToken);
}

