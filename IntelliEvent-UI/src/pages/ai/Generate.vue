<template>
  <div class="ai-generate-page">
    <h1>智能策划生成</h1>
    
    <div class="input-section">
      <form @submit.prevent="generatePlan">
        <div class="form-group">
          <label for="eventType">活动类型</label>
          <select v-model="formData.eventType" id="eventType" required>
            <option value="">请选择活动类型</option>
            <option value="product_launch">产品发布会</option>
            <option value="team_building">团建活动</option>
            <option value="conference">会议论坛</option>
            <option value="exhibition">展览展示</option>
            <option value="wedding">婚礼庆典</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="theme">活动主题</label>
          <input 
            type="text" 
            v-model="formData.theme" 
            id="theme" 
            placeholder="请输入活动主题" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="scale">活动规模 (参与人数)</label>
          <input 
            type="number" 
            v-model.number="formData.scale" 
            id="scale" 
            min="10" 
            max="10000" 
            placeholder="参与人数" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="budget">活动预算 (元)</label>
          <input 
            type="number" 
            v-model.number="formData.budget" 
            id="budget" 
            min="0" 
            step="0.01" 
            placeholder="预算金额" 
            required
          >
        </div>
        
        <div class="form-group">
          <label for="requirements">特殊要求</label>
          <textarea 
            v-model="formData.requirements" 
            id="requirements" 
            rows="4" 
            placeholder="请输入特殊要求（如：环保主题、互动环节等）"
          ></textarea>
        </div>
        
        <button type="submit" class="generate-btn" :disabled="isGenerating">
          {{ isGenerating ? '生成中...' : '生成策划方案' }}
        </button>
      </form>
    </div>
    
    <!-- 生成结果 -->
    <div v-if="generatedPlan" class="result-section">
      <h2>生成的策划方案</h2>
      
      <div class="plan-card">
        <h3>{{ generatedPlan.title }}</h3>
        
        <div class="plan-section">
          <h4>活动概述</h4>
          <p>{{ generatedPlan.overview }}</p>
        </div>
        
        <div class="plan-section">
          <h4>活动流程</h4>
          <ul class="schedule-list">
            <li v-for="(item, index) in generatedPlan.schedule" :key="index">
              <span class="time">{{ item.time }}</span>
              <span class="content">{{ item.content }}</span>
            </li>
          </ul>
        </div>
        
        <div class="plan-section">
          <h4>物料清单</h4>
          <table class="materials-table">
            <thead>
              <tr>
                <th>物料名称</th>
                <th>数量</th>
                <th>单价(元)</th>
                <th>总价(元)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in generatedPlan.materials" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.unitPrice.toFixed(2) }}</td>
                <td>{{ item.totalPrice.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="plan-section">
          <h4>预算总计</h4>
          <p class="total-budget">¥{{ generatedPlan.totalBudget.toFixed(2) }}</p>
        </div>
        
        <button class="save-btn" @click="savePlan">保存方案</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AIGeneratePage',
  setup() {
    const isGenerating = ref(false)
    const formData = ref({
      eventType: '',
      theme: '',
      scale: 100,
      budget: 50000,
      requirements: ''
    })

    const generatedPlan = ref(null)

    const generatePlan = async () => {
      isGenerating.value = true
      
      // 模拟AI生成过程
      try {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // 生成模拟数据
        generatedPlan.value = {
          title: `${formData.value.theme}${getEventTypeText(formData.value.eventType)}`,
          overview: `本次${getEventTypeText(formData.value.eventType)}以\"${formData.value.theme}\"为主题，预计参与人数${formData.value.scale}人，总预算${formData.value.budget}元。活动将围绕主题设计丰富的环节，确保参与者获得良好体验。`,
          schedule: [
            { time: '09:00-09:30', content: '嘉宾签到' },
            { time: '09:30-10:00', content: '开场致辞' },
            { time: '10:00-11:30', content: '主题演讲' },
            { time: '11:30-12:30', content: '互动环节' },
            { time: '12:30-14:00', content: '午餐休息' },
            { time: '14:00-16:00', content: '分组讨论' },
            { time: '16:00-17:00', content: '总结发言' },
            { time: '17:00-17:30', content: '合影留念' }
          ],
          materials: [
            { name: '背景板', quantity: 1, unitPrice: 2000, totalPrice: 2000 },
            { name: '音响设备', quantity: 1, unitPrice: 3000, totalPrice: 3000 },
            { name: '桌椅', quantity: 100, unitPrice: 20, totalPrice: 2000 },
            { name: '签到礼品', quantity: 100, unitPrice: 50, totalPrice: 5000 },
            { name: '餐饮', quantity: 100, unitPrice: 100, totalPrice: 10000 },
            { name: '摄影服务', quantity: 1, unitPrice: 4000, totalPrice: 4000 }
          ],
          totalBudget: 26000
        }
        
        // 显示成功提示
        alert('策划方案生成成功！')
      } catch (error) {
        console.error('生成策划方案失败:', error)
        alert('生成失败，请稍后重试')
      } finally {
        isGenerating.value = false
      }
    }

    const savePlan = () => {
      // 保存策划方案逻辑
      alert('方案已保存！')
    }

    const getEventTypeText = (type) => {
      const typeMap = {
        product_launch: '产品发布会',
        team_building: '团建活动',
        conference: '会议论坛',
        exhibition: '展览展示',
        wedding: '婚礼庆典'
      }
      return typeMap[type] || ''
    }

    return {
      isGenerating,
      formData,
      generatedPlan,
      generatePlan,
      savePlan
    }
  }
}
</script>

<style scoped>
.ai-generate-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.input-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.input-section h2 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
}

.generate-btn {
  background: #1890ff;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.generate-btn:hover {
  background: #40a9ff;
}

.generate-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result-section {
  margin-top: 30px;
}

.plan-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.plan-section {
  margin-bottom: 25px;
}

.plan-section h4 {
  margin-bottom: 10px;
  color: #333;
  border-left: 4px solid #1890ff;
  padding-left: 10px;
}

.schedule-list {
  list-style: none;
  padding: 0;
}

.schedule-list li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  display: flex;
}

.schedule-list li:last-child {
  border-bottom: none;
}

.time {
  font-weight: bold;
  width: 120px;
  color: #1890ff;
}

.materials-table {
  width: 100%;
  border-collapse: collapse;
}

.materials-table th,
.materials-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.materials-table th {
  background: #fafafa;
  font-weight: bold;
}

.total-budget {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  text-align: right;
}

.save-btn {
  background: #52c41a;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  float: right;
}

.save-btn:hover {
  background: #73d13d;
}
</style>