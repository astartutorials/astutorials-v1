import PaymentShell from "@/components/tutorials/payment/PaymentShell";
import PaymentStepper, {
  StepItem,
} from "@/components/tutorials/payment/PaymentStepper";
import OrderSummaryCard from "@/components/tutorials/payment/OrderSummaryCard";
import CompletePaymentPanel from "@/components/tutorials/payment/CompletePaymentPanel";

const steps: StepItem[] = [
  { id: 1, title: "Payment", subtitle: "Processing fee" },
  { id: 2, title: "Request Details", subtitle: "Student info" },
  { id: 3, title: "Success", subtitle: "Confirmation" },
];

export default function PaymentPage() {
  return (
    <PaymentShell
      sidebar={<PaymentStepper steps={steps} activeStep={1} />}
      summary={
        <OrderSummaryCard
          service="Private Tutorial Request"
          duration="1 Session"
          total="NGN 5,075"
          note="This payment secures your request. A tutor will be assigned after confirmation."
          highlight="info"
        />
      }
    >
      <CompletePaymentPanel />
    </PaymentShell>
  );
}
