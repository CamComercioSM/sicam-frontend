@php
$configData = Helper::appClasses();
$customizerHidden = 'customizer-hide';
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Verify Email Basic - Pages')

@section('page-style')
<!-- Page -->
@vite('resources/assets/vendor/scss/pages/page-auth.scss')
@endsection

@section('content')
<div class="position-relative">
  <div class="authentication-wrapper authentication-basic container-p-y">
    <div class="authentication-inner py-6 mx-4">
      <div class="card p-sm-7 p-2">
        <!-- Logo -->
        <div class="app-brand justify-content-center mt-5">
          <a href="{{ url('/') }}" class="app-brand-link gap-3">
            <span class="app-brand-logo demo">@include('_partials.macros')</span>
            <span class="app-brand-text demo text-heading fw-semibold">{{ config('variables.templateName') }}</span>
          </a>
        </div>
        <!-- /Logo -->

        <!-- Verify Email -->
        <div class="card-body mt-1">
          <h4 class="mb-1">Verify your email ✉️</h4>
          <p class="text-start mb-0">Account activation link sent to your email address: <span
              class="h6">hello@example.com</span> Please follow the link inside to continue.</p>
          <a class="btn btn-primary w-100 my-5" href="{{ url('/') }}"> Skip for now </a>
          <p class="text-center mb-0">
            Didn't get the mail?
            <a href="javascript:void(0);"> Resend </a>
          </p>
        </div>
      </div>
      <img src="{{ asset('assets/img/illustrations/tree-3.png') }}" alt="auth-tree"
        class="authentication-image-object-left d-none d-lg-block" />
      <img src="{{ asset('assets/img/illustrations/auth-basic-mask-' . $configData['theme'] . '.png') }}"
        class="authentication-image d-none d-lg-block" height="172" alt="triangle-bg"
        data-app-light-img="illustrations/auth-basic-mask-light.png"
        data-app-dark-img="illustrations/auth-basic-mask-dark.png" />
      <img src="{{ asset('assets/img/illustrations/tree.png') }}" alt="auth-tree"
        class="authentication-image-object-right d-none d-lg-block" />
      <!-- /Verify Email -->
    </div>
  </div>
</div>
@endsection