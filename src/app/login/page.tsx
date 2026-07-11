import { Suspense } from 'react'

import { LoginForm } from '@/components/login-form'

/**
 * Login page recreated from Bubble Sign in (email + password).
 */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        className="absolute inset-0 bg-[linear-gradient(160deg,#091e7c_0%,#0c29ab_42%,#f7f7f7_42%,#ffffff_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 top-0 h-[42%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.18),transparent_60%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto w-full max-w-md">
        <Suspense
          fallback={
            <div className="rounded-[20px] border border-[#e6e6e6] bg-white p-8 text-center text-sm text-[#525252]">
              Loading sign in...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
