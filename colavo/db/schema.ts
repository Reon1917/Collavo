// Enums
import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	varchar,
	pgEnum,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').$defaultFn(() => false).notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull(),
	updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date()).notNull()
});

export const session = pgTable("session", {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').$defaultFn(() => /* @__PURE__ */ new Date()),
	updatedAt: timestamp('updated_at').$defaultFn(() => /* @__PURE__ */ new Date())
});






// Enums
export const taskImportanceEnum = pgEnum("task_importance", [
	"low",
	"medium",
	"high",
	"critical"
]);

export const taskStatusEnum = pgEnum("task_status", [
	"pending",
	"in_progress",
	"completed",
	"cancelled"
]);

// Projects table
export const projects = pgTable("projects", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	leaderId: text("leader_id").notNull(), // References better-auth user id
	deadline: timestamp("deadline"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Members table - tracks project membership and permissions
export const members = pgTable("members", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	userId: text("user_id").notNull(), // References better-auth user id
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),

	// Permission flags - leader can modify these
	createTask: boolean("create_task").default(false).notNull(), //creation both main and sub tasks
	handleTask: boolean("handle_task").default(false).notNull(), //modification of main and sub tasks
	handleEvent: boolean("handle_event").default(false).notNull(), //modification of events
	handleFile: boolean("handle_file").default(true).notNull(), // Default true for all members it is for handling files and link crud
	addMember: boolean("add_member").default(false).notNull(),
	createEvent: boolean("create_event").default(false).notNull(),
	viewFiles: boolean("view_files").default(true).notNull(),

	joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Main tasks table
export const mainTasks = pgTable("main_tasks", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
	title: varchar("title", { length: 500 }).notNull(),
	description: text("description"),
	importanceLevel: taskImportanceEnum("importance_level").default("medium").notNull(),
	deadline: timestamp("deadline"),
	createdBy: text("created_by").notNull(), // References better-auth user id
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sub tasks table
export const subTasks = pgTable("sub_tasks", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	mainTaskId: text("main_task_id").notNull().references(() => mainTasks.id, { onDelete: "cascade" }),
	projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }), // Optional as mentioned
	assignedId: text("assigned_id"), // References better-auth user id - can be null if unassigned
	title: varchar("title", { length: 500 }).notNull(),
	description: text("description"),
	status: taskStatusEnum("status").default("pending").notNull(),
	note: text("note"),
	deadline: timestamp("deadline"),
	createdBy: text("created_by").notNull(), // References better-auth user id
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
	title: varchar("title", { length: 500 }).notNull(),
	description: text("description"),
	datetime: timestamp("datetime").notNull(),
	location: varchar("location", { length: 500 }),
	createdBy: text("created_by").notNull(), // References better-auth user id
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Files table
export const files = pgTable("files", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
	addedBy: text("added_by").notNull(), // References better-auth user id
	name: varchar("name", { length: 500 }).notNull(),
	description: text("description"),
	url: text("url"), // For external links or file URLs
	uploadThingId: text("uploadthing_id"), // UploadThing file ID if uploaded via UploadThing
	size: integer("size"), // File size in bytes
	mimeType: varchar("mime_type", { length: 100 }), // File MIME type
	addedAt: timestamp("added_at").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
	members: many(members),
	mainTasks: many(mainTasks),
	subTasks: many(subTasks),
	events: many(events),
	files: many(files),
}));

export const membersRelations = relations(members, ({ one }) => ({
	project: one(projects, {
		fields: [members.projectId],
		references: [projects.id],
	}),
}));

export const mainTasksRelations = relations(mainTasks, ({ one, many }) => ({
	project: one(projects, {
		fields: [mainTasks.projectId],
		references: [projects.id],
	}),
	subTasks: many(subTasks),
}));

export const subTasksRelations = relations(subTasks, ({ one }) => ({
	mainTask: one(mainTasks, {
		fields: [subTasks.mainTaskId],
		references: [mainTasks.id],
	}),
	project: one(projects, {
		fields: [subTasks.projectId],
		references: [projects.id],
	}),
}));

export const eventsRelations = relations(events, ({ one }) => ({
	project: one(projects, {
		fields: [events.projectId],
		references: [projects.id],
	}),
}));

export const filesRelations = relations(files, ({ one }) => ({
	project: one(projects, {
		fields: [files.projectId],
		references: [projects.id],
	}),
}));

// Types for TypeScript inference
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type MainTask = typeof mainTasks.$inferSelect;
export type NewMainTask = typeof mainTasks.$inferInsert;

export type SubTask = typeof subTasks.$inferSelect;
export type NewSubTask = typeof subTasks.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;