import { Button, Modal, Progress } from 'antd';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

let modalData: any = null;
const App = () => {
  const { t, i18n } = useTranslation();
  const create = () => {
    ipcRenderer.send('openMain');
  };
  const [version, setVersion] = useState({
    new: '0.0.0',
    old: '0.0.0',
  });
  const [content, setContent] = useState<any>(null);
  useEffect(() => {
    ipcRenderer.on('version', async (event, data) => {
      console.log(data);
      setVersion({
        old: data.old,
        new: data.new,
      });
      setContent(data.data.content);
    });
    ipcRenderer.on('updateProgressing', async (event, data) => {
      setPercent(data);
      if (data == 100) {
        showModal();
      }
    });
    ipcRenderer.on('updateFail', async (event, data) => {
      setTimeout(() => {
        setState(false);
        Modal.destroyAll();
        Modal.info({
          content: <div>{t('renew.updateAgain')}</div>,
          onOk() {
            handleOk();
          },
        });
      }, 1000);
    });
    ipcRenderer.on('language', async (event, data) => {
      console.log(data);
      i18n.changeLanguage(data);
    });
  }, []);
  const [state, setState] = useState(false);
  const startUpdating = () => {
    setState(true);
    ipcRenderer.invoke('startUpdate');
  };
  const [percent, setPercent] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    if (modalData) return;
    modalData = Modal.info({
      title: t('renew.applyUpdate'),
      content: <div>{t('renew.restartUpdatenow')}</div>,
      onOk() {
        handleOk();
      },
    });
  };

  const handleOk = () => {
    setIsModalOpen(false);
    ipcRenderer.invoke('restartNow');
  };
  return (
    <div className="renew">
      <div>
        {t('renew.currentVersion')}：{version.old}
      </div>
      <div>
        {t('renew.latestVersion')}：{version.new}
      </div>
      <div>
        {t('renew.updat')}：{content ? content ?? '无' : '--'}
      </div>
      {state ? (
        <div>
          {t('renew.downloadProgress')}：
          <Progress percent={Math.floor(percent)} />
        </div>
      ) : (
        ''
      )}
      <div style={{ textAlign: 'center' }}>
        <Button onClick={startUpdating} disabled={state}>
          {t('renew.startUpdating')}
        </Button>
      </div>
    </div>
  );
};

export default App;
