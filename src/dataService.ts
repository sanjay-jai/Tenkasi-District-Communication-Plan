import Papa from 'papaparse';
import { RawRow, ConstituencyData, ZonalTeam, PoliceInspector, SupervisorGroup, OfficerInfo } from './types.ts';

const SHEET1_URL = 'https://docs.google.com/spreadsheets/d/1IOg9nH08XgJ_eQSnRNK9yIym6GQ9IQGh/export?format=csv';
const SHEET2_URL = 'https://docs.google.com/spreadsheets/d/1hj2NeBNj7hBwW_P_6NXkE-XYO14akCAk/export?format=csv';

function getPollingStationRanges(stations: string[]): string {
  const nums = Array.from(new Set(
    stations
      .flatMap(s => s.split(',').map(part => parseInt(part.trim())))
      .filter(n => !isNaN(n))
  )).sort((a, b) => a - b);
  
  if (nums.length === 0) return "";
  
  const ranges: string[] = [];
  if (nums.length > 0) {
    let start = nums[0];
    let end = nums[0];

    for (let i = 1; i <= nums.length; i++) {
      if (i < nums.length && nums[i] === end + 1) {
        end = nums[i];
      } else {
        if (start === end) {
          ranges.push(`${start}`);
        } else {
          ranges.push(`${start}-${end}`);
        }
        if (i < nums.length) {
          start = nums[i];
          end = nums[i];
        }
      }
    }
  }
  return ranges.join(", ");
}

async function fetchCSV(url: string, label: string): Promise<RawRow[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const text = await response.text();
    
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
       console.error(`Fetch error for ${label}: Received HTML instead of CSV. Is the sheet published/public?`);
       return [];
    }

    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
        complete: (results) => {
          console.log(`Parsed ${label}: ${results.data.length} rows`);
          resolve(results.data as RawRow[]);
        },
      });
    });
  } catch (err) {
    console.error(`Error fetching ${label}:`, err);
    return [];
  }
}

function findValue(row: RawRow, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const cand of candidates) {
    if (row[cand]) return row[cand].trim();
    const foundKey = keys.find(k => 
      k.toLowerCase().trim() === cand.toLowerCase().trim() ||
      k.toLowerCase().trim().includes(cand.toLowerCase().trim())
    );
    if (foundKey && row[foundKey]) return row[foundKey].trim();
  }
  return "";
}

export async function getConstituencies(): Promise<string[]> {
  const [data1, data2] = await Promise.all([
    fetchCSV(SHEET1_URL, "Sheet 1 (Officers)"),
    fetchCSV(SHEET2_URL, "Sheet 2 (Supervisors)")
  ]);
  
  const map = new Map<string, string>();
  const candidates = ['Assembly Constituency', 'Constituency', 'AC Name'];
  
  const processData = (rows: RawRow[]) => {
    rows.forEach(row => {
      const val = findValue(row, candidates);
      if (val && val.toLowerCase() !== 'total') {
        const normalized = val.trim();
        const key = normalized.toLowerCase();
        if (!map.has(key)) {
          map.set(key, normalized);
        }
      }
    });
  };

  processData(data1);
  processData(data2);
  
  const result = Array.from(map.values()).sort();
  console.log(`Unique Constituencies found: ${result.length}`, result);
  return result;
}

