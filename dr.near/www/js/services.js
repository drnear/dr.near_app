angular.module('DrNEAR.services',['ngResource'])	
    .run(function ($rootScope, AUTH_EVENTS, AuthService, $location,$state) {
        $rootScope.$on( '$stateChangeStart', function( event, next ) {
            if ( typeof(next.data) == 'object' ) {
                if (!AuthService.isAuthorized(next.data.authorizedRoles)) {
                    event.preventDefault();
                    if ( AuthService.isAuthenticated() ) {
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                    }
                    else {
                        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    }
                }
            }
        });

        $rootScope.$on( AUTH_EVENTS.notAuthenticated, function( event, next ) {
            $state.go( 'app.login' );
        });
    })
    .factory('AuthService', function ($http, Session ) {
        console.log( 'AuthService' );
        var authService = {};
        authService.login = function( credentials ) {
            return Parse.User.logIn( credentials.username, credentials.password );
            Parse.User.logIn( credentials.username, credentials.password, {
                success: function( user ) {
                    Session.create( user );
                    console.log(Session.create(user));
                    return user;
                }
            });
        };
        authService.isAuthenticated = function () {
            return !!Session.userId;
        };     
        authService.isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }

            return (authService.isAuthenticated() &&
                    authorizedRoles.indexOf(Session.userRole) !== -1);
        };
        return authService;
        console.log(authService);
    })
	.factory( 'LoginUser', function() {
		console.log( 'LoginUser' );
	  	// ログインユーザーは仮に「最初のユーザー」とする	  
		var UserObject = Parse.Object.extend( 'User2' );
		var query = new Parse.Query( UserObject );
		query.limit(1);
		query.ascending( 'createdAt' );
		return query.first().then( function( result ) 
		                           { return result.fetch();  } );
	})
 	.service('Session', function () {
		console.log( 'Session' );
		this.create = function (sessionId, userId, userRole) {
		    this.id = sessionId;
		    this.userId = userId;
		    this.userRole = userRole;
		};
	 	this.destroy = function () {
		    this.id = null;
		    this.userId = null;
		    this.userRole = null;
	 	};
  	})
  	.constant('AUTH_EVENTS', {
		loginSuccess     : 'auth-login-success',
		loginFailed      : 'auth-login-failed',
		logoutSuccess    : 'auth-logout-success',
		sessionTimeout   : 'auth-session-timeout',
		notAuthenticated : 'auth-not-authenticated',
		notAuthorized    : 'auth-not-authorized'
   	})
  	.constant('USER_ROLES', {
		all    : '*',
		admin  : 'admin',
		editor : 'editor',
		guest  : 'guest'
  	})
	.directive('formAutofillFix', function ($timeout) {
		console.log( 'formAutofillFix' ); 
		return function (scope, element, attrs) {
		    element.prop('method', 'post');
		    if (attrs.ngSubmit) {
		        $timeout(function () {
			        element
			            .unbind('submit')
			            .bind('submit', function (event) {
				            event.preventDefault();
				            element
				                .find('input, textarea, select')
				                .trigger('input')
				                .trigger('change')
				                .trigger('keydown');
				            scope.$apply(attrs.ngSubmit);
			            });
		        });
		    }
		};
	});
