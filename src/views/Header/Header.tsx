import brand from "@assets/brand.png";
import { Menu, MenuItem } from "./Menu";
import { UserOutlined } from "@ant-design/icons";

const Header: React.FC = () => {
  return (
    <div className="header">
      <img className="brand-img" src={brand} />
      <div className="header-center">
        <Menu></Menu>
      </div>
      <div className="header-right">
        <UserOutlined />
      </div>
    </div>
  );
};

export default Header;
