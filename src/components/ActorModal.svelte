<script lang="ts">
    export let visible: boolean = false;
    export let actorName: string = '';
    export let actorPhoto: string | null = '';
    export let onClose: () => void;
  </script>
  
  {#if visible}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg relative w-80 max-w-sm">
        <!-- Close button positioned within the modal -->
        <button class="absolute top-2 right-2 text-xl font-semibold text-gray-600 hover:text-gray-900" on:click={onClose}>×</button>
        <h2 class="text-xl font-bold mb-4">{actorName}</h2>
        {#if actorPhoto}
          <img src={actorPhoto} alt={actorName} class="mt-2 max-w-full h-auto rounded-lg"/>
        {:else}
          <p class="mt-2 text-gray-600">No photo available</p>
        {/if}
      </div>
    </div>
  {/if}