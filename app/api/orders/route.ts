// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const variant_id = String(form.get('variant_id') || '')
  const wear_date = String(form.get('wear_date') || '')
  const extra_duration = Number(form.get('extra_duration') || 0)
  const delivery_type = String(form.get('delivery_type') || 'INSTANT')

  if (!variant_id || !wear_date) {
    return NextResponse.redirect(new URL('/?error=missing', req.url))
  }

  // Cek inventory yang available
  const availUrl = new URL(req.url)
  availUrl.pathname = '/api/availability'
  availUrl.search = ''
  availUrl.searchParams.set('variantId', variant_id)
  availUrl.searchParams.set('wear_date', wear_date)
  availUrl.searchParams.set('extra_duration', String(extra_duration))

  const avail = await fetch(availUrl.toString(), { cache: 'no-store' }).then(r => r.json())
  if (!avail?.availableInventoryId) {
    return NextResponse.redirect(new URL('/?error=unavailable', req.url))
  }

  // Ambil info harga produk
  const { data: variantRow, error: vErr } = await supabaseAdmin
    .from('variants')
    .select(`
      id,
      product:products (
        id,
        base_price,
        extra_day,
        deposit
      )
    `)
    .eq('id', Number(variant_id))
    .maybeSingle()

  if (vErr || !variantRow || !variantRow.product) {
    console.error(vErr)
    return NextResponse.redirect(new URL('/?error=variant', req.url))
  }

  const base = Number(variantRow.product.base_price ?? 0)
  const extra = Number(variantRow.product.extra_day ?? 0) * extra_duration
  const total = base + extra
  const deposit = Number(variantRow.product.deposit ?? 0)

  // Buat order + booking
  const { error } = await supabaseAdmin.rpc('create_order_with_booking', {
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
