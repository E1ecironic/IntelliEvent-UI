<template>
  <div class="knowledge-base">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>知识库/模板中心</h2>
      <p class="subtitle">丰富的活动模板和知识资源，助您快速上手</p>
    </div>

    <!-- 搜索和分类筛选 -->
    <el-card class="filter-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索模板、清单或知识内容"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="活动策划" value="planning" />
            <el-option label="物料清单" value="materials" />
            <el-option label="合同模板" value="contracts" />
            <el-option label="主持稿" value="scripts" />
            <el-option label="应急预案" value="emergency" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="selectedType" placeholder="选择类型" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="模板" value="template" />
            <el-option label="清单" value="checklist" />
            <el-option label="文档" value="document" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <div class="header-actions">
            <el-button type="primary" @click="showUploadDialog = true">
              <el-icon><Upload /></el-icon>
              上传资源
            </el-button>
            <el-button @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新建模板
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 资源分类标签页 -->
    <el-card class="content-card">
      <el-tabs v-model="activeTab" class="resource-tabs">
        <!-- 活动模板标签页 -->
        <el-tab-pane label="活动模板" name="planning">
          <div class="resource-container">
            <el-row :gutter="20">
              <el-col v-for="template in filteredPlanningTemplates" :key="template.id" :span="8">
                <el-card class="resource-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <h4>{{ template.name }}</h4>
                      <el-tag :type="getTypeColor(template.type)" size="small">{{ template.type }}</el-tag>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p class="resource-description">{{ template.description }}</p>
                    <div class="resource-meta">
                      <span class="meta-item">
                        <el-icon><Clock /></el-icon>
                        {{ template.createdAt }}
                      </span>
                      <span class="meta-item">
                        <el-icon><Download /></el-icon>
                        {{ template.downloads }}
                      </span>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <el-button type="primary" size="small" @click="previewTemplate(template)">
                      <el-icon><View /></el-icon>
                      预览
                    </el-button>
                    <el-button size="small" @click="useTemplate(template)">
                      <el-icon><Check /></el-icon>
                      使用
                    </el-button>
                    <el-button size="small" @click="downloadTemplate(template)">
                      <el-icon><Download /></el-icon>
                      下载
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 物料清单标签页 -->
        <el-tab-pane label="物料清单" name="materials">
          <div class="resource-container">
            <el-row :gutter="20">
              <el-col v-for="checklist in filteredMaterials" :key="checklist.id" :span="8">
                <el-card class="resource-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <h4>{{ checklist.name }}</h4>
                      <el-tag :type="getTypeColor(checklist.type)" size="small">{{ checklist.type }}</el-tag>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p class="resource-description">{{ checklist.description }}</p>
                    <div class="checklist-preview">
                      <el-progress :percentage="checklist.completionRate" />
                      <span class="completion-text">{{ checklist.items }}项物品</span>
                    </div>
                    <div class="resource-meta">
                      <span class="meta-item">
                        <el-icon><Clock /></el-icon>
                        {{ checklist.createdAt }}
                      </span>
                      <span class="meta-item">
                        <el-icon><Download /></el-icon>
                        {{ checklist.downloads }}
                      </span>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <el-button type="primary" size="small" @click="previewChecklist(checklist)">
                      <el-icon><View /></el-icon>
                      查看
                    </el-button>
                    <el-button size="small" @click="useChecklist(checklist)">
                      <el-icon><Check /></el-icon>
                      使用
                    </el-button>
                    <el-button size="small" @click="downloadChecklist(checklist)">
                      <el-icon><Download /></el-icon>
                      下载
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 合同模板标签页 -->
        <el-tab-pane label="合同模板" name="contracts">
          <div class="resource-container">
            <el-row :gutter="20">
              <el-col v-for="contract in filteredContracts" :key="contract.id" :span="8">
                <el-card class="resource-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <h4>{{ contract.name }}</h4>
                      <el-tag :type="getTypeColor(contract.type)" size="small">{{ contract.type }}</el-tag>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p class="resource-description">{{ contract.description }}</p>
                    <div class="contract-info">
                      <div class="info-item">
                        <span class="label">适用场景：</span>
                        <span class="value">{{ contract.scenario }}</span>
                      </div>
                      <div class="info-item">
                        <span class="label">版本：</span>
                        <span class="value">{{ contract.version }}</span>
                      </div>
                    </div>
                    <div class="resource-meta">
                      <span class="meta-item">
                        <el-icon><Clock /></el-icon>
                        {{ contract.createdAt }}
                      </span>
                      <span class="meta-item">
                        <el-icon><Download /></el-icon>
                        {{ contract.downloads }}
                      </span>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <el-button type="primary" size="small" @click="previewContract(contract)">
                      <el-icon><View /></el-icon>
                      预览
                    </el-button>
                    <el-button size="small" @click="useContract(contract)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button size="small" @click="downloadContract(contract)">
                      <el-icon><Download /></el-icon>
                      下载
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 主持稿标签页 -->
        <el-tab-pane label="主持稿" name="scripts">
          <div class="resource-container">
            <el-row :gutter="20">
              <el-col v-for="script in filteredScripts" :key="script.id" :span="8">
                <el-card class="resource-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <h4>{{ script.name }}</h4>
                      <el-tag :type="getTypeColor(script.type)" size="small">{{ script.type }}</el-tag>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p class="resource-description">{{ script.description }}</p>
                    <div class="script-preview">
                      <div class="preview-text">{{ script.preview }}</div>
                    </div>
                    <div class="resource-meta">
                      <span class="meta-item">
                        <el-icon><Clock /></el-icon>
                        {{ script.createdAt }}
                      </span>
                      <span class="meta-item">
                        <el-icon><Download /></el-icon>
                        {{ script.downloads }}
                      </span>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <el-button type="primary" size="small" @click="previewScript(script)">
                      <el-icon><View /></el-icon>
                      预览
                    </el-button>
                    <el-button size="small" @click="useScript(script)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button size="small" @click="downloadScript(script)">
                      <el-icon><Download /></el-icon>
                      下载
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 应急预案标签页 -->
        <el-tab-pane label="应急预案" name="emergency">
          <div class="resource-container">
            <el-row :gutter="20">
              <el-col v-for="plan in filteredEmergencyPlans" :key="plan.id" :span="8">
                <el-card class="resource-card" shadow="hover">
                  <template #header>
                    <div class="card-header">
                      <h4>{{ plan.name }}</h4>
                      <el-tag :type="getTypeColor(plan.type)" size="small">{{ plan.type }}</el-tag>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p class="resource-description">{{ plan.description }}</p>
                    <div class="emergency-info">
                      <div class="risk-level">
                        <span class="label">风险等级：</span>
                        <el-tag :type="getRiskLevelColor(plan.riskLevel)" size="small">
                          {{ plan.riskLevel }}
                        </el-tag>
                      </div>
                      <div class="applicable-scenarios">
                        <span class="label">适用场景：</span>
                        <span class="value">{{ plan.scenarios.join('、') }}</span>
                      </div>
                    </div>
                    <div class="resource-meta">
                      <span class="meta-item">
                        <el-icon><Clock /></el-icon>
                        {{ plan.createdAt }}
                      </span>
                      <span class="meta-item">
                        <el-icon><Download /></el-icon>
                        {{ plan.downloads }}
                      </span>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <el-button type="primary" size="small" @click="previewEmergencyPlan(plan)">
                      <el-icon><View /></el-icon>
                      预览
                    </el-button>
                    <el-button size="small" @click="useEmergencyPlan(plan)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button size="small" @click="downloadEmergencyPlan(plan)">
                      <el-icon><Download /></el-icon>
                      下载
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreviewDialog" :title="previewTitle" width="800px">
      <div class="preview-content">
        <div v-if="previewData" class="preview-text">
          <pre>{{ previewData }}</pre>
        </div>
        <div v-else class="no-preview">
          <el-empty description="暂无预览内容" />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPreviewDialog = false">关闭</el-button>
          <el-button type="primary" @click="copyPreviewContent">复制内容</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 上传资源对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传资源" width="600px">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="资源类型">
          <el-select v-model="uploadForm.type" placeholder="选择资源类型">
            <el-option label="活动模板" value="planning" />
            <el-option label="物料清单" value="materials" />
            <el-option label="合同模板" value="contracts" />
            <el-option label="主持稿" value="scripts" />
            <el-option label="应急预案" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源名称">
          <el-input v-model="uploadForm.name" placeholder="请输入资源名称" />
        </el-form-item>
        <el-form-item label="资源描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入资源描述"
          />
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="uploadForm.fileList"
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到此处或 <em>点击上传</em>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false">取消</el-button>
          <el-button type="primary" @click="submitUpload" :loading="isUploading">
            上传
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新建模板对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建模板" width="600px">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="模板类型">
          <el-select v-model="createForm.type" placeholder="选择模板类型">
            <el-option label="活动模板" value="planning" />
            <el-option label="物料清单" value="materials" />
            <el-option label="合同模板" value="contracts" />
            <el-option label="主持稿" value="scripts" />
            <el-option label="应急预案" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板名称">
          <el-input v-model="createForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入模板描述"
          />
        </el-form-item>
        <el-form-item label="模板内容">
          <el-input
            v-model="createForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入模板内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="submitCreate" :loading="isCreating">
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Upload,
  Plus,
  Clock,
  Download,
  View,
  Check,
  Edit
} from '@element-plus/icons-vue'

