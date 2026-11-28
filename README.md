# DevBox 前端开发工具箱

> 浏览器里的瑞士军刀:JSON 格式化、时间戳转换、URL/Base64 编解码、SHA 哈希、颜色转换、UUID 生成。
> **纯前端 · 零依赖 · 零构建** —— 打开网页即用,数据永远不出浏览器。

![Node](https://img.shields.io/badge/node-%E2%89%A518-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![Tests](https://img.shields.io/badge/tests-35%20passing-success)

## ✨ 工具一览

| 工具 | 能力 |
|------|------|
| 🧾 JSON | 格式化 / 压缩 / 递归键排序,报错带可读提示 |
| ⏱ 时间戳 | 秒/毫秒自动识别;支持任意 IANA 时区(含半小时时区),非法日期严格校验不静默顺延 |
| 🔗 URL | `encodeURIComponent` 编码 / 解码,非法转义明确报错 |
| 🔐 Base64 | UTF-8 安全(中文、emoji 不乱码),往返一致 |
| #️⃣ SHA | SHA-1/256/384/512,基于浏览器原生 WebCrypto |
| 🎨 颜色 | HEX ⇄ RGB ⇄ HSL,色块实时预览,支持 `rgb()` 输入 |
| 🆔 UUID | RFC 4122 v4 批量生成(去重),格式校验 |

**工程亮点**

- 🧪 **35 个单元测试**:核心逻辑全部拆成纯函数模块,用 Node 内置 `node:test` 驱动,**测试框架也是零依赖**
- 🧩 **逻辑与 UI 分离**:`src/*.js` 是纯函数,浏览器与 Node 双端复用
- 🔒 **无服务器**:没有网络请求、没有埋点,天然适合处理敏感配置
- 📱 响应式布局,移动端可用

## 🌐 在线使用

推送后可在 GitHub Pages 直接访问(Settings → Pages → 选择 `main` 分支根目录):

> https://jake1266.github.io/devbox/

## 💻 本地运行

```bash
git clone https://github.com/JAKE1266/devbox.git
cd devbox

python -m http.server 8000      # 或 npx serve .
# 打开 http://localhost:8000
```

> ⚠️ 页面使用 ES Modules,**直接双击 `index.html`(file:// 协议)无法运行**,
> 需要通过任意静态服务器访问 —— 这是浏览器安全策略,不是缺陷。

## 🧪 运行测试

```bash
npm test          # 即 node --test,35 个用例
```

测试覆盖:已知向量(如 `sha256("abc")`)、往返一致性、边界与时区(UTC / 上海 / 纽约 1 月 / 印度 +5:30)、
非法输入路径(坏 JSON、坏 Base64、`%ZZ`、`2026-02-30` 静默顺延防护)。

## 📁 项目结构

```
devbox/
├── index.html            # 单页应用骨架
├── assets/
│   ├── style.css         # 暗色主题样式
│   └── app.js            # UI 编排(只做取数与渲染)
├── src/                  # 纯函数核心模块(浏览器 / Node 双端复用)
│   ├── jsonfmt.js        #   解析/格式化/压缩/键排序
│   ├── timestamp.js      #   秒毫秒归一、IANA 时区互转、相对时间
│   ├── codec.js          #   URL / Base64(UTF-8 安全)
│   ├── colorconv.js      #   HEX ⇄ RGB ⇄ HSL
│   ├── identity.js       #   UUID v4 生成与校验
│   └── hash.js           #   WebCrypto SHA 系列
├── tests/*.test.js       # 35 个 node:test 用例
└── .github/workflows/ci.yml  # CI:三系统 × Node 20/24
```

## ❓ 常见问题

**Q: 为什么不打包、不用框架?**
单页小工具用原生 ES Modules 足够,零构建意味着克隆即可改、部署即上传,
供应链依赖为零。

**Q: 数据会上传吗?**
不会。所有转换在你浏览器里完成,页面不发出任何网络请求(哈希用的是浏览器内置 WebCrypto)。

**Q: 时间戳转换怎么处理时区?**
基于 `Intl.DateTimeFormat` 的 IANA 时区数据,支持任意时区与半小时偏移(如印度 +5:30),
并按目标时区的真实墙钟时间换算;1 月的纽约与 7 月的纽约偏移不同也会正确处理。

**Q: GitHub Pages 部署麻烦吗?**
推送后到仓库 Settings → Pages → Source 选 `main` 分支 / 根目录即可,无需任何构建步骤。

## 🗺 路线图

- [ ] 二维码生成(自研编码器)
- [ ] JWT 解码器
- [ ] Cron 表达式解释器
- [ ] 深色/浅色主题切换

## 📄 许可证

[MIT](LICENSE) —— 可自由使用、修改与分发。

---

*同系列项目:[PyToolBox](https://github.com/JAKE1266/py-toolbox) 多功能工具箱 · [CashBook](https://github.com/JAKE1266/cashbook) 命令行记账本 · [gitdash](https://github.com/JAKE1266/gitdash) Git 终端仪表盘 · [csvq](https://github.com/JAKE1266/csvq) SQL 查 CSV · [cjktable](https://github.com/JAKE1266/cjktable) CJK 排版微库 · [duviz](https://github.com/JAKE1266/duviz) 磁盘占用可视化 · [httpoke](https://github.com/JAKE1266/httpoke) HTTP 调试工具 · [mdown](https://github.com/JAKE1266/mdown) Markdown→HTML · [msite](https://github.com/JAKE1266/msite) 静态文档站 · [crony](https://github.com/JAKE1266/crony) cron 表达式解析 · [pomo](https://github.com/JAKE1266/pomo) 番茄钟 · [termplot](https://github.com/JAKE1266/termplot) 终端数据图表 · [filewatch](https://github.com/JAKE1266/filewatch) 目录变更监控 · [packpeek](https://github.com/JAKE1266/packpeek) 压缩包检查与安全解压 · [statline](https://github.com/JAKE1266/statline) 统计摘要 · [difftool](https://github.com/JAKE1266/difftool) 文本差异 · [wordfreq](https://github.com/JAKE1266/wordfreq) 词频统计 · [hexview](https://github.com/JAKE1266/hexview) 十六进制查看器 · [quicktodo](https://github.com/JAKE1266/quicktodo) 待办清单 · [envcheck](https://github.com/JAKE1266/envcheck) .env 校验 · [ipcalc](https://github.com/JAKE1266/ipcalc) 子网计算器 · [quickjournal](https://github.com/JAKE1266/quickjournal) 速记日志 · [csv2md](https://github.com/JAKE1266/csv2md) CSV→Markdown · [namecase](https://github.com/JAKE1266/namecase) 命名风格转换 · [dirsinc](https://github.com/JAKE1266/dirsinc) 目录增量同步*
