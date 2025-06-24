// Enums
import {
	pgTable,
	text,
	timestamp,
	boolean,
	integer,
	varchar,
	pgEnum,
	index,
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

export const permissionTypeEnum = pgEnum("permission_type", [
	"createTask",
	"handleTask", 
	"updateTask",
	"handleEvent",
	"handleFile",
	"addMember",
	"createEvent",
	"viewFiles"
]);

export const memberRoleEnum = pgEnum("member_role", [
	"leader",
	"member"
]);

export const notificationTypeEnum = pgEnum("notification_type", [
	"subtask",
	"event"
]);

export const notificationStatusEnum = pgEnum("notification_status", [
	"pending",
	"sent", 
	"failed",
	"cancelled"
]);

// Projects table
export const projects = pgTable("projects", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	leaderId: text("leader_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	deadline: timestamp("deadline"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invitations table for external users
export const invitations = pgTable("invitations", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	email: text("email").notNull(),
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
	invitedBy: text("invited_by").notNull().references(() => user.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	acceptedAt: timestamp("accepted_at"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
	emailProjectIdx: index("idx_invitations_email_project").on(table.email, table.projectId),
	tokenIdx: index("idx_invitations_token").on(table.token),
}));

// Members table - simplified with role-based approach
export const members = pgTable("members", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
	role: memberRoleEnum("role").default("member").notNull(),
	joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
	userProjectIdx: index("idx_members_user_project").on(table.userId, table.projectId),
	projectIdx: index("idx_members_project").on(table.projectId),
}));

// Permissions table - normalized permission system
export const permissions = pgTable("permissions", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	memberId: text("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
	permission: permissionTypeEnum("permission").notNull(),
	granted: boolean("granted").default(false).notNull(),
	grantedAt: timestamp("granted_at").defaultNow().notNull(),
	grantedBy: text("granted_by").references(() => user.id, { onDelete: 'set null' }),
}, (table) => ({
	memberPermissionIdx: index("idx_permissions_member_permission").on(table.memberId, table.permission),
}));

// Main tasks table
export const mainTasks = pgTable("main_tasks", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
	title: varchar("title", { length: 500 }).notNull(),
	description: text("description"),
	importanceLevel: taskImportanceEnum("importance_level").default("medium").notNull(),
	deadline: timestamp("deadline"),
	createdBy: text("created_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
	projectIdx: index("idx_main_tasks_project").on(table.projectId),
	createdByIdx: index("idx_main_tasks_created_by").on(table.createdBy),
}));

// Sub tasks table - removed redundant projectId
export const subTasks = pgTable("sub_tasks", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	mainTaskId: text("main_task_id").notNull().references(() => mainTasks.id, { onDelete: "cascade" }),
	assignedId: text("assigned_id").references(() => user.id, { onDelete: 'set null' }),
	title: varchar("title", { length: 500 }).notNull(),
	description: text("description"),
	status: taskStatusEnum("status").default("pending").notNull(),
	note: text("note"),
	deadline: timestamp("deadline"),
	createdBy: text("created_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
	mainTaskIdx: index("idx_sub_tasks_main_task").on(table.mainTaskId),
	assignedIdx: index("idx_sub_tasks_assigned").on(table.assignedId),
	statusIdx: index("idx_sub_tasks_status").on(table.status),
}));

// Events table
export const events = pgTable("events", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
	title: varchar("title", { length: 500 }).notNull(),
	description: text("description"),
	datetime: timestamp("datetime").notNull(),
	location: varchar("location", { length: 500 }),
	createdBy: text("created_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
	projectDatetimeIdx: index("idx_events_project_datetime").on(table.projectId, table.datetime),
	createdByIdx: index("idx_events_created_by").on(table.createdBy),
}));

