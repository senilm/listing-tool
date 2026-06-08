// Publication lifecycle. Single source of truth for the publication_status
// Postgres enum (lib/db/schema/publication.ts imports this) and the UI badge.
export enum PublicationStatus {
  Draft = "draft",
  Scheduled = "scheduled",
  Publishing = "publishing",
  Published = "published",
  Failed = "failed",
  Ended = "ended",
}
