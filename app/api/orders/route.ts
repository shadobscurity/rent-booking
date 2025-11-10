import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const variant_id = String(form.get('variant_id') || '')
  const wear_date = String(form.get('wear_date') || '')
  const extra_duration = Number(form.get('extra_duration') || 0)
  const delivery_type = String(form.get('delivery_type') || 'INSTANT')

  if (!variant_id || !wear_date) return NextResponse.redirect(new URL('/?error=missing', req.url))

  // find available inventory
  const url = new URL(req.url)
  url.pathname = '/api/availability'
  url.searchParams.set('variantId', variant_id)
  url.searchParams.set('wear_date', wear_date)
  url.searchParams.set('extra_duration', String(extra_duration))
  const avail = await fetch(url.toString(), { cache: 'no-store' }).then(r => r.json())

  if (!avail.availableInventoryId) {
    return NextResponse.redirect(new URL('/?error=unavailable', req.url))
  }

  // product price
  const { data: variantRow } = await supabaseAdmin
    .from('variants')
    .select('id, product:products ( id, base_price, extra_day, deposit )')
    .eq('id', variant_id).single()

  const base = variantRow?.product?.base_price ?? 0
  const extra = (variantRow?.product?.extra_day ?? 0) * extra_duration
  const total = base + extra
  const deposit = variantRow?.product?.deposit ?? 0

  const { data: order, error } = await supabaseAdmin.rpc('create_order_with_booking', {
    p_inventory_id: avail.availableInventoryId,
    p_wear_date: wear_date,
    p_extra_duration: extra_duration,
    p_delivery_type: delivery_type,
    p_total: total,
    p_deposit: deposit
  })

  if (error) {
    console.error(error)
    return NextResponse.redirect(new URL('/?error=order', req.url))
  }

  return NextResponse.redirect(new URL('/success', req.url))
}
