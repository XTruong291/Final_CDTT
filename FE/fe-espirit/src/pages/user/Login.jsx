import { useState } from 'react'
import { authService } from '../../services/authService'

function formatJson(value) {
  if (value === undefined) return '(empty)'
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const body = { username, password }
    setLoading(true)
    setResult({
      requestBody: body,
      httpStatus: null,
      responseBody: null,
      error: null,
    })

    try {
      const data = await authService.login(body)
      setResult({
        requestBody: body,
        httpStatus: '2xx',
        responseBody: data,
        error: null,
      })
    } catch (err) {
      const status = err.response?.status ?? null
      const responseBody = err.response?.data ?? err.message
      setResult({
        requestBody: body,
        httpStatus: status,
        responseBody,
        error: err.message || 'Request failed',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Login API test</h1>
      <p className="mt-1 text-sm text-gray-500">
        POST /api/v1/auth/login — không lưu token, không redirect.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          Username
          <input
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-4 text-sm">
          <section>
            <h2 className="font-medium">Request body</h2>
            <pre className="mt-1 overflow-auto rounded bg-gray-100 p-3">{formatJson(result.requestBody)}</pre>
          </section>
          <section>
            <h2 className="font-medium">HTTP status</h2>
            <p className="mt-1">{result.httpStatus ?? (loading ? 'pending' : 'no HTTP status (network/CORS)')}</p>
          </section>
          <section>
            <h2 className="font-medium">Response body</h2>
            <pre className="mt-1 overflow-auto rounded bg-gray-100 p-3">{formatJson(result.responseBody)}</pre>
          </section>
          {result.error && (
            <section>
              <h2 className="font-medium text-red-700">Error</h2>
              <pre className="mt-1 overflow-auto rounded bg-red-50 p-3 text-red-700">{result.error}</pre>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
