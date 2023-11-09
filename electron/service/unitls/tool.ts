interface Data {
  c: number;
  f: number;
  humi: number;
}
export function findMinMax(data: Data[]): {
  c: { min: number; max: number };
  f: { min: number; max: number };
  humi: { min: number; max: number };
} {
  let cList: number[] = [];
  let fList: number[] = [];
  let humiList: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const { c, f, humi } = data[i];
    cList.push(Number(c));
    fList.push(Number(f));
    humiList.push(Number(humi));
  }
  let cMin = findMinValue(cList);
  let cMax = findMaxValue(cList);
  let fMin = findMinValue(fList);
  let fMax = findMaxValue(fList);
  let humiMin = findMinValue(humiList);
  let humiMax = findMaxValue(humiList);
  return {
    c: { min: cMin, max: cMax },
    f: { min: fMin, max: fMax },
    humi: { min: humiMin, max: humiMax },
  };
}

function findMaxValue(numbers) {
  let max = -Infinity;
  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] > max) {
      max = numbers[i];
    }
  }
  return max;
}
function findMinValue(data: number[]): number {
  let min = Number.POSITIVE_INFINITY;
  for (let i = 0; i < data.length; i++) {
    if (data[i] < min) {
      min = data[i];
    }
  }
  return min;
}
