<x-form-section submit="updatePassword">
  <x-slot name="title">
    {{ __('Actualizar contraseña') }}
  </x-slot>

  <x-slot name="description">
    {{ __('Asegúrate de que tu cuenta use una contraseña larga y aleatoria para mantenerla segura.') }}
  </x-slot>

  <x-slot name="form">
    <x-action-message class="me-3" on="saved">
      {{ __('Saved.') }}
    </x-action-message>
    <div class="mb-5">
      <x-label class="form-label" for="current_password" value="{{ __('Contraseña actual') }}" />
      <x-input id="current_password" type="password" class="{{ $errors->has('current_password') ? 'is-invalid' : '' }}"
        wire:model="state.current_password" autocomplete="current-password" />
      <x-input-error for="current_password" />
    </div>

    <div class="mb-5">
      <x-label class="form-label" for="password" value="{{ __('Nueva contraseña') }}" />
      <x-input id="password" type="password" class="{{ $errors->has('password') ? 'is-invalid' : '' }}"
        wire:model="state.password" autocomplete="new-password" />
      <x-input-error for="password" />
    </div>

    <div class="mb-5">
      <x-label class="form-label" for="password_confirmation" value="{{ __('Confirmar contraseña') }}" />
      <x-input id="password_confirmation" type="password"
        class="{{ $errors->has('password_confirmation') ? 'is-invalid' : '' }}" wire:model="state.password_confirmation"
        autocomplete="new-password" />
      <x-input-error for="password_confirmation" />
    </div>
  </x-slot>

  <x-slot name="actions">
    <x-button>
      {{ __('Guardar') }}
    </x-button>
  </x-slot>
</x-form-section>