import { Button, Modal, Space } from "antd";
import summary from "@assets/MainForm/btn.summary.png";
import { ExclamationCircleFilled, HomeOutlined } from "@ant-design/icons";
import { Popup } from "@/components/popup/Popup";

const { confirm } = Modal;

const menuConfig: MenuConfig[] = [
  {
    name: "概要",
    clock: () => {},
    icon: () => <HomeOutlined style={{ fontSize: "18px" }} />,
  },
  {
    name: "配置设备",
    clock: () => {},
    icon: () => <HomeOutlined style={{ fontSize: "18px" }} />,
  },
  {
    name: "历史数据",
    clock: () => {},
    icon: () => <HomeOutlined style={{ fontSize: "18px" }} />,
  },
  {
    name: "21 CFR",
    clock: () => {},
    icon: () => <HomeOutlined style={{ fontSize: "18px" }} />,
  },
  {
    name: "偏好设置",
    clock: () => {
      Popup({
        title:"11",
        content: <div>111111</div>,
      })
    },
    icon: () => <HomeOutlined style={{ fontSize: "18px" }} />,
  },
  {
    name: "帮助",
    clock: () => {},
    icon: () => <HomeOutlined style={{ fontSize: "18px" }} />,
  },
  {
    name: "关于",
    clock: () => {},
    icon: () => <HomeOutlined style={{ fontSize: "18px" }} />,
  },
];

export const Menu: React.FC = () => {
  return (
    <>
      {menuConfig.map((item, index) => {
        return MenuItem(item, index);
      })}
    </>
  );
};

export const MenuItem = (props: MenuConfig, index) => {
  return (
    <div className="menu-item" key={index} onClick={props.clock}>
      <div className="menu-son">
        <props.icon />
      </div>
      <div>{props.name}</div>
    </div>
  );
};
