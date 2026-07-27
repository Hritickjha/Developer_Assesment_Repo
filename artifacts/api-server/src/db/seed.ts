import db from "./database.js";
import { logger } from "../lib/logger.js";

export function seedIfEmpty(): void {
  const row = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };

  if (row.count > 0) {
    return;
  }

  logger.info("Seeding database with demo data");

  const insertUser = db.prepare(
    "INSERT INTO users (email, display_name, role) VALUES (?, ?, ?)"
  );
  insertUser.run("admin@contoso.com", "Sarah Chen", "admin");
  insertUser.run("james.wright@contoso.com", "James Wright", "staff");
  insertUser.run("priya.sharma@contoso.com", "Priya Sharma", "staff");

  const insertClient = db.prepare(
    "INSERT INTO clients (name, tenant_id, status) VALUES (?, ?, ?)"
  );
  const c1 = insertClient.run("Northwind Traders",   "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "active");
  const c2 = insertClient.run("Fabrikam Industries", "b2c3d4e5-f6a7-8901-bcde-f12345678901", "active");
         insertClient.run("Contoso Healthcare",  "c3d4e5f6-a7b8-9012-cdef-123456789012", "onboarding");
  const c4 = insertClient.run("Adventure Works",    "d4e5f6a7-b8c9-0123-defa-234567890123", "onboarding");
         insertClient.run("Tailspin Toys",       "e5f6a7b8-c9d0-1234-efab-345678901234", "suspended");

  const insertMsUser = db.prepare(
    "INSERT INTO microsoft_users (client_id, ms_user_id, email, display_name) VALUES (?, ?, ?, ?)"
  );

  const c1id = Number(c1.lastInsertRowid);
  const c2id = Number(c2.lastInsertRowid);

  insertMsUser.run(c1id, "ms-nw-001", "alice.morgan@northwindtraders.com", "Alice Morgan");
  insertMsUser.run(c1id, "ms-nw-002", "bob.evans@northwindtraders.com",    "Bob Evans");
  insertMsUser.run(c1id, "ms-nw-003", "carol.white@northwindtraders.com",  "Carol White");
  insertMsUser.run(c1id, "ms-nw-004", "david.kim@northwindtraders.com",    "David Kim");
  insertMsUser.run(c1id, "ms-nw-005", "emma.patel@northwindtraders.com",   "Emma Patel");

  insertMsUser.run(c2id, "ms-fab-001", "frank.liu@fabrikam.com",      "Frank Liu");
  insertMsUser.run(c2id, "ms-fab-002", "grace.jones@fabrikam.com",    "Grace Jones");
  insertMsUser.run(c2id, "ms-fab-003", "henry.brown@fabrikam.com",    "Henry Brown");
  insertMsUser.run(c2id, "ms-fab-004", "iris.chen@fabrikam.com",      "Iris Chen");
  insertMsUser.run(c2id, "ms-fab-005", "james.taylor@fabrikam.com",   "James Taylor");

  const insertAudit = db.prepare(
    "INSERT INTO audit_events (actor_email, action, target_type, target_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const ago = (minutes: number) =>
    new Date(Date.now() - minutes * 60_000).toISOString().replace("T", " ").slice(0, 19);

  insertAudit.run("admin@contoso.com",        "client.created",        "client", "1", JSON.stringify({ name: "Northwind Traders" }),              ago(4320));
  insertAudit.run("admin@contoso.com",        "client.created",        "client", "2", JSON.stringify({ name: "Fabrikam Industries" }),             ago(4300));
  insertAudit.run("james.wright@contoso.com", "client.viewed",         "client", "1", null,                                                       ago(2880));
  insertAudit.run("admin@contoso.com",        "sync.triggered",        "client", "1", JSON.stringify({ user_count: 5 }),                           ago(2160));
  insertAudit.run("priya.sharma@contoso.com", "client.created",        "client", "3", JSON.stringify({ name: "Contoso Healthcare" }),              ago(1440));
  insertAudit.run("admin@contoso.com",        "sync.triggered",        "client", "2", JSON.stringify({ user_count: 5 }),                           ago(1320));
  insertAudit.run("james.wright@contoso.com", "onboarding.started",    "client", "3", JSON.stringify({ triggered_by: "james.wright@contoso.com" }), ago(720));
  insertAudit.run("admin@contoso.com",        "client.created",        "client", "4", JSON.stringify({ name: "Adventure Works" }),                 ago(480));
  insertAudit.run("priya.sharma@contoso.com", "client.viewed",         "client", "2", null,                                                       ago(360));
  insertAudit.run("admin@contoso.com",        "onboarding.started",    "client", "4", JSON.stringify({ triggered_by: "admin@contoso.com" }),       ago(240));
  insertAudit.run("james.wright@contoso.com", "integration.updated",   "tenant", "main", JSON.stringify({ setting: "sync_schedule", value: "daily" }), ago(180));
  insertAudit.run("admin@contoso.com",        "client.created",        "client", "5", JSON.stringify({ name: "Tailspin Toys" }),                   ago(120));
  insertAudit.run("admin@contoso.com",        "client.status_changed", "client", "5", JSON.stringify({ from: "active", to: "suspended" }),         ago(60));
  insertAudit.run("priya.sharma@contoso.com", "client.viewed",         "client", "3", null,                                                       ago(45));
  insertAudit.run("james.wright@contoso.com", "graph.users_fetched",   "client", "1", JSON.stringify({ count: 5 }),                                ago(30));
  insertAudit.run("admin@contoso.com",        "client.viewed",         "client", "4", null,                                                       ago(20));
  insertAudit.run("priya.sharma@contoso.com", "sync.triggered",        "client", "1", JSON.stringify({ user_count: 5 }),                           ago(15));
  insertAudit.run("james.wright@contoso.com", "client.viewed",         "client", "2", null,                                                       ago(10));
  insertAudit.run("admin@contoso.com",        "integration.viewed",    "tenant", "main", null,                                                    ago(5));
  insertAudit.run("priya.sharma@contoso.com", "graph.users_fetched",   "client", "2", JSON.stringify({ count: 5 }),                                ago(2));

  logger.info("Seed complete");
}