// Files table
export const files = pgTable("files", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
	addedBy: text("added_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: varchar("name", { length: 500 }).notNull(),
	description: text("description"),
	url: text("url"), // For external links or file URLs
	uploadThingId: text("uploadthing_id"), // UploadThing file ID if uploaded via UploadThing
	size: integer("size"), // File size in bytes
	mimeType: varchar("mime_type", { length: 100 }), // File MIME type
	addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => ({
	projectIdx: index("idx_files_project").on(table.projectId),
	addedByIdx: index("idx_files_added_by").on(table.addedBy),
}));

// Scheduled notifications table
export const scheduledNotifications = pgTable("scheduled_notifications", {
	id: text("id").primaryKey().$defaultFn(() => createId()),
	type: notificationTypeEnum("type").notNull(),
	entityId: text("entity_id").notNull(), // subtask.id or event.id
	recipientUserId: text("recipient_user_id").references(() => user.id, { onDelete: 'cascade' }), // for single recipient (subtasks)
	recipientUserIds: text("recipient_user_ids").array(), // for multiple recipients (events)
	scheduledFor: timestamp("scheduled_for").notNull(),
	daysBefore: integer("days_before").notNull(),
	status: notificationStatusEnum("status").default("pending").notNull(),
	qstashMessageId: text("qstash_message_id"), // for cancellation
	emailId: text("email_id"), // Resend email ID
	sentAt: timestamp("sent_at"),
	createdBy: text("created_by").notNull().references(() => user.id, { onDelete: 'cascade' }),
	projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
	typeEntityIdx: index("idx_notifications_type_entity").on(table.type, table.entityId),
	statusIdx: index("idx_notifications_status").on(table.status),
	scheduledForIdx: index("idx_notifications_scheduled_for").on(table.scheduledFor),
	projectIdx: index("idx_notifications_project").on(table.projectId),
}));

// Relations
export const userRelations = relations(user, ({ many }) => ({
	projectsLed: many(projects),
	memberships: many(members),
	mainTasksCreated: many(mainTasks),
	subTasksCreated: many(subTasks),
	subTasksAssigned: many(subTasks),
	eventsCreated: many(events),
	filesAdded: many(files),
	invitationsSent: many(invitations),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
	leader: one(user, {
		fields: [projects.leaderId],
		references: [user.id],
	}),
	members: many(members),
	mainTasks: many(mainTasks),
	events: many(events),
	files: many(files),
	invitations: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
	project: one(projects, {
		fields: [invitations.projectId],
		references: [projects.id],
	}),
	invitedBy: one(user, {
		fields: [invitations.invitedBy],
		references: [user.id],
	}),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
	user: one(user, {
		fields: [members.userId],
		references: [user.id],
	}),
	project: one(projects, {
		fields: [members.projectId],
		references: [projects.id],
	}),
	permissions: many(permissions),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
	member: one(members, {
		fields: [permissions.memberId],
		references: [members.id],
	}),
	grantedBy: one(user, {
		fields: [permissions.grantedBy],
		references: [user.id],
	}),
}));

export const mainTasksRelations = relations(mainTasks, ({ one, many }) => ({
	project: one(projects, {
		fields: [mainTasks.projectId],
		references: [projects.id],
	}),
	createdBy: one(user, {
		fields: [mainTasks.createdBy],
		references: [user.id],
	}),
	subTasks: many(subTasks),
}));

export const subTasksRelations = relations(subTasks, ({ one }) => ({
	mainTask: one(mainTasks, {
		fields: [subTasks.mainTaskId],
		references: [mainTasks.id],
	}),
	assignedTo: one(user, {
		fields: [subTasks.assignedId],
		references: [user.id],
	}),
	createdBy: one(user, {
		fields: [subTasks.createdBy],
		references: [user.id],
	}),
}));

export const eventsRelations = relations(events, ({ one }) => ({
	project: one(projects, {
		fields: [events.projectId],
		references: [projects.id],
	}),
	createdBy: one(user, {
		fields: [events.createdBy],
		references: [user.id],
	}),
}));

export const filesRelations = relations(files, ({ one }) => ({
	project: one(projects, {
		fields: [files.projectId],
		references: [projects.id],
	}),
	addedBy: one(user, {
		fields: [files.addedBy],
		references: [user.id],
	}),
}));

export const scheduledNotificationsRelations = relations(scheduledNotifications, ({ one }) => ({
	project: one(projects, {
		fields: [scheduledNotifications.projectId],
		references: [projects.id],
	}),
	createdBy: one(user, {
		fields: [scheduledNotifications.createdBy],
		references: [user.id],
	}),
	recipientUser: one(user, {
		fields: [scheduledNotifications.recipientUserId],
		references: [user.id],
	}),
}));

// Types for TypeScript inference
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;

export type MainTask = typeof mainTasks.$inferSelect;
export type NewMainTask = typeof mainTasks.$inferInsert;

export type SubTask = typeof subTasks.$inferSelect;
export type NewSubTask = typeof subTasks.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;

export type ScheduledNotification = typeof scheduledNotifications.$inferSelect;
export type NewScheduledNotification = typeof scheduledNotifications.$inferInsert;