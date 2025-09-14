import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Signup() {
  const { signup } = useAuth()

  const handleSignup = () => {
    signup()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start using Sharpeful in seconds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSignup} className="w-full">
            Sign Up with Auth0
          </Button>
          <p className="text-sm text-gray-600 text-center">
            Already have an account? <Link className="underline" to="/login">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
