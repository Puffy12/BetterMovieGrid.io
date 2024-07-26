<script lang="ts">
    export let visible: boolean;
    export let correctGuesses: number;
    export let correctAnswers: (string | null)[];
    export let possibleAnswers: (string | null)[];
    export let onClose: () => void;
  </script>
  
  {#if visible}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal-overlay" on:click={onClose}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="modal" on:click|stopPropagation>
        <h2 class="mb-2">Game Over</h2>
        <p>You got {correctGuesses}/9 guesses correct</p>
        
        <div class="grid-container">
          <h3>Correct Answers</h3>
          <div class="grid">
            {#each correctAnswers as answer, idx}
              <div class="cell">{answer || ''}</div>
            {/each}
          </div>
          
          <h3>Possible Correct Answers</h3>
          <div class="grid">
            {#each possibleAnswers as answer, idx}
              <div class="cell">{answer || ''}</div>
            {/each}
          </div>
        </div>
        
        <button on:click={onClose} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Close</button>
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
      align-items: center;
      justify-content: center;
    }
    .modal {
      background: white;
      padding: 20px;
      border-radius: 8px;
      width: 300px;
    }
    .grid-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-gap: 10px;
      margin-top: 10px;
    }
    .cell {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #ddd;
      background: #f9f9f9;
    }
  </style>
  