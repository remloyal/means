import { ConfigProvider } from 'antd';

export const MainBody = ({ children }) => {
  return (
    <div className="summary-main">
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
