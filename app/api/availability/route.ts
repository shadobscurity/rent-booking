// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function addDays(date: Date, days: number){ const d=new Date(date); d.setDate(d.getDate()+days); return d }
function subDays(date: Date, days: number){ const d=new Date(date); d.setDate(d.getDate()-days); return d }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const variantId = searchParams.get('variantId')
  const wear_date = searchParams.get('wear_date')
  const extra = Number(searchParams.get('extra_duration') || 0)

  if (!variantId || !wear_date) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const BASE = 4, BUF_BEFORE = 1, BUF_AFTER = 1
  const start = subDays(new Date(wear_date), BUF_BEFORE)
  const end   = addDays(new Date(wear_date), BASE + extra + BUF_AFTER)

  // Ambil semua inventory milik varian + booking yang ada
  const { data: inventories, error } = await supabaseAdmin
    .from('inventories')
    .select('id, bookings ( wear_date, extra_duration )')
    .eq('variant_id', Number(variantId))

  if (error) {
    console.error('availability error', error)
    return NextResponse.json({ availableInventoryId: null })
  }

  const available = (inventories ?? []).find((inv: any) => {
    return (inv.bookings ?? []).every((b: any) => {
      const bStart = subDays(new Date(b.wear_date), BUF_BEFORE)
      const bEnd   = addDays(new Date(b.wear_date), BASE + Number(b.extra_duration ?? 0) + BUF_AFTER)
      // tidak overlap
      return bEnd <= start || bStart >= end
    })
  })

  return NextResponse.json({ availableInventoryId: available?.id ?? null })
}
