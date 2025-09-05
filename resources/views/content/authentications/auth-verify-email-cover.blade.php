@php
$configData = Helper::appClasses();
$customizerHidden = 'customizer-hide';
$configData = Helper::appClasses();
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Verify Email Cover - Pages')

@section('page-style')
<!-- Page -->
@vite('resources/assets/vendor/scss/pages/page-auth.scss')
@endsection

@section('content')
<div class="authentication-wrapper authentication-cover">
  <!-- Logo -->
  <a href="{{ url('/') }}" class="auth-cover-brand d-flex align-items-center gap-3">
    <span class="app-brand-logo demo">@include('_partials.macros')</span>
    <span class="app-brand-text demo text-heading fw-semibold">{{ config('variables.templateName') }}</span>
  </a>
  <!-- /Logo -->
  <div class="authentication-inner row m-0">
    <!-- /Left Section -->
    <div class="d-none d-lg-flex col-lg-7 col-xl-8 align-items-center justify-content-center p-12 pb-2">
      <div>
        <img
          src="{{ asset('assets/img/illustrations/auth-cover-verify-email-illustration-' . $configData['theme'] . '.png') }}"
          class="authentication-image-model d-none d-lg-block" alt="auth-model"
          data-app-light-img="illustrations/auth-cover-verify-email-illustration-light.png"
          data-app-dark-img="illustrations/auth-cover-verify-email-illustration-dark.png" />
      </div>
      <img src="{{ asset('assets/img/illustrations/tree-2.png') }}" alt="tree" class="authentication-image-tree z-n1" />
      <img src="{{ asset('assets/img/illustrations/auth-cover-mask-' . $configData['theme'] . '.png') }}"
        class="scaleX-n1-rtl authentication-image d-none d-lg-block w-75" height="362" alt="triangle-bg"
        data-app-light-img="illustrations/auth-cover-mask-light.png"
        data-app-dark-img="illustrations/auth-cover-mask-dark.png" />
    </div>
    <!-- /Left Section -->

    <!--  Verify email -->
    <div
      class="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg position-relative py-sm-5 px-12 py-4">
      <div class="w-px-400 mx-auto pt-12 pt-lg-0">
        <h4 class="mb-1">Verify your email ✉️</h4>
        <p class="text-start mb-0">Account activation link sent to your email address: <span
            class="h6">hello@example.com</span> Please follow the link inside to continue.</p>
        <a class="btn btn-primary w-100 my-5" href="{{ url('/') }}"> Skip for now </a>
        <p class="text-center">
          Didn't get the mail?
          <a href="javascript:void(0);"> Resend </a>
        </p>
      </div>
    </div>
    <!-- / Verify email -->
  </div>
</div>
@endsection