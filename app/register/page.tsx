'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('两次密码不一致')
      return
    }
    if (password.length < 6) {
      setError('密码至少6个字符')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else if (data.session) {
      // 注册成功并已登录（邮箱确认关闭时）
      router.push('/')
      router.refresh()
    } else if (data.user && !data.session) {
      // 注册成功但需要确认邮箱
      setError('注册成功！请检查邮箱确认您的账户（如果未收到，可能已自动激活，请直接登录）')
      setLoading(false)
      return
    } else {
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Heart className="h-12 w-12 text-pink-500 fill-pink-500 mx-auto" />
          <CardTitle>创建账户</CardTitle>
          <CardDescription>开始记录您的恋爱旅程</CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="密码（至少6个字符）" value={password} onChange={e => setPassword(e.target.value)} required />
            <Input type="password" placeholder="确认密码" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : '注册'}
            </Button>
          </CardFooter>
        </form>
        <CardFooter className="justify-center">
          <p className="text-sm">已有账户？ <Link href="/login" className="text-pink-600">登录</Link></p>
        </CardFooter>
      </Card>
    </div>
  )
}
