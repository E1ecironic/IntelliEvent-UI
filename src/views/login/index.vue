<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/images/vue.svg" alt="Logo" class="logo" v-if="hasLogo" />
        <h2 class="title">智能活动管理系统</h2>
        <p class="subtitle">IntelliEvent Management System</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        size="large"
      >
        <el-form-item prop="userName">
          <el-input
            v-model="loginForm.userName"
            placeholder="用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="code">
          <div class="captcha-wrapper">
            <el-input
              v-model="loginForm.code"
              placeholder="验证码"
              :prefix-icon="Key"
              class="captcha-input"
              @keyup.enter="handleLogin"
            />
            <div class="captcha-img-box" @click="refreshCaptcha" v-loading="captchaLoading">
              <img v-if="captchaImg" :src="captchaImg" alt="验证码" class="captcha-img" />
              <div v-else class="captcha-placeholder">加载中...</div>
            </div>
          </div>
        </el-form-item>

        <div class="login-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-button link type="primary">忘记密码？</el-button>
        </div>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { authApi } from '@/api'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)
const captchaLoading = ref(false)
const captchaImg = ref('')
const rememberMe = ref(false)
const hasLogo = ref(true)

const loginForm = reactive({
  userName: '',
  password: '',
  code: '',
  uuid: ''
})

const loginRules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 获取验证码
const refreshCaptcha = async () => {
  if (captchaLoading.value) return
  captchaLoading.value = true
  try {
    const res = await authApi.getCaptcha()
    if (res.code === 200) {
      captchaImg.value = res.data.img
      loginForm.uuid = res.data.uuid
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
  } finally {
    captchaLoading.value = false
  }
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res = await authApi.login(loginForm)
        if (res.code === 200) {
          ElMessage.success('登录成功')
          // 持久化 Token
          localStorage.setItem('token', res.data.token)
          // 存储用户信息
          localStorage.setItem('userInfo', JSON.stringify(res.data.user))
          // 跳转到首页
          router.push('/')
        }
      } catch (error: any) {
        console.error('登录失败:', error)
        // 登录失败通常需要刷新验证码
        refreshCaptcha()
        loginForm.code = ''
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: cover;
}

.login-box {
  width: 400px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  .title {
    margin: 0;
    font-size: 24px;
    color: #303133;
    font-weight: 600;
  }

  .subtitle {
    margin: 8px 0 0;
    font-size: 14px;
    color: #909399;
  }
}

.login-form {
  .captcha-wrapper {
    display: flex;
    gap: 12px;
    width: 100%;

    .captcha-input {
      flex: 1;
    }

    .captcha-img-box {
      width: 120px;
      height: 40px;
      cursor: pointer;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f7fa;

      .captcha-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .captcha-placeholder {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .login-button {
    width: 100%;
    height: 44px;
    font-size: 16px;
    letter-spacing: 4px;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
    }
  }
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}
</style>
