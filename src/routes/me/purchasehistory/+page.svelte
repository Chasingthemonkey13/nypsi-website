<script lang="ts">
  import Loading from "$lib/components/Loading.svelte";
  import dayjs from "dayjs";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  export let data;

  let loadingText = ".";

  const interval = setInterval(() => {
    if (loadingText.length >= 3) {
      loadingText = ".";
      return;
    }
    loadingText += ".";
  }, 300);

  onMount(async () => {
    await Promise.resolve(data.totalCost);
    clearInterval(interval);
  });
</script>

<svelte:head>
  <title>purchase history / nypsi</title>
</svelte:head>

<div class="flex w-full justify-center">
  <div class="flex w-full flex-col px-10 sm:w-[55vw]">
    {#await data.streamed.premium then premium}
      {#if premium}
        <div class="flex justify-center">
          <a
            href="https://help.ko-fi.com/hc/en-us/articles/4405488403473-How-do-I-Cancel-or-Manage-My-Membership-to-a-Creator-#how-do-i-cancel-or-manage-my-membership-to-a-creator--0-0"
            target="_blank"
            class="w-fit rounded bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-2 font-semibold shadow-md shadow-slate-950"
            >manage membership</a
          >
        </div>
      {/if}
    {/await}

    <div class="flex items-end">
      <p class="pl-1 text-xs text-slate-500">as of 2023-07-20</p>
      <p class="mb-1 grow pr-1 text-right text-sm text-slate-300 sm:text-lg">
        total spent <span class="font-semibold text-accent">
          {#await data.totalCost}
            {loadingText}
          {:then amount}
            {Intl.NumberFormat("en-UK", { style: "currency", currency: "GBP" }).format(amount)}
          {/await}
        </span>
      </p>
    </div>

    {#await data.history}
      <div class="relative mt-10">
        <Loading fadeInSettings={{ delay: 150, duration: 150 }} />
      </div>
    {:then history}
      <table class="m w-full text-slate-200 sm:text-lg">
        {#each history as { date, item }, i}
          <tr
            class="mb-2 flex w-full items-center gap-2 rounded border border-slate-400 border-opacity-5 bg-slate-950 bg-opacity-20 px-2 py-1 duration-200 ease-in hover:scale-105 hover:border-accent hover:border-opacity-20"
            in:fly|global={{ delay: 150 + i * 55, duration: 500, y: 250 }}
          >
            <td class="text-sm text-slate-400">{dayjs(date).format("YYYY-MM-DD")}</td>
            <td class="line-clamp-1 grow break-all text-right text-slate-200 sm:text-center">
              {item}
            </td>
          </tr>
        {/each}
      </table>
    {/await}
  </div>
</div>
