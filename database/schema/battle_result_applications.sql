CREATE TABLE battle_result_applications (
  id BIGSERIAL PRIMARY KEY,
  battle_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (battle_id, user_id)
);

CREATE INDEX idx_battle_result_applications_user_id
  ON battle_result_applications (user_id);

CREATE INDEX idx_battle_result_applications_battle_id
  ON battle_result_applications (battle_id);
