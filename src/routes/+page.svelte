<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>


<script lang="ts">
    import InputModal from './InputModal.svelte';

    // Initialize image sources as null to hide images by default
    let imageSources: (string | null)[] = [
        null, null, null, null, null, null, null, null, null
    ];
    
    let showModal: boolean = false;
    let selectedCellId: number | null = null;

    const openModal = (cellId: number) => {
        selectedCellId = cellId;
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
        selectedCellId = null;
    };

    const handleImageSubmit = (cellId: number, imageUrl: string) => {
        if (cellId > 0 && cellId <= imageSources.length) {
            imageSources[cellId - 1] = imageUrl; // Update image source with URL
        }
    };
</script>

<div class="flex items-center justify-center min-h-screen">
    <div class="grid grid-cols-3 w-full max-w-md border border-black">
        {#each imageSources as src, i}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div 
                role="button" 
                tabindex="0" 
                class="flex items-center justify-center bg-gray-400 text-xl hover:bg-gray-700 h-48 border border-black cursor-pointer relative"
                on:click={() => openModal(i + 1)}
            >
                {#if src}
                    <img src={src} alt={`Image for cell ${i + 1}`} class="object-cover w-full h-full"/>
                {:else}
                    <span class="text-white text-2xl font-bold">{i + 1}</span>
                {/if}
            </div>
        {/each}
    </div>
</div>

<InputModal visible={showModal} onClose={closeModal} cellId={selectedCellId} onSubmitImage={handleImageSubmit} />

<!-- 
'src/lib/images/BadBoys.jpg',
'src/lib/images/MySpy.jpg',
'src/lib/images/TheBoys.jpg',
'src/lib/images/ThoseAboutTo.jpg',
 -->
