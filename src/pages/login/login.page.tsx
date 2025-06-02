import { FunctionComponent } from 'react'
import FrameComponent from '../../components/login-frame'
import './login.page.css'
const LoginPage: FunctionComponent = () => {
  return (
    <div className="login-admin">
      <FrameComponent headquarters="Headquarters" signInButton="/sign-in-button.svg" qiqNewLogos1="" />
    </div>
  )
}

export default LoginPage
