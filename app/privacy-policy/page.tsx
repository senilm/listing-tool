import { type Metadata } from "next";

import { PrivacyPolicyContent } from "@/features/legal/components/privacy-policy-content";

export const metadata: Metadata = {
  title: "Privacy Policy — Listing Tool",
  description: "How Listing Tool collects, uses and protects your data.",
};

const PrivacyPolicyPage = () => {
  return <PrivacyPolicyContent />;
};

export default PrivacyPolicyPage;
