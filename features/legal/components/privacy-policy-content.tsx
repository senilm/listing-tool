import { Typography } from "@/components/typography";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export const PrivacyPolicyContent = () => {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-8 px-6 py-12">
      <header className="space-y-2">
        <Typography variant="h2" as="h1">
          Privacy Policy
        </Typography>
        <Typography variant="muted">Last updated: 11 June 2026</Typography>
      </header>

      <section className="space-y-3">
        <Typography variant="h4" as="h2">
          Who we are
        </Typography>
        <Typography>
          Listing Tool is a product-listing application that lets sellers manage
          jewellery listings and publish them to their connected eBay accounts.
          This policy explains what data we collect, why we collect it, and how
          it is handled.
        </Typography>
      </section>

      <section className="space-y-3">
        <Typography variant="h4" as="h2">
          Information we collect
        </Typography>
        <Typography>
          <strong>Account information.</strong> When you register we store your
          name, email address and a hashed password. We never store passwords in
          plain text.
        </Typography>
        <Typography>
          <strong>eBay account connections.</strong> When you connect an eBay
          seller account we store your eBay username and the OAuth refresh token
          eBay issues to us. Tokens are encrypted at rest and are used solely to
          act on your behalf — for example creating or updating listings you ask
          us to publish. We never see or store your eBay password.
        </Typography>
        <Typography>
          <strong>Listing data.</strong> Product details you create in the app
          (titles, descriptions, prices, images and publication history) are
          stored so the service can function.
        </Typography>
      </section>

      <section className="space-y-3">
        <Typography variant="h4" as="h2">
          How we use your information
        </Typography>
        <Typography>
          Your data is used only to provide the service: authenticating you,
          managing your product catalogue, and publishing listings to the eBay
          accounts you have connected. We do not sell your data or share it with
          third parties for advertising.
        </Typography>
      </section>

      <section className="space-y-3">
        <Typography variant="h4" as="h2">
          Third-party services
        </Typography>
        <Typography>
          We rely on a small number of infrastructure providers to operate: our
          database and hosting providers store the data described above, and the
          eBay API receives the listing content you choose to publish. Each
          provider processes data only as needed to run the service.
        </Typography>
      </section>

      <section className="space-y-3">
        <Typography variant="h4" as="h2">
          Data security
        </Typography>
        <Typography>
          All traffic is encrypted in transit over HTTPS. eBay refresh tokens
          are additionally encrypted at rest with AES-256-GCM. Access to
          production data is restricted to operating the service.
        </Typography>
      </section>

      <section className="space-y-3">
        <Typography variant="h4" as="h2">
          Data retention and deletion
        </Typography>
        <Typography>
          Disconnecting an eBay account removes its stored tokens. You can
          request deletion of your account and all associated data at any time
          by contacting us, and we will action it within 30 days.
        </Typography>
      </section>

      <section className="space-y-3">
        <Typography variant="h4" as="h2">
          Changes to this policy
        </Typography>
        <Typography>
          If this policy changes we will update this page and revise the date at
          the top. Material changes will be communicated to registered users by
          email.
        </Typography>
      </section>

      {!!CONTACT_EMAIL && (
        <section className="space-y-3">
          <Typography variant="h4" as="h2">
            Contact
          </Typography>
          <Typography>
            For any privacy questions or data requests, contact us at{" "}
            <a
              className="underline underline-offset-4"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </Typography>
        </section>
      )}
    </article>
  );
};
