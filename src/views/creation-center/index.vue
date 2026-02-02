<template>
  <div class="creation-center">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>智能创作中心</h2>
      <p class="subtitle">AI驱动的活动创作工具，让您的创意无限延伸</p>
    </div>

    <!-- AI工具卡片网格 -->
    <el-row :gutter="20" class="tools-grid">
      <el-col :span="8">
        <el-card class="tool-card" shadow="hover">
          <div class="tool-header">
            <div class="tool-icon email">
              <el-icon size="40"><Message /></el-icon>
            </div>
            <h3>邮件/通知生成器</h3>
          </div>
          <p class="tool-description">智能生成格式规范、语气得体的活动通知邮件</p>
          <el-button type="primary" @click="openEmailGenerator" class="tool-btn">
            立即使用
          </el-button>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="tool-card" shadow="hover">
          <div class="tool-header">
            <div class="tool-icon speech">
              <el-icon size="40"><Microphone /></el-icon>
            </div>
            <h3>主持稿/讲话稿生成器</h3>
          </div>
          <p class="tool-description">根据活动环节和基调，生成专业的串词和致辞</p>
          <el-button type="primary" @click="openSpeechGenerator" class="tool-btn">
            立即使用
          </el-button>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="tool-card" shadow="hover">
          <div class="tool-header">
            <div class="tool-icon copywriting">
              <el-icon size="40"><Edit /></el-icon>
            </div>
            <h3>活动文案生成器</h3>
          </div>
          <p class="tool-description">生成公众号推文、海报文案、邀请函等营销文案</p>
          <el-button type="primary" @click="openCopywritingGenerator" class="tool-btn">
            立即使用
          </el-button>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="tool-card" shadow="hover">
          <div class="tool-header">
            <div class="tool-icon planning">
              <el-icon size="40"><Calendar /></el-icon>
            </div>
            <h3>活动策划助手</h3>
          </div>
          <p class="tool-description">AI协助您制定完整的活动策划方案</p>
          <el-button type="primary" @click="openPlanningAssistant" class="tool-btn">
            立即使用
          </el-button>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="tool-card" shadow="hover">
          <div class="tool-header">
            <div class="tool-icon budget">
              <el-icon size="40"><Money /></el-icon>
            </div>
            <h3>预算优化建议</h3>
          </div>
          <p class="tool-description">智能分析预算分配，提供成本优化建议</p>
          <el-button type="primary" @click="openBudgetOptimizer" class="tool-btn">
            立即使用
          </el-button>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="tool-card" shadow="hover">
          <div class="tool-header">
            <div class="tool-icon timeline">
              <el-icon size="40"><Timer /></el-icon>
            </div>
            <h3>时间轴生成器</h3>
          </div>
          <p class="tool-description">自动生成活动时间安排和流程时间轴</p>
          <el-button type="primary" @click="openTimelineGenerator" class="tool-btn">
            立即使用
          </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近生成的内容 -->
    <el-card class="recent-content" v-if="recentGenerations.length > 0">
      <template #header>
        <div class="card-header">
          <h3>最近生成的内容</h3>
          <el-button text @click="clearRecent">清空历史</el-button>
        </div>
      </template>
      
      <el-timeline>
        <el-timeline-item
          v-for="item in recentGenerations"
          :key="item.id"
          :timestamp="item.timestamp"
          :type="item.type"
        >
          <el-card>
            <h4>{{ item.title }}</h4>
            <p>{{ item.preview }}</p>
            <div class="recent-actions">
              <el-button size="small" @click="viewFullContent(item)">查看完整内容</el-button>
              <el-button size="small" @click="copyContent(item)">复制</el-button>
              <el-button size="small" @click="editContent(item)">编辑</el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 邮件生成器对话框 -->
    <el-dialog v-model="showEmailGenerator" title="邮件/通知生成器" width="700px">
      <el-form :model="emailForm" label-width="100px">
        <el-form-item label="邮件类型">
          <el-select v-model="emailForm.type" placeholder="选择邮件类型">
            <el-option label="活动邀请" value="invitation" />
            <el-option label="活动通知" value="notification" />
            <el-option label="活动提醒" value="reminder" />
            <el-option label="活动总结" value="summary" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动主题">
          <el-input v-model="emailForm.subject" placeholder="请输入活动主题" />
        </el-form-item>
        <el-form-item label="关键信息">
          <el-input
            v-model="emailForm.keyPoints"
            type="textarea"
            :rows="3"
            placeholder="请输入关键信息，如时间、地点、着装要求、注意事项等"
          />
        </el-form-item>
        <el-form-item label="语气风格">
          <el-radio-group v-model="emailForm.tone">
            <el-radio label="formal">正式</el-radio>
            <el-radio label="friendly">友好</el-radio>
            <el-radio label="urgent">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <div v-if="generatedEmail" class="generated-content">
        <h4>生成的邮件内容：</h4>
        <div class="content-preview">{{ generatedEmail }}</div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEmailGenerator = false">取消</el-button>
          <el-button type="primary" @click="generateEmail" :loading="isGenerating">
            生成邮件
          </el-button>
          <el-button v-if="generatedEmail" type="success" @click="saveEmail">
            保存到历史
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 主持稿生成器对话框 -->
    <el-dialog v-model="showSpeechGenerator" title="主持稿/讲话稿生成器" width="700px">
      <el-form :model="speechForm" label-width="100px">
        <el-form-item label="稿件类型">
          <el-select v-model="speechForm.type" placeholder="选择稿件类型">
            <el-option label="主持人串词" value="host" />
            <el-option label="领导致辞" value="leader" />
            <el-option label="嘉宾发言" value="guest" />
            <el-option label="开场白" value="opening" />
            <el-option label="结束语" value="closing" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动环节">
          <el-input v-model="speechForm.segment" placeholder="请输入具体环节，如开场、颁奖、抽奖等" />
        </el-form-item>
        <el-form-item label="活动基调">
          <el-input
            v-model="speechForm.theme"
            type="textarea"
            :rows="2"
            placeholder="描述活动氛围，如喜庆、庄重、轻松、正式等"
          />
        </el-form-item>
        <el-form-item label="时长要求">
          <el-input-number
            v-model="speechForm.duration"
            :min="1"
            :max="30"
            :step="1"
            placeholder="分钟"
          />
          <span style="margin-left: 10px;">分钟</span>
        </el-form-item>
      </el-form>
      
      <div v-if="generatedSpeech" class="generated-content">
        <h4>生成的稿件内容：</h4>
        <div class="content-preview">{{ generatedSpeech }}</div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSpeechGenerator = false">取消</el-button>
          <el-button type="primary" @click="generateSpeech" :loading="isGenerating">
            生成稿件
          </el-button>
          <el-button v-if="generatedSpeech" type="success" @click="saveSpeech">
            保存到历史
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 文案生成器对话框 -->
    <el-dialog v-model="showCopywritingGenerator" title="活动文案生成器" width="700px">
      <el-form :model="copywritingForm" label-width="100px">
        <el-form-item label="文案类型">
          <el-select v-model="copywritingForm.type" placeholder="选择文案类型">
            <el-option label="公众号推文" value="wechat" />
            <el-option label="海报文案" value="poster" />
            <el-option label="邀请函" value="invitation" />
            <el-option label="宣传文案" value="promotion" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动主题">
          <el-input v-model="copywritingForm.theme" placeholder="请输入活动主题" />
        </el-form-item>
        <el-form-item label="目标受众">
          <el-input
            v-model="copywritingForm.audience"
            type="textarea"
            :rows="2"
            placeholder="描述目标受众特征"
          />
        </el-form-item>
        <el-form-item label="文案风格">
          <el-radio-group v-model="copywritingForm.style">
            <el-radio label="creative">创意</el-radio>
            <el-radio label="professional">专业</el-radio>
            <el-radio label="warm">温馨</el-radio>
            <el-radio label="energetic">活力</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <div v-if="generatedCopywriting" class="generated-content">
        <h4>生成的文案内容：</h4>
        <div class="content-preview">{{ generatedCopywriting }}</div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCopywritingGenerator = false">取消</el-button>
          <el-button type="primary" @click="generateCopywriting" :loading="isGenerating">
            生成文案
          </el-button>
          <el-button v-if="generatedCopywriting" type="success" @click="saveCopywriting">
            保存到历史
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 工具对话框状态
const showEmailGenerator = ref(false)
const showSpeechGenerator = ref(false)
const showCopywritingGenerator = ref(false)
const showBudgetOptimizer = ref(false)
const showPlanningAssistant = ref(false)
const showTimelineGenerator = ref(false)

