# IntelliEvent-UI
基于大模型的智能活动策划与管理平台-前端

## 产品目标
构建一个面向企业活动的全流程平台，覆盖活动创建、执行、复盘与资产沉淀，并融合 AI 实现活动方案生成、物料清单、预算分析、风险识别与内容产出。

## 技术栈
- Vue 3 + TypeScript + Vite
- Element Plus + Pinia + Vue Router 4
- Axios + ECharts

## 现有页面能力
- 活动列表 / 活动详情
- 智能策划生成
- 智能创作中心（邮件/通知、主持稿等）
- 数据报表
- 知识库
- 组织、用户、角色、权限、系统配置

## 前端架构
- 路由驱动模块化：activity / ai / admin 子路由
- 组件封装：AimiForm、AimiTable、AimiDialog、AimiSearchForm
- 状态管理：活动、通知、待办等使用 Pinia
- 配置驱动页面：config.ts 定义表格/表单

## 核心体验设计
- 活动创建：基础信息 + AI 辅助生成策划
- 活动执行：任务、预算、物料、人员
- 活动复盘：报告生成、指标分析
- 知识沉淀：模板、清单、复盘案例

## AI 功能规划（前端视角）
- 活动策划生成：基于活动类型、规模、预算、地点
- 预算分析与优化建议
- 风险识别与应急预案
- 话术/邮件/邀请函/主持稿生成
- 复盘报告自动生成

## 前后端接口契约（示例）
- /activities/page：分页查询活动
- /activities/{id}：活动详情
- /ai/plan/generate：活动策划生成
- /ai/budget/analyze：预算分析
- /ai/risk/identify：风险识别
- /knowledge/template/page：模板库
- /report/activity/summary：活动复盘报告

## 迭代路线（前端）
1. 完成活动列表、详情、创建与编辑的真实 API 接入
2. 将 AI 相关功能从本地模拟迁移为真实服务调用
3. 将知识库/报表与后端数据联动
4. 增强协作能力：角色权限、任务分配、通知中心
5. 增强可视化：活动趋势、预算结构、ROI 分析

## 开发说明
- 使用 <script setup> + 组合式 API
- 优先使用封装组件与配置驱动页面
- 表单与表格配置集中在同级 config.ts
