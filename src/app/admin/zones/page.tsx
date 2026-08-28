import { createAdminClient } from '@/lib/supabase/admin'
import { ZoneMapEditor } from '@/components/admin/zone-map-editor'
import { ZoneListItem } from '@/components/admin/zone-list-item'

type ZoneRow = { id: string; name: string; active: boolean }

export default async function AdminZonesPage() {
  // The regular RLS-scoped client can only see active=true zones (see the
  // "service_zones: public read active zones" policy) — this page needs to
  // show inactive ones too, and admin-gating already happened in layout.tsx.
  const admin = createAdminClient()
  const { data: zones } = await admin
    .from('service_zones')
    .select('id, name, active')
    .order('name')
    .returns<ZoneRow[]>()

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold text-neutral-900">Draw a new delivery zone</h1>
        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <ZoneMapEditor />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-neutral-900">Existing zones</h2>
        <div className="mt-4 space-y-2">
          {(zones ?? []).map((zone) => (
            <ZoneListItem key={zone.id} id={zone.id} name={zone.name} active={zone.active} />
          ))}
          {(!zones || zones.length === 0) && (
            <p className="text-sm text-neutral-500">No zones yet — draw one above.</p>
          )}
        </div>
      </section>
    </div>
  )
}
