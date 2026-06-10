// Plain content (no FieldDescription wrapper) so it can be passed as a Field's
// `description`, which supplies the wrapper itself.
export const PasswordRequirements = () => (
  <>
    8–128 characters, with at least one uppercase, one lowercase, one number,
    and one special character.
  </>
);
