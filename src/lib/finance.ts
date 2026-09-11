export type PaymentStatus = "Unpaid" | "Partial Payment" | "Paid";

export type ProjectStatus = "NotStarted" | "InProgress" | "WaitingForClient" | "Completed" | "OnHold";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  NotStarted: "Not Started",
  InProgress: "In Progress",
  WaitingForClient: "Waiting for Client",
  Completed: "Completed",
  OnHold: "On Hold",
};

/**
 * Calculates the total paid amount for a set of payments.
 */
export function calculateTotalPaid(payments: { amount: number }[] = []): number {
  return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
}

/**
 * Calculates remaining due amount for a project given total value and total paid.
 * Always computed, never a manual input field.
 */
export function calculateRemaining(totalAmount: number, totalPaid: number): number {
  return Math.max(0, totalAmount - totalPaid);
}

/**
 * Determines payment status:
 * - 0 paid => "Unpaid"
 * - 0 < paid < total => "Partial Payment"
 * - paid >= total => "Paid"
 */
export function getPaymentStatus(totalAmount: number, totalPaid: number): PaymentStatus {
  if (totalPaid <= 0) return "Unpaid";
  if (totalPaid >= totalAmount) return "Paid";
  return "Partial Payment";
}

/**
 * Formats a monetary number into fixed INR currency display (e.g. ₹1,50,000)
 */
export function formatCurrency(amount: number): string {
  const value = Math.round(amount || 0);
  return `₹${value.toLocaleString('en-IN')}`;
}

/**
 * Calculates aggregate stats for dashboard
 */
export function calculateDashboardStats(
  clientsCount: number,
  projects: { totalAmount: number; status: string; payments: { amount: number }[] }[],
  allPayments: { amount: number }[]
) {
  const totalClients = clientsCount;
  const activeProjects = projects.filter((p) => p.status !== "Completed").length;
  const totalReceived = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalProjectValue = projects.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalDue = Math.max(0, totalProjectValue - totalReceived);

  return {
    totalClients,
    activeProjects,
    totalReceived,
    totalDue,
  };
}
