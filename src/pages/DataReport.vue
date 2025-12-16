<template>
  <div class="data-report">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>数据报告中心</h2>
      <p class="subtitle">数据驱动的活动洞察与决策支持</p>
    </div>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon size="40"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalActivities }}</div>
              <div class="stat-label">总活动数</div>
              <div class="stat-trend up">
                <el-icon><Top /></el-icon>
                +12.5%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon budget">
              <el-icon size="40"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ formatBudget(totalBudget) }}</div>
              <div class="stat-label">总预算</div>
              <div class="stat-trend down">
                <el-icon><Bottom /></el-icon>
                -5.2%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon participants">
              <el-icon size="40"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalParticipants }}</div>
              <div class="stat-label">总参与人数</div>
              <div class="stat-trend up">
                <el-icon><Top /></el-icon>
                +8.7%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon completion">
              <el-icon size="40"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ completionRate }}%</div>
              <div class="stat-label">完成率</div>
              <div class="stat-trend up">
                <el-icon><Top /></el-icon>
                +3.1%
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>活动类型分布</h3>
              <el-button text @click="refreshChart('type')">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="typeChart" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>月度活动趋势</h3>
              <el-button text @click="refreshChart('monthly')">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="monthlyChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>预算使用分析</h3>
              <el-button text @click="refreshChart('budget')">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="budgetChart" class="chart-container"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <h3>资源利用率排行</h3>
              <el-button text @click="refreshChart('resource')">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </template>
          <div ref="resourceChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 活动复盘报告 -->
    <el-card class="review-section">
      <template #header>
        <div class="card-header">
          <h3>活动复盘报告</h3>
          <el-button type="primary" @click="generateReviewReport">
            <el-icon><Star /></el-icon>
            AI生成复盘报告
          </el-button>
        </div>
      </template>
      
      <div class="review-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="activity-selector">
              <h4>选择活动</h4>
              <el-select 
                v-model="selectedActivity" 
                placeholder="请选择要复盘的活动"
                clearable
                @change="onActivitySelect"
              >
                <el-option
                  v-for="activity in completedActivities"
                  :key="activity.id"
                  :label="activity.name"
                  :value="activity.id"
                />
              </el-select>
              
              <div v-if="selectedActivityData" class="activity-info">
                <h5>活动信息</h5>
                <el-descriptions :column="1" size="small">
                  <el-descriptions-item label="类型">{{ selectedActivityData.type }}</el-descriptions-item>
                  <el-descriptions-item label="时间">{{ formatDate(selectedActivityData.date) }}</el-descriptions-item>
                  <el-descriptions-item label="地点">{{ selectedActivityData.location }}</el-descriptions-item>
                  <el-descriptions-item label="预算">{{ formatBudget(selectedActivityData.budget) }}</el-descriptions-item>
                  <el-descriptions-item label="参与人数">{{ selectedActivityData.participants }}人</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-col>
          
          <el-col :span="16">
            <div v-if="generatedReview" class="review-report">
              <div class="report-header">
                <h4>{{ selectedActivityData?.name }} - 复盘报告</h4>
                <div class="report-actions">
                  <el-button size="small" @click="exportReport">导出报告</el-button>
                  <el-button size="small" type="primary" @click="saveReport">保存报告</el-button>
                </div>
              </div>
              
              <div class="report-content">
                <div class="report-section">
                  <h5>📊 成果数据</h5>
                  <div class="section-content">{{ generatedReview.achievements }}</div>
                </div>
                
                <div class="report-section">
                  <h5>✨ 活动亮点</h5>
                  <div class="section-content">{{ generatedReview.highlights }}</div>
                </div>
                
                <div class="report-section">
                  <h5>🔍 待改进点</h5>
                  <div class="section-content">{{ generatedReview.improvements }}</div>
                </div>
                
                <div class="report-section">
                  <h5>💡 经验总结</h5>
                  <div class="section-content">{{ generatedReview.lessons }}</div>
                </div>
                
                <div class="report-section">
                  <h5>🎯 改进建议</h5>
                  <div class="section-content">{{ generatedReview.suggestions }}</div>
                </div>
              </div>
            </div>
            
            <div v-else-if="isGeneratingReview" class="generating-review">
              <el-empty description="正在生成复盘报告...">
                <el-icon class="is-loading" size="40"><Loading /></el-icon>
              </el-empty>
            </div>
            
            <div v-else class="no-review">
              <el-empty description="请选择活动并生成复盘报告">
                <el-button type="primary" @click="generateReviewReport" :disabled="!selectedActivity">
                  生成复盘报告
                </el-button>
              </el-empty>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 导出选项对话框 -->
    <el-dialog v-model="showExportDialog" title="导出报告" width="500px">
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="pdf">PDF文档</el-radio>
            <el-radio label="excel">Excel表格</el-radio>
            <el-radio label="word">Word文档</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="包含图表">
          <el-switch v-model="exportForm.includeCharts" />
        </el-form-item>
        <el-form-item label="包含数据">
          <el-switch v-model="exportForm.includeData" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showExportDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmExport">确认导出</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useActivityStore } from '../stores/activity'
