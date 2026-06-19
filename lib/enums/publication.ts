// Publication lifecycle. Single source of truth for the publication_status
// Postgres enum (lib/db/schema/publication.ts imports this) and the UI badge.
export enum PublicationStatus {
  Published = "published",
  Failed = "failed",
}
