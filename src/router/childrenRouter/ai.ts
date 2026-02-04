// AI相关子路由
export const aiRoutes = [
  {
    path: 'ai/generate',
    name: 'AIGenerate',
    component: () => import('@/views/ai/generate/index.vue'),
    meta: {
      title: 'AI生成',
      icon: 'Cpu',
      isShow: true
    }
  }
]