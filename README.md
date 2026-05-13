# 人生履迹地图

可视化个人人生地理轨迹的 Web 应用。

## 访问地址

https://ninjiayu.github.io/life-map/

## 功能

- 中国地级市地图可视化
- 按省→市选择并录入到访记录
- 五种到访类型：常驻、求学、工作/出差、旅游、途经
- 每座城市支持多条记录 + 一句话记忆
- 时间轴视图
- 数据导入/导出（JSON）
- 海报生成与分享
- 本地 localStorage 持久化

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- ECharts（中国地图 GeoJSON）
- Zustand（状态管理）
- modern-screenshot（海报生成）

## 本地开发

```bash
npm install
npm run dev
```

## 部署

项目已配置 GitHub Actions 自动部署到 GitHub Pages。每次 push 到 main 分支会自动触发构建与部署。
