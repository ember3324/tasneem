'use client'

import { useTransition } from 'react'
import { toggleZoneActive, deleteZone } from '@/lib/actions/zones'

export function ZoneListItem({
  id,
  name,
  active,
}: {
  id: string
  name: string
  active: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <div>
        <p className="font-medium text-neutral-900">{name}</p>
        <p className="text-xs text-neutral-500">{active ? 'Active' : 'Inactive'}</p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => toggleZoneActive(id, !active))}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          {active ? 'Deactivate' : 'Activate'}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => deleteZone(id))}
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
