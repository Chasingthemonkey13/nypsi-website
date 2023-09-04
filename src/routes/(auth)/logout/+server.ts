import { redirect } from "@sveltejs/kit";

export const GET = ({ cookies, url }) => {
  cookies.delete("discord_access_token");
  cookies.delete("discord_refresh_token");

  const redirectTo = url.searchParams.get("next");

  throw redirect(302, redirectTo || "/");
};
