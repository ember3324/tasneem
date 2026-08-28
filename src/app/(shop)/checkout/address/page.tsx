import { AddressForm } from '@/components/checkout/address-form'

export default function CheckoutAddressPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-neutral-900">Delivery location</h1>
      <p className="mt-1 text-sm text-neutral-500">
        We need this to confirm you&apos;re within our delivery area.
      </p>
      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <AddressForm />
      </div>
    </div>
  )
}
