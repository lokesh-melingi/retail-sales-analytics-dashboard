# 📊 Retail Sales Analytics Dashboard

A modern and interactive Retail Sales Analytics Dashboard built to analyze sales performance, identify business trends, and provide data-driven insights through beautiful visualizations and forecasting.

## 🚀 Live Demo
🔗 Add your deployed application link here

## 📂 GitHub Repository
🔗 https://github.com/varalaxmimaripi-droid/retail-sales-analytics-dashboard

---

## 📖 Project Overview

The Retail Sales Analytics Dashboard helps businesses monitor sales performance by visualizing important metrics such as revenue, profit, orders, customer trends, and sales forecasting. It provides an intuitive interface for exploring data and making informed business decisions.

---

## ✨ Features

- 📈 Interactive Sales Dashboard
- 📊 Revenue & Profit Analysis
- 🛍️ Product Performance Insights
- 👥 Customer Analytics
- 📅 Time-Based Sales Trends
- 🔮 Sales Forecasting
- 📉 Responsive Charts & Graphs
- 🌙 Modern Responsive UI
- ⚡ Fast Performance

---

## 🛠️ Technologies Used

- TypeScript
- React
- Vite
- Tailwind CSS
- TanStack Router
- Modern JavaScript (ES6+)

---

## 📁 Project Structure

```
retail-sales-analytics-dashboard/
│── src/
│── public/
│── components/
│── routes/
│── styles.css
│── vite.config.ts
│── package.json
│── README.md
```

---

## 📸 Screenshots

> Add screenshots of your dashboard here.

---

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
is a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.
