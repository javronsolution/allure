import { Header } from "@/components/layout/header";
import { CustomerForm } from "@/components/customers/customer-form";

export default function NewCustomerPage() {
  return (
    <>
      <Header title="New Customer" showBack />
      <main className="px-4 py-4 max-w-lg mx-auto">
        <CustomerForm />
      </main>
    </>
  );
}
