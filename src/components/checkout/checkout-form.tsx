'use client'

import { useActionState, useState } from 'react'
import { createOrder } from '@/lib/actions/checkout'
import { useLocale } from '@/lib/i18n/client'

export function CheckoutForm({ addressId, total }: { addressId: string; total: number }) {
  const [state, formAction, pending] = useActionState(createOrder, null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card')
  const { t } = useLocale()

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="addressId" value={addressId} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <div>
        <span className="block text-sm font-medium text-neutral-700">{t('checkout.paymentMethod')}</span>
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm has-[:checked]:border-neutral-900">
            <input
              type="radio"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
            />
            {t('checkout.payOnline')}
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2 text-sm has-[:checked]:border-neutral-900">
            <input
              type="radio"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
            />
            {t('checkout.cashOnDelivery')}
          </label>
        </div>
      </div>

      {state && 'error' in state && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? (
          t('checkout.placingOrder')
        ) : (
          <>
            {paymentMethod === 'card' ? t('checkout.continueToPayment') : t('checkout.placeOrder')}
            {' · '}
            <span dir="ltr">{total.toFixed(2)} SAR</span>
          </>
        )}
      </button>
    </form>
  )
}
