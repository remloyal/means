// 参数验证是否正确

export const parameterValidation = (record: any): boolean => {
  if (typeof record !== 'object') {
    return false;
  }
  //   验证列表
  const verifyList: boolean[] = [verifyType(record.deviceType)];
  //   验证所有
  return verifyList.every(item => item == true); // 所有验证通过返回true，否则返回false
};

// 验证类型
const verifyType = (value: string | null): boolean => {
  if (typeof value != 'string') {
    return false;
  }
  const parameter = ['M2D', 'M2H', 'M2H#V1#1', 'M2D#V1#1'];
  return parameter.includes(value); // 验证类型是否在参数列表中
};
