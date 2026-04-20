export interface OfficerInfo {
  name: string;
  number: string;
  role?: string;
  extra?: string;
}

export interface ZonalTeam {
  officerName: string;
  officerNumber: string;
  assistantName: string;
  assistantNumber: string;
  pollingStations: string;
}

export interface PoliceInspector {
  policeStation: string;
  inspectorName: string;
  inspectorNumber: string;
}

export interface SupervisorGroup {
  name: string;
  number: string;
  pollingStations: string;
}

export interface ConstituencyData {
  constituency: string;
  ro: OfficerInfo;
  aros: OfficerInfo[];
  fstTeams: OfficerInfo[];
  sstTeams: OfficerInfo[];
  zonalTeams: ZonalTeam[];
  assemblyCoordinator: OfficerInfo;
  dsp: OfficerInfo & { subdivision: string };
  assemblyInspector: OfficerInfo;
  policeStationInspectors: PoliceInspector[];
  supervisors: SupervisorGroup[];
}

export interface RawRow {
  [key: string]: string;
}
