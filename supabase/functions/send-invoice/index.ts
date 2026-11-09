// Supabase Edge Function: send-invoice (nur intern, Header x-admin-token)
// Erstellt oder aktualisiert die Rechnung zu einer bestehenden Bestellung und versendet sie.
// Für Bestellungen ohne Rechnung und für nachträglich gewünschte Kundenadressen.
// Eine bestehende Rechnung behält ihre Nummer.
// Body: { order_id, gross_cents?, service_date?, customer_name?, customer_address?: string[], dry_run? }
import { createClient } from 'npm:@supabase/supabase-js@2'
import { renderInvoicePdf, splitGross, toBase64, PACKAGE_NAMES } from '../stripe-webhook/invoice.ts'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  const adminToken = Deno.env.get('INVOICE_ADMIN_TOKEN')
  if (!adminToken || req.headers.get('x-admin-token') !== adminToken) return json({ error: 'forbidden' }, 403)
  if (req.method !== 'POST') return json({ error: 'method' }, 405)

  try {
    const { order_id, gross_cents, service_date, customer_name, customer_address, dry_run } = await req.json()
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SB_SERVICE_ROLE_KEY')!)

    const { data: order } = await supabase.from('orders').select('id, email, package, status, created_at').eq('id', order_id).maybeSingle()
    if (!order) return json({ error: 'Bestellung nicht gefunden' }, 404)
    if (!['paid', 'processing', 'completed'].includes(order.status)) return json({ error: `Bestellung nicht bezahlt: ${order.status}` }, 400)
    if (!order.email) return json({ error: 'Keine E-Mail-Adresse an der Bestellung' }, 400)

    const { data: existing } = await supabase.from('invoices').select('*').eq('order_id', order.id).maybeSingle()
    const gross = existing?.gross_cents ?? gross_cents
    if (!Number.isInteger(gross) || gross <= 0) return json({ error: 'gross_cents fehlt' }, 400)

    const vatRate = existing ? Number(existing.vat_rate) : Number(Deno.env.get('INVOICE_VAT_RATE') ?? '19')
    const { net, vat } = splitGross(gross, vatRate)
    const description = existing?.description ?? PACKAGE_NAMES[order.package] ?? PACKAGE_NAMES.single
    const name = customer_name ?? existing?.customer_name ?? null
    const addressLines: string[] = Array.isArray(customer_address)
      ? customer_address
      : (existing?.customer_address ? String(existing.customer_address).split(', ') : [])
    const serviceDate = service_date ?? existing?.service_date ?? String(order.created_at).slice(0, 10)

    const fields = {
      customer_name: name, customer_email: order.email, customer_address: addressLines.join(', ') || null,
      description, gross_cents: gross, net_cents: net, vat_cents: vat, vat_rate: vatRate, service_date: serviceDate,
    }

    let row = dry_run ? { invoice_number: existing?.invoice_number ?? 'ENTWURF', issued_at: existing?.issued_at ?? new Date().toISOString(), id: existing?.id } : null
    if (!dry_run) {
      const res = existing
        ? await supabase.from('invoices').update(fields).eq('id', existing.id).select('*').single()
        : await supabase.from('invoices').insert({ order_id: order.id, ...fields }).select('*').single()
      if (res.error || !res.data) throw new Error(`Rechnungszeile: ${res.error?.message}`)
      row = res.data
    }

    let letterhead: Uint8Array | null = null
    const url = Deno.env.get('INVOICE_LETTERHEAD_URL')
    if (url) {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) }).catch(() => null)
      if (res?.ok) letterhead = new Uint8Array(await res.arrayBuffer())
    }

    const pdf = await renderInvoicePdf({
      number: row!.invoice_number,
      issuedAt: new Date(row!.issued_at),
      serviceDate: new Date(serviceDate),
      customerName: name,
      customerEmail: order.email,
      customerAddress: addressLines,
      description,
      grossCents: gross,
      netCents: net,
      vatCents: vat,
      vatRate,
      orderRef: String(order.id).slice(0, 8).toUpperCase(),
    }, letterhead)

    if (dry_run) return json({ dry_run: true, to: order.email, number: row!.invoice_number, net, vat, gross, pdf_base64: toBase64(pdf) })

    const path = `${new Date(row!.issued_at).getUTCFullYear()}/${row!.invoice_number}.pdf`
    const { error: upErr } = await supabase.storage.from('rechnungen').upload(path, pdf, { contentType: 'application/pdf', upsert: true })
    if (upErr) throw new Error(`Archiv: ${upErr.message}`)
    await supabase.from('invoices').update({ storage_path: path }).eq('id', row!.id)

    const orderDate = new Date(serviceDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' })
    const mail = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}` },
      body: JSON.stringify({
        from: Deno.env.get('EMAIL_FROM') || 'ImmoPrüf <info@immopruef.de>',
        to: order.email,
        subject: `Ihre Rechnung ${row!.invoice_number} zu Ihrer ImmoPrüf-Bestellung`,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:#222;line-height:1.5;max-width:560px">
<p>Guten Tag,</p>
<p>anbei erhalten Sie die Rechnung ${row!.invoice_number} zu Ihrer ImmoPrüf-Bestellung vom ${orderDate}. Der Betrag ist bereits bezahlt, Sie müssen nichts weiter tun.</p>
<p>Wenn Ihre Anschrift auf der Rechnung stehen soll, antworten Sie einfach auf diese E-Mail. Wir stellen Ihnen die Rechnung dann entsprechend aus.</p>
<p>Viele Grüße<br>Seydhan Cakmak<br>Cakmak Digital · ImmoPrüf</p></div>`,
        reply_to: 'info@immopruef.de',
        attachments: [{ filename: `Rechnung-${row!.invoice_number}.pdf`, content: toBase64(pdf) }],
      }),
    })
    const mailBody = await mail.text()
    if (!mail.ok) return json({ error: 'Mailversand fehlgeschlagen', status: mail.status, detail: mailBody.slice(0, 300), number: row!.invoice_number }, 502)

    return json({ sent: true, to: order.email, number: row!.invoice_number, net, vat, gross, storage_path: path })
  } catch (e) {
    console.error('send-invoice:', e)
    return json({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
