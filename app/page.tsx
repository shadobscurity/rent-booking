// @ts-nocheck
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export default async function Home({ searchParams }:{
  searchParams: { wear_date?: string; extra_duration?: string; delivery_type?: string }
}) {
  const wear_date = searchParams.wear_date ?? ''
  const extra = searchParams.extra_duration ?? '0'
  const delivery = searchParams.delivery_type ?? 'instant'

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, slug, name, brand, base_price')
    .order('name')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2" type="date" defaultValue={wear_date} />
        <input className="border rounded px-3 py-2 w-28" type="number" min={0} defaultValue={extra} placeholder="Extra days" />
        <select className="border rounded px-3 py-2" defaultValue={delivery}>
          <option value="instant">Instant</option>
          <option value="same_day">Same-day</option>
          <option value="regular">Regular</option>
          <option value="pickup">Pickup</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(products ?? []).map((p: any) => (
          <Link
            key={p.id}
            href={`/detail/${p.slug}?wear_date=${wear_date}&extra_duration=${extra}&delivery_type=${delivery}`}
