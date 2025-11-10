// @ts-nocheck
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { calcPrice } from '@/lib/pricing'

export default async function Detail({ params, searchParams }) {
  const wear_date = searchParams?.wear_date ?? ''
  const extra = Number(searchParams?.extra_duration ?? 0)
  const delivery = (searchParams?.delivery_type ?? 'instant').toUpperCase()

  const { data: product } = await supabaseAdmin
    .from('products')
    .select(`
      id, slug, name, brand, description,
      base_price, extra_day, deposit,
      variants ( id, size )
    `)
    .eq('slug', params.slug)
    .maybeSingle()

  if (!product) return <div>Not found</div>

  const price = calcPrice(Number(product.base_price), Number(product.extra_day), extra)

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6">
      <div className="aspect-[3/4] bg-gray-200 rounded" />
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="opacity-75">by {product.brand}</p>

        <div className="mt-4">
          <div className="text-lg font-medium">
            Total: Rp {price.toLocaleString('id-ID')}
          </div>
          <div className="text-sm opacity-75">
            Deposit: Rp {Number(product.deposit ?? 0).toLocaleString('id-ID')}
          </div>

          <form method="post" action="/api/orders" className="space-y-3 mt-4">
            <input type="hidden" name="variant_id" value={product.variants?.[0]?.id ?? ''} />

            <label className="block">
              <span>Tanggal pakai</span>
              <input name="wear_date" type="date" required defaultValue={wear_date} className="border rounded px-3 py-2 w-full" />
            </label>

            <label className="block">
              <span>Extra hari</span>
              <input name="extra_duration" type="number" min={0} defaultValue={extra} className="border rounded px-3 py-2 w-full" />
            </label>

            <label className="block">
              <span>Pengiriman</span>
              <select name="delivery_type" defaultValue={delivery} className="border rounded px-3 py-2 w-full">
                <option value="INSTANT">Instant</option>
                <option value="SAME_DAY">Same-day</option>
                <option value="REGULAR">Regular</option>
                <option value="PICKUP">Pickup</option>
              </select>
            </label>

            <button className="bg-black text-white px-4 py-2 rounded w-full">
              Book Now
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