export async function getDataByConstituency(ac: string): Promise<ConstituencyData | null> {
  const [data1, data2] = await Promise.all([
    fetchCSV(SHEET1_URL, "Sheet 1 (Officers)"),
    fetchCSV(SHEET2_URL, "Sheet 2 (Supervisors)")
  ]);

  const acCandidates = ['Assembly Constituency', 'Constituency', 'AC Name'];

  const filtered1 = data1.filter(row => 
    findValue(row, acCandidates).toLowerCase() === ac.toLowerCase()
  );
  
  const filtered2 = data2.filter(row => 
    findValue(row, acCandidates).toLowerCase() === ac.toLowerCase()
  );

  console.log(`Filtering for ${ac}: Found ${filtered1.length} in S1, ${filtered2.length} in S2`);

  if (filtered1.length === 0 && filtered2.length === 0) return null;

  const firstRow = filtered1[0] || {};
  
  // RO
  const ro: OfficerInfo = {
    name: findValue(firstRow, ['RO Name', 'Revenue Officer']),
    number: findValue(firstRow, ['RO Number', 'RO Contact', 'RO No'])
  };

  // AROs
  const aros: OfficerInfo[] = [];
  ['ARO1', 'ARO2', 'ARO3'].forEach(key => {
    const name = findValue(firstRow, [`${key} Name`]);
    if (name) {
      aros.push({
        role: key,
        name,
        number: findValue(firstRow, [`${key} Number`, `${key} No`, `${key} Contact`])
      });
    }
  });

  // FST Teams (Unique)
  const fstMap = new Map<string, OfficerInfo>();
  filtered1.forEach(row => {
    const name = findValue(row, ['FST Name']);
    const num = findValue(row, ['FST Number', 'FST No']);
    if (name) fstMap.set(`${name}-${num}`, { name, number: num });
  });
  const fstTeams = Array.from(fstMap.values());

  // SST Teams (Unique)
  const sstMap = new Map<string, OfficerInfo>();
  filtered1.forEach(row => {
    const name = findValue(row, ['SST Name']);
    const num = findValue(row, ['SST Number', 'SST No']);
    if (name) sstMap.set(`${name}-${num}`, { name, number: num });
  });
  const sstTeams = Array.from(sstMap.values());

  // Zonal Teams (Combined Officer & Assistant)
  const zonalTeamMap = new Map<string, { 
    officerName: string, 
    officerNumber: string, 
    assistantName: string, 
    assistantNumber: string, 
    stations: string[] 
  }>();

  filtered1.forEach(row => {
    const oName = findValue(row, ['Zonal Officer Name']);
    const oNum = findValue(row, ['Zonal Officer Number', 'Zonal Officer No']);
    const aName = findValue(row, ['Zonal Officer Assistant Name', 'Assistant Zonal Officer']);
    const aNum = findValue(row, ['Zonal Officer Assistant Number', 'Assistant Zonal Officer Number']);
    const ps = findValue(row, ['Polling Station No']);

    if (oName || aName) {
      const key = `${oName}-${aName}`;
      if (!zonalTeamMap.has(key)) {
        zonalTeamMap.set(key, {
          officerName: oName,
          officerNumber: oNum,
          assistantName: aName,
          assistantNumber: aNum,
          stations: []
        });
      }
      if (ps) zonalTeamMap.get(key)!.stations.push(ps);
    }
  });

  const zonalTeams: ZonalTeam[] = Array.from(zonalTeamMap.values()).map(t => ({
    officerName: t.officerName,
    officerNumber: t.officerNumber,
    assistantName: t.assistantName,
    assistantNumber: t.assistantNumber,
    pollingStations: getPollingStationRanges(t.stations)
  }));

  // Assembly Coordinator
  const assemblyCoordinator: OfficerInfo = {
    name: findValue(firstRow, ['Assembly Coordinator(Web Casting)', 'Coordinator']),
    number: findValue(firstRow, ['Mobile Number', 'Coordinator Number', 'Coordinator Contact'])
  };

  // DSP
  const dsp: OfficerInfo & { subdivision: string } = {
    name: findValue(firstRow, ['DSP Name']),
    number: findValue(firstRow, ['DSP Number', 'DSP No']),
    subdivision: findValue(firstRow, ['Subdivision'])
  };

  // Assembly Inspector
  const assemblyInspector: OfficerInfo = {
    name: findValue(firstRow, ['Assembly Inspector']),
    number: findValue(firstRow, ['Assembly Inspector Number', 'Assembly Inspector No'])
  };

  // Police Station Inspector
  const psMap = new Map<string, PoliceInspector>();
  filtered1.forEach(row => {
    const ps = findValue(row, ['Police Station']);
    const name = findValue(row, ['Police Station-Inspector', 'Inspector Name']);
    const num = findValue(row, ['Inspector Number', 'Inspector Contact']);
    if (ps && name) {
      const key = `${ps}-${name}`;
      if (!psMap.has(key)) {
        psMap.set(key, { policeStation: ps, inspectorName: name, inspectorNumber: num || '' });
      }
    }
  });
  const policeStationInspectors = Array.from(psMap.values());

  // Supervisors (Grouped by name & number)
  const supervisorMap = new Map<string, { name: string, number: string, stations: string[] }>();
  filtered2.forEach(row => {
     const name = findValue(row, ['Supervisor Name']);
     const num = findValue(row, ['Supervisor Number', 'Supervisor No', 'Supervisor Contact']);
     const ps = findValue(row, ['Polling Station No']);
     if (name) {
       const key = `${name}-${num}`;
       if (!supervisorMap.has(key)) {
         supervisorMap.set(key, { name, number: num, stations: [] });
       }
       if (ps) supervisorMap.get(key)!.stations.push(ps);
     }
  });
  const supervisors: SupervisorGroup[] = Array.from(supervisorMap.values()).map(s => ({
    name: s.name,
    number: s.number,
    pollingStations: getPollingStationRanges(s.stations)
  }));

  return {
    constituency: ac,
    ro,
    aros,
    fstTeams,
    sstTeams,
    zonalTeams,
    assemblyCoordinator,
    dsp,
    assemblyInspector,
    policeStationInspectors,
    supervisors
  };
}
