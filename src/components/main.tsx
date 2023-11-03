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
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              inkBarColor: '#f4860f',
              itemActiveColor: '#f4860f',
              itemSelectedColor: '#f4860f',
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </div>
  );
};

export const MainRight = ({ children }) => {
  return <div className="summary-right">{children}</div>;
};
