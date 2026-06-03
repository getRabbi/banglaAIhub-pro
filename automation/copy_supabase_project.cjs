const fs = require("fs");
const { spawnSync } = require("child_process");
const { createClient } = require("@supabase/supabase-js");

function readEnv(path) {
  const env = {};
  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const oldEnv = readEnv(".env");
const OLD_URL = oldEnv.NEXT_PUBLIC_SUPABASE_URL || oldEnv.SUPABASE_URL;
const OLD_KEY = oldEnv.SUPABASE_SERVICE_KEY;
const NEW_URL = process.env.NEW_SUPABASE_URL;
const NEW_KEY = process.env.NEW_SUPABASE_SERVICE_KEY;
const NEW_DB_URL = process.env.SUPABASE_DB_URL;

if (!OLD_URL || !OLD_KEY || !NEW_URL || !NEW_KEY) {
  console.error("Old .env plus NEW_SUPABASE_URL and NEW_SUPABASE_SERVICE_KEY are required.");
  process.exit(2);
}

const oldSb = createClient(OLD_URL, OLD_KEY, { auth: { persistSession: false } });
const newSb = createClient(NEW_URL, NEW_KEY, { auth: { persistSession: false } });

const BLOG_CATEGORY_BY_CATEGORY_SLUG = {
  "ai-business": "money-making",
  "ai-productivity": "product-review",
  "ai-automation": "ai-tools",
  "ai-research": "tech-news",
};

const ALLOWED_BLOG_SOURCES = new Set(["manual", "reddit", "x", "hackernews", "producthunt"]);
const ALLOWED_BLOG_CATEGORIES = new Set(["money-making", "ai-tools", "tech-news", "product-review"]);
const ALLOWED_TOOL_PRICING = new Set(["free", "freemium", "paid", "enterprise"]);
const ALLOWED_TOOL_BADGES = new Set(["", "editors_choice", "trending", "new", "popular", "best_value"]);

const TABLES = [
  ["categories", ["id", "name", "name_bn", "slug", "description", "description_bn", "icon", "color", "tool_count", "sort_order", "is_active", "created_at", "updated_at"]],
  ["tools", ["id", "name", "slug", "tagline", "tagline_bn", "description", "description_bn", "logo_url", "website_url", "affiliate_url", "category_id", "pricing", "pricing_details", "rating", "review_count", "badge", "features", "features_bn", "pros", "pros_bn", "cons", "cons_bn", "faq", "is_featured", "is_published", "view_count", "click_count", "meta_title", "meta_description", "created_at", "updated_at"]],
  ["tool_alternatives", ["id", "tool_id", "alternative_id", "reason", "reason_bn"]],
  ["comparisons", ["id", "title", "title_bn", "slug", "tool_a_id", "tool_b_id", "body", "body_bn", "verdict", "verdict_bn", "is_published", "view_count", "meta_title", "meta_description", "created_at"]],
  ["top_lists", ["id", "title", "title_bn", "slug", "description_bn", "body_bn", "tool_ids", "category_id", "is_published", "view_count", "meta_title", "meta_description", "created_at", "updated_at"]],
  ["guides", ["id", "title", "title_bn", "slug", "body_bn", "category_id", "difficulty", "is_published", "view_count", "read_time_min", "meta_title", "meta_description", "thumbnail_url", "created_at", "updated_at"]],
  ["blog_posts", ["id", "source", "source_url", "original_title", "original_body", "title_bn", "body_bn", "hook_bn", "slug", "category", "tags", "meta_title", "meta_description", "thumbnail_url", "read_time_min", "view_count", "engagement_score", "content_hash", "quality_score", "quality_grade", "is_published", "fb_posted", "fb_post_id", "fb_comment_id", "published_at", "created_at", "updated_at"]],
  ["deals", ["id", "title", "title_bn", "slug", "description_bn", "tool_id", "coupon_code", "discount_text", "discount_text_bn", "deal_url", "expires_at", "is_active", "is_featured", "view_count", "click_count", "created_at"]],
  ["prompts", ["id", "title", "title_bn", "slug", "description_bn", "prompt_text", "category", "tool_name", "use_case", "use_case_bn", "is_published", "view_count", "download_count", "created_at"]],
  ["workflows", ["id", "title", "title_bn", "slug", "description_bn", "steps", "tool_ids", "category", "is_published", "view_count", "created_at"]],
  ["affiliate_links", ["id", "tool_id", "slug", "destination_url", "label", "click_count", "is_active", "created_at"]],
  ["affiliate_clicks", ["id", "link_id", "tool_id", "referrer", "ip_hash", "user_agent", "clicked_at"]],
  ["scrape_queue", ["id", "source", "source_url", "title", "body", "engagement_score", "status", "rejection_reason", "created_at"]],
  ["published_topics", ["id", "title_hash", "slug", "source", "published_at"]],
  ["social_posts", ["id", "blog_post_id", "platform", "post_text", "post_url", "image_url", "status", "scheduled_at", "posted_at", "platform_post_id", "error_message", "retry_count", "created_at"]],
  ["newsletter_subscribers", ["id", "email", "name", "is_confirmed", "is_active", "subscribed_at", "confirmed_at", "unsubscribed_at"]],
  ["analytics_events", ["id", "event_type", "entity_type", "entity_id", "entity_slug", "referrer", "ip_hash", "user_agent", "metadata", "created_at"]],
  ["openclaw_jobs", ["id", "job_type", "status", "started_at", "completed_at", "stats", "error_message"]],
  ["openclaw_job_logs", ["id", "job_id", "level", "message", "metadata", "created_at"]],
  ["site_settings", ["key", "value", "updated_at"]],
  ["glossary_terms", ["id", "term", "term_bn", "slug", "definition_bn", "related_tool_ids", "is_published", "created_at"]],
];

const idTables = TABLES.filter(([, columns]) => columns.includes("id")).map(([table]) => table);
const NATURAL_CONFLICT = {
  categories: "slug",
  tools: "slug",
  comparisons: "slug",
  top_lists: "slug",
  guides: "slug",
  blog_posts: "slug",
  deals: "slug",
  prompts: "slug",
  workflows: "slug",
  affiliate_links: "slug",
  published_topics: "title_hash",
  site_settings: "key",
  glossary_terms: "slug",
};

function first(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function bool(value, fallback) {
  return value === undefined || value === null ? fallback : Boolean(value);
}

function categoryFromRow(row, context) {
  const direct = first(row.category);
  if (ALLOWED_BLOG_CATEGORIES.has(direct)) return direct;
  const category = context.categoriesById.get(row.category_id);
  if (category?.slug && BLOG_CATEGORY_BY_CATEGORY_SLUG[category.slug]) return BLOG_CATEGORY_BY_CATEGORY_SLUG[category.slug];
  return "tech-news";
}

function mapBlogSource(value) {
  const source = String(value || "manual");
  return ALLOWED_BLOG_SOURCES.has(source) ? source : "manual";
}

function estimateReadTime(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function normalizeRow(table, row, context) {
  const next = { ...row };

  if (next.category_id && isUuid(next.category_id)) {
    next.category_id = context.newCategoryIdByOldId.get(next.category_id);
  }

  if (table === "categories") {
    next.name = first(row.name, row.name_en, row.label, row.title, row.slug);
    next.name_bn = first(row.name_bn, row.label_bn, row.title_bn, row.name, row.slug);
    next.description = first(row.description, row.description_en, "");
    next.description_bn = first(row.description_bn, row.summary_bn, row.description, "");
    next.icon = first(row.icon, row.emoji, "");
    next.color = first(row.color, "#3b82f6");
    next.tool_count = first(row.tool_count, 0);
    next.sort_order = first(row.sort_order, row.order, 0);
    next.is_active = bool(row.is_active, true);
  }

  if (table === "tools") {
    next.pricing_details = first(row.pricing_details, row.pricing_detail, row.free_plan_details_bn);
    next.is_published = bool(first(row.is_published, row.is_active), true);
    next.pricing = ALLOWED_TOOL_PRICING.has(row.pricing) ? row.pricing : "free";
    next.badge = ALLOWED_TOOL_BADGES.has(row.badge) ? row.badge : "";
    next.features = Array.isArray(row.features) ? row.features : [];
    next.features_bn = Array.isArray(first(row.features_bn, row.key_features)) ? first(row.features_bn, row.key_features) : [];
    next.pros = Array.isArray(row.pros) ? row.pros : [];
    next.pros_bn = Array.isArray(row.pros_bn) ? row.pros_bn : [];
    next.cons = Array.isArray(row.cons) ? row.cons : [];
    next.cons_bn = Array.isArray(row.cons_bn) ? row.cons_bn : [];
    next.faq = Array.isArray(row.faq) ? row.faq : [];
  }

  if (["comparisons", "top_lists", "guides", "prompts", "workflows", "glossary_terms"].includes(table)) {
    next.is_published = bool(first(row.is_published, row.is_active, row.status === "published" ? true : undefined), true);
  }

  if (table === "prompts") {
    next.title = first(row.title, row.title_bn, row.name, row.slug);
    next.title_bn = first(row.title_bn, row.title, row.name_bn, row.slug);
    next.description_bn = first(row.description_bn, row.summary_bn, row.description, "");
    next.prompt_text = first(row.prompt_text, row.prompt, row.content, row.body, row.description_bn, "");
    next.category = first(row.category, "general");
    next.tool_name = first(row.tool_name, row.tool, "");
    next.use_case = first(row.use_case, "");
    next.use_case_bn = first(row.use_case_bn, "");
  }

  if (table === "blog_posts") {
    const title = first(row.title_bn, row.bangla_title, row.title, row.source_title, "Untitled");
    const body = first(row.body_bn, row.bangla_body, row.content_bn, row.body, row.content, "");
    const hook = first(row.hook_bn, row.bangla_hook, row.excerpt_bn, row.summary_bn, row.meta_description, "");
    next.source = mapBlogSource(first(row.source, row.source_platform));
    next.original_title = first(row.original_title, row.source_title, title);
    next.original_body = first(row.original_body, "");
    next.title_bn = title;
    next.body_bn = body;
    next.hook_bn = hook;
    next.slug = first(row.blog_slug, row.slug);
    next.category = categoryFromRow(row, context);
    next.tags = Array.isArray(row.tags) ? row.tags : [next.category];
    next.meta_title = first(row.meta_title, title.slice(0, 70));
    next.meta_description = first(row.meta_description, hook.slice(0, 155));
    next.read_time_min = first(row.read_time_min, row.reading_time_minutes, estimateReadTime(body || hook || title));
    next.is_published = bool(first(row.is_published, row.status === "published" ? true : undefined), true);
    next.fb_posted = bool(row.fb_posted, false);
  }

  if (table === "deals" || table === "affiliate_links") {
    next.is_active = bool(first(row.is_active, row.status === "published" ? true : undefined), true);
  }

  if (table === "affiliate_links") {
    next.destination_url = first(row.destination_url, row.url, row.affiliate_url, row.website_url);
  }

  if (table === "analytics_events") {
    next.metadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
  }

  if (table === "social_posts") {
    next.post_text = first(row.post_text, "");
    next.post_url = first(row.post_url, "");
    next.image_url = first(row.image_url, "");
    next.status = first(row.status, "posted");
    next.platform = first(row.platform, "facebook");
  }

  if (table === "glossary_terms") {
    next.term = first(row.term, row.term_en, row.title, row.slug);
    next.term_bn = first(row.term_bn, row.title_bn, row.term, row.title, row.slug);
    next.definition_bn = first(row.definition_bn, row.description_bn, row.definition, row.body_bn, row.content_bn, "");
    next.related_tool_ids = Array.isArray(row.related_tool_ids) ? row.related_tool_ids : [];
    next.is_published = bool(first(row.is_published, row.is_active), true);
  }

  return next;
}

function pickColumns(table, columns, row, context) {
  const normalized = normalizeRow(table, row, context);
  const picked = {};
  for (const column of columns) {
    if (column === "id" && isUuid(normalized[column])) continue;
    if (normalized[column] !== undefined) picked[column] = normalized[column];
  }
  return picked;
}

async function fetchAll(table) {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const query = oldSb.from(table).select("*").range(from, to);
    const { data, error } = await query;
    if (error) {
      if (/does not exist|schema cache/i.test(error.message || "")) {
        console.log(`${table}: missing in old project, skipped`);
        return [];
      }
      throw new Error(`${table}: ${error.message}`);
    }
    rows.push(...(data || []));
    if (!data || data.length < pageSize) return rows;
  }
}

async function upsertChunk(table, rows, onConflict) {
  const { error } = await newSb.from(table).upsert(rows, { onConflict });
  if (!error) return { ok: rows.length, failed: 0 };

  let ok = 0;
  let failed = 0;
  for (const row of rows) {
    const single = await newSb.from(table).upsert(row, { onConflict });
    if (single.error) {
      failed += 1;
      console.error(`${table}: row skipped (${single.error.message})`);
    } else {
      ok += 1;
    }
  }
  return { ok, failed };
}

async function copyTable(table, columns, context) {
  const sourceRows = await fetchAll(table);
  if (!sourceRows.length) {
    console.log(`${table}: 0`);
    return { table, source: 0, copied: 0, failed: 0 };
  }

  const rows = sourceRows
    .map((row) => pickColumns(table, columns, row, context))
    .filter((row) => Object.keys(row).length > 0);
  const hasGeneratedIds = rows.some((row) => !("id" in row));
  const onConflict = hasGeneratedIds ? NATURAL_CONFLICT[table] || "id" : columns.includes("id") ? "id" : "key";

  let copied = 0;
  let failed = 0;
  for (let i = 0; i < rows.length; i += 250) {
    const result = await upsertChunk(table, rows.slice(i, i + 250), onConflict);
    copied += result.ok;
    failed += result.failed;
  }

  console.log(`${table}: ${copied}/${sourceRows.length}${failed ? ` (${failed} failed)` : ""}`);
  return { table, source: sourceRows.length, copied, failed };
}

async function refreshNewCategoryMap(context) {
  const { data, error } = await newSb.from("categories").select("*");
  if (error) throw new Error(`categories refresh: ${error.message}`);

  const newBySlug = new Map((data || []).map((category) => [category.slug, category]));
  for (const oldCategory of context.oldCategories) {
    const newCategory = newBySlug.get(oldCategory.slug);
    if (newCategory?.id) context.newCategoryIdByOldId.set(oldCategory.id, newCategory.id);
  }
}

async function buildContext() {
  const categories = await fetchAll("categories");
  return {
    oldCategories: categories,
    categoriesById: new Map(categories.map((category) => [category.id, category])),
    newCategoryIdByOldId: new Map(),
  };
}

function setSequences() {
  if (!NEW_DB_URL) {
    console.log("SUPABASE_DB_URL not set; sequence reset skipped.");
    return;
  }
  for (const table of idTables) {
    const sql = `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`;
    const result = spawnSync("npx.cmd", ["supabase", "db", "query", "--db-url", NEW_DB_URL], {
      input: sql,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    if (result.status !== 0) {
      const details = result.error?.message || result.stderr || result.stdout || `exit ${result.status}`;
      console.error(`sequence ${table}: ${details}`);
    }
  }
  console.log("Sequences reset.");
}

async function listStorageFiles(client, bucketName, prefix = "") {
  const { data, error } = await client.storage.from(bucketName).list(prefix, { limit: 1000 });
  if (error) throw error;

  const files = [];
  for (const item of data || []) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id || item.metadata) {
      files.push(path);
    } else {
      files.push(...(await listStorageFiles(client, bucketName, path)));
    }
  }
  return files;
}

async function copyStorage() {
  const { data: buckets, error } = await oldSb.storage.listBuckets();
  if (error) {
    console.log(`storage: skipped (${error.message})`);
    return;
  }
  if (!buckets?.length) {
    console.log("storage: 0 buckets");
    return;
  }

  for (const bucket of buckets) {
    await newSb.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.file_size_limit,
      allowedMimeTypes: bucket.allowed_mime_types,
    });
    const files = await listStorageFiles(oldSb, bucket.name);
    let copied = 0;
    for (const path of files) {
      const downloaded = await oldSb.storage.from(bucket.name).download(path);
      if (downloaded.error) {
        console.error(`storage ${bucket.name}/${path}: ${downloaded.error.message}`);
        continue;
      }
      const buffer = Buffer.from(await downloaded.data.arrayBuffer());
      const uploaded = await newSb.storage.from(bucket.name).upload(path, buffer, {
        upsert: true,
        contentType: downloaded.data.type || undefined,
      });
      if (uploaded.error) {
        console.error(`storage ${bucket.name}/${path}: ${uploaded.error.message}`);
      } else {
        copied += 1;
      }
    }
    console.log(`storage ${bucket.name}: ${copied}/${files.length}`);
  }
}

async function main() {
  const context = await buildContext();
  const results = [];
  for (const [table, columns] of TABLES) {
    const result = await copyTable(table, columns, context);
    results.push(result);
    if (table === "categories") await refreshNewCategoryMap(context);
  }
  await copyStorage();
  setSequences();

  const failed = results.reduce((sum, result) => sum + result.failed, 0);
  const copied = results.reduce((sum, result) => sum + result.copied, 0);
  console.log(`Data copy complete: ${copied} rows copied, ${failed} rows failed.`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
