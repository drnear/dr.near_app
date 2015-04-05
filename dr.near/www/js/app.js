// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
if ( typeof( APP_CONFIG ) == 'undefined' ) {
    APP_CONFIG = {};
}

angular.module('starter', ['ionic', 'starter.controllers'])
.run(function($ionicPlatform) {
  Parse.initialize( APP_CONFIG.PARSE_APP_KEY, APP_CONFIG.PARSE_APP_SECRET )
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
.config(function($stateProvider, $urlRouterProvider) {
  openFB.init({appId: APP_CONFIG.FACEBOOK_APP_ID});

  $stateProvider
  .state('login1', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('signup1', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignupCtrl'
  })
  .state('messages1', {
    url: '/messages',
    templateUrl: 'templates/messages.html',
    controller: 'MessagesCtrl'
  })
  .state('amessage1', {
    url: '/amessage/:uid',
    templateUrl: 'templates/amessage.html',
    controller: 'AmessageCtrl'
  })
  .state('disease1', {
    url: '/disease',
    templateUrl: 'templates/disease.html',
    controller: 'DiseaseCtrl'
  })
  .state('medicine1', {
    url: '/medicine',
    templateUrl: 'templates/medicine.html',
    controller: 'MedicineCtrl'
  })
  .state('sidemenu', {
    url: "/side",
    abstract: true,
    templateUrl: "templates/sidemenu.html",
    controller: 'SidemenuCtrl'
  })
  .state('main', {
    url: '/',
    templateUrl: 'templates/main.html',
    controller: 'MainCtrl'
  })
  .state('profile', {
    url: "/profile",
    views: {
      'mainContent': {
        templateUrl: "templates/profile.html",
        controller: 'ProfileCtrl'
      }
    }
  })

        // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
})
