import { redirect } from "next/navigation";

/** The Projects section became Works. Keep old links (and any indexed URLs)
 *  landing somewhere sensible instead of on a 404. */
export default function ProjectsRedirect() {
  redirect("/works");
}
