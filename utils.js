const EXPECTED_HEADERS = [
  "Date",
  "Registration",
  "Type",
  "From",
  "To",
  "Off Block",
  "On Block",
  "Total Time",
  "SE Time",
  "ME Time",
  "MP Time",
  "PIC Time",
  "Copi Time",
  "Dual Time",
  "Instructor Time",
  "PICUS Time",
  "SPIC Time",
  "Night Time",
  "IFR Time",
  "PIC Name",
  "Day Ldg",
  "Night Ldg",
  "IFR Approaches",
  "Day Toff",
  "Night Toff",
  "IFR Departures",
  "Remark",
  "Marker: Cross Country",
  "Marker: Solo",
];

const HEADER_MAPPING = {
  day: "Date",
  "registration number": "Registration",
  aircraft: "Type",
  "departure place": "From",
  "arrival place": "To",
  "engine start time": "Off Block",
  "engine stop time": "On Block",
  "engine time": "Total Time",
  "vfr night": "Night Time",
  ifr: "IFR Time",
  "pilot in command": "PIC Name",
  "number of flights": "Day Ldg",
  "touch and goes": "Night Ldg",
  "nr of approaches": "IFR Approaches",
  "day toff": "Day Toff",
  "go arounds": "Night Toff",
  remarks: "Remark",
  "cross country": "Marker: Cross Country",
  "marker solo": "Marker: Solo",
};

const AIRCRAFT_TYPE_MAPPING = {
  "Czech Aircraft Group s.r.o. PS-28 Cruiser": "CRUZ",
  "AEROSTAR SA R40F Festival": "FEST",
  "Zlin 142": "Z142",
  "Zlin 242": "Z242",
  "Cessna 172": "C172",
  "Cessna 182": "C182",
};

const AERODROME_CODE_MAPPING = {
  ATCJ: "LRCJ",
  DZM: "LRCJ",
  LRMM: "LRBM",
};

export const getAircraftTypeMapping = (code) =>
  AIRCRAFT_TYPE_MAPPING[code] || code;
export const getAerodromeCodeMapping = (code) =>
  AERODROME_CODE_MAPPING[code] || code;
export const getHeaderMapping = (code) => HEADER_MAPPING[code];

const addPicTimes = (newRow, picName, dpeName) => {
  if (newRow["PIC Name"] !== picName && newRow["PIC Name"] !== dpeName) {
    newRow["SPIC Time"] = newRow["Total Time"];
    newRow["Dual Time"] = newRow["Total Time"];
    newRow["PICUS Time"] = "0:00";
    newRow["PIC Time"] = "0:00";
    return;
  }

  if (newRow["Remark"] === "yes") {
    newRow["SPIC Time"] = "0:00";
    newRow["Dual Time"] = "0:00";

    if (newRow["PIC Name"] === dpeName) {
      newRow["PICUS Time"] = "0:00";
      newRow["PIC Time"] = newRow["Total Time"];
    } else {
      newRow["PICUS Time"] = newRow["Total Time"];
      newRow["PIC Time"] = "0:00";
    }
    return;
  }

  newRow["SPIC Time"] = "0:00";
  newRow["Dual Time"] = "0:00";
  newRow["PICUS Time"] = "0:00";
  newRow["PIC Time"] = newRow["Total Time"];
};

export const convertRow = (row, picName, dpeName) => {
  const newRow = Object.fromEntries(
    // initialize the new row with empty values for all expected headers
    EXPECTED_HEADERS.map((header) => [header, ""])
  );

  for (const key in row) {
    switch (key) {
      case "aircraft":
        newRow["Type"] = getAircraftTypeMapping(row[key]);
        break;
      case "departure place":
        newRow["From"] = getAerodromeCodeMapping(row[key]);
        break;
      case "arrival place":
        newRow["To"] = getAerodromeCodeMapping(row[key]);
        break;

      default:
        if (getHeaderMapping(key)) {
          newRow[getHeaderMapping(key)] = row[key];
        }
        break;
    }
  }

  // add missing
  newRow["SE Time"] = newRow["Total Time"];
  newRow["Dual Time"] = "0";
  newRow["Instructor Time"] = "0";
  newRow["PICUS Time"] = "0";
  newRow["SPIC Time"] = "0";

  // add empty
  newRow["ME Time"] = "0:00";
  newRow["MP Time"] = "0:00";
  newRow["Copi Time"] = "0:00";
  newRow["Instructor Time"] = "0:00";
  newRow["IFR Approaches"] = 0;
  newRow["IFR Departures"] = 0;

  // add pic time
  addPicTimes(newRow, picName, dpeName);

  return newRow;
};