// 搜索和筛选
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedType = ref('')
const activeTab = ref('planning')

// 预览对话框
const showPreviewDialog = ref(false)
const previewTitle = ref('')
const previewData = ref('')

// 上传对话框
const showUploadDialog = ref(false)
const isUploading = ref(false)
const uploadForm = ref({
  type: '',
  name: '',
  description: '',
  fileList: []
})

// 新建对话框
const showCreateDialog = ref(false)
const isCreating = ref(false)
const createForm = ref({
  type: '',
  name: '',
  description: '',
  content: ''
})

// 模拟数据
const planningTemplates = ref([
  {
    id: 1,
    name: '新员工团建活动模板',
    type: '团建',
    description: '适用于新员工融入团队的团建活动策划模板，包含破冰游戏、团队建设等环节',
    createdAt: '2024-01-15',
    downloads: 128,
    content: '完整的新员工团建活动模板内容...'
  },
  {
    id: 2,
    name: '公司年会策划模板',
    type: '年会',
    description: '公司年度庆典活动策划模板，包含节目安排、颁奖环节、晚宴流程等',
    createdAt: '2024-01-10',
    downloads: 256,
    content: '完整的公司年会策划模板内容...'
  },
  {
    id: 3,
    name: '产品发布会模板',
    type: '发布会',
    description: '新产品发布活动策划模板，包含发布流程、媒体邀请、现场布置等',
    createdAt: '2024-01-08',
    downloads: 89,
    content: '完整的产品发布会模板内容...'
  }
])

