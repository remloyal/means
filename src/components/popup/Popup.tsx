import { CloseOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import './popup.scss';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
interface PopupProps {
  title?: string;
  content: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
  width?: number | string;
  t: TFunction;
}

const { confirm } = Modal;
export const Popup = ({ title, content, onClose, onConfirm, width, t }: PopupProps) => {
  const confirmData = confirm({
    width,
    title: (
      <div className="popup-title">
        <div
          onClick={() => {
            confirmData.destroy();
          }}
        >
          {t(title!)}
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
    content,
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
