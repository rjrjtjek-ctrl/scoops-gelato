-- ═══════════════════════════════════════════════════
-- FMS Phase 3~10 전체 테이블 생성 SQL
-- Supabase SQL Editor에서 한번에 실행하세요
-- ═══════════════════════════════════════════════════

-- Phase 3: AI 채팅
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  store_id uuid REFERENCES stores(id),
  role text NOT NULL,
  content text NOT NULL,
  attachments jsonb,
  msg_type text DEFAULT 'general',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_chat" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_chat_user_created ON chat_messages(user_id, created_at DESC);

-- Phase 4: 본사 발주
CREATE TABLE IF NOT EXISTS hq_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text,
  unit text,
  price numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE hq_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_hq_products" ON hq_products FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS hq_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id),
  items jsonb NOT NULL,
  status text DEFAULT 'pending',
  total_amount numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE hq_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_hq_orders" ON hq_orders FOR ALL USING (true) WITH CHECK (true);

-- Phase 5: 최저가 검색
CREATE TABLE IF NOT EXISTS approved_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  brand text,
  spec text,
  category text,
  search_keyword text,
  purchase_mode text DEFAULT 'store_purchase',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE approved_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_approved" ON approved_products FOR ALL USING (true) WITH CHECK (true);

-- Phase 6: 직원 작업 관리
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id),
  assigned_to uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'normal',
  due_date date,
  is_recurring boolean DEFAULT false,
  recur_pattern text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS task_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES tasks(id),
  user_id uuid NOT NULL REFERENCES users(id),
  action text NOT NULL,
  description text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_task_logs" ON task_logs FOR ALL USING (true) WITH CHECK (true);

-- Phase 7: 메뉴 관리
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  image_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_menu" ON menu_items FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS store_menu_status (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL REFERENCES stores(id),
  menu_item_id uuid NOT NULL REFERENCES menu_items(id),
  is_available boolean DEFAULT true,
  UNIQUE(store_id, menu_item_id)
);
ALTER TABLE store_menu_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_store_menu" ON store_menu_status FOR ALL USING (true) WITH CHECK (true);

-- Phase 8: 공지사항
CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'all',
  target_store_id uuid REFERENCES stores(id),
  attachments jsonb,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS announcement_reads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id uuid NOT NULL REFERENCES announcements(id),
  user_id uuid NOT NULL REFERENCES users(id),
  read_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_reads" ON announcement_reads FOR ALL USING (true) WITH CHECK (true);

-- Phase 9: 지식 베이스
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "allow_all_kb" ON knowledge_base FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════
-- 완료! 모든 테이블이 생성되었습니다.
-- ═══════════════════════════════════════════════════
