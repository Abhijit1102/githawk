import LoginUI from "@/lib/module/auth/components/LoginUI"
import { requireUnAuth } from "@/lib/module/auth/utils/auth-utils"

const LoginPage = async() => {
  await requireUnAuth();
  return (
    <div>
        <LoginUI />
    </div>
  )
}

export default LoginPage