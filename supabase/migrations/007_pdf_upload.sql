-- PDF-/Bild-Upload als Eingabekanal (Alternative zur Portal-URL, gleicher Preis).
-- Dateien landen im privaten Bucket "exposes" (Ordner uploads/, max 20 MB,
-- nur PDF/JPEG/PNG/WebP); analyze liest sie mit Service-Role und übergibt sie
-- als native document/image-Blöcke an Claude (Batch).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('exposes','exposes', false, 20971520, array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "anon_upload_exposes" on storage.objects;
create policy "anon_upload_exposes" on storage.objects
  for insert to anon
  with check (bucket_id = 'exposes' and (storage.foldername(name))[1] = 'uploads');

alter table analyses add column if not exists file_paths jsonb;
