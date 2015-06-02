if ( typeof( APP_CONFIG ) == 'undefined' ) {
	APP_CONFIG = {};
}

angular.module('DrNear', ['ionic', 'DrNear.controllers'])
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
    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, USER_ROLES) {
	    openFB.init({appId: APP_CONFIG.FACEBOOK_APP_ID});
	    $ionicConfigProvider.views.maxCache(0);
	    $stateProvider
	        .state('app', {
		        url: '/app',
		        templateUrl: 'templates/menu.html',
		        controller: 'AppCtrl',
	            data: {
	                authorizedRoles: [USER_ROLES.all ,USER_ROLES.admin]
	            }
	        })
	        .state('app.activity',{
		        url: '/activity',
		        views: {
			        'menuContent':{
				        templateUrl: 'templates/activity.html',
				        controller: 'ActivityCtrl'
			        },
			        'fabContent': {
				        template:'<button id="fab-activity" class="button button-fab button-fab-bottom-right button-balanced" ui-sref="app.post" ><i class="icon ion-plus"></i></button>',
				        controller: function ($scope,$timeout,$ionicPopup) {
							$scope.showPopup = function() {
							    var alertPopup = $ionicPopup.alert({
									title: 'Dont eat that!',
									template: 'It might taste good'
							    }); 
							    $timeout(function () {
									document.getElementById('fab-activity').classList.toggle('on');
							    },200);
							}}
			        }
		        }
	        })
	        .state('app.post',{
		        url: '/post',
		        views: {
			        'menuContent':{
				        templateUrl: 'templates/post.html',
				        controller: 'PostCtrl'
			        },
			        'fabContent': {
				        template:'<button id="fab-post" class="button button-fab button-fab-bottom-right button-balanced" ><i class="icon ion-plus"></i></button>',
				        controller: function ($timeout) {
							$timeout(function () {
								document.getElementById('fab-post').classList.toggle('on');
							}, 200);
						}
			        }
		        }
	        })
	        .state('app.alert', {
			    url: '/alert',
			    views: {
					'menuContent': {
						templateUrl: 'templates/alert.html',
						controller: 'AlertCtrl'
					},
					'fabContent': {
						template:'<button id="fab-post" class="button button-fab button-fab-bottom-right button-balanced" ><i class="icon ion-plus"></i></button>',
						controller: function ($timeout) {
							$timeout(function () {
								document.getElementById('fab-post').classList.toggle('on');
							}, 200);
						}
					}
			    }
	        })
	        .state('app.search', {
			    url: '/search',
			    views: {
					'menuContent': {
						templateUrl: 'templates/search.html',
						controller: 'SearchCtrl'
					}
			    }
	        })
	        .state('signup', {
		        url: '/signup',
		        templateUrl: 'templates/signup.html',
		        controller: 'SignupCtrl'
	        })
	        .state('app.intro', {
		        url:'/intro',
		        views: {
			        'menuContent':{
			            templateUrl: "templates/intro.html",
			            controller:'IntroCtrl'
			        }
	            }
	        })
	        .state('app.setting',{
		        url: '/setting',
		        views: {
			        'menuContent':{
				        templateUrl: 'templates/setting.html',
				        controller: 'SettingCtrl'
			        },
			        'fabContent': {
				        template:'<button id="fab-setting" class="button button-fab button-fab-bottom-right button-balanced"><i class="icon ion-plus"></i></button>',
				        controller: function ($timeout) {
							$timeout(function () {
								document.getElementById('fab-setting').classList.toggle('on');
							}, 200);
						}
			        }
		        }
	        })
	        .state('app.login', {
		        url: '/login',
		        views:{
				    'menuContent': {
						templateUrl: 'templates/login.html',
						controller: 'LoginCtrl'
				    },
				    'fabContent': {
					    template:'<button id="fab-activity" class="button button-fab button-fab-bottom-right button-balanced"><i class="icon ion-plus"></i></button>',
					    controller: function ($timeout) {
							$timeout(function () {
								document.getElementById('fab-activity').classList.toggle('on');
							}, 200);
						}
				    }
		        }
	        })
	        .state('app.profile', {
		        url: "/profile",
		        views: {
			        'menuContent': {
				        templateUrl: "templates/profile.html",
				        controller: 'ProfileCtrl'
			        },
			        'fabContent': {
				        template:'',
				        controller: ''
			        }
		        }
	        })
	        .state('app.messages', {
		        url: '/messages',
		        views: {
			        'menuContent': {
				        templateUrl: "templates/messages.html",
				        controller: 'MessagesCtrl'
			        },
			        'fabContent': {
				        template:'<button id="fab-activity" class="button button-fab button-fab-bottom-right button-balanced"><i class="icon ion-plus"></i></button>',
				        controller: function ($timeout) {
							$timeout(function () {
								document.getElementById('fab-activity').classList.toggle('on');
							}, 200);
						}
			        }
		        }
	        })
	        .state('amessage', {
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
	    // if none of the above states are matched, use this as the fallback
	    $urlRouterProvider.otherwise('/app/activity');
    })
