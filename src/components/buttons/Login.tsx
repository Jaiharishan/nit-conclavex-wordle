import { useState } from 'react'
import GoogleLogin from 'react-google-login'
import { BACKEND_URL } from '../../constants/strings'

const responseGoogle = (res: any) => {
  console.log(res)
}

export let currentUserEmail = ''
const Login = () => {
  const [user, setUser]: any = useState({})
  const onSuccess = (res: any) => {
    // send the response to a backend using axios and get that creds store in a database and display in leaderboard
    let data = {
      id: res.profileObj.googleId,
      name: res.profileObj.name,
      email: res.profileObj.email,
      score: 0,
    }

    setUser(data)
    currentUserEmail = res.profileObj.email

    fetch(BACKEND_URL + '/postUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then((res) => {
      console.log('Request complete! response:', res)
    })
  }
  const clientId =
    '428218354441-bbovvr4fia9t9v7obe75c6kp7hils1nb.apps.googleusercontent.com'
  return (
    <div className="flex w-100 mt-10 items-center justify-center">
      {/* <button>Login with google</button> */}
      {user?.email ? (
        <p className="text-xl font-bold dark:text-white">Hi! {user.name}</p>
      ) : (
        <GoogleLogin
          clientId={clientId}
          render={(renderProps) => (
            <button
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
              className="dark:bg-white shadow-lg px-3 py-3 rounded-lg flex gap-1 items-center hover:scale-105 transition duration-150"
            >
              <img
                src="https://img.icons8.com/color/50/000000/google-logo.png"
                alt="google-icon"
                className="w-8 h-8 md:w-10 md:h-10"
              />

              <p className="md:text-lg">Login with Google</p>
            </button>
          )}
          buttonText="Login with Google"
          onSuccess={onSuccess}
          onFailure={responseGoogle}
          cookiePolicy={'single_host_origin'}
        />
      )}
    </div>
  )
}

export default Login
