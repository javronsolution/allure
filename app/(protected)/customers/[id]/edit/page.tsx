import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { CustomerForm } from "@/components/customers/customer-form";
import { notFound } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (!customer) {
    notFound();
  }

  return (
    <>
     <PageWrapper title={"Edit Customer"} showBack>
         <CustomerForm customer={customer} />
     </PageWrapper>
    </>
  );
}
