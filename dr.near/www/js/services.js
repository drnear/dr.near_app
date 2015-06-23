angular.module('DrNEAR.services',['ngResource'])    
    .service('Session', function () {
        var service = {
            isAuthenticated : false,
            username        : null,
            email           : null,
            emailVerified   : false,
            role            : null
        };
        service.create = function ( user ) {
            console.log( 'Session.create', user );
            if ( !user ) { return; }
            service.isAuthenticated = true;
            service.username        = user.get('username');
            service.email           = user.get('email');
            service.emailVerified   = user.get('emailVerified');
            service.role            = user.get('role');
        };
        service.destroy = function () {
            service.isAuthenticated = false;
            service.username        = null;
            service.email           = null;
            service.emailVerified   = false;
            service.role            = null;
        };
        service.isAuthorized = function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }
            // return service.enable && (authorizedRoles.indexOf(Session.role) !== -1);
            return service.isAuthenticated;
        };
        return service;
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
