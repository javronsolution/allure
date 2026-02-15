import { createClient } from "@/lib/supabase/server";
import { CustomerList } from "@/components/customers/customer-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageWrapper } from "@/components/layout/PageWrapper";

const PAGE_SIZE = 20;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim() ?? "";

  // Build query
  let query = supabase.from("customers").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: customers, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <>
      <PageWrapper
        title="Customers"
        actions={
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Link>
          </Button>
        }
      >
        <CustomerList
          customers={customers ?? []}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          searchQuery={search}
        />
      </PageWrapper>
    </>
  );
}