import * as echarts from 'echarts'
import { Top, Bottom, Refresh, Star } from '@element-plus/icons-vue'

const store = useActivityStore()

// 图表引用
const typeChart = ref(null)
const monthlyChart = ref(null)
const budgetChart = ref(null)
const resourceChart = ref(null)

// 图表实例
let typeChartInstance = null
let monthlyChartInstance = null
let budgetChartInstance = null
let resourceChartInstance = null

// 复盘报告相关
const selectedActivity = ref(null)
const selectedActivityData = ref(null)
const generatedReview = ref(null)
const isGeneratingReview = ref(false)
const showExportDialog = ref(false)

// 导出表单
const exportForm = ref({
  format: 'pdf',
  includeCharts: true,
  includeData: true
})

// 计算属性
const totalActivities = computed(() => store.activities.length)
const totalBudget = computed(() => store.activities.reduce((sum, a) => sum + a.budget, 0))
const totalParticipants = computed(() => store.activities.reduce((sum, a) => sum + a.participants, 0))
const completionRate = computed(() => {
  const completed = store.activities.filter(a => a.status === '已完成').length
  return totalActivities.value > 0 ? Math.round((completed / totalActivities.value) * 100) : 0
})

const completedActivities = computed(() => store.activities.filter(a => a.status === '已完成'))

// 格式化函数
const formatBudget = (budget) => {
  if (!budget) return '¥0'
  return `¥${(budget / 10000).toFixed(1)}万`
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 初始化图表
const initCharts = () => {
  // 活动类型分布图
  if (typeChart.value) {
    typeChartInstance = echarts.init(typeChart.value)
    const typeData = store.activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1
      return acc
    }, {})
    
    const typeOption = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '活动类型',
          type: 'pie',
          radius: '50%',
          data: Object.entries(typeData).map(([name, value]) => ({ name, value })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }
    typeChartInstance.setOption(typeOption)
  }

  // 月度活动趋势图
  if (monthlyChart.value) {
    monthlyChartInstance = echarts.init(monthlyChart.value)
    const monthlyData = store.activities.reduce((acc, activity) => {
      const month = new Date(activity.date).getMonth() + 1
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})
    
    const monthlyOption = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '活动数量',
          type: 'line',
          data: Array.from({ length: 12 }, (_, i) => monthlyData[i + 1] || 0),
          smooth: true,
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    }
    monthlyChartInstance.setOption(monthlyOption)
  }

  // 预算使用分析图
  if (budgetChart.value) {
    budgetChartInstance = echarts.init(budgetChart.value)
    const budgetData = store.activities.map(activity => ({
      name: activity.name,
      budget: activity.budget,
      used: Math.floor(activity.budget * 0.8) // 模拟已使用预算
    }))
    
    const budgetOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['预算', '已使用']
      },
      xAxis: {
        type: 'category',
        data: budgetData.map(item => item.name.substring(0, 10))
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '预算',
          type: 'bar',
          data: budgetData.map(item => item.budget),
          itemStyle: {
            color: '#67C23A'
          }
        },
        {
          name: '已使用',
          type: 'bar',
          data: budgetData.map(item => item.used),
          itemStyle: {
            color: '#E6A23C'
          }
        }
      ]
    }
    budgetChartInstance.setOption(budgetOption)
  }

  // 资源利用率排行图
  if (resourceChart.value) {
    resourceChartInstance = echarts.init(resourceChart.value)
    const resourceData = [
      { name: '会议室A', value: 95 },
      { name: '音响设备', value: 88 },
      { name: '投影仪', value: 82 },
      { name: '餐饮供应商', value: 76 },
      { name: '摄影服务', value: 72 }
    ]
    
    const resourceOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'value',
        max: 100
      },
      yAxis: {
        type: 'category',
        data: resourceData.map(item => item.name)
      },
      series: [
        {
          name: '利用率',
          type: 'bar',
          data: resourceData.map(item => item.value),
          itemStyle: {
            color: function(params) {
              const value = params.value
              if (value >= 90) return '#67C23A'
              if (value >= 70) return '#E6A23C'
              return '#F56C6C'
            }
          }
        }
      ]
    }
    resourceChartInstance.setOption(resourceOption)
  }
}

