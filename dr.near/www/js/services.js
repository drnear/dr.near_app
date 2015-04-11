angular.module('Myapp.services',['ngResource'])	

	.factory( 'LoginUser', function() {
	  // ログインユーザーは仮に「最初のユーザー」とする
	    var UserObject = Parse.Object.extend( 'User2' );
	    var query = new Parse.Query( UserObject );
	    query.limit(1);
	    query.ascending( 'createdAt' );
	    return query.first().then( function( result ) 
	      { return result.fetch();  } );
	})
	.factory('Sessions', function ($resource) {
    return $resource('http://localhost:5000/sessions/:sessionId');
	})
  .service('Session', function () {
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
     loginSuccess: 'auth-login-success',
     loginFailed: 'auth-login-failed',
     logoutSuccess: 'auth-logout-success',
     sessionTimeout: 'auth-session-timeout',
     notAuthenticated: 'auth-not-authenticated',
     notAuthorized: 'auth-not-authorized'
   })
  .constant('USER_ROLES', {
     all: '*',
     admin: 'admin',
     editor: 'editor',
     guest: 'guest'
   })

  .factory('AuthService', function ($http, Session) {
    var authService = {};
     
    authService.login = function( credentials ) {
           Parse.User.logIn( credentials.username, credentials.password, {
               success: function( user ) {
                   Session.create( user );
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
  })