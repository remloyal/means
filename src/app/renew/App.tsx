import { Button, Modal, Progress } from 'antd';
import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';

let modalData: any = null;
const App = () => {
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
        Modal.destroyAll();
        Modal.info({
          content: <div>更新发生错误，请联系管理员！</div>,
          onOk() {
            handleOk();
          },
        });
      }, 1000);
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
      title: '应用更新',
      content: <div>立即重启更新！</div>,
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
      <div>当前版本：{version.old}</div>
      <div>最新版本：{version.new}</div>
      <div>更新内容：{content ? content ?? '无' : '--'}</div>
      {state ? (
        <div>
          下载进度：
          <Progress percent={percent} />
        </div>
      ) : (
        ''
      )}
      <div style={{ textAlign: 'center' }}>
        <Button onClick={startUpdating}>开始更新</Button>
      </div>
    </div>
  );
};

export default App;
