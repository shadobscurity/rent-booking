import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const variant_id = String(form.get('variant_id') || '')
  const wear_date = String(form.get('wear_date') || '')
  const extra_duration = Number(form.get('extra_duration') || 0)
  const delivery_type = String(form.get('delivery_type') || 'INSTANT')

  if (!variant_id || !wear_date) {
    const u = new URL(req.url); u.pathname = '/'; u.searchParams.set('error', 'missing')
    return NextResponse.redirect(u)
  }

  // 1) cari inventory available
  const availUrl = new URL(req.url)
  availUrl.pathname = '/api/availability'
  availUrl.searchParams.set('variantId', variant_id)
  availUrl.searchParams.set('wear_date', wear_date)
  availUrl.searchParams.set('extra_duration', String(extra_duration))
  const avail = await fetch(availUrl.toString(), { cache: 'no-store' }).then(r => r.json())

  if (!avail.availableInventoryId) {
    const u = new URL(req.url); u.pathname = '/'; u.searchParams.set('error', 'unavailable')
    return NextResponse.redirect(u)
  }

  // 2) ambil product harga via 2 query (hindari typing error)
  const { data: variantRow, error: vErr } = await supabaseAdmin
    .from('variants')
    .select('id, product_id')
    .eq('id', variant_id)
    .single()
  if (vErr || !variantRow) {
    const u = new URL(req.url); u.pathname = '/'; u.searchParams.set('error', 'variant')
    return NextResponse.redirect(u)
  }

  const { data: product, error: pErr } = await supabaseAdmin
    .from('products')
    .select('base_price, extra_day, deposit')
    .eq('id', variantRow.product_id)
    .single()
  if (pErr || !product) {
    const u = new URL(req.url); u.pathname = '/'; u.searchParams.set('error', 'product')
    return NextResponse.redirect(u)
  }

  const base = Number(product.base_price ?? 0)
  const extra = Number(product.extra_day ?? 0) * Number(extra_duration ?? 0)
  const total = base + extra
  const deposit = Number(product.deposit ?? 0)

  // 3) create order + booking via RPC
  const { error: rpcErr } = await supabaseAdmin.rpc('create_order_with_booking', {
    p_inventory_id: avail.availableInventoryId,
    p_wear_date: wear_date,
    p_extra_duration: extra_duration,
    p_delivery_type: delivery_type,
    p_total: total,
    p_deposit: deposit
  })

  if (rpcErr) {
    const u = new URL(req.url); u.pathname = '/'; u.searchParams.set('error', 'order')
    return NextResponse.redirect(u)
  }

  const u = new URL(req.url); u.pathname = '/success'
  return NextResponse.redirect(u)
}
