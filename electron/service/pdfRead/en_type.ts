// 应用生成
const ENTYPE = {
  title: ["Date", "Time", "℃", "℉", "RH"],
  rule: {
    time: [
      /File Created Date: (.*?)Frigga Data Report/,
      /File Created Date:(.*?)Frigga®/,
      /컄볾뒴붨죕웚: (.*?)쫽뻝놨룦뗍컂뺯놨/,
    ],
    timeFormat: [
      /Hour clock,(.*?)Temp Low Alarm/,
      /Hour clock,(.*?)]Device Configuration/,
      /킡쪱훆,(.*?)]뚩떥탅쾢/,
    ],
    lowAlarm: [/Temp Low Alarm: (.*?)Temp High Alarm/],
    highAlarm: [
      /Temp High Alarm: (.*?)Humi Low Alarm:/,
      /Temp High Alarm: (.*?)Data Points/,
    ],
    humiLowAlarm: [/Humi Low Alarm: (.*?)Humi High Alarm: /],
    humiHighAlarm: [/Humi High Alarm: (.*?)Data Points/],
    dataPoints: [/Data Points: (.*?)Stop Mode/],
    stopMode: [
      /Stop Mode: (.*?)Device Information/,
      /춣횹쒣쪽:(.*?)힢:쯹폐쪱볤믹폚/,
    ],
    deviceID: [/Device ID: (.*?)Device Model/, /ID:(.*?)짨놸탍뫅/],
    deviceModel: [
      /Device Model: (.*?)Firmware Version/,
      /짨놸탍뫅:(.*?)만볾냦놾:/,
    ],
    firmwareVersion: [
      /Firmware Version: (.*?)Hardware Version/,
      /만볾냦놾:(.*?)펲볾냦놾/,
    ],
    hardwareVersion: [
      /Hardware Version: (.*?)Device Configuration/,
      /놾:(.*?)볇슼룅튪컂뛈횵/,
    ],
    startDelay: [
      /Start delay: (.*?)Log interval/,
      /뚩떥탅쾢퇓쪱뾪쪼:(.*?)듦뒢볤룴/,
    ],
    logInterval: [
      /Log Interval: (.*?) Start Time/,
      /Log interval: (.*?)Start Time/,
      /듦뒢볤룴(.*?)뾪쪼쪱볤/,
    ],
    minsStartTime: [/MinsStart Time: (.*?)End time/],
    endTime: [/End time: (.*?)Logging Summary/],
    threshold: [/Threshold(.*?)Data Points/, /뗍ꆫ룟(.*?)쫽뻝쳵쫽/],
    highestTemperature: [/Highest Temperature: (.*?)Lowest Temperature/],
    lowestTemperature: [/Lowest Temperature: (.*?)Highest Humidity/],
    highestHumidity: [/Highest Humidity: (.*?)Lowest Humidity/],
    lowestHumidity: [/Lowest Humidity: (.*?)MKT/],
    mkt: [/MKT: (.*?)Average Temperature/, /MKT:(.*?)욽뻹컂뛈/],
    average: [/Average Temperature: (.*?)Data Summary/],
    tempLow: [/Temp-Low (.*?)Temp-High/],
    tempHigh: [/Temp-High (.*?)Humi-Low/],
    humiLow: [/Humi-Low (.*?)Humi-High/],
    humiHigh: [/Humi-High (.*?)Record/],
  },
};
// 设备生成
const DEVICEENTYPE = {
  ...ENTYPE,
  rule: {
    ...ENTYPE.rule,
    lowAlarm: [/Temp Low Alarm: (.*?)Temp High Alarm/],
    highAlarm: [/Temp High Alarm: (.*?)Humi Low Alarm:/],
    humiLowAlarm: [/Humi Low Alarm: (.*?)Humi High Alarm: /],
    humiHighAlarm: [/Humi High Alarm: (.*?)Data Points/],
    stopMode: [/Stop Mode: (.*?)Note:/, /춣횹쒣쪽:(.*?)힢:쯹폐쪱볤믹폚/],
    hardwareVersion: [
      /Hardware Version: (.*?)Logging Summary/,
      /펲볾냦놾:(.*?)볇슼룅튪컂뛈횵/,
    ],
    startDelay: [
      /Start Delay: (.*?)Log Interval/,
      /뚩떥탅쾢퇓쪱뾪쪼:(.*?)듦뒢볤룴/,
    ],
    logInterval: [/Log Interval: (.*?)Start Time/, /듦뒢볤룴:(.*?)뾪쪼쪱볤/],
    minsStartTime: [/MinsStart Time: (.*?)End Time/],
    endTime: [/End Time: (.*?)Device Information/],
  },
};
export default { currency: ENTYPE, device: DEVICEENTYPE };
