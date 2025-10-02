<?php
// app/Models/Concerns/WithUserStamps.php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

trait WithUserStamps
{
    public static function bootWithUserStamps(): void
    {
        static::creating(function ($model) {
            $actorId = Auth::id();
            if ($actorId) {
                if (self::attrUsable($model, 'created_by')) $model->created_by = $actorId;
                if (self::attrUsable($model, 'updated_by')) $model->updated_by = $actorId;
            }
        });

        static::updating(function ($model) {
            $actorId = Auth::id();
            if ($actorId && self::attrUsable($model, 'updated_by')) {
                // se setea antes de persistir; no dispara eventos extra
                $model->updated_by = $actorId;
            }
        });

        static::deleting(function ($model) {
            $actorId = Auth::id();
            if (!$actorId || !self::attrUsable($model, 'deleted_by')) {
                return;
            }

            $usesSoftDeletes = self::usesSoftDeletes($model);
            $forceDeleting = $usesSoftDeletes && method_exists($model, 'isForceDeleting')
                ? $model->isForceDeleting()
                : !$usesSoftDeletes; // si no usa soft delete, la eliminación es forzada

            // Para SoftDeletes: setear antes del borrado lógico
            if ($usesSoftDeletes && !$forceDeleting) {
                $model->deleted_by = $actorId;
                // Guardamos silenciosamente para no disparar observers en cascada
                $model->saveQuietly();
            }
        });

        // Opcional, si el modelo usa SoftDeletes
        static::restored(function ($model) {
            $actorId = Auth::id();
            if ($actorId && self::attrUsable($model, 'updated_by')) {
                $model->updated_by = $actorId;
                $model->saveQuietly();
            }
        });
    }

    /**
     * Verifica que el atributo exista y sea asignable
     */
    private static function attrUsable($model, string $key): bool
    {
        // Si el modelo usa $fillable:
        if (method_exists($model, 'getFillable') && in_array($key, $model->getFillable(), true)) {
            return true;
        }
        // Si el modelo usa $guarded = [] (todo asignable), también sirve:
        if (property_exists($model, 'guarded') && is_array($model->guarded) && empty($model->guarded)) {
            return true;
        }
        // fallback: permitir forceFill en saveQuietly si la propiedad está en la tabla
        return array_key_exists($key, $model->getAttributes());
    }

    private static function usesSoftDeletes($model): bool
    {
        return in_array(SoftDeletes::class, class_uses_recursive(get_class($model)), true);
    }
}