const materialsChecklists = ref([
  {
    id: 1,
    name: '会议活动物料清单',
    type: '会议',
    description: '标准会议活动所需的物料清单，包含音响设备、投影设备、文具等',
    items: 25,
    completionRate: 85,
    createdAt: '2024-01-12',
    downloads: 167,
    content: '完整的会议活动物料清单内容...'
  },
  {
    id: 2,
    name: '团建活动物料清单',
    type: '团建',
    description: '团队建设活动所需的物料清单，包含游戏道具、奖品、餐饮用品等',
    items: 18,
    completionRate: 92,
    createdAt: '2024-01-09',
    downloads: 134,
    content: '完整的团建活动物料清单内容...'
  }
])

const contractTemplates = ref([
  {
    id: 1,
    name: '活动场地租赁合同',
    type: '场地租赁',
    description: '活动场地租赁标准合同模板，包含租赁条款、费用明细、违约责任等',
    scenario: '酒店、会议中心、展览馆等场地租赁',
    version: 'v2.1',
    createdAt: '2024-01-14',
    downloads: 203,
    content: '完整的活动场地租赁合同内容...'
  },
  {
    id: 2,
    name: '活动服务合同模板',
    type: '服务合同',
    description: '活动服务提供商合同模板，适用于摄影、摄像、主持等服务',
    scenario: '摄影、摄像、主持、礼仪等服务',
    version: 'v1.8',
    createdAt: '2024-01-11',
    downloads: 156,
    content: '完整的活动服务合同模板内容...'
  }
])

