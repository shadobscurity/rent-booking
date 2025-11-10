// @ts-nocheck
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import Link from 'next/link'

export default async function Home({ searchParams }) {
  const wear_date = searchParams?.wear_date ?? ''
  const extra = searchParams?.extra_duration ?? '0'
  const delivery = searchParams?.delivery_type ?? 'instant'

  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, slug, name, brand, base_price')
    .order('name')

  return (
    <div className="space-y-4 p-6">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(products ?? []).map(p => (
          <Link
            key={p.id}
            href={`/detail/${p.slug}?wear_date=${wear_date}&extra_duration=${extra}&delivery_type=${delivery}`}
            className="border rounded block"
          >
            <div className="aspect-[3/4] bg-gray-200" />
            <div className="p-3">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm opacity-75">Mulai Rp {Number(p.base_price ?? 0).toLocaleString('id-ID')}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
