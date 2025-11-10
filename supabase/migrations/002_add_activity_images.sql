-- 创建activity_images表，用于存储地点相关图片
CREATE TABLE IF NOT EXISTS activity_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_activity_images_plan_id ON activity_images(plan_id);
CREATE INDEX IF NOT EXISTS idx_activity_images_activity_name ON activity_images(activity_name);

-- 启用Row Level Security
ALTER TABLE activity_images ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能查看和修改自己计划中的图片
CREATE POLICY "Users can view own activity images"
  ON activity_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = activity_images.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own activity images"
  ON activity_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = activity_images.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own activity images"
  ON activity_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM travel_plans
      WHERE travel_plans.id = activity_images.plan_id
      AND travel_plans.user_id = auth.uid()
    )
  );