// 生成状态
const isGenerating = ref(false)

// 表单数据
const emailForm = ref({
  type: '',
  subject: '',
  keyPoints: '',
  tone: 'formal'
})

const speechForm = ref({
  type: '',
  segment: '',
  theme: '',
  duration: 5
})

const copywritingForm = ref({
  type: '',
  theme: '',
  audience: '',
  style: 'creative'
})

// 生成的内容
const generatedEmail = ref('')
const generatedSpeech = ref('')
const generatedCopywriting = ref('')

// 最近生成的历史
const recentGenerations = ref([
  {
    id: 1,
    title: '新员工团建活动邀请邮件',
    preview: '尊敬的同事们，我们将于下周六举行新员工团建活动...',
    timestamp: '2小时前',
    type: 'primary',
    fullContent: '完整的邮件内容...'
  },
  {
    id: 2,
    title: '公司年会主持稿',
    preview: '各位领导、各位同事，大家晚上好！在这美好的夜晚...',
    timestamp: '1天前',
    type: 'success',
    fullContent: '完整的主持稿内容...'
  }
])

// 打开各个工具
const openEmailGenerator = () => {
  showEmailGenerator.value = true
  // 重置表单
  emailForm.value = {
    type: '',
    subject: '',
    keyPoints: '',
    tone: 'formal'
  }
  generatedEmail.value = ''
}

