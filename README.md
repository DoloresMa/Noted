# 温柔情绪瞬间（Gentle Moments）

一个优先移动端的极简情绪瞬间记录 Web App：
- 无账号、无社交、无打卡
- 本地存储（IndexedDB）
- PWA 可安装，离线可打开并查看已缓存内容

## 技术栈

- React 18 + Vite + TypeScript
- Tailwind CSS
- IndexedDB（idb）
- React Router

## 功能覆盖

- Home `/`：
  - 两个入口：`🌤 现在挺好的` / `🌧 现在有点难受`
  - Good：文本 + 可选单标签
  - Bad：文本 + 强度滑条（0-10，默认 5）
  - 保存后 2 秒提示并返回
- Timeline `/timeline`：
  - 月历 6x7 网格，含上月/下月补齐
  - 每天显示点阵（`●` bad、`○` good，最多 3 个，超出显示 `+`）
  - 点击某天弹出 Bottom Sheet，按时间倒序查看并可展开全文
- Review `/review`：
  - 按月统计总数与 good/bad 数
  - 固定文案：`生活没有只朝一个方向走。`
- Settings `/settings`：
  - 导出 JSON
  - 导入 JSON（合并/覆盖，默认合并）
  - 清空本地数据（确认）

## 数据模型

```ts
interface Entry {
  id: string
  timestamp: number
  type: 'good' | 'bad'
  text: string
  intensity?: number
  tag?: string
  createdAt: number
}
```

IndexedDB：
- DB: `gentle-moments-db`
- Store: `entries`
- Index: `timestamp`, `createdAt`

已提供：
- `getEntriesByMonth(year, month)`
- `groupEntriesByDay(entries)`（用于日历点阵）

## 项目结构

```text
gentle-moments-app/
  public/
    manifest.webmanifest
    sw.js
    icon.svg
  src/
    components/
      AppLayout.tsx
      BottomNav.tsx
    lib/
      data-refresh.tsx
      date.ts
      db.ts
      id.ts
      pwa.ts
    pages/
      HomePage.tsx
      TimelinePage.tsx
      ReviewPage.tsx
      SettingsPage.tsx
    types/
      entry.ts
    App.tsx
    main.tsx
    styles.css
  index.html
  package.json
  tailwind.config.js
  postcss.config.js
  tsconfig.json
  tsconfig.node.json
```

## 本地运行

```bash
cd gentle-moments-app
npm install
npm run dev
```

默认开发地址：`http://localhost:5173`

## 构建与部署

```bash
npm run build
npm run preview
```

`dist/` 可直接部署到 Vercel / Netlify（静态站点）。

## PWA 说明

- 已配置 `manifest.webmanifest`
- 已注册 `public/sw.js`
- 首次在线访问后，静态资源会缓存，离线可再次打开与查看已缓存页面

## 验收自测清单

1. 不登录可创建记录，刷新后仍存在（IndexedDB）。
2. Home 能在 1 分钟内完成 good/bad 记录。
3. Timeline 显示当月 6x7 日历，点阵与记录类型数量匹配。
4. 点击日期可在底部抽屉看到当天所有记录（时间倒序，可展开）。
5. Review 可按月正确统计 good/bad 与总数。
6. 导出 JSON -> 清空 -> 导入 JSON，可恢复数据。
7. 可安装 PWA，离线能打开并查看已有记录。
