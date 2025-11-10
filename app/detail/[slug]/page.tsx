import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { calcPrice } from '@/lib/pricing'

export default async function Detail({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { wear_date?: string; extra_duration?: string; delivery_type?: string }
}) {
  const wear_date = searchParams?.wear_date ?? ''
  const extra = Number(searchParams?.extra_duration ?? 0)
  const delivery = (searchParams?.delivery_type ?? 'instant').toUpperCase()

  const { data: product, error } = await supabaseAdmin
    .from('products')
    .select('id, name, brand, description, base_price, extra_day, deposit, slug, variants ( id, size )')
    .eq('slug', params.slug)
    .single()

  if (error || !product) {
    return <div className="text-red-600">Product not found</div>
  }

  const price = calcPrice(Number(product.base_price), Number(product.extra_day), extra)

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="aspect-[3/4] bg-gray-100 rounded" />
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm opacity-80">by {product.brand ?? 'Collection'}</p>

        <div className="mt-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {product.variants?.map((v: any) => (
              <span key={v.id} className="px-3 py-1 border rounded">{v.size}</span>
            ))}
          </div>

          <div className="text-lg font-medium mt-2">
            Total sewa: Rp {price.toLocaleString('id-ID')}
            <span className="block text-sm opacity-75">Deposit: Rp {Number(product.deposit).toLocaleString('id-ID')}</span>
          </div>

          <form method="post" action="/api/orders" className="space-y-2">
            <input type="hidden" name="variant_id" value={product.variants?.[0]?.id ?? ''} />
            <label className="block">
              <span className="text-sm">Tanggal pakai</span>
              <input name="wear_date" type="date" defaultValue={wear_date} className="border rounded px-3 py-2 w-full" required />
            </label>
            <label className="block">
              <span className="text-sm">Extra hari</span>
              <input name="extra_duration" type="number" min={0} defaultValue={extra} className="border rounded px-3 py-2 w-full" />
            </label>
            <label className="block">
              <span className="text-sm">Delivery</span>
              <select name="delivery_type" defaultValue={delivery} className="border rounded px-3 py-2 w-full">
                <option value="INSTANT">Instant</option>
                <option value="SAME_DAY">Same-day</option>
                <option value="REGULAR">Regular</option>
                <option value="PICKUP">Pickup</option>
              </select>
            </label>
            <button className="bg-black text-white px-4 py-2 rounded w-full">Book Now</button>
          </form>
        </div>
      </div>

      <section className="md:col-span-2 mt-4">
        <h2 className="font-semibold mb-2">Deskripsi</h2>
        <p className="opacity-90">{product.description ?? '—'}</p>
      </section>
    </div>
  )
}
