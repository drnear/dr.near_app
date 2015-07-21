angular.module('DrNEAR.services',['ngResource'])
    .service('Session', function ($timeout) {
        var service = {
            user            : null,
            isAuthenticated : false,
            username        : null,
            name            : null,
            iconurl         : 'img/material1.jpg',
            email           : null,
            emailVerified   : false,
            role            : null,
            diseases        : []
        };
        service.create = function ( user ) {
            if ( !user ) { service.destroy(); return; }
            service.update( user );
        };
        service.update = function ( user ) {
            if ( !user ) { service.destroy(); return; }
            service.user            = user;
            service.isAuthenticated = true;
            service.username        = user.get('username');
            service.name            = user.get('name') || user.get('username');
            service.iconurl         = user.get('icon') ? user.get('icon').url() : 'img/material1.jpg';
            service.email           = user.get('email');
            service.emailVerified   = user.get('emailVerified');
            service.role            = user.get('role');
            if ( user.relation("diseases") ) {
                user.relation("diseases").query().find().then(function(diseases){
                    $timeout(function(){
                        service.diseases = diseases;
                    });
                });
            }
        };
        service.destroy = function () {
            service.user            = null;
            service.isAuthenticated = false;
            service.username        = null;
            service.name            = null;
            service.iconurl         = 'img/material1.jpg';
            service.email           = null;
            service.emailVerified   = false;
            service.role            = null;
            service.diseases        = [];
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
