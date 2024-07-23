<!-- HintModal.svelte -->
<script>
    export let visible = false;
    export let hintText = '';
    export let hintDescription = '';
    export let onClose;
  </script>
  
  {#if visible}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-overlay" on:click={onClose}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="modal-content" on:click|stopPropagation>
        <button class="close-button" on:click={onClose}>×</button>
        <div class="modal-body">
          <h2>{hintText}</h2>
          <p>{hintDescription}</p>
        </div>
      </div>
    </div>
  {/if}
  
  <style>
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      position: relative;
    }
    .close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }
  </style>
  