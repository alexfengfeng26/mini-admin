import { ref } from 'vue'
import { isPermissionError, getPermissionErrorMessage } from '@/utils/api'

export interface ErrorHandlerOptions {
  showPermissionDenied?: boolean
  permission?: string
  onError?: (error: any) => void
  onPermissionError?: (error: any) => void
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    showPermissionDenied = false,
    permission = '',
    onError,
    onPermissionError
  } = options

  const error = ref<string | null>(null)
  const isPermissionDenied = ref(false)

  const handleError = (err: any, customMessage?: string) => {
    error.value = null
    isPermissionDenied.value = false

    if (isPermissionError(err)) {
      isPermissionDenied.value = true
      error.value = getPermissionErrorMessage(err)
      onPermissionError?.(err)
      return
    }

    // 处理其他错误
    const errorMessage = customMessage ||
      err?.response?.data?.message ||
      err?.message ||
      '操作失败，请稍后重试'

    error.value = errorMessage
    onError?.(err)

    // 只在非权限错误时显示alert
    if (!isPermissionError(err)) {
      console.error('操作错误:', err)
    }
  }

  const clearError = () => {
    error.value = null
    isPermissionDenied.value = false
  }

  return {
    error,
    isPermissionDenied,
    handleError,
    clearError
  }
}

// 简化版本，只处理API错误
export function useApiError() {
  const { error, isPermissionDenied, handleError, clearError } = useErrorHandler({
    onError: (err) => {
      // 只在非权限错误时显示alert
      if (!isPermissionError(err)) {
        alert(error.value || '操作失败')
      }
    }
  })

  return {
    error,
    isPermissionDenied,
    handleError,
    clearError
  }
}