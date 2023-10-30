import * as echarts from "echarts";
import React, { useEffect, useRef, useState } from "react";
import { ipcRenderer } from "electron";

interface Chart {
  title?: string;
  xData?: string[];
  seriesData?: number[];
  option: any;
  className?: string;
  parent: React.MutableRefObject<HTMLDivElement | null>;
}

const ShareChart: React.FC<Chart> = (props) => {
  const { option, parent } = props;
  const chartWrapper = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);

  useEffect(() => {
    const height = parent.current?.clientHeight;
    if (!chartWrapper.current) {
      return;
    }
    chartWrapper.current.style.height = `${height! - 100}px`;
    chart.current = echarts.init(chartWrapper.current, "vintage");
    ipcRenderer.on("resizeEvent", (data) => {
      parent.current &&
        chart.current.resize({
          width: parent.current?.clientWidth,
          height: parent.current?.clientHeight - 100,
        });
    });
  }, []);

  useEffect(() => {
    if (chartWrapper != null && chart.current != null) {
      chart.current.setOption(option);
    }
  }, [option]);
  return <div ref={chartWrapper} />;
};

export { ShareChart };