const openSpeechGenerator = () => {
  showSpeechGenerator.value = true
  speechForm.value = {
    type: '',
    segment: '',
    theme: '',
    duration: 5
  }
  generatedSpeech.value = ''
}

const openCopywritingGenerator = () => {
  showCopywritingGenerator.value = true
  copywritingForm.value = {
    type: '',
    theme: '',
    audience: '',
    style: 'creative'
  }
  generatedCopywriting.value = ''
}

const openBudgetOptimizer = () => {
  ElMessage.info('预算优化工具开发中...')
}

const openPlanningAssistant = () => {
  ElMessage.info('活动策划助手开发中...')
}

const openTimelineGenerator = () => {
  ElMessage.info('时间轴生成器开发中...')
}

// 生成邮件
const generateEmail = async () => {
  if (!emailForm.value.subject || !emailForm.value.keyPoints) {
    ElMessage.warning('请填写必要信息')
    return
  }
  
  isGenerating.value = true
  
  setTimeout(() => {
    const templates = {
      invitation: `主题：${emailForm.value.subject}

尊敬的同事们：

${emailForm.value.keyPoints}

我们期待您的参与！

此致
敬礼！

活动组织团队`,
      notification: `各位同事：

${emailForm.value.keyPoints}

请大家准时参加，谢谢配合！

行政部`,
      reminder: `提醒：${emailForm.value.subject}

${emailForm.value.keyPoints}

请勿忘记！`,
      summary: `活动总结：${emailForm.value.subject}

${emailForm.value.keyPoints}

本次活动圆满成功，感谢大家的支持！`
    }
    
    generatedEmail.value = templates[emailForm.value.type] || emailForm.value.keyPoints
    isGenerating.value = false
    ElMessage.success('邮件生成成功！')
  }, 1500)
}

// 生成主持稿
const generateSpeech = async () => {
  if (!speechForm.value.type || !speechForm.value.segment) {
    ElMessage.warning('请填写必要信息')
    return
  }
  
  isGenerating.value = true
  
  setTimeout(() => {
    const templates = {
      host: `各位来宾、各位朋友：

大家好！我是今天的主持人。

${speechForm.value.segment}环节现在开始。

${speechForm.value.theme}

让我们一起享受这个美好的时刻！

谢谢大家！`,
      leader: `各位同事：

${speechForm.value.segment}

${speechForm.value.theme}

我相信，通过大家的共同努力，我们的活动一定会取得圆满成功！

谢谢大家！`,
      guest: `尊敬的主办方、各位来宾：

${speechForm.value.segment}

${speechForm.value.theme}

很荣幸能够参与这次活动，祝愿活动圆满成功！

谢谢！`
    }
    
    generatedSpeech.value = templates[speechForm.value.type] || speechForm.value.segment
    isGenerating.value = false
    ElMessage.success('稿件生成成功！')
  }, 1500)
}

