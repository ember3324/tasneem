'use client'

import { useActionState, useState } from 'react'
import { createOrder } from '@/lib/actions/checkout'
import { useLocale } from '@/lib/i18n/client'

const OPTION =
  'flex cursor-pointer items-center gap-3 rounded-xl border border-ocean-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700'

export function CheckoutForm({ addressId, total }: { addressId: string; total: number }) {
  const [state, formAction, pending] = useActionState(createOrder, null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card')
  const { t } = useLocale()

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="addressId" value={addressId} />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <div>
        <span className="field-label">{t('checkout.paymentMethod')}</span>
        <div className="space-y-2">
          <label className={OPTION}>
            <input
              type="radio"
              className="accent-brand-600"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
            />
            {t('checkout.payOnline')}
          </label>
          <label className={OPTION}>
            <input
              type="radio"
              className="accent-brand-600"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
            />
            {t('checkout.cashOnDelivery')}
          </label>
        </div>
      </div>

      {state && 'error' in state && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn btn-primary w-full py-3 text-sm">
        {pending ? (
          t('checkout.placingOrder')
        ) : (
          <>
            {paymentMethod === 'card' ? t('checkout.continueToPayment') : t('checkout.placeOrder')}
            {' · '}
            <span dir="ltr">{total.toFixed(2)} ر.س</span>
          </>
        )}
      </button>
    </form>
  )
}
