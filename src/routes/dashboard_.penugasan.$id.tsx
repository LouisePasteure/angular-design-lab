import { createFileRoute } from "@tanstack/react-router";
import { CustomerAssignmentDetailPage } from "@/components/portal/customer-assignment-detail-page";

export const Route = createFileRoute("/dashboard_/penugasan/$id")({
  head: ({ params }) => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex" }],
  }),
  component: SecuredAssignmentDetail,
});

function SecuredAssignmentDetail() {
  const { id } = Route.useParams();
  return <CustomerAssignmentDetailPage id={id} />;
}
