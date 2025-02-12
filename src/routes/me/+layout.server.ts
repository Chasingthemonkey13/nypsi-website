import getItems from "$lib/functions/getItems.js";
import type { BaseUserData, UserApiResponsexd } from "$lib/types/User.js";
import { redirect } from "@sveltejs/kit";

export async function load({ parent, url, fetch }) {
  const { user } = await parent();

  if (!user.authenticated) redirect(302, "/login?next=" + encodeURIComponent(url.pathname));

  const [items, baseData] = await Promise.all([
    getItems(),
    fetch(`/api/user/${user.id}/base`).then((r) => r.json() as Promise<BaseUserData>),
  ]);
  return {
    items,
    baseData,

    userData: fetch(`/api/user/${user.id}`).then((r) => r.json() as Promise<UserApiResponsexd>),
  };
}
