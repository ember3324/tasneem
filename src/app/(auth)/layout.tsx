import { WhatsAppButton } from '@/components/shop/whatsapp-button'
import { getLocale } from '@/lib/i18n/server'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border-2 border-ocean-300 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
      <WhatsAppButton locale={locale} />
    </div>
  )
}
