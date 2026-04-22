import { AuditWorkspace } from "@/components/audits/audit-workspace";

export default async function AuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <AuditWorkspace auditId={id} />;
}
