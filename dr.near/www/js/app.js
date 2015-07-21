if ( typeof( APP_CONFIG ) == "undefined" ) {
    APP_CONFIG = {};
}

angular.module("DrNEAR", ["ionic", "DrNEAR.controllers"])
    .run( function( $ionicPlatform, Session ) {
        Parse.initialize( APP_CONFIG.PARSE_APP_KEY, APP_CONFIG.PARSE_APP_SECRET );
        Session.create( Parse.User.current() );

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
        // openFB.init({appId: APP_CONFIG.FACEBOOK_APP_ID});
        $ionicConfigProvider.views.maxCache(0);
        $stateProvider
            .state("login", {
                url: "/login",
                templateUrl: "templates/login.html",
                controller: "LoginCtrl as ctrl"
            })
            .state("signup", {
                url: "/signup",
                templateUrl: "templates/signup.html",
                controller: "SignupCtrl"
            })
            .state("intro", {
                url: "/intro",
                views: {
                    "appContent":{
                        templateUrl: "templates/intro.html",
                        controller:"IntroCtrl"
                    }
                }
            })
            .state("app", {
                url: "/app",
                templateUrl: "templates/app.html",
                controller: "AppCtrl as appctrl"
            })
            .state("app.activity",{
                url: "/activity",
                data: {
                    authorizedRoles: [USER_ROLES.all]
                },
                views: {
                    "appContent":{
                        templateUrl: "templates/activity.html",
                        controller: "ActivityCtrl as ctrl"
                    }
                }
            })
            .state("app.post",{
                url: "/post",
                views: {
                    "appContent":{
                        templateUrl: "templates/post.html",
                        controller: "ActivityPostCtrl as ctrl"
                    }
                }
            })
            .state("app.alert", {
                url: "/alert",
                views: {
                    "appContent": {
                        templateUrl: "templates/alert.html",
                        controller: "AlertCtrl as ctrl"
                    }
                }
            })
            .state("app.search", {
                url: "/search",
                views: {
                    "appContent": {
                        templateUrl: "templates/search.html",
                        controller: "SearchCtrl as ctrl"
                    }
                }
            })
            .state("app.profile", {
                url: "/profile",
                views: {
                    "appContent": {
                        templateUrl: "templates/profile.html",
                        controller: "ProfileCtrl as ctrl"
                    }
                }
            })
            .state("app.profedit", {
                url: "/profedit",
                views: {
                    "appContent": {
                        templateUrl: "templates/profedit.html",
                        controller: "ProfEditCtrl as ctrl"
                    }
                }
            })
            .state("app.profedit_diseases",{
                url: "/profedit_diseases",
                views: {
                    "appContent": {
                        templateUrl: "templates/profedit_diseases.html",
                        controller: "ProfEditDiseasesCtrl as ctrl"
                    }
                }
            })
            .state("app.setting",{
                url: "/setting",
                views: {
                    "appContent":{
                        templateUrl: "templates/setting.html",
                        controller: "SettingCtrl as ctrl"
                    }
                }
            })
            .state("app.setting_password",{
                url: "/setting_password",
                views: {
                    "appContent":{
                        templateUrl: "templates/setting_password.html",
                        controller: "SettingPasswordCtrl as ctrl"
                    }
                }
            })

            .state("app.messages", {
                url: "/messages",
                views: {
                    "appContent": {
                        templateUrl: "templates/messages.html",
                        controller: "MessagesCtrl"
                    },
                    "fabContent": {
                        template: '<button id="fab-activity" class="button button-fab button-fab-bottom-right button-balanced"><i class="icon ion-plus"></i></button>',
                        controller: function ($timeout) {
                            $timeout(function () {
                                document.getElementById("fab-activity").classList.toggle("on");
                            }, 200);
                        }
                    }
                }
            })
            .state("amessage", {
                url: "/amessage/:uid",
                templateUrl: "templates/amessage.html",
                controller: "AmessageCtrl"
            })
            .state("disease1", {
                url: "/disease",
                templateUrl: "templates/disease.html",
                controller: "DiseaseCtrl"
            })
            .state("medicine1", {
                url: "/medicine",
                templateUrl: "templates/medicine.html",
                controller: "MedicineCtrl"
            });

        $urlRouterProvider.otherwise( function( $injector ) {
            var $state = $injector.get("$state");
            $state.go("app.activity");
        });
    })
    .run(function ($rootScope, $state, Session, AUTH_EVENTS) {
        $rootScope.$on( "$stateChangeStart", function( event, toState, toParam, fromState, fromParam ) {
            if ( typeof(toState.data) == "object" ) {
                if (!Session.isAuthorized(toState.data.authorizedRoles)) {
                    event.preventDefault();
                    if ( Session.isAuthenticated ) {
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                    }
                    else {
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    }
                }
            }
        });

        $rootScope.$on( AUTH_EVENTS.notAuthenticated, function( event ) {
            $state.go( "login" );
        });

        $rootScope.$on( AUTH_EVENTS.loginSuccess, function( event ) {
            $state.go( "app.activity" );
        });
    });
