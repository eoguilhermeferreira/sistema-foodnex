import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { CompanyProvider } from "@/contexts/CompanyContext";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, fantasy_name, slug, trial_ends_at, plan, plan_expires_at")
    .eq("owner_id", user.id)
    .single();

  if (!company) redirect("/onboarding");

  // Check trial / plan access
  const now = new Date();
  const trialEnd = company.trial_ends_at ? new Date(company.trial_ends_at) : null;
  const planEnd = company.plan_expires_at ? new Date(company.plan_expires_at) : null;
  const activePlan = company.plan && company.plan !== "trial" && planEnd && planEnd > now;
  const trialActive = trialEnd && trialEnd > now;

  if (!activePlan && !trialActive) {
    redirect("/assinar");
  }

  return (
    <CompanyProvider company={company}>
      <AdminShell companyId={company.id} companyName={company.fantasy_name ?? company.name}>
        {children}
      </AdminShell>
    </CompanyProvider>
  );
}
