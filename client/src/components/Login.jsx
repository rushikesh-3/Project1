import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext.js'
import toast from 'react-hot-toast'

export default function Login({ setShowLogin }) {
  const { axios, setToken, setShowLogin: setContextShowLogin } = useAppContext()
  const [state, setState] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const close = () => { setShowLogin(false); setContextShowLogin(false) }

  const submit = async event => {
    event.preventDefault()
    try {
      if (state === 'request-reset') {
        const { data } = await axios.post('/api/user/request-reset', { email })
        if (!data.success) return toast.error(data.message)
        toast.success(data.message); setState('reset'); return
      }
      if (state === 'reset') {
        const { data } = await axios.post('/api/user/reset-password', { email, otp, password })
        if (!data.success) return toast.error(data.message)
        toast.success(data.message); setState('login'); setPassword(''); setOtp(''); return
      }
      const registering = state === 'register'
      const { data } = await axios.post(registering ? '/api/user/register' : '/api/user/login', registering ? { name, email, password } : { email, password })
      if (!data.success) return toast.error(data.message)
      localStorage.setItem('token', data.token); setToken(data.token)
      toast.success(registering ? 'Account created' : 'Logged in'); close()
    } catch (error) { toast.error(error.response?.data?.message || error.message) }
  }

  const title = state === 'register' ? 'Create Account' : state === 'request-reset' ? 'Reset Password' : state === 'reset' ? 'Enter Reset Code' : 'Login'
  return <div onClick={close} className="fixed inset-0 z-[100] flex items-center bg-black/50 text-sm text-gray-600">
    <form onSubmit={submit} onClick={e => e.stopPropagation()} className="m-auto flex w-80 flex-col items-start gap-4 rounded-lg border border-gray-200 bg-white p-8 py-10 shadow-xl sm:w-[352px]">
      <button type="button" onClick={close} aria-label="Close login" className="self-end text-xl">×</button>
      <p className="m-auto text-2xl font-medium"><span className="text-primary">CarRental</span> {title}</p>
      {state === 'register' && <label className="w-full">Name<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required className="mt-1 w-full rounded border p-2"/></label>}
      <label className="w-full">Email<input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" required className="mt-1 w-full rounded border p-2"/></label>
      {state === 'reset' && <label className="w-full">6 digit reset code<input value={otp} onChange={e => setOtp(e.target.value)} inputMode="numeric" pattern="[0-9]{6}" required className="mt-1 w-full rounded border p-2"/></label>}
      {state !== 'request-reset' && <label className="w-full">{state === 'reset' ? 'New password' : 'Password'}<input value={password} onChange={e => setPassword(e.target.value)} type="password" minLength={8} autoComplete={state === 'login' ? 'current-password' : 'new-password'} required className="mt-1 w-full rounded border p-2"/></label>}
      {state === 'login' && <button type="button" onClick={() => setState('request-reset')} className="self-end text-primary">Forgot password?</button>}
      {state === 'register' && <p>Already registered? <button type="button" onClick={() => setState('login')} className="text-primary">Log in</button></p>}
      {state === 'login' && <p>Need an account? <button type="button" onClick={() => setState('register')} className="text-primary">Sign up</button></p>}
      {state === 'reset' && <button type="button" onClick={() => setState('request-reset')} className="text-primary">Request another code</button>}
      {(state === 'request-reset' || state === 'reset') && <button type="button" onClick={() => setState('login')} className="text-primary">Back to login</button>}
      <button className="w-full rounded-md bg-primary py-2 text-white hover:bg-primary-dull">{state === 'register' ? 'Create Account' : state === 'request-reset' ? 'Send reset code' : state === 'reset' ? 'Update password' : 'Login'}</button>
      {(state === 'request-reset' || state === 'reset') && <p className="text-xs">For this development setup, the reset code is printed in the server terminal.</p>}
    </form>
  </div>
}
