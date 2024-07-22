<script>

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="flex items-center justify-center min-h-screen ">
    <div class="grid grid-cols-3 w-full max-w-md border border-black">
        {#each Array(9) as _, i}
            <div class="flex items-center justify-center bg-gray-400 text-xl hover:bg-gray-700 h-48 border border-black" id="${i + 1}">
            </div>
        {/each}
    </div>
</div>
