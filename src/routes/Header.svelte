<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';

	import InfoModal from '../components/InfoModal.svelte';
	let showInfoModal = false;

	const openInfoModal = () => {
		showInfoModal = true;
	};

	const closeInfoModal = () => {
		showInfoModal = false;
	};
</script>

<header class="flex justify-between items-center p-4 ">
	<!-- Left corner -->
	<div class="flex items-center space-x-4">
		<a href="https://kit.svelte.dev" class="w-12 h-12 flex items-center justify-center">
			<img src={logo} alt="SvelteKit" class="w-8 h-8 object-contain" />
		</a>
	</div>

	<!-- Navigation -->
	<nav class="flex items-center space-x-4 bg-opacity-70  rounded-md shadow-lg">
		<svg viewBox="0 0 2 3" aria-hidden="true" class="w-8 h-12 invisible">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" class="fill-gray-400" />
		</svg>
		<ul class="flex space-x-4 items-center list-none p-0 m-0">
			<li class="relative" aria-current="page">
				<a href="/" class="text-gray-800 font-bold text-sm uppercase tracking-wider hover:text-blue-500 hover:scale-110 ">Home</a>
			</li>
			<li class="relative" aria-current="page">
				<a href="/about" class="text-gray-800 font-bold text-sm uppercase tracking-wider hover:text-blue-500 hover:scale-110">About</a>
			</li>
			<li class="relative" aria-current="page">
				<a href="/contact" class="text-gray-800 font-bold text-sm uppercase tracking-wider hover:text-blue-500 hover:scale-110">Contact</a>
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true" class="w-8 h-12 invisible">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" class="fill-gray-400" />
		</svg>
	</nav>

	<!-- Right corner -->
	<div class="flex flex-row items-center space-x-2">
		<button 
		class="bg-transparent border-none text-2xl cursor-pointer order-1" 
		on:click={openInfoModal}>
		ⓘ
		</button>
		<a 
		href="https://github.com/Puffy12/BetterMovieGrid.io" 
		class="w-12 h-12 flex items-center justify-center order-2">
		<img src={github} alt="GitHub" class="w-8 h-8 object-contain" />
		</a>
	</div>
  
  <InfoModal visible={showInfoModal} onClose={closeInfoModal} />

</header>

