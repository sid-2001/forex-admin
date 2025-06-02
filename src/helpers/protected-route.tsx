// import { Navigate } from "react-router-dom";

import { Navigate } from 'react-router-dom'
import { LocalStorageService } from '../helpers/local-storage-service'

export type ProtectedRouteProps = {
  authenticationPath: string
  outlet: JSX.Element
}

function ProtectedRoute({
  //@ts-ignore
  authenticationPath,
  outlet,
}: ProtectedRouteProps) {
  const localstorageService = new LocalStorageService()
  const isAuthenticated = localstorageService.get_accesstoken()

  if (isAuthenticated) {
    return outlet
  } else {
    return <Navigate to={{ pathname: authenticationPath }} />
    // return outlet
  }
}

export default ProtectedRoute
