-- Run this in your Supabase SQL editor (https://app.supabase.com → SQL Editor)

create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  mood_before integer not null check (mood_before between 1 and 5),
  mood_after integer check (mood_after between 1 and 5),
  mood_delta integer,
  dominant_emotion text,
  duration_seconds integer,
  created_at timestamp with time zone default now()
);

create table if not exists choices (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade,
  scene_number integer not null,
  choice_text text not null,
  emotion_tag text not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table sessions enable row level security;
alter table choices enable row level security;

-- Allow anyone to insert and read (anonymous public access for the demo)
create policy "public insert sessions" on sessions for insert with check (true);
create policy "public select sessions" on sessions for select using (true);
create policy "public update sessions" on sessions for update using (true);
create policy "public insert choices" on choices for insert with check (true);
create policy "public select choices" on choices for select using (true);
