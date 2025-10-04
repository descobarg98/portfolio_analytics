import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Login() {
  const { login } = useAuth()

  const handleLogin = () => {
    login()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex items-center">
          <img src={`${import.meta.env.BASE_URL}sharpeful-logo.png`} alt="Sharpeful" className="h-12 w-auto mb-2" />
          <CardTitle>Welcome to Sharpeful</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLogin} className="w-full">
            Sign In with Auth0
          </Button>
          <p className="text-sm text-gray-600 text-center">
            Don&apos;t have an account? <Link className="underline" to="/signup">Create one</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
