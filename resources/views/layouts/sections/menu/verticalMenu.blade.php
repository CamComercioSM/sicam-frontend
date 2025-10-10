@php
    use Illuminate\Support\Facades\Route;
    $configData = Helper::appClasses();

  $user = auth()->user();
  
  // --- 1) Normalizador: stdClass|array -> array (recursivo)
  $normalize = function ($value) use (&$normalize) {
    if (is_array($value)) {
      return array_map($normalize, $value);
    }
    if (is_object($value)) {
      // stdClass -> array y normaliza hijos
      return collect(get_object_vars($value))
        ->map(fn($v) => $normalize($v))
        ->all();
    }
    return $value;
  };

  // --- 2) Filtro recursivo por roles/permisos (trabaja con arrays)
  $filterMenu = function (array $items) use ($user, &$filterMenu) {
    return collect($items)->map(function ($item) use ($user, &$filterMenu) {
      // $item es array asociativo garantizado
      if (isset($item['menuHeader'])) {
        return $item; // los headers pasan tal cual
      }

      $role = $item['role']    ?? null;
      $all  = $item['all']     ?? [];
      $any  = $item['any']     ?? [];
      $kids = $item['submenu'] ?? [];

      $passes = true;
      if ($role) {
        // $role puede ser string ("Administrador") o array (["Administrador","Soporte"])
        // normaliza a array y limpia espacios / mayúsculas
        $roles = is_array($role) ? $role : [$role];
        $roles = array_filter(array_map(fn($r) => strtolower(trim((string)$r)), $roles));

        $userRole  = strtolower(trim((string) ($user->getRoleNames()->first() ?? 'Sin Rol')));


        // ¿El rol del usuario está entre las opciones?
        $allowed = in_array($userRole, $roles, true);

        if($allowed)  print_r(" - ALLOWED");
        else 
          print_r(" - NOT ALLOWED");
        // Actualiza pasa si está permitido  

        $passes = $passes && $allowed;
        var_dump($passes);
      }

      if(!$passes) return null;
      
      if (!empty($all)) {
        $passes = $passes && collect($all)->every(fn ($p) => $user?->can($p));
      }

      if (!empty($any)) {
        $hasAny = method_exists($user, 'canAny')
          ? ($user?->canAny($any) ?? false)
          : collect($any)->contains(fn ($p) => $user?->can($p));
        $passes = $passes && $hasAny;
      }

      // Filtra hijos primero
      if (!empty($kids) && is_array($kids)) {
        $item['submenu'] = $filterMenu($kids);
      }

      // Si no pasa y no tiene hijos visibles -> descarta
      if (!$passes && empty($item['submenu'])) {
        return null;
      }

      return $item;
    })
    ->filter()   // elimina nulls
    ->values()
    ->all();
  };

  // 3) Volver a objetos (stdClass) de forma recursiva
  $toObject = function ($value) use (&$toObject) {
    if (is_array($value)) {
      // ¿lista o mapa?
      $isList = array_keys($value) === range(0, count($value) - 1);
      if ($isList) {
        return array_map($toObject, $value);
      }
      $obj = new \stdClass();
      foreach ($value as $k => $v) {
        $obj->{$k} = $toObject($v);
      }
      return $obj;
    }
    return $value; // escalares
  };

  // --- 3) Normaliza y filtra tus datos compartidos por el provider
  $verticalRawObj   = $menuData[0] ?? [];
  $horizontalRawObj = $menuData[1] ?? [];

  $verticalRaw      = $normalize($verticalRawObj);  
  $horizontalRaw    = $normalize($horizontalRawObj);

  $verticalArr   = is_array($verticalRaw)   ? $filterMenu($verticalRaw['menu'])   : [];
  $horizontalArr = is_array($horizontalRaw) ? $filterMenu($horizontalRaw) : [];

  // Resultado final como arrays de stdClass
  $menuData[0]     = $toObject( ['menu' =>  $verticalArr ]);
  
  $menuData[1]   = $toObject($horizontalArr);

@endphp

<aside id="layout-menu" class="layout-menu menu-vertical menu"
    @foreach ($configData['menuAttributes'] as $attribute => $value)
  {{ $attribute }}="{{ $value }}" @endforeach>

    <!-- ! Hide app brand if navbar-full -->
    @if (!isset($navbarFull))
        <div class="app-brand demo">
            <a href="{{ url('/') }}" class="app-brand-link gap-xl-0 gap-2">
                <span class="app-brand-logo demo me-1">@include('_partials.macros')</span>
                <span
                    class="app-brand-text demo menu-text fw-semibold ms-2">{{ config('variables.templateName') }}</span>
            </a>

            <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large ms-auto">
                <i class="menu-toggle-icon d-xl-inline-block align-middle"></i>
            </a>
        </div>
    @endif

    <div class="menu-inner-shadow"></div>

    <ul class="menu-inner py-1">
        @foreach ($menuData[0]->menu as $menu)
            {{-- adding active and open class if child is active --}}

            {{-- menu headers --}}
            @if (isset($menu->menuHeader))
                <li class="menu-header mt-7">
                    <span class="menu-header-text">{{ __($menu->menuHeader) }}</span>
                </li>
            @else
                {{-- active menu method --}}
                @php
                    $activeClass = null;
                    $currentRouteName = Route::currentRouteName();

                    if ($currentRouteName === $menu->slug) {
                        $activeClass = 'active';
                    } elseif (isset($menu->submenu)) {
                        if (gettype($menu->slug) === 'array') {
                            foreach ($menu->slug as $slug) {
                                if (str_contains($currentRouteName, $slug) and strpos($currentRouteName, $slug) === 0) {
                                    $activeClass = 'active open';
                                }
                            }
                        } else {
                            if (
                                str_contains($currentRouteName, $menu->slug) and
                                strpos($currentRouteName, $menu->slug) === 0
                            ) {
                                $activeClass = 'active open';
                            }
                        }
                    }
                @endphp

                {{-- main menu --}}
                <li class="menu-item {{ $activeClass }}">
                    <a href="{{ isset($menu->url) ? url($menu->url) : 'javascript:void(0);' }}"
                        class="{{ isset($menu->submenu) ? 'menu-link menu-toggle' : 'menu-link' }}"
                        @if (isset($menu->target) and !empty($menu->target)) target="_blank" @endif>
                        @isset($menu->icon)
                            <i class="{{ $menu->icon }}"></i>
                        @endisset
                        <div>{{ isset($menu->name) ? __($menu->name) : '' }}</div>
                        @isset($menu->badge)
                            <div class="badge bg-{{ $menu->badge[0] }} rounded-pill ms-auto">{{ $menu->badge[1] }}</div>
                        @endisset
                    </a>

                    {{-- submenu --}}
                    @isset($menu->submenu)
                        @include('layouts.sections.menu.submenu', ['menu' => $menu->submenu])
                    @endisset
                </li>
            @endif
        @endforeach
    </ul>

</aside>
