import { ConfigProvider } from 'antd';

export const MainBody = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <div className="summary-main" style={style}>
      <ConfigProvider theme={Theme}>{children}</ConfigProvider>
    </div>
  );
};

export const MainRight = ({ children }) => {
  return (
    <ConfigProvider theme={Theme}>
      <div className="summary-right">{children}</div>
    </ConfigProvider>
  );
};

export const MainLeft = ({ children }) => {
  return <ConfigProvider theme={Theme}>{children}</ConfigProvider>;
};

const Theme = {
  components: {
    Tabs: {
      inkBarColor: '#f4860f',
      itemActiveColor: '#f4860f',
      itemSelectedColor: '#f4860f',
    },
    Radio: {
      buttonSolidCheckedBg: 'var(--bg-color)',
    },
    Descriptions: {
      contentColor: '#FFFFFF',
      titleColor: '#FFFFFF',
      extraColor: '#ffffff',
    },
  },
};
