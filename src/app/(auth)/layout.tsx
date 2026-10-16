export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <a href="/categories" className="mb-6 text-2xl font-extrabold text-brand-700">
        نبع مكيون
      </a>
      <div className="w-full max-w-sm">
        <div className="surface p-8">{children}</div>
      </div>
    </div>
  )
}
