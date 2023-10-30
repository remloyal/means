import disconnect from "@assets/MainForm/DeviceImage/disconnect.png";
import { Button } from "antd";

const Left: React.FC = () => {
  return (
    <div className="left">
      <div className="image">
        <img src={disconnect} alt="" />
        <span>报警</span>
      </div>
      <div className="record">
        <div className="record-nature">
          <div>设备型号：</div>
          <div>序列号：</div>
          <div>设备时间：</div>
          <div>电池电量：</div>
          <div>设备状态：</div>
          <div>记录点数：</div>
          <div>首记录时间：</div>
          <div>末记录时间：</div>
          <div>最大值：</div>
          <div>最小值：</div>
        </div>
        <RecordPrice></RecordPrice>
      </div>
      <div className="record-operate">
        <Button type="primary" danger>
          停止记录
        </Button>
        <Button type="primary">重新加载</Button>
      </div>
    </div>
  );
};

const RecordPrice = () => {
  return (
    <div className="record-price">
      <div>--</div>
      <div>--</div>
      <div>--</div>
      <div>--</div>
      <div>--</div>
      <div>--</div>
      <div>--</div>
      <div>--</div>
      <div>--</div>
      <div>--</div>
    </div>
  );
};

export default Left;