const scripts = ref([
  {
    id: 1,
    name: '公司年会主持稿',
    type: '年会',
    description: '公司年度庆典活动主持稿，包含开场白、节目串词、颁奖词等',
    preview: '尊敬的各位领导、各位同事，大家晚上好！在这辞旧迎新的美好时刻...',
    createdAt: '2024-01-13',
    downloads: 189,
    content: '完整的公司年会主持稿内容...'
  },
  {
    id: 2,
    name: '产品发布会主持稿',
    type: '发布会',
    description: '新产品发布会主持稿，包含产品介绍、嘉宾介绍、互动环节等',
    preview: '各位媒体朋友、各位来宾，大家上午好！欢迎来到XX公司新产品发布会现场...',
    createdAt: '2024-01-07',
    downloads: 98,
    content: '完整的产品发布会主持稿内容...'
  }
])

const emergencyPlans = ref([
  {
    id: 1,
    name: '恶劣天气应急预案',
    type: '天气应急',
    description: '针对恶劣天气情况的应急预案，包含室内备选方案、延期安排等',
    riskLevel: '中',
    scenarios: ['暴雨', '台风', '大雪'],
    createdAt: '2024-01-06',
    downloads: 145,
    content: '完整的恶劣天气应急预案内容...'
  },
  {
    id: 2,
    name: '设备故障应急预案',
    type: '技术应急',
    description: '针对音响、投影等设备故障的应急预案，包含备用设备、技术支持等',
    riskLevel: '低',
    scenarios: ['音响故障', '投影故障', '网络故障'],
    createdAt: '2024-01-05',
    downloads: 112,
    content: '完整的设备故障应急预案内容...'
  }
])

