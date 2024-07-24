<script>
	import { fade } from 'svelte/transition';
	//  import { Toaster } from '@zerodevx/svelte-toast';


	const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { data, error } = await sendEmail(formData);

    if (error) {
      toast.push(error, { theme: { '--toastBackground': 'red', '--toastBarBackground': 'darkred' } });
      return;
    }

    toast.push("Email sent successfully!", { theme: { '--toastBackground': 'green', '--toastBarBackground': 'darkgreen' } });
  };

</script>

<svelte:head>
	<title>Contact Us</title>
	<meta name="description" content="Contact Us" />
	<style>
		.container {
		  margin-top: 5rem;
		  margin-bottom: 5rem;
		  text-align: center;
		}
	
		.form-container {
		  margin-top: 2.5rem;
		}
	  </style>
</svelte:head>

<section
  id="contact"
  class="mt-20 mb-20 sm:mb-32 w-[min(100%,38rem)] text-center scroll-mt-28 flex flex-col justify-center items-center mx-auto px-4"
  use:fade={{ duration: 1000 }}
>
  <h2 class="text-2xl sm:text-3xl font-medium capitalize mb-6 sm:mb-8 text-center text-orange-500">Contact Us</h2>

  <p class="mt-6 text-white/80 text-center px-2 sm:px-0">
    Please contact us directly at
    <a class="text-orange-500 font-bold underline" href="mailto:BetterMovieGrid@gmail.com">
      BetterMovieGrid@gmail.com
    </a>
    <br />
    or through this form.
  </p>

  <form class="mt-10 flex flex-col text-black w-full max-w-lg" on:submit={handleSubmit}>
    <input
      class="h-12 sm:h-14 px-4 rounded-lg border-2 border-orange-400 bg-white bg-opacity-80 focus:bg-opacity-100 hover:bg-white focus:border-4 focus:border-orange-400 transition-all"
      name="senderEmail"
      type="email"
      required
      maxlength="500"
      placeholder="Your email"
    />
    <textarea
      class="h-36 sm:h-52 my-3 rounded-lg border-2 border-orange-400 p-4 bg-white bg-opacity-80 focus:bg-opacity-100 hover:bg-white focus:border-4 focus:border-orange-400 transition-all"
      name="message"
      placeholder="Your message"
      required
      maxlength="5000"
    ></textarea>
    <button type="submit" class="h-12 sm:h-14 px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all">
      Submit
    </button>
  </form>
</section>
