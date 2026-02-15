import { CustomerForm } from "@/components/customers/customer-form";
import { PageWrapper } from "@/components/layout/PageWrapper";

export default function NewCustomerPage() {
  return (
    <>
   <PageWrapper title="New Customer" showBack>
     <CustomerForm />
   </PageWrapper>
    </>
  );
}
