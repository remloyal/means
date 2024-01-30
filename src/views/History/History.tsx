import { MainBody, MainRight } from '@/components/main';
import {
  analysisState,
  deviceData,
  deviceDataCache,
  deviceSelectKey,
  equipment,
  historyDevice,
  resize,
} from '@/stores';
import {
  Button,
  DatePicker,
  Input,
  Modal,
  Radio,
  RadioChangeEvent,
  Select,
  Space,
  Spin,
  Table,
  TableProps,
  Tooltip,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { ipcRenderer } from 'electron';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { AnalysisPage, AnalysisPageLeft } from './AnalysisPage';
import { Maximum } from '@/config';
const { RangePicker } = DatePicker;

const History: React.FC = () => {
  const pageState = useRecoilValue(analysisState);
  return (
    <div className="summary">
      <MainBody style={{ position: 'relative', overflow: 'auto' }}>
        <HistoryMain />
        {pageState ? (
          <></>
        ) : (
          <div className="summary-analysis">
            <AnalysisPage />
          </div>
        )}
      </MainBody>
      {pageState ? (
        <></>
      ) : (
        <div className="analysis-right" style={{ position: 'relative', zIndex: 10 }}>
          <AnalysisPageLeft />
        </div>
      )}

      <MainRight style={{ position: 'relative', display: pageState ? 'block' : 'none' }}>
        <HistoryRight />
      </MainRight>
    </div>
  );
};

interface RecordType {
  id: number;
  cloudStorage: string;
  type: string;
  datanName: string | number;
  startTime: string | number;
  dataConunt: string | number;
  maxTemperature: string | number;
  minTemperature: string | number;
}

const HistoryMain = () => {
  const { t } = useTranslation();
  const [unit, setUnit] = useState('\u2103');
  const StorageMethod = [t('history.local'), t('history.clouds')];
  const columns: TableProps<RecordType>['columns'] = [
    {
      title: <span className="font-14">{t('home.serialNumber')}</span>,
      dataIndex: 'id',
      width: 60,
      align: 'center',
      render: (text, record, index) => `${index + 1}`,
    },
    // {
    //   title: <span className="font-14">{t('history.cloudStorage')}</span>,
    //   dataIndex: 'cloudStorage',
    //   width: 60,
    //   align: 'center',
    //   render(value, record, index) {
    //     return (
    //       <Tooltip title={t('history.uploadPlatform')} destroyTooltipOnHide={true}>
    //         <i
    //           className="iconfont icon-yunduanshangchuan"
    //           style={{ fontSize: '20px', color: 'var(--bg-to-color)' }}
    //         ></i>
    //       </Tooltip>
    //     );
    //   },
    // },
    {
      title: <span className="font-14">{t('left.equipmentModel')}</span>,
      dataIndex: 'type',
      width: 80,
      align: 'center',
    },
    {
      title: <span className="font-14">{t('history.dataName')}</span>,
      dataIndex: 'dataName',
      width: 260,
      align: 'center',
    },
    {
      title: <span className="font-14">{t('history.startTime')}</span>,
      dataIndex: 'startTime',
      width: 180,
      align: 'center',
      render(value) {
        return (
          <span>
            {dayjs(value).format(`${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`)}
          </span>
        );
      },
    },
    {
      title: <span className="font-14">{t('home.runLengthCoding')}</span>,
      dataIndex: 'runLengthCoding',
      width: 160,
      align: 'center',
      render(value: any, record: any, index: number) {
        const data = record.otherData.record;
        if (data.shipmentId) {
          return <span>{data.shipmentId}</span>;
        } else {
          return <></>;
        }
      },
    },
    {
      title: <span className="font-14">{t('history.currentNumberEntries')}</span>,
      dataIndex: 'dataCount',
      width: 80,
      align: 'center',
    },
    {
      title: <span className="font-14">{`S1(${t('left.maximumValue')})`}</span>,
      dataIndex: 'maxTemperature',
      width: 80,
      align: 'center',
      render(value: any, record: any, index: number) {
        return (
          <span>
            {record.temperature.max ? record.temperature.max.toFixed(1) : '0.0'}
            {unit}
          </span>
        );
      },
    },
    {
      title: <span className="font-14">{`S1(${t('left.minimumValue')})`}</span>,
      dataIndex: 'minTemperature',
      width: 80,
      align: 'center',
      render(value: any, record: any, index: number) {
        return (
          <span>
            {record.temperature.min ? record.temperature.min.toFixed(1) : '0.0'}
            {unit}
          </span>
        );
      },
    },
    {
      title: <span className="font-14">{t('history.storeWay')}</span>,
      dataIndex: 'dataStorage_type',
      width: 80,
      align: 'center',
      render(value: any, record: RecordType, index: number) {
        return <span>{StorageMethod[value]}</span>;
      },
    },
  ];

  const [axle, setAxle] = useState<number>(600);
  const [deviceRecord, setDeviceRecord] = useState([]);
  const resizeData = useRecoilValue(resize);
  const device = useRecoilValue(equipment);
  const [deviceList, setDeviceList] = useRecoilState(deviceData);
  const [deviceListKey, setDeviceListKey] = useRecoilState(deviceSelectKey);
  const [paramCache, setParamCache] = useRecoilState(deviceDataCache);
  useEffect(() => {
    const Y = document.getElementsByClassName('summary-main')[0].clientHeight;
    if (!Y) return;
    if (resizeData >= 1500) {
      setAxle(Y - 120);
    } else {
      setAxle(Y - 150);
    }
  }, [resizeData]);

  useEffect(() => {
    setDeviceRecord(deviceList);
    setSelectedRowKeys([]);
  }, [deviceList]);

  const getRowClassName = (record, index) => {
    let className = '';
    className = index % 2 === 0 ? 'oddRow' : 'evenRow';
    return className;
  };

  useEffect(() => {
    getData();
    getList();
    if (paramCache.deviceSelectKey) {
      setDeviceListKey(paramCache.deviceSelectKey);
      setSelectedRowKeys(paramCache.deviceSelectKey);
    }
  }, []);
  useEffect(() => {
    setParamCache(res => {
      return { ...res, deviceSelectKey: [...deviceListKey] };
    });
  }, [deviceListKey]);
  const getList = () => {
    ipcRenderer.on('renewDevice', async (event, data) => {
      if (data && data.length > 0) {
        setDeviceList(data);
      }
    });
  };
  const getData = async () => {
    const data = await ipcRenderer.invoke('queryDevice');
    setDeviceList(data);
    // const multidUnit = device?.record.multidUnit;
    // if (parseInt(multidUnit) == 1) {
    //   setUnit('\u2109');
    // } else {
    //   setUnit('\u2103');
    // }
    setTimeout(() => {
      setSelectedRowKeys(deviceListKey);
    });
  };
  const handleRowClick = event => {
    const index = selectedRowKeys.findIndex(item => item == event.id);
    if (index != -1) {
      const keys = [...selectedRowKeys];
      keys.splice(index, 1);
      setSelectedRowKeys(keys);
      setDeviceListKey(keys);
    } else {
      const keys = Array.from(new Set([...selectedRowKeys, event.id]));
      setSelectedRowKeys(keys);
      setDeviceListKey(keys);
    }
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const onSelectChange = (neWselectedRowKeys, selectedRows, info: { type }) => {
    // console.log('selectedRowKeys changed: ', neWselectedRowKeys, selectedRows, info);
    setSelectedRowKeys(neWselectedRowKeys);
    setDeviceListKey(neWselectedRowKeys);
  };

  const rowSelection = {
    columnWidth: 26,
    selectedRowKeys,
    onClick: onSelectChange,
    onChange: onSelectChange,
  };

  return (
    <>
      <div style={{ padding: 0 }} className="tableTitle">
        <Table
          bordered={false}
          // virtual
          size="small"
          columns={columns}
          scroll={{ x: 900, y: axle }}
          rowKey="id"
          dataSource={deviceRecord}
          // pagination={false}
          rowClassName={getRowClassName}
          rowSelection={rowSelection}
          onRow={record => {
            return {
              onClick: event => handleRowClick(record), // 点击行
            };
          }}
        />
      </div>
    </>
  );
};

const format = 'YYYY-MM-DD HH:mm:ss';
const HistoryRight = () => {
  const { t } = useTranslation();

  const [deviceList, setDeviceList] = useRecoilState(deviceData);
  const [deviceListKey, setDeviceListKey] = useRecoilState(deviceSelectKey);
  const [paramCache, setParamCache] = useRecoilState(deviceDataCache);

  const [param, setParam] = useState<any>({
    time: ['', ''],
    dataType: 1,
    selectType: 0,
  });
  const timeChange = async (dates, dateStrings: [string, string]) => {
    if (dateStrings[0] == '' && dateStrings[1] == '') {
      setParam(res => {
        return { ...res, time: ['', ''] };
      });
    } else {
      const timeList = [dates[0].format(format), dates[1].format(format)];
      setParam(res => {
        return { ...res, time: timeList };
      });
    }
  };

  const queryDevice = async (param: any = null) => {
    const todo = await ipcRenderer.invoke('queryDevice', param);
    setDeviceList(todo);
  };

  const handleChange = value => {
    if (value == 0) {
      setParam(res => {
        return { ...res, time: ['', ''], selectType: value };
      });
      return;
    }
    const data = prevMonth(value);
    setParam(res => {
      return { ...res, time: data, selectType: value };
    });
  };
  const prevMonth = t => {
    return [
      dayjs(dayjs(new Date())).subtract(t, 'month').format('YYYY-MM-DD HH:mm:ss'),
      dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ];
  };
  const [checked, setChecked] = useState(false);
  const handleChangeCheck = e => {
    setChecked(!checked);
  };
  const DataFiltering = memo(() => {
    const [value, setValue] = useState(1);
    const dataChange = e => {
      setValue(e.target.value);
    };
    return (
      <>
        <div className="history-left">{t('home.dataFilter')}：</div>
        <Radio.Group onChange={dataChange} value={value} size="small" disabled>
          <Space direction="vertical">
            <Radio value={1}>{t('history.allData')}</Radio>
            <Radio value={2}>{t('history.localData')}</Radio>
            <Radio value={3} disabled>
              {t('history.cloudData')}
            </Radio>
          </Space>
        </Radio.Group>
      </>
    );
  });

  const EditData = () => {
    // 删除数据
    const deleteData = async () => {
      const data = getData();
      if (!data) return;
      setDeleteOpen(true);
    };

    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteOk = async () => {
      const data = getData();
      const todo = await ipcRenderer.invoke('deleteDevice', data);
      if (todo) {
        const list = [...deviceList];
        const foundArr = list.filter(item => !deviceListKey.includes(item.id));
        setDeviceList(foundArr);
        setDeviceListKey([]);
        message.success({
          content: t('history.dataDeletionSuccessful'),
        });
      } else {
        message.warning({
          content: t('history.dataDeletionFailed'),
        });
      }
      setDeleteOpen(false);
    };

    const deleteCancel = () => {
      setDeleteOpen(false);
    };

    // 更新备注
    const [open, setOpen] = useState(false);
    const [deviceSingle, setDeviceSingle] = useState<any>({});
    const [remark, setRemark] = useState('');

    const showModal = () => {
      if (deviceListKey.length === 0 || deviceListKey.length > 1) {
        return;
      }
      const foundArr = deviceList.filter(item => deviceListKey.includes(item.id));
      setDeviceSingle(foundArr[0]);
      setRemark(foundArr[0].notes);
      setOpen(true);
    };

    const hideModal = async () => {
      const data = { ...deviceSingle };
      data.notes = remark;
      const state = await ipcRenderer.invoke('updateDevice', data);
      if (state) {
        const list = [...deviceList];
        const foundindex = list.findIndex(item => item.id === data.id);
        list.splice(foundindex, 1, data);
        setDeviceList(list);
        message.success({
          content: t('history.dataUpdateSuccessful'),
        });
      } else {
        message.error({
          content: t('history.dataUpdateFailed'),
        });
      }
      setOpen(false);
    };
    const onCancel = () => {
      setOpen(false);
    };
    const remarkChange = e => {
      setRemark(e.target.value);
    };
    // 查看详情
    const [detailsState, setDetailsState] = useState(true);
    const [noteState, setNoteState] = useState(true);
    const [device, setDevice] = useRecoilState(historyDevice);
    const [compareState, setCompareState] = useState(true);
    useEffect(() => {
      if (deviceListKey.length > 1 && compareState != false) {
        setCompareState(false);
      } else {
        setCompareState(true);
      }
      if (deviceListKey.length == 1) {
        setDetailsState(false);
        setNoteState(false);
      } else {
        if (detailsState) return;
        setDetailsState(true);
        setNoteState(true);
      }
    }, [deviceListKey]);
    const viewDetails = async () => {
      const foundArr = deviceList.filter(item => deviceListKey.includes(item.id));
      const todo = await ipcRenderer.invoke('queryHistoryDevice', foundArr[0]);
      setDevice(todo);
    };
    const [pageState, setPageState] = useRecoilState(analysisState);

    const analysisPageState = () => {
      if (deviceListKey.length > Maximum) {
        Modal.warning({
          content: t('history.piecesData', { count: Maximum, select: deviceListKey.length }),
          centered: true,
        });
        return;
      }
      setPageState(false);
    };

    const [loading, setLoading] = useState(false);

    const importPDF = async () => {
      setLoading(true);
      const todo = await ipcRenderer.invoke('importPDF');
      if (todo == 'nopath') {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        return;
      }
      if (todo) {
        queryDevice();
        const msg = todo as { success: number; error: number };
        message.success(t('history.importListMsg', { success: msg.success, error: msg.error }));
      } else {
        message.error(t('history.importFailed'));
      }
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    };
    return (
      <>
        <div>
          <div className="history-left">{t('history.dataEditing')}：</div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button style={{ width: '100%' }} disabled={detailsState} onClick={viewDetails}>
              {t('history.detail')}
            </Button>
            <Button style={{ width: '100%' }} onClick={deleteData}>
              {t('history.delete')}
            </Button>
            <Button style={{ width: '100%' }} onClick={showModal} disabled={noteState}>
              {t('history.editNotes')}
            </Button>
            <Button style={{ width: '100%' }} onClick={analysisPageState} disabled={compareState}>
              {t('history.contrastAnalysis')}
            </Button>
            <Button style={{ width: '100%' }} onClick={importPDF}>
              {t('history.import')} PDF
            </Button>
          </Space>
        </div>
        <Modal
          title={t('history.modifyRemarks')}
          width={400}
          open={open}
          onOk={hideModal}
          onCancel={onCancel}
          centered
          destroyOnClose={true}
        >
          <p>{t('left.equipmentModel')}</p>
          <Input disabled value={deviceSingle.type} />
          <p>{t('left.serialNumber')}</p>
          <Input disabled value={deviceSingle.gentsn} />
          <p>{t('history.dataName')}</p>
          <Input disabled value={deviceSingle.dataName} />
          <p>{t('history.notes')}</p>
          <Input.TextArea
            autoSize={{ maxRows: 5, minRows: 3 }}
            value={remark}
            onChange={remarkChange}
          />
        </Modal>
        <Modal
          title={t('history.delete')}
          open={deleteOpen}
          onOk={deleteOk}
          onCancel={deleteCancel}
          centered
          width={300}
        >
          <p>{t('history.deleteThisData')}</p>
        </Modal>
        <Modal open={loading} centered width={200} closeIcon={null} footer={null}>
          <div
            style={{ height: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <div style={{ height: 100, width: 100 }}>
              <Spin size="large" tip={`${t('left.reading')}...`} style={{ height: 100 }}>
                <div className="content" />
              </Spin>
            </div>
          </div>
        </Modal>
      </>
    );
  };

  const getData = () => {
    if (deviceListKey.length == 0) {
      message.warning({
        content: t('history.selectHistoricalData'),
      });
      return false;
    }
    const foundArr = deviceList.filter(item => deviceListKey.includes(item.id));
    return foundArr;
  };

  // PDF 读取密码弹窗
  const PdfPassword = () => {
    useEffect(() => {
      function pdfPassword(event, data) {
        setFileName(data.fileName);
        setSaving(true);
        if (data.reason == 2) {
          message.error(t('history.passwordError'));
        }
      }
      ipcRenderer.on('pdfPassword', pdfPassword);
      return () => {
        ipcRenderer.removeAllListeners('pdfPassword');
      };
    }, []);
    const [fileName, setFileName] = useState('');
    const [saving, setSaving] = useState(false);
    const [password, setPassword] = useState('');
    const pdfEnterPassword = () => {
      if (password.length == 0) {
        message.error(t('history.enterPassword'));
        return;
      }
      ipcRenderer.invoke('pdfEnterPassword', password);
      setSaving(false);
    };
    const callPassword = () => {
      ipcRenderer.invoke('callPassword');
      setSaving(false);
    };
    const onPasswordChange = (e: any) => {
      setPassword(e.target.value);
    };
    return (
      <Modal
        open={saving}
        centered
        width={500}
        title={`PDF ${t('history.password')}`}
        closeIcon={null}
        onOk={pdfEnterPassword}
        onCancel={callPassword}
      >
        <label htmlFor="">{t('history.fileName')}：</label>
        <div style={{ padding: '10px 0' }}>{fileName}</div>
        <label htmlFor="">PDF {t('history.password')}：</label>
        <Input
          style={{ margin: '10px 0' }}
          placeholder={t('history.enterPassword')}
          onChange={onPasswordChange}
        />
      </Modal>
    );
  };
  useEffect(() => {
    if (paramCache.param) {
      setParam(paramCache.param);
    }
  }, []);

  useEffect(() => {
    queryDevice(param);
    setParamCache(res => {
      return { ...res, param };
    });
  }, [param]);
  return (
    <div style={{ padding: '0 10px' }}>
      <Space direction="vertical" size="middle">
        <div className="history-left">{t('history.timeOptions')}：</div>
        <RangePicker
          format={`${localStorage.getItem('dateFormat') || 'YYYY-MM-DD'} HH:mm:ss`}
          value={[
            param.time[0] == '' ? null : dayjs(param.time[0]),
            param.time[1] == '' ? null : dayjs(param.time[1]),
          ]}
          showTime
          size="small"
          onChange={timeChange}
          // style={{ height: '30px' }}
        />
        <div className="history-left">{t('history.quickView')}：</div>
        <div className="deploy-select" style={{ padding: '0' }}>
          <Select
            style={{ width: '100%' }}
            value={param.selectType}
            onChange={handleChange}
            popupClassName="deploy-select-popup"
            options={[
              { value: 0, label: t('history.all') },
              { value: 1, label: t('history.oneMonth') },
              { value: 3, label: t('history.threeMonths') },
              { value: 6, label: t('history.sixMonths') },
            ]}
          />
        </div>
        <div className="history-left">{t('history.alarmOption')}：</div>
        <Radio.Group value={checked} disabled>
          <Radio onClick={handleChangeCheck} value={true}>
            {t('history.alarmEquipment')}
          </Radio>
        </Radio.Group>
        <DataFiltering />
        <EditData />
      </Space>
      <PdfPassword />
    </div>
  );
};

export default History;
