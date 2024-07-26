<script>
    export let visible = false;
    export let onClose = () => {};
  
    // Function to close the modal
    const close = () => {
      onClose();
    };
  </script>
  
  {#if visible}
    <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">How to Play Movie Grid!</h2>
        <p class="mb-4">
          Select a movie for each cell using the clues that correspond to that cell's rows and columns.
        </p>
        <p class="mb-4">
          Movies in the drop down are ordered by popularity and they must be exact, down to the punctuation.
        </p>
        <p class="mb-4">
          Each game, you have nine movie guesses to fill out the grid.
        </p>
        <p class="mb-4">
          Each movie, whether correct or incorrect, will count as one of your nine guesses.
        </p>
        <p class="mb-4">
          If a movie poster pops up, congratulations -- you got it right you little cinephile.
        </p>
        <p class="mb-4">
          If you need a refresher on who someone is, click on their name for a headshot.
        </p>
        <p class="mb-4">
          A movie cannot be used twice.
        </p>
        <p class="mb-4">
          If a clue is just a name, movies that actor directed will not count.
        </p>
        <p class="mb-4">
          A word containing a hyphen counts as one word.
        </p>
        <button on:click={close} class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">Close</button>
      </div>
    </div>
  {/if}
  