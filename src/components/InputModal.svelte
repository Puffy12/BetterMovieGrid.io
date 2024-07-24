<script lang="ts">
    export let visible: boolean = false;
    export let onClose: () => void;
    export let cellId: number | null = null;
    export let onSubmitImage: (cellId: number, imageUrl: string) => void;
    let inputValue: string = '';

    const handleSubmit = (event: Event) => {
        event.preventDefault();
        if (cellId !== null) {
            onSubmitImage(cellId, inputValue);
            onClose();
        }
    };
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
{#if visible}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div role="dialog" aria-labelledby="modal-title" class="modal-overlay fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center" on:click={onClose}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div role="document" class="modal bg-white p-8 rounded shadow-lg max-w-md w-full relative" on:click|stopPropagation>
            <button type="button" class="close absolute top-0 right-0 m-4 text-gray-500 hover:text-gray-700" on:click={onClose} aria-label="Close modal">✕</button>
            <form on:submit={handleSubmit}>
                <label id="modal-title" for="input" class="block text-gray-700 text-sm font-bold mb-2">Enter image URL for cell {cellId}</label>
                <input id="input" type="text" bind:value={inputValue} class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"/>
                <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    Submit
                </button>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        z-index: 1000;
    }
    .modal {
        z-index: 1001;
    }
</style>
