import { ConfigProvider, Button } from "antd";
import React, { useState } from "react";
import appTheme from "@/theme/App";
import "@/App.scss";
import "./views/view.scss";

import {
  BrowserRouter,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Outlet
} from "react-router-dom";
import Router from "./router/index";
import Header from "./views/Header/Header";
import Left from "./views/Left/Left";

const App: React.FC = () => {
  return (
    <ConfigProvider theme={appTheme}>
      <Header />
      <div
        style={{
          padding: "14px",
          display:'flex'
        }}
      >
        <Left></Left>
        <RouterProvider router={Router} />
      </div>
    </ConfigProvider>
  );
};

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [csvData, setCsvData] = useState<null | any>(null);

  window.eventBus.on("friggaDevice:in", (csvData) => {
    setIsConnected(true);
    // console.count("frigga:in")
    // console.log("frigga:in", csvData)
    setCsvData(csvData);
  });

  window.eventBus.on("friggaDevice:out", (...datas) => {
    setIsConnected(false);
    // console.log("frigga:out", datas)
  });
  {
    isConnected ? (
      <>
        <div>frigga 已接入</div>
        {csvData
          ? csvData.map(({ timeStamp, c }, i) => (
              <div key={i}>
                <div
                  style={{
                    width: 300,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ width: 50 }}>时间：</span>
                  <span style={{ width: 150 }}>{timeStamp}</span>
                  <span style={{ width: 50 }}>温度：</span>
                  <span style={{ width: 50 }}>{c}</span>
                </div>
              </div>
            ))
          : null}
      </>
    ) : (
      <div>frigga 未接入</div>
    );
  }
};

export default App;