// 生成文案
const generateCopywriting = async () => {
  if (!copywritingForm.value.type || !copywritingForm.value.theme) {
    ElMessage.warning('请填写必要信息')
    return
  }
  
  isGenerating.value = true
  
  setTimeout(() => {
    const templates = {
      wechat: `🎉【${copywritingForm.value.theme}】🎉

${copywritingForm.value.audience}

💫 精彩亮点：
• 专业策划，精心安排
• 丰富内容，难忘体验
• 优质服务，贴心保障

📅 时间：敬请期待
📍 地点：详见通知

#${copywritingForm.value.theme} #活动预告`,
      poster: `${copywritingForm.value.theme}

${copywritingForm.value.audience}

精彩不容错过！`,
      invitation: `尊敬的贵宾：

诚挚邀请您参加${copywritingForm.value.theme}

${copywritingForm.value.audience}

期待您的光临！`
    }
    
    generatedCopywriting.value = templates[copywritingForm.value.type] || copywritingForm.value.theme
    isGenerating.value = false
    ElMessage.success('文案生成成功！')
  }, 1500)
}

// 保存到历史
const saveEmail = () => {
  if (generatedEmail.value) {
    const newItem = {
      id: Date.now(),
      title: `邮件：${emailForm.value.subject}`,
      preview: generatedEmail.value.substring(0, 100) + '...',
      timestamp: '刚刚',
      type: 'primary',
      fullContent: generatedEmail.value
    }
    recentGenerations.value.unshift(newItem)
    ElMessage.success('已保存到历史记录')
  }
}

const saveSpeech = () => {
  if (generatedSpeech.value) {
    const newItem = {
      id: Date.now(),
      title: `${speechForm.value.type === 'host' ? '主持稿' : '讲话稿'}：${speechForm.value.segment}`,
      preview: generatedSpeech.value.substring(0, 100) + '...',
      timestamp: '刚刚',
      type: 'success',
      fullContent: generatedSpeech.value
    }
    recentGenerations.value.unshift(newItem)
    ElMessage.success('已保存到历史记录')
  }
}

const saveCopywriting = () => {
  if (generatedCopywriting.value) {
    const newItem = {
      id: Date.now(),
      title: `文案：${copywritingForm.value.theme}`,
      preview: generatedCopywriting.value.substring(0, 100) + '...',
      timestamp: '刚刚',
      type: 'warning',
      fullContent: generatedCopywriting.value
    }
    recentGenerations.value.unshift(newItem)
    ElMessage.success('已保存到历史记录')
  }
}

// 历史记录操作
const viewFullContent = (item) => {
  ElMessage.info(`查看完整内容: ${item.title}`)
}

const copyContent = (item) => {
  navigator.clipboard.writeText(item.fullContent).then(() => {
    ElMessage.success('内容已复制到剪贴板')
  })
}

const editContent = (item) => {
  ElMessage.info(`编辑内容: ${item.title}`)
}

const clearRecent = () => {
  recentGenerations.value = []
  ElMessage.success('历史记录已清空')
}
</script>

<style scoped>
.creation-center {
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
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

.tools-grid {
  margin-bottom: 40px;
}

.tool-card {
  border-radius: 12px;
  text-align: center;
  padding: 30px 20px;
  margin-bottom: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.tool-header {
  margin-bottom: 20px;
}

.tool-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: white;
}

.tool-icon.email {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tool-icon.speech {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.tool-icon.copywriting {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.tool-icon.planning {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.tool-icon.budget {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.tool-icon.timeline {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.tool-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.tool-description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 25px;
  min-height: 60px;
}

.tool-btn {
  width: 100%;
}

.recent-content {
  border-radius: 12px;
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

.recent-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.generated-content {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.generated-content h4 {
  margin-bottom: 15px;
  color: #303133;
}

.content-preview {
  background: white;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
  white-space: pre-line;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 28px;
}
</style>