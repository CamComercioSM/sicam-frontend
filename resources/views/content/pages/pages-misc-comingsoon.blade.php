@php
$customizerHidden = 'customizer-hide';
$configData = Helper::appClasses();
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Coming Soon - Pages')

@section('page-style')
<!-- Page -->
@vite('resources/assets/vendor/scss/pages/page-misc.scss')
@endsection

@section('content')
<!-- We are Coming soon -->
<div class="misc-wrapper">
  <h4 class="mb-2 mx-2">We are launching soon 🚀</h4>
  <p class="mb-10 mx-2">We're creating something awesome. Please subscribe to get notified when it's ready!</p>
  <form onsubmit="return false">
    <div class="mb-0 d-flex gap-4">
      <input type="text" class="form-control form-control-sm" placeholder="Enter your email" autofocus />
      <button type="submit" class="btn btn-primary">Notify</button>
    </div>
  </form>
  <div class="d-flex justify-content-center mt-10">
    <img src="{{ asset('assets/img/illustrations/tree-3.png') }}" alt="misc-tree" class="img-fluid misc-object d-none d-lg-inline-block" />
    <img src="{{ asset('assets/img/illustrations/tree.png') }}" alt="misc-tree" class="img-fluid misc-object-right d-none d-lg-inline-block" />
    <img src="{{ asset('assets/img/illustrations/misc-mask-' . $configData['theme'] . '.png') }}" alt="misc-error" class="scaleX-n1-rtl misc-bg d-none d-lg-inline-block" height="172" data-app-light-img="illustrations/misc-mask-light.png" data-app-dark-img="illustrations/misc-mask-dark.png" />
    <img src="{{ asset('assets/img/illustrations/misc-coming-soon.png') }}" alt="misc-error" class="img-fluid z-1" width="680" />
  </div>
</div>
<!-- /We are Coming soone -->
@endsection