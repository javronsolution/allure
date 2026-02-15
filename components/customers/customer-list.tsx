"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Phone, Users } from "lucide-react";
import { Customer } from "@/lib/types/database";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface CustomerListProps {
  customers: Customer[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  searchQuery: string;
}

export function CustomerList({
  customers,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  searchQuery,
}: CustomerListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);

  const handleSearch = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    params.delete("page"); // reset to page 1 on new search
    const qs = params.toString();
    router.push(qs ? `/customers?${qs}` : "/customers");
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {searchQuery ? "No customers found" : "No customers yet"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery
                ? "Try a different search term"
                : "Add your first customer to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
          {customers.map((customer) => (
            <Link key={customer.id} href={`/customers/${customer.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {customer.full_name}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                    {customer.bust && customer.waist && customer.hip && (
                      <div className="text-xs text-muted-foreground text-right shrink-0 ml-4">
                        <span>
                          B:{customer.bust} W:{customer.waist} H:{customer.hip}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        basePath="/customers"
      />
    </div>
  );
}
