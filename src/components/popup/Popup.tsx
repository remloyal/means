import { CloseOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import './popup.scss';
interface PopupProps {
  title?: string;
  content: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
  width?: number | string;
}

const { confirm } = Modal;
export const Popup = ({ title, content, onClose, onConfirm, width }: PopupProps) => {
  const confirmData = confirm({
    width: width,
    title: (
      <div className="popup-title">
        <div
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
    icon: null,
    wrapClassName: 'popup',
    maskClosable: true,
    content: content,
    centered: true,
    footer: [],
    onOk() {
      onClose && onClose();
    },
    onCancel() {
      onConfirm && onConfirm();
    },
  });
};
