import { CloseOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import "./popup.scss";
interface PopupProps {
  title?: string;
  content: React.ReactNode;
}

const { confirm } = Modal;
export const Popup = ({ title, content }: PopupProps) => {
  const confirmData = confirm({
    title: (
      <div
        className="popup-title"

      >
        <div
          style={{ fontSize: "18px" }}
          onClick={() => {
            confirmData.destroy();
          }}
        >
          {title}
        </div>
        <CloseOutlined
          onClick={() => {
            confirmData.destroy();
          }}
        />
      </div>
    ),
    // icon: <FullscreenExitOutlined />,
    icon: null,
    wrapClassName:'popup',
    closeIcon: <CloseOutlined />,
    maskClosable: true,
    content: content,
    centered: true,
    footer: [],
    // onOk() {
    //   console.log('OK');
    // },
    // onCancel() {
    //   console.log('Cancel');
    // },
  });
};
