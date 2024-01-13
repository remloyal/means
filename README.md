# 环境配置

安装node ,版本 > 16.0.0

安装 node-gyp

参考 [node-gpy](https://www.npmjs.com/package/node-gyp)

```

npm install -g node-gyp

```

## 配置 node-gyp 环境

### 手动安装工具和配置：

安装 Visual C++ 生成环境：按照 node-gyp 文档提示 推荐使用 [Visual Studio Build Tools](https://visualstudio.microsoft.com/zh-hans/thank-you-downloading-visual-studio/?sku=BuildTools) 安装，选择 Visual studio 2019，并勾选下方选项耐心等待。。。
<img  src='https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bafe706d75e2480ebaacca1882166371~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?'>

参考 [node-gyp 环境配置](https://juejin.cn/post/7042123168722452516)

安装 Python 环境 （当前应用建议大于 3.9）

设置 npm 的 Python 路径

```
npm config set python "D:\app\python\python.exe"

```

安装 node-gyp 依赖项

进入 node 的根目录，找到 install_tools.bat 脚本文件 ，点击运行 （中间卡住按回车键）

```
//设置淘宝镜像
npm config set registry  https://registry.npmmirror.com

npm config set electron_mirror https://registry.npmmirror.com

```

重够依赖

```
npm cache clean --force

rimraf node_modules

./node_modules/.bin/electron-rebuild.cmd

npm rebuild

```

electron-bulider 打包特别慢解决办法
参考 [打包特别慢解决办法](https://blog.csdn.net/sinat_41292836/article/details/108002416)
