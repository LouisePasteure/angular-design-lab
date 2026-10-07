import { createFileRoute } from "@tanstack/react-router";
import { GuestAssignmentDetailPage } from "@/components/guest/guest-assignment-detail-page";

export const Route = createFileRoute("/cek-penugasan/$id")({
  head: ({ params }) => ({
    meta: [{ title: "jokitugass" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: GuestAssignmentRoute,
});

function GuestAssignmentRoute() {
  const { id } = Route.useParams();
  return <GuestAssignmentDetailPage id={id} />;
}