// 计算属性
const filteredPlanningTemplates = computed(() => {
  return planningTemplates.value.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || template.type === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const filteredMaterials = computed(() => {
  return materialsChecklists.value.filter(checklist => {
    const matchesSearch = checklist.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
                         checklist.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || checklist.type === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const filteredContracts = computed(() => {
  return contractTemplates.value.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
                         contract.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || contract.type === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const filteredScripts = computed(() => {
  return scripts.value.filter(script => {
    const matchesSearch = script.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || script.type === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const filteredEmergencyPlans = computed(() => {
  return emergencyPlans.value.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    const matchesCategory = !selectedCategory.value || plan.type === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

// 方法
const getTypeColor = (type) => {
  const colors = {
    '团建': 'success',
    '年会': 'primary',
    '发布会': 'warning',
    '会议': 'info',
    '场地租赁': 'danger',
    '服务合同': 'primary',
    '天气应急': 'warning',
    '技术应急': 'info'
  }
  return colors[type] || 'info'
}

const getRiskLevelColor = (level) => {
  const colors = {
    '高': 'danger',
    '中': 'warning',
    '低': 'success'
  }
  return colors[level] || 'info'
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中实现
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中实现
}

const previewTemplate = (template) => {
  showPreviewDialog.value = true
  previewTitle.value = template.name
  previewData.value = template.content
}

const useTemplate = (template) => {
  ElMessage.success(`正在使用模板：${template.name}`)
}

const downloadTemplate = (template) => {
  template.downloads++
  ElMessage.success(`模板下载成功：${template.name}`)
}

const previewChecklist = (checklist) => {
  showPreviewDialog.value = true
  previewTitle.value = checklist.name
  previewData.value = checklist.content
}

const useChecklist = (checklist) => {
  ElMessage.success(`正在使用清单：${checklist.name}`)
}

const downloadChecklist = (checklist) => {
  checklist.downloads++
  ElMessage.success(`清单下载成功：${checklist.name}`)
}

const previewContract = (contract) => {
  showPreviewDialog.value = true
  previewTitle.value = contract.name
  previewData.value = contract.content
}

const useContract = (contract) => {
  ElMessage.success(`正在编辑合同：${contract.name}`)
}

const downloadContract = (contract) => {
  contract.downloads++
  ElMessage.success(`合同下载成功：${contract.name}`)
}

const previewScript = (script) => {
  showPreviewDialog.value = true
  previewTitle.value = script.name
  previewData.value = script.content
}

const useScript = (script) => {
  ElMessage.success(`正在编辑主持稿：${script.name}`)
}

const downloadScript = (script) => {
  script.downloads++
  ElMessage.success(`主持稿下载成功：${script.name}`)
}

const previewEmergencyPlan = (plan) => {
  showPreviewDialog.value = true
  previewTitle.value = plan.name
  previewData.value = plan.content
}

const useEmergencyPlan = (plan) => {
  ElMessage.success(`正在编辑应急预案：${plan.name}`)
}

const downloadEmergencyPlan = (plan) => {
  plan.downloads++
  ElMessage.success(`应急预案下载成功：${plan.name}`)
}

const copyPreviewContent = () => {
  navigator.clipboard.writeText(previewData.value).then(() => {
    ElMessage.success('内容已复制到剪贴板')
  })
}

const handleFileChange = (file, fileList) => {
  uploadForm.value.fileList = fileList
}

const submitUpload = () => {
  if (!uploadForm.value.name || !uploadForm.value.type) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  isUploading.value = true
  
  setTimeout(() => {
    ElMessage.success('资源上传成功！')
    showUploadDialog.value = false
    isUploading.value = false
    // 重置表单
    uploadForm.value = {
      type: '',
      name: '',
      description: '',
      fileList: []
    }
  }, 1500)
}

const submitCreate = () => {
  if (!createForm.value.name || !createForm.value.type || !createForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  isCreating.value = true
  
  setTimeout(() => {
    ElMessage.success('模板创建成功！')
    showCreateDialog.value = false
    isCreating.value = false
    // 重置表单
    createForm.value = {
      type: '',
      name: '',
      description: '',
      content: ''
    }
  }, 1500)
}
</script>

<style scoped>
.knowledge-base {
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

.filter-card {
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.content-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

.resource-tabs {
  min-height: 500px;
}

.resource-tabs :deep(.el-tabs__header) {
  margin-bottom: 30px;
}

.resource-tabs :deep(.el-tabs__content) {
  min-height: 400px;
}

.resource-container {
  width: 100%;
  padding-bottom: 20px;
}

.resource-container .el-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.resource-container .el-col {
  padding-left: 10px !important;
  padding-right: 10px !important;
  margin-bottom: 20px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.resource-card {
  border-radius: 12px;
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
}

.resource-content {
  flex: 1;
  margin-bottom: 15px;
}

.resource-description {
  color: #606266;
  line-height: 1.5;
  margin-bottom: 15px;
  min-height: 40px;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e4e7ed;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 12px;
}

.checklist-preview {
  margin-bottom: 15px;
}

.completion-text {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.contract-info {
  margin-bottom: 15px;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #909399;
  font-size: 12px;
  margin-right: 8px;
  min-width: 70px;
}

.info-item .value {
  color: #606266;
  font-size: 12px;
}

.script-preview {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.preview-text {
  color: #606266;
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.emergency-info {
  margin-bottom: 15px;
}

.risk-level {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.risk-level .label {
  color: #909399;
  font-size: 12px;
  margin-right: 8px;
  min-width: 70px;
}

.applicable-scenarios {
  display: flex;
  align-items: center;
}

.applicable-scenarios .label {
  color: #909399;
  font-size: 12px;
  margin-right: 8px;
  min-width: 70px;
}

.applicable-scenarios .value {
  color: #606266;
  font-size: 12px;
}

.resource-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.preview-content {
  max-height: 500px;
  overflow-y: auto;
}

.preview-text pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  line-height: 1.6;
  color: #303133;
}

.no-preview {
  text-align: center;
  padding: 40px 0;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .resource-container .el-col {
    span: 12;
  }
}

@media (max-width: 768px) {
  .resource-container .el-col {
    span: 24;
  }
  
  .page-header h2 {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 14px;
  }
}
</style>