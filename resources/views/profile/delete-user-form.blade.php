<x-action-section>
  <x-slot name="title">
    {{ __('Eliminar cuenta') }}
  </x-slot>

  <x-slot name="description">
    {{ __('Elimina permanentemente tu cuenta.') }}
  </x-slot>

  <x-slot name="content">
    <div>
      {{ __('Una vez que tu cuenta sea eliminada, todos sus recursos y datos se borrarán de forma permanente. Antes de eliminar tu cuenta, descarga cualquier dato o información que desees conservar.') }}
    </div>

    <div class="mt-3">
      <x-danger-button wire:click="confirmUserDeletion" wire:loading.attr="disabled">
        {{ __('Eliminar') }}
      </x-danger-button>
    </div>

    <!-- Delete User Confirmation Modal -->
    <x-dialog-modal wire:model.live="confirmingUserDeletion">
      <x-slot name="title">
        {{ __('Delete Account') }}
      </x-slot>

      <x-slot name="content">
        {{ __('¿Estás seguro de que deseas eliminar tu cuenta? Una vez eliminada, todos los recursos y datos asociados se borrarán de forma permanente. Ingresa tu contraseña para confirmar que deseas eliminar tu cuenta de manera definitiva.') }}

        <div class="mt-2" x-data="{}"
          x-on:confirming-delete-user.window="setTimeout(() => $refs.password.focus(), 250)">
          <x-input type="password" class="{{ $errors->has('password') ? 'is-invalid' : '' }}"
            placeholder="{{ __('Contraseña') }}" x-ref="password" wire:model="password" wire:keydown.enter="deleteUser" />

          <x-input-error for="password" />
        </div>
      </x-slot>

      <x-slot name="footer">
        <x-secondary-button wire:click="$toggle('confirmingUserDeletion')" wire:loading.attr="disabled">
          {{ __('Cancelar') }}
        </x-secondary-button>

        <x-danger-button class="ms-1" wire:click="deleteUser" wire:loading.attr="disabled">
          {{ __('Eliminar cuenta') }}
        </x-danger-button>
      </x-slot>
    </x-dialog-modal>
  </x-slot>

</x-action-section>