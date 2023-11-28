import brand from '@assets/brand.png';
import { Menu, MenuItem } from './Menu';
import { UserOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';

const Header: React.FC = () => {
  return (
    <div className="header">
      <Row>
        <Col span={4}>
          <img className="brand-img" src={brand} />
        </Col>
        <Col span={16}>
          <div className="header-center">
            <Menu></Menu>
          </div>
        </Col>
        <Col span={4}>
          <div className="header-right">
            {/* 用户登录 */}
            {/* <UserOutlined /> */}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Header;
