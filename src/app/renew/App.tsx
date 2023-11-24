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
    forceUpdate: 0,
  });
  const [content, setContent] = useState<any>(null);
  const [updateType, setUpdateType] = useState(0);
  useEffect(() => {
    ipcRenderer.on('version', async (event, data) => {
      console.log(data);
      setVersion({
        ...version,
        old: data.old,
        new: data.new,
        forceUpdate: data.forceUpdate || 0,
      });
      setUpdateType(data.updateType);
      setContent(data.data.content);
    });
    ipcRenderer.on('updateProgressing', async (event, data) => {
      setPercent(data);
      if (data == 100 && updateType == 0) {
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
            // handleOk();
          },
        });
      }, 1000);
    });

    ipcRenderer.on('automaticUpdateFail', async (event, data) => {
      setState(false);
      Modal.destroyAll();
      Modal.info({
        content: <div>{t('renew.updateAgain')}</div>,
        onOk() {
          startUpdating();
        },
      });
    });
    ipcRenderer.on('language', async (event, data) => {
      console.log(data);
      i18n.changeLanguage(data);
    });

    //更新已下载
    ipcRenderer.on('updateDownloaded', (event, data) => {
      const installModal = Modal.info({
        title: t('renew.applyUpdate'),
        content: <div>退出并安装程序</div>,
        onOk() {
          ipcRenderer.invoke('quit-and-install');
          installModal.destroy();
        },
      });
    });
  }, []);

  const [state, setState] = useState(false);
  const startUpdating = () => {
    setState(true);
    ipcRenderer.invoke('startUpdate');
  };
  const [percent, setPercent] = useState(0);
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
    if (updateType == 0) {
      ipcRenderer.invoke('startUpdate');
    }
    if (updateType == 1) {
      // 全量更新错误，重新检查下载
      ipcRenderer.invoke('startUpdate');
    }
  };
  const cancelUpdating = () =>{
    // 关闭窗口
    ipcRenderer.invoke('cancelUpdate');
  }
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
        <Button onClick={startUpdating} disabled={state} type="primary">
          {t('renew.startUpdating')}
        </Button>
        {version.forceUpdate == 0 ? (
          <Button onClick={ cancelUpdating} disabled={state} style={{ marginLeft: '20px' }}>
            {t('home.cancellation')}
          </Button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default App;
