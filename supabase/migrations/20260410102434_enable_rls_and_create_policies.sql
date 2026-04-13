ALTER TABLE "public"."blogs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."blog_tags" ENABLE ROW LEVEL SECURITY;

-- blogs table RLS
CREATE POLICY "Enable read access for prpb_user only" 
  ON "public"."blogs" FOR SELECT TO prpb_user USING (true);

CREATE POLICY "Enable insert for prpb_user only" 
  ON "public"."blogs" FOR INSERT TO prpb_user WITH CHECK (true);

CREATE POLICY "Enable update for prpb_user only" 
  ON "public"."blogs" FOR UPDATE TO prpb_user USING (true);

CREATE POLICY "Enable delete for prpb_user only" 
  ON "public"."blogs" FOR DELETE TO prpb_user USING (true);

-- tags table RLS
CREATE POLICY "Enable read access for all users" 
  ON "public"."tags" FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert for prpb_user only" 
  ON "public"."tags" FOR INSERT TO prpb_user WITH CHECK (true);

CREATE POLICY "Enable update for prpb_user only" 
  ON "public"."tags" FOR UPDATE TO prpb_user USING (true);

CREATE POLICY "Enable delete for prpb_user only" 
  ON "public"."tags" FOR DELETE TO prpb_user USING (true);

-- blog_tags table RLS
CREATE POLICY "Enable read access for prpb_user only" 
  ON "public"."blog_tags" FOR SELECT TO prpb_user USING (true);

CREATE POLICY "Enable insert for prpb_user only" 
  ON "public"."blog_tags" FOR INSERT TO prpb_user WITH CHECK (true);

CREATE POLICY "Enable update for prpb_user only" 
  ON "public"."blog_tags" FOR UPDATE TO prpb_user USING (true);

CREATE POLICY "Enable delete for prpb_user only" 
  ON "public"."blog_tags" FOR DELETE TO prpb_user USING (true);
  