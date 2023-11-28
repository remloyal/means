// 应用生成
const ZHTYPE = {
  title: ['日期', '时间', '℃', '℉', 'RH'],
  rule: {
    time: [/文件创建日期：(.*?)数据报告注：/],
    timeFormat: [/24小时制，(.*?)低温警报：/, /24小时制，(.*?)]设备配置/],
    lowAlarm: [/低温警报： (.*?)高温警报/],
    highAlarm: [/高温警报：(.*?)低湿警报/],
    humiLowAlarm: [/低湿警报： (.*?)高湿警报/],
    humiHighAlarm: [/高湿警报： (.*?)数据条数/],
    dataPoints: [/数据条数：(.*?)停止方式/],
    stopMode: [/停止方式： (.*?)设备信息/],
    deviceID: [/设备 ID： (.*?)设备型号/],
    deviceModel: [/设备型号： (.*?)固件版本/],
    firmwareVersion: [/固件版本： (.*?)硬件版本/],
    hardwareVersion: [/硬件版本： (.*?)设备配置/],
    startDelay: [/启动延时：(.*?)日志间隔/],
    logInterval: [/日志间隔：(.*?)开始时间/],
    minsStartTime: [/开始时间： (.*?)结束时间/],
    endTime: [/结束时间： (.*?)记录概要/],
    threshold: [/阈值(.*?)数据点/],
    highestTemperature: [/最高温度： (.*?)最低温度：/],
    lowestTemperature: [/最低温度： (.*?)最高湿度：/],
    highestHumidity: [/最高湿度： (.*?)最低湿度：/],
    lowestHumidity: [/最低湿度： (.*?)MKT/],
    mkt: [/MKT： (.*?)平均温度：/],
    average: [/平均温度： (.*?)警报信息/],
    tempLow: [/低温警报 (.*?)高温警报/],
    tempHigh: [/高温警报 (.*?)低湿警报/],
    humiLow: [/低湿警报 (.*?)高湿警报/],
    humiHigh: [/高湿警报 (.*?)记录图表/],
  },
};

// 设备生成
const DEVICEENTYPE = {
  ...ZHTYPE,
  rule: {
    ...ZHTYPE.rule,
    lowAlarm: [/低温警报： (.*?)高温警报/],
    highAlarm: [/高温警报：(.*?)低湿警报/],
    humiLowAlarm: [/低湿警报： (.*?)高湿警报/],
    humiHighAlarm: [/高湿警报： (.*?)数据条数/],
    // stopMode: [/Stop Mode: (.*?)Note:/],
    // hardwareVersion: [/Hardware Version: (.*?)Logging Summary/],
    // startDelay: [/Start Delay: (.*?)Log Interval/],
    // logInterval: [/Log Interval: (.*?) MinsStart Time/],
    // minsStartTime: [/MinsStart Time: (.*?)End Time/],
    // endTime: [/End Time: (.*?)Device Information/],
  },
};
export default { currency: ZHTYPE, device: DEVICEENTYPE };
