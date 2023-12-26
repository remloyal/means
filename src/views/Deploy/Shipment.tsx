import { OPERATE_CONFIG } from '@/config';
import { deviceConfigParam, equipment } from '@/stores';
import { deviceOperate } from '@/utils/deviceOperation';
import { c2f, f2c } from '@/utils/utils';
import { Col, Input, InputNumber, Select } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

// 行程ID设置
export const ShipmentIdDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setOperation();
    }
  }, [state]);
  const [text, setText] = useState('');
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);

  useEffect(() => {
    init();
    window.eventBus.on('deviceConfig', deviceData => {
      setText(deviceData.shipmentId || text);
    });
    return () => {
      window.eventBus.removeAllListeners('deviceConfig');
    };
  }, []);

  const init = async () => {
    const value = device?.record.shipmentId || '';
    if (value) {
      setText(value);
    }
    setDeviceConfig(item => {
      return {
        ...item,
        shipmentId: value,
      };
    });
  };
  const handleChange = e => {
    setText(e.target.value);
    setDeviceConfig(item => {
      return {
        ...item,
        shipmentId: e.target.value,
      };
    });
  };
  const setOperation = async () => {
    if (text != device?.record.shipmentId) {
      await deviceOperate.setShipmentId(text);
    }
  };
  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('home.runLengthCoding')}</div>
      <div className="deploy-select">
        <Input onChange={handleChange} value={text} maxLength={13} />
      </div>
    </Col>
  );
};

const { TextArea } = Input;
// 行程描述设置
export const ShipmentDescribeDom = ({ state }: { state: boolean }) => {
  useEffect(() => {
    if (state) {
      setOperation();
    }
  }, [state]);
  const [text, setText] = useState('');
  const { t } = useTranslation();
  const [device, setDevice] = useRecoilState(equipment);
  const [deviceConfig, setDeviceConfig] = useRecoilState(deviceConfigParam);

  useEffect(() => {
    init();
    window.eventBus.on('deviceConfig', deviceData => {
      setText(deviceData.shipmentId || text);
    });
    return () => {
      window.eventBus.removeAllListeners('deviceConfig');
    };
  }, []);

  const init = async () => {
    const value = device?.record.shipment || '';
    if (value) {
      setText(value);
    }
    setDeviceConfig(item => {
      return {
        ...item,
        shipment: value,
      };
    });
  };
  const handleChange = e => {
    let val = e.target.value.trim();
    if (Buffer.from(val, 'utf-8').length >= 270) {
      const buffer = Buffer.from(val, 'utf-8');
      val = buffer.subarray(0, 269).toString().replaceAll('�', '');
      setText(val);
    } else {
      setText(val);
    }
    setDeviceConfig(item => {
      return {
        ...item,
        shipment: val,
      };
    });
  };

  const setOperation = async () => {
    if (text != device?.record.shipment) {
      const textList = getNewStrArrByByte(text);
      console.log(textList);
      await deviceOperate.setShipmentDescribe(textList);
    }
  };
  /**
   * 根据字符串每个字符的字节大小分割
   */
  function getNewStrArrByByte(str: string, len = 40) {
    const strList = str.split('');
    const strArr: string[] = [];
    let size = 0;
    let term = 0;
    strList.forEach((item, index) => {
      const extent = Buffer.byteLength(item, 'utf8');
      if (size + extent < len) {
        strArr[term] = (strArr[term] || '') + (item || '\xa0');
        size = size + extent;
      } else {
        term++;
        strArr[term] = (strArr[term] || '') + (item || '\xa0');
        size = extent;
      }
    });
    return strArr;
  }

  return (
    <Col span={8}>
      <div style={{ padding: '10px 0' }}>{t('home.journeyDescription')}</div>
      <div className="deploy-select">
        <TextArea
          value={text}
          onChange={handleChange}
          style={{ height: '120px', resize: 'none' }}
          className="textarea-input"
        />
      </div>
    </Col>
  );
};
