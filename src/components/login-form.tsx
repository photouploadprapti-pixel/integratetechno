'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { getRoleHomePath, getUserRole } from '@/lib/auth/roles'
import { createClient } from '@/lib/supabase/client'

/**
 * Branded login form that signs in with Supabase Auth.
 */
export const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Signs the user in and redirects by role to the correct dashboard home.
   * @param event - Form submit event
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    const role = getUserRole(data.user)
    const fallback = getRoleHomePath(role)
    const nextPath = searchParams.get('next') || fallback
    router.push(nextPath.startsWith('/admin') ? nextPath : fallback)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md rounded-[20px] border border-[#e6e6e6] bg-white p-6 shadow-[0_12px_40px_rgba(12,41,171,0.12)] md:p-8">
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/assets/logo.png"
          alt="Integrate Techno Trade"
          width={96}
          height={96}
          className="mb-4 h-20 w-20 rounded-full object-cover shadow-md md:h-24 md:w-24"
          priority
        />
        <Image
          src="/assets/wordmark.png"
          alt="Integrate Techno Trade"
          width={320}
          height={40}
          className="mb-3 h-auto w-full max-w-[260px]"
          priority
        />
        <h1 className="font-[family-name:var(--font-righteous)] text-2xl text-[#1a1a1a]">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-[#525252]">
          Access your Integrate Techno Trade account
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-sm font-light text-[#1a1a1a]">
          Email address
          <input
            required
            type="email"
            autoComplete="email"
            placeholder="Enter your email.."
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-12 rounded-[10px] border-2 border-[#e6e6e6] px-3 text-base outline-none transition-colors focus:border-[#0c29ab]"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-light text-[#1a1a1a]">
          Password
          <input
            required
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password.."
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-12 rounded-[10px] border-2 border-[#e6e6e6] px-3 text-base outline-none transition-colors focus:border-[#0c29ab]"
          />
        </label>

        {error ? (
          <p className="rounded-[10px] bg-[#ef2f15]/10 px-3 py-2 text-sm text-[#ef2f15]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex min-h-11 items-center justify-center rounded-[20px] bg-[#0c29ab] px-8 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm font-medium text-[#2c3d94] transition-colors hover:text-[#000b3a]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
