-- Run this in your Supabase SQL editor AFTER supabase-schema.sql
-- Adds ML model weights tables + WellnessAgent decision log.
-- Adds ML model storage tables for the gradient descent mood predictor.

-- Current model weights (one row per training run, newest is active)
create table if not exists ml_weights (
  id                uuid    default gen_random_uuid() primary key,
  weights           jsonb   not null,           -- array of 7 floats [w0..w6]
  bias              float   not null,
  loss              float,                       -- final MSE on training set
  training_sessions integer,                     -- how many sessions were used
  epochs            integer,
  created_at        timestamp with time zone default now()
);

-- Per-training-run loss history (for loss curve visualisation)
create table if not exists ml_training_log (
  id         uuid  default gen_random_uuid() primary key,
  epoch      integer not null,
  loss       float   not null,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table ml_weights     enable row level security;
alter table ml_training_log enable row level security;

-- Public read + insert (same pattern as sessions / choices)
create policy "public insert ml_weights"      on ml_weights      for insert with check (true);
create policy "public select ml_weights"      on ml_weights      for select using  (true);
create policy "public insert ml_training_log" on ml_training_log for insert with check (true);
create policy "public select ml_training_log" on ml_training_log for select using  (true);

-- WellnessAgent decision log (one row per scene the agent processed)
create table if not exists agent_decisions (
  id              uuid    default gen_random_uuid() primary key,
  session_id      uuid    references sessions(id) on delete cascade,
  scene_number    integer,
  action          text    not null,          -- tool name chosen
  reasoning       text,                      -- agent's 1-sentence assessment
  modifier        text,                      -- directive injected into scene prompt
  emotion_history jsonb,                     -- emotion array at time of decision
  mood_before     integer,
  predicted_delta integer,                   -- ML model's prediction at that moment
  created_at      timestamp with time zone default now()
);

alter table agent_decisions enable row level security;
create policy "public insert agent_decisions" on agent_decisions for insert with check (true);
create policy "public select agent_decisions" on agent_decisions for select using  (true);
