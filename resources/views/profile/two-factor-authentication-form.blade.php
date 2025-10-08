<x-action-section>
  <x-slot name="title">
    {{ __('Autenticación en dos pasos') }}
  </x-slot>

  <x-slot name="description">
    {{ __('Agrega seguridad adicional a tu cuenta usando la autenticación en dos pasos.') }}
  </x-slot>

  <x-slot name="content">
    <h6>
      @if ($this->enabled)
      @if ($showingConfirmation)
      {{ __('Estás habilitando la autenticación en dos pasos.') }}
      @else
      {{ __('Has habilitado la autenticación en dos pasos.') }}
      @endif
      @else
      {{ __('No has habilitado la autenticación en dos pasos.') }}
      @endif
    </h6>

    <p class="card-text">
      {{ __('Cuando la autenticación en dos pasos está habilitada, se te pedirá un token seguro y aleatorio durante la autenticación. Puedes obtener este token desde la aplicación Google Authenticator de tu teléfono.') }}
    </p>

    @if ($this->enabled)
    @if ($showingQrCode)
    <p class="card-text mt-2">
      @if ($showingConfirmation)
      {{ __('Escanea el siguiente código QR con la aplicación autenticadora de tu teléfono y confírmalo con el código OTP generado.') }}
      @else
      {{ __('La autenticación en dos pasos está ahora habilitada. Escanea el siguiente código QR con la aplicación autenticadora de tu teléfono.') }}
      @endif
    </p>

    <div class="mt-2">
      {!! $this->user->twoFactorQrCodeSvg() !!}
    </div>

    <div class="mt-4">
      <p class="fw-medium">
        {{ __('Clave de configuración') }}: {{ decrypt($this->user->two_factor_secret) }}
      </p>
    </div>

    @if ($showingConfirmation)
    <div class="mt-2">
      <x-label for="code" value="{{ __('Código') }}" />
      <x-input id="code" class="d-block mt-3 w-100" type="text" inputmode="numeric" name="code" autofocus
        autocomplete="one-time-code" wire:model="code" wire:keydown.enter="confirmTwoFactorAuthentication" />
      <x-input-error for="code" class="mt-3" />
    </div>
    @endif
    @endif

    @if ($showingRecoveryCodes)
    <p class="card-text mt-2">
      {{ __('Guarda estos códigos de recuperación en un gestor de contraseñas seguro. Pueden usarse para recuperar el acceso a tu cuenta si pierdes tu dispositivo de autenticación en dos pasos.') }}
    </p>

    <div class="bg-light rounded p-2">
      @foreach (json_decode(decrypt($this->user->two_factor_recovery_codes), true) as $code)
      <div>{{ $code }}</div>
      @endforeach
    </div>
    @endif
    @endif

    <div class="mt-2">
      @if (!$this->enabled)
      <x-confirms-password wire:then="enableTwoFactorAuthentication">
        <x-button type="button" wire:loading.attr="disabled">
          {{ __('Activar') }}
        </x-button>
      </x-confirms-password>
      @else
      @if ($showingRecoveryCodes)
      <x-confirms-password wire:then="regenerateRecoveryCodes">
        <x-secondary-button class="me-1">
          {{ __('Regenerar códigos de recuperación') }}
        </x-secondary-button>
      </x-confirms-password>
      @elseif ($showingConfirmation)
      <x-confirms-password wire:then="confirmTwoFactorAuthentication">
        <x-button type="button" wire:loading.attr="disabled">
          {{ __('Confirmar') }}
        </x-button>
      </x-confirms-password>
      @else
      <x-confirms-password wire:then="showRecoveryCodes">
        <x-secondary-button class="me-1">
          {{ __('Mostrar códigos de recuperación') }}
        </x-secondary-button>
      </x-confirms-password>
      @endif

      <x-confirms-password wire:then="disableTwoFactorAuthentication">
        <x-danger-button wire:loading.attr="disabled">
          {{ __('Deshabilitar') }}
        </x-danger-button>
      </x-confirms-password>
      @endif
    </div>
  </x-slot>
</x-action-section>