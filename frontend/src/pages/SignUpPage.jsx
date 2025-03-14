import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, MessageSquare } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const [emailValid, setEmailValid] = useState(0);
  const validateEmail = () => {
    if (!formData.email.trim()) {
      setEmailValid(1);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailValid(2);
      return false;
    }
    setEmailValid(0);
    return true;
  };

  const [fullnameValid, setFullnameValid] = useState(true);
  const validateFullname = () => {
    if (!formData.fullName.trim()) {
      setFullnameValid(false);
      return false;
    }
    setFullnameValid(true);
    return true;
  };

  const [passwordValid, setPasswordValid] = useState(0);
  const validatePassword = () => {
    if (!formData.password) {
      setPasswordValid(1);
      return false;
    }
    if (formData.password.length < 6) {
      setPasswordValid(2);
      return false;
    }
    setPasswordValid(0);
    return true;
  };

  const [repeatValid, setRepeatValid] = useState(true);
  const validateRepeatPsw = () => {
    if (formData.password !== formData.repeatPassword) {
      setRepeatValid(false);
      return false;
    }
    setRepeatValid(true);
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 点击表单的提交按钮会触发表单提交并刷新页面，可以使用 preventDefault() 阻止这个行为：
    const success =
      validateEmail() &
      validateFullname() &
      validatePassword() &
      validateRepeatPsw();
    if (success == true) {
      signup(formData).then(() => {
        navigate("/");
      });
    }
  };
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* leftside */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 ">
        <div className="w-full max-w-md space-y-8">
          {/* logo */}
          <div className="text-center mb-8 ">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <div className="text-2xl font-bold mt-2">创建账户</div>
              <div className="text-base-content/60">
                免费开启你的聊天账户吧！
              </div>
            </div>
          </div>
          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-xs space-y-2">
              <div>Email</div>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  type="text"
                  className="grow"
                  placeholder="you@email.com"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  onBlur={() => validateEmail()}
                />
              </label>
              {emailValid === 0 ? (
                <></>
              ) : (
                <div className="text-error">
                  {emailValid === 1 ? "邮箱必填" : "邮箱格式有误"}
                </div>
              )}
            </div>
            <div className="text-xs space-y-2">
              <div>Full Name</div>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input
                  type="text"
                  className="grow"
                  placeholder="Cathy Wong"
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  onBlur={() => validateFullname()}
                />
              </label>
              {fullnameValid ? (
                <></>
              ) : (
                <div className="text-error">用户名必填</div>
              )}
            </div>
            <div className="text-xs space-y-2">
              <div>Password</div>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="grow"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  onBlur={() => validatePassword()}
                />
                <div
                  className="cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 cursor-pointer" />
                  )}
                </div>
              </label>
              {passwordValid === 0 ? (
                <></>
              ) : (
                <div className="text-error">
                  {passwordValid === 1 ? "密码必填" : "密码至少为6位数"}
                </div>
              )}
            </div>
            <div className="text-xs space-y-2">
              <div>Repeat Password</div>
              <label className="input input-bordered flex items-center gap-2 w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  className="grow"
                  onChange={(e) =>
                    setFormData({ ...formData, repeatPassword: e.target.value })
                  }
                  onBlur={() => validateRepeatPsw()}
                />
                <div
                  className="cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 cursor-pointer" />
                  )}
                </div>
              </label>
              {repeatValid ? (
                <></>
              ) : (
                <div className="text-error">输入两次密码不一致</div>
              )}
            </div>
            {/* submit button */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <span className="loading loading-dots loading-sm">
                    注册中...
                  </span>
                </>
              ) : (
                "立即注册"
              )}
            </button>
          </form>
          <div className="text-center">
            <p className="text-base-content/60">
              已经拥有一个账户了？{" "}
              <Link to="/login" className="link link-primary">
                立刻登录！
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={
          "Sign in to continue your conversations and catch up with your messages."
        }
      />
    </div>
  );
};

export default SignUpPage;
