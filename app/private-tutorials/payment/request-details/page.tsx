import PaymentShell from "@/components/tutorials/payment/PaymentShell";
import PaymentStepper, {
  StepItem,
} from "@/components/tutorials/payment/PaymentStepper";
import OrderSummaryCard from "@/components/tutorials/payment/OrderSummaryCard";
import RequestDetailsForm from "@/components/tutorials/payment/RequestDetailsForm";

const steps: StepItem[] = [
  { id: 1, title: "Payment", subtitle: "Payment successful" },
  { id: 2, title: "Request Details", subtitle: "Tutorial preferences" },
  { id: 3, title: "Success", subtitle: "Confirmation" },
];

export default function RequestDetailsPage() {
  return (
    <PaymentShell
      sidebar={
        <PaymentStepper steps={steps} activeStep={2} completedSteps={[1]} />
      }
      summary={
        <OrderSummaryCard
          service="Private Tutorial Session"
          total="NGN 5,075"
          status="PAID"
          note="Your payment has been confirmed. Please complete this form to finalize your booking."
          highlight="success"
        />
      }
    >
      <RequestDetailsForm />
    </PaymentShell>
  );
}
