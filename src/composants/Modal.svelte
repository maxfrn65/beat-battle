<script lang="ts">
    export let show: boolean = false;
    export let title: string = '';
    export let message: string = '';
    export let onClose: () => void;
</script>

{#if show}
    <div class="modal-overlay" on:click={onClose}>
        <div class="modal-content" on:click|stopPropagation>
            <h2>{title}</h2>
            <p>{message}</p>
            <button on:click={onClose}>Fermer</button>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        text-align: center;
    }

    h2 {
        color: #1DB954;
        margin-bottom: 1rem;
    }

    button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #1DB954;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
    }

    button:hover {
        background-color: #1ed760;
    }
</style> 