// 刷新图表
const refreshChart = (type) => {
  ElMessage.success(`正在刷新${type}图表...`)
  // 这里可以添加实际的刷新逻辑
}

// 活动选择处理
const onActivitySelect = () => {
  if (selectedActivity.value) {
    selectedActivityData.value = store.activities.find(a => a.id === selectedActivity.value)
    generatedReview.value = null // 清空之前的复盘报告
  } else {
    selectedActivityData.value = null
  }
}

// 生成复盘报告
const generateReviewReport = async () => {
  if (!selectedActivity.value) {
    ElMessage.warning('请先选择一个活动')
    return
  }
  
  isGeneratingReview.value = true
  
  setTimeout(() => {
    generatedReview.value = {
      achievements: `本次活动共吸引了${selectedActivityData.value.participants}人参与，超出了预期目标。活动预算控制在${formatBudget(selectedActivityData.value.budget)}以内，成本效益良好。参与者满意度调查显示，整体满意度达到92%，其中活动组织、内容设计、现场服务等方面获得较高评价。`,
      highlights: `1. 创新的活动形式：采用了线上线下相结合的方式，扩大了参与覆盖面。\n2. 精心的内容设计：活动环节设置合理，互动性强，有效提升了参与者的体验感。\n3. 专业的执行团队：各部门协作配合默契，现场执行流畅有序。\n4. 有效的宣传推广：通过多渠道宣传，活动影响力显著提升。`,
      improvements: `1. 时间安排：部分环节时间控制不够精准，导致整体流程略有延迟。\n2. 现场管理：高峰期人流疏导需要进一步优化，避免拥堵现象。\n3. 技术支持：线上平台在高峰期出现短暂卡顿，影响用户体验。\n4. 应急预案：对突发情况的应对准备还不够充分。`,
      lessons: `1. 提前规划的重要性：充分的前期准备是活动成功的基础。\n2. 团队协作的价值：各部门间的有效沟通是确保活动顺利进行的关键。\n3. 用户体验的核心地位：始终以参与者体验为中心设计活动流程。\n4. 数据驱动决策：通过数据分析及时调整策略，提升活动效果。`,
      suggestions: `1. 优化时间管理：制定更详细的时间表，设置缓冲时间应对突发情况。\n2. 加强技术保障：提前进行技术测试，准备备用方案确保平台稳定。\n3. 完善应急预案：针对可能出现的各种情况制定详细的应对措施。\n4. 建立评估体系：建立更完善的活动效果评估体系，持续优化改进。`
    }
    
    isGeneratingReview.value = false
    ElMessage.success('复盘报告生成成功！')
  }, 2000)
}

// 导出报告
const exportReport = () => {
  showExportDialog.value = true
}

const confirmExport = () => {
  ElMessage.success(`报告导出为${exportForm.value.format}格式成功！`)
  showExportDialog.value = false
}

// 保存报告
const saveReport = () => {
  ElMessage.success('复盘报告已保存到知识库')
}

// 监听窗口大小变化
const handleResize = () => {
  if (typeChartInstance) typeChartInstance.resize()
  if (monthlyChartInstance) monthlyChartInstance.resize()
  if (budgetChartInstance) budgetChartInstance.resize()
  if (resourceChartInstance) resourceChartInstance.resize()
}

// 生命周期
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (typeChartInstance) typeChartInstance.dispose()
  if (monthlyChartInstance) monthlyChartInstance.dispose()
  if (budgetChartInstance) budgetChartInstance.dispose()
  if (resourceChartInstance) resourceChartInstance.dispose()
})
</script>

<style scoped>
.data-report {
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin-bottom: 10px;
  color: #303133;
  font-size: 28px;
}

.subtitle {
  color: #909399;
  font-size: 16px;
  margin: 0;
}

.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.budget {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.participants {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.completion {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  text-align: right;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
}

.stat-trend.up {
  color: #67c23a;
}

.stat-trend.down {
  color: #f56c6c;
}

.charts-row {
  margin-bottom: 30px;
}

.chart-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #303133;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.review-section {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.review-content {
  padding: 20px 0;
}

.activity-selector {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  height: 100%;
}

.activity-selector h4 {
  margin-bottom: 15px;
  color: #303133;
}

.activity-info {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
}

.activity-info h5 {
  margin-bottom: 10px;
  color: #303133;
}

.review-report {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  min-height: 400px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.report-header h4 {
  margin: 0;
  color: #303133;
}

.report-actions {
  display: flex;
  gap: 10px;
}

.report-section {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
}

.report-section h5 {
  margin-bottom: 10px;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 5px;
}

.section-content {
  color: #606266;
  line-height: 1.6;
  white-space: pre-line;
}

.generating-review {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.no-review {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>