interface MenuConfig {
  name: string;
  clock: () => void;
  icon: React.FC<{}>;
}
