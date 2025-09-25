<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as VerifyEmailBase;
use Illuminate\Notifications\Messages\MailMessage;


class VerifyEmail extends VerifyEmailBase
{
    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verifica tu correo en la Cámara de Comercio de Santa Marta')
            ->greeting('¡Bienvenido a SICAM!')
            ->line('Gracias por registrarte en el Sistema de Información de la Cámara de Comercio de Santa Marta para el Magdalena.')
            ->line('Por favor haz clic en el botón para verificar tu dirección de correo electrónico y activar tu cuenta.')
            ->action('Verificar correo electrónico', $verificationUrl)
            ->line('Si tú no creaste esta cuenta, puedes ignorar este mensaje.')
            ->line('Ante cualquier duda, comunícate con nuestro equipo de soporte: soporte@cdnsicam.net');
    }
}
