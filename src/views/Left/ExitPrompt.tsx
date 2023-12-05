import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { Modal, Radio, RadioChangeEvent, Space, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
export const QuitPrompt = () => {
  const { t } = useTranslation();
  useEffect(() => {
    ipcRenderer.on('exitPrompt', (event, data) => {
      //   setResizeData(data);
      setQuitState(true);
    });
    ipcRenderer.on('exitType', (event, err) => {
      //   setLoading(false);
      //   alert(t('left.errotText'));
    });
  }, []);
  const [quitState, setQuitState] = useState(false);
  const [value, setValue] = useState(1);
  const onChange = (e: RadioChangeEvent) => {
    setValue(e.target.value);
  };
  const onExit = async () => {
    setQuitState(false);
    ipcRenderer.invoke('exitType', value);
  };
  return (
    <>
      <Modal
        open={quitState}
        centered
        width={400}
        maskClosable={false}
        title={t('left.exitPrompt')}
        onCancel={() => setQuitState(false)}
        onOk={onExit}
        // footer={null}
      >
        <div style={{ padding: '20px' }}>
          <Radio.Group onChange={onChange} value={value}>
            <Space direction="vertical">
              <Radio value={1}>{t('left.minimizeTray')}</Radio>
              <Radio value={2}>{t('left.exitApp')}</Radio>
            </Space>
          </Radio.Group>
        </div>
      </Modal>
    </>
  );
};
