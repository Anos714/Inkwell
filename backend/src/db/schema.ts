import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm/_relations";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  pgEnum,
  primaryKey,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  username: varchar("username", { length: 100 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  avatarUrl: text("avatar_url"),
  googleId: text("google_id").unique().notNull(),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const blogs = pgTable("blogs", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  content: jsonb("content").notNull(),
  coverImage: text("cover_image"),
  tags: text("tags").array().notNull().default([]),
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
},
(table) => [
  index("blogs_published_idx").on(table.isPublished, table.publishedAt),
  index("blogs_created_idx").on(table.createdAt),
]);

export const blogLikes = pgTable(
  "blog_likes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    blogId: uuid("blog_id")
      .notNull()
      .references(() => blogs.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.blogId],
    }),
  ],
);

export const blogComments = pgTable("blog_comments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),

  blogId: uuid("blog_id")
    .notNull()
    .references(() => blogs.id, {
      onDelete: "cascade",
    }),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  // Single-level threading: NULL = top-level, otherwise the parent comment.
  // Explicit AnyPgColumn breaks the circular type inference.
  parentId: uuid("parent_id").references((): AnyPgColumn => blogComments.id, {
    onDelete: "cascade",
  }),

  content: text("content").notNull().default(""),

  // Optional attached GIF (Tenor/Giphy direct link), rendered by the client.
  gifUrl: text("gif_url"),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
},
(table) => [
  index("blog_comments_blog_idx").on(table.blogId, table.createdAt),
  index("blog_comments_thread_idx").on(table.blogId, table.parentId, table.createdAt),
]);

export const commentLikes = pgTable(
  "comment_likes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    commentId: uuid("comment_id")
      .notNull()
      .references(() => blogComments.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.commentId],
    }),
    index("comment_likes_comment_idx").on(table.commentId),
  ],
);

// relations
export const usersRelations = relations(users, ({ many }) => ({
  blogLikes: many(blogLikes),
  blogComments: many(blogComments),
}));

export const blogsRelations = relations(blogs, ({ many }) => ({
  likes: many(blogLikes),
  comments: many(blogComments),
}));

export const blogLikesRelations = relations(blogLikes, ({ one }) => ({
  user: one(users, {
    fields: [blogLikes.userId],
    references: [users.id],
  }),

  blog: one(blogs, {
    fields: [blogLikes.blogId],
    references: [blogs.id],
  }),
}));

export const blogCommentsRelations = relations(blogComments, ({ one, many }) => ({
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id],
  }),

  blog: one(blogs, {
    fields: [blogComments.blogId],
    references: [blogs.id],
  }),

  likes: many(commentLikes),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),

  comment: one(blogComments, {
    fields: [commentLikes.commentId],
    references: [blogComments.id],
  }),
}));